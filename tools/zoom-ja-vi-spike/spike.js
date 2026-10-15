const out = document.getElementById("out");
let lastReport = null;

function log(m) {
  out.textContent += "\n" + m;
}

document.getElementById("run").addEventListener("click", async () => {
  out.textContent = "Running...";
  lastReport = await runTranslatorProbe(log);
  out.textContent += "\n\n" + JSON.stringify(lastReport, null, 2);
});

document.getElementById("copy").addEventListener("click", async () => {
  if (lastReport) await navigator.clipboard.writeText(JSON.stringify(lastReport, null, 2));
});
