// "Bí kíp phòng thi" on Practice tests: the link opens a modal, every open is tracked as a `tips_open`
// event, and only the admin can see who opened it (/admin → Insights).
// Run against a local server started with ADMIN_USERNAME/ADMIN_PASSWORD set (never commit them):
//   node tests/e2e/exam-tips.mjs <screenshot-dir> <admin-username> <admin-password>
import { chromium } from 'playwright';
const [S, ADMIN_U, ADMIN_P] = process.argv.slice(2);
const B = 'http://localhost:3100';
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`); };
const errs = [];
const page = async (ctx) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); return p; };
const events = [];
const watch = (p) => p.on('request', (r) => { if (r.url().endsWith('/api/events') && r.method() === 'POST') { try { events.push(...JSON.parse(r.postData()).events); } catch {} } });

// ── Guest ──
const G = await b.newContext({ viewport: { width: 1280, height: 900 } });
const gp = await page(G); watch(gp);
await gp.goto(B + '/tests'); await gp.waitForTimeout(600);
const link = gp.getByRole('button', { name: 'Bí kíp phòng thi' });
check('TC1 link "Bí kíp phòng thi" is on Practice tests', (await link.count()) === 1);
const order = await gp.evaluate(() => { const h = document.querySelector('h1'); const btn = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Bí kíp phòng thi')); const para = h.parentElement.querySelector('p'); return { h1: h.textContent, below: !!(h.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING), above: !!(btn.compareDocumentPosition(para) & Node.DOCUMENT_POSITION_FOLLOWING) }; });
check('TC2 it sits directly under the "Practice tests" heading (above the description)', order.h1 === 'Practice tests' && order.below && order.above);
check('TC3 the modal is closed until clicked', (await gp.getByRole('dialog').count()) === 0);
await link.click();
const dlg = gp.getByRole('dialog', { name: 'Bí kíp phòng thi' });
check('TC4 click opens the modal', await dlg.isVisible());
const text = await dlg.innerText();
check('TC5 modal has the intro, the 3 question types, the extra tip and the sign-off',
  /3 loại/.test(text) && /Loại “Nhận ra”/.test(text) && /Loại “Gán nhãn”/.test(text) && /Loại “Tính \/ áp dụng”/.test(text) && /ĐÚNG \| SAI/.test(text) && /không thấy tự tin/.test(text) && /Good luck!!/.test(text));
await gp.screenshot({ path: S + '/tips-desktop.png' });
await gp.keyboard.press('Escape'); await gp.waitForTimeout(150);
check('TC6 Esc closes the modal and focus returns to the link', (await gp.getByRole('dialog').count()) === 0 && (await gp.evaluate(() => document.activeElement?.textContent?.includes('Bí kíp phòng thi'))));
await link.click(); await gp.getByRole('button', { name: 'Đóng' }).click();
check('TC7 the ✕ button closes it', (await gp.getByRole('dialog').count()) === 0);
await link.click(); await gp.mouse.click(8, 8); await gp.waitForTimeout(150);
check('TC8 clicking the backdrop closes it', (await gp.getByRole('dialog').count()) === 0);
await gp.waitForTimeout(500);
const guestTips = events.filter((e) => e.t === 'tips_open');
check('TC9 each open sent a tips_open event (3 opens)', guestTips.length === 3, String(guestTips.length));

// ── Phone ──
const P = await b.newContext({ viewport: { width: 393, height: 852 } });
const pp = await page(P);
await pp.goto(B + '/tests'); await pp.getByRole('button', { name: 'Bí kíp phòng thi' }).click();
const fits = await pp.getByRole('dialog').evaluate((d) => { const r = d.getBoundingClientRect(); return r.width <= innerWidth && r.height <= innerHeight && document.documentElement.scrollWidth <= innerWidth; });
check('TC10 on a 393px phone the modal fits the screen (scrolls inside, no horizontal scroll)', fits);
await pp.screenshot({ path: S + '/tips-phone.png' });

// ── Signed-in user + guest data for the admin panel ──
const U = await b.newContext({ viewport: { width: 1280, height: 900 } });
const g = await (await U.request.post(B + '/api/account/generate')).json();
await U.request.post(B + '/api/account/login', { data: { username: g.username, password: g.password } });
const up = await page(U);
await up.goto(B + '/tests'); await up.getByRole('button', { name: 'Bí kíp phòng thi' }).click(); await up.waitForTimeout(300);
await up.keyboard.press('Escape'); await up.getByRole('button', { name: 'Bí kíp phòng thi' }).click(); await up.waitForTimeout(800);

// A normal user must not see who opened it.
const nr = await U.request.get(B + '/admin?tab=insights');
const nbody = await nr.text();
// The admin page shows a non-admin the sign-in form (it names the signed-in account, which is theirs): no panel, no data.
const leaks = ['Visitors per day', 'Signed-in users', 'Bí kíp phòng thi', 'tips_open'].filter((t) => nbody.includes(t));
check('TC11 a non-admin user gets the admin sign-in form, none of the Insights', leaks.length === 0, leaks.join(', ') || String(nr.status()));
const ur = await U.request.get(B + '/api/events');
check('TC12 events API cannot be read back by a normal user (POST-only)', ur.status() === 405 || ur.status() === 404, String(ur.status()));
const gr = await G.request.get(B + '/admin?tab=insights');
check('TC13 a guest does not see Insights either', !(await gr.text()).includes('Visitors per day'));

// ── Admin ──
const A = await b.newContext({ viewport: { width: 1280, height: 1000 } });
const al = await A.request.post(B + '/api/account/login', { data: { username: ADMIN_U, password: ADMIN_P } });
check('setup: admin signed in', al.ok() && (await al.json()).admin === true);
const ap = await page(A);
await ap.goto(B + '/admin?tab=insights&days=30'); await ap.waitForSelector('text=Bí kíp phòng thi', { timeout: 20000 });
const row = ap.locator('tr', { hasText: g.username });
check('TC14 admin Insights lists the signed-in user who opened it', (await row.count()) === 1);
const opens = Number((await row.locator('td').nth(1).innerText()).trim());
check('TC15 …with the right number of opens (2)', opens === 2, String(opens));
const tiles = await ap.locator('div:has(> span:text-is("Guests"))').first().innerText().catch(() => '');
check('TC16 guests are counted separately (≥ 2 guest browsers)', Number((tiles.match(/\d+/) || [0])[0]) >= 2, tiles.replace(/\n/g, ' '));
await ap.locator('h2:has-text("Bí kíp phòng thi")').scrollIntoViewIfNeeded();
await ap.screenshot({ path: S + '/tips-admin.png' });

check('no JavaScript errors on any page', errs.length === 0, errs.join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
