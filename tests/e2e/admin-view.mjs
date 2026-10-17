// Admin "view dashboard of": non-admins and guests must never read another learner's data.
// Run against a local server started with ADMIN_USERNAME/ADMIN_PASSWORD set (never commit them):
//   node tests/e2e/admin-view.mjs <screenshot-dir> <admin-username> <admin-password>
import { chromium } from 'playwright';
const [S, ADMIN_U, ADMIN_P] = process.argv.slice(2);
const B = 'http://localhost:3100';
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };
async function newUser() {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const g = await (await ctx.request.post(B + '/api/account/generate')).json();
  const l = await ctx.request.post(B + '/api/account/login', { data: { username: g.username, password: g.password } });
  return { ctx, p, username: g.username, ok: l.ok() };
}
async function takeTest(p) {
  await p.goto(B + '/tests');
  await p.getByRole('button', { name: /^Start test/ }).first().click();
  await p.waitForSelector('.exam-card');
  await p.getByRole('button', { name: /Submit now/ }).click();
  await p.waitForURL(/result/); await p.waitForTimeout(1500);
}

// User A: a learner with one saved test.
const A = await newUser(); await takeTest(A.p);
const aAttempts = (await (await A.ctx.request.get(B + '/api/attempts')).json()).attempts.length;
check('setup: user A has saved attempts', aAttempts >= 1, `${A.username}, ${aAttempts}`);

// User B: another normal learner. Must NOT see anyone else's dashboard.
const Bu = await newUser();
check('setup: user B signed in', Bu.ok, Bu.username);
let r = await Bu.ctx.request.get(B + '/api/admin/dashboard');
check('TC1 non-admin cannot list accounts (404)', r.status() === 404, String(r.status()));
r = await Bu.ctx.request.get(B + '/api/admin/dashboard?username=' + A.username);
const body = await r.text();
check("TC2 non-admin cannot read user A's dashboard data (404)", r.status() === 404 && !body.includes('"attempts"'), String(r.status()));
r = await Bu.ctx.request.get(B + '/api/admin/dashboard?username=' + Bu.username);
check('TC3 non-admin cannot use the endpoint even for own username (404)', r.status() === 404, String(r.status()));
await Bu.p.goto(B + '/dashboard'); await Bu.p.waitForTimeout(1000);
check('TC4 non-admin dashboard has no "view dashboard of" picker', (await Bu.p.locator('#view-as').count()) === 0 && (await Bu.p.getByText('Admin · view dashboard of').count()) === 0);
check("TC5 non-admin dashboard shows only their own data (0 attempts)", (await Bu.p.getByText(/Hi .*here.s where you stand/).count()) === 1 && (await Bu.p.getByText('Attempts', { exact: true }).locator('..').innerText()).includes('0'));
const bAttempts = (await (await Bu.ctx.request.get(B + '/api/attempts')).json()).attempts.length;
check("TC6 non-admin /api/attempts returns only their own attempts", bAttempts === 0, String(bAttempts));

// Guest (signed out).
const G = await b.newContext();
r = await G.request.get(B + '/api/admin/dashboard?username=' + A.username);
check('TC7 guest cannot read user A (404)', r.status() === 404, String(r.status()));

// Admin.
const Ad = await b.newContext({ viewport: { width: 1280, height: 900 } });
const ap = await Ad.newPage();
const al = await Ad.request.post(B + '/api/account/login', { data: { username: ADMIN_U, password: ADMIN_P } });
check('setup: admin signed in', al.ok() && (await al.json()).admin === true);
r = await Ad.request.get(B + '/api/admin/dashboard');
const accounts = (await r.json()).accounts ?? [];
check('TC8 admin can list accounts (admin itself not listed)', r.ok() && accounts.some((a) => a.username === A.username) && !accounts.some((a) => a.username === ADMIN_U), `${accounts.length} accounts`);
r = await Ad.request.get(B + '/api/admin/dashboard?username=' + A.username);
const ad = await r.json();
check("TC9 admin can read user A's attempts", r.ok() && ad.attempts?.length === aAttempts, `${ad.attempts?.length}`);
r = await Ad.request.get(B + '/api/admin/dashboard?username=' + ADMIN_U);
check('TC10 admin account itself is not viewable this way (404)', r.status() === 404, String(r.status()));
r = await Ad.request.get(B + '/api/admin/dashboard?username=nosuchuser999');
check('TC11 unknown username → 404', r.status() === 404, String(r.status()));
await ap.goto(B + '/dashboard'); await ap.waitForTimeout(1200);
check('TC12 admin dashboard shows the picker', (await ap.locator('#view-as').count()) === 1);
await ap.locator('#view-as').selectOption(A.username); await ap.waitForTimeout(1200);
const h1 = await ap.locator('h1').first().innerText();
check("TC13 admin sees user A's dashboard heading", h1.includes("dashboard") && (await ap.getByText('Read-only: viewing ' + A.username).count()) === 1, h1);
const statText = await ap.getByText('Attempts', { exact: true }).locator('..').innerText();
check("TC14 stats show user A's attempt count", statText.includes(String(aAttempts)), statText.replace(/\n/g, ' '));
const wl = ap.locator('[data-screen-label="Weak LOs"]').first();
check("TC15 Weak LOs shows user A's quizzes", (await wl.getByText(/^Quiz 1$/).count()) === 1);
await wl.getByRole('button', { name: 'Review this LO' }).first().click(); await ap.waitForTimeout(600);
check('TC16 read-only: no "Practice this LO" while viewing', (await ap.getByRole('button', { name: 'Practice this LO' }).count()) === 0);
await ap.screenshot({ path: S + '/admin-view.png', fullPage: false });
await ap.locator('#view-as').selectOption(''); await ap.waitForTimeout(500);
check('TC17 admin can switch back to own dashboard', (await ap.getByText(/Hi .*here.s where you stand/).count()) === 1);
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
