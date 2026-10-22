import { $, bindSeg, fmt, fmtP, showError, replay } from "./utils.js";
import { runTest, SampleType, Tail, TestInput, TestResult, TestType } from "./stats.js";
import { drawBell } from "./charts.js";

const num = (id: string): number => {
  const raw = $<HTMLInputElement>(id).value.trim();
  if (raw === "") throw new Error("Please fill in all the required fields.");
  const v = Number(raw);
  if (!Number.isFinite(v)) throw new Error("Inputs must be valid numbers.");
  return v;
};

const getTest = bindSeg("segTest", refresh) as () => TestType;
const getSample = bindSeg("segSample", refresh) as () => SampleType;
const getTail = bindSeg("segTail", refresh) as () => Tail;
const getAlpha = bindSeg("segAlpha", () => { /* alpha only changes on Run */ });

let last: { res: TestResult; alpha: number } | null = null;

/** Update labels, show/hide sample 2, and auto-write the hypotheses (still editable). */
function refresh(): void {
  const t = getTest(), s = getSample(), tail = getTail();
  const sd = t === "z" ? "σ" : "s";
  const sdWord = t === "z" ? "Population std. dev." : "Sample std. dev.";
  $("lblSd1").textContent = s === "one" ? `${sdWord} (${sd})` : `${sdWord} (${sd}₁)`;
  $("lblSd2").textContent = `${sdWord} (${sd}₂)`;
  $("lblMu").textContent = s === "one" ? "Hypothesized mean (μ₀)" : "Hypothesized difference (D₀)";
  $("group2").hidden = s === "one";

  const mu = $<HTMLInputElement>("mu0").value.trim() || "0";
  const sym = s === "one" ? "μ" : "μ₁ − μ₂";
  const h0 = tail === "two" ? "=" : tail === "left" ? "≥" : "≤";
  const h1 = tail === "two" ? "≠" : tail === "left" ? "<" : ">";
  $<HTMLInputElement>("h0").value = `${sym} ${h0} ${mu}`;
  $<HTMLInputElement>("h1").value = `${sym} ${h1} ${mu}`;
}

function criticalText(r: TestResult): string {
  if (r.critLow !== null && r.critHigh !== null) return `± ${fmt(r.critHigh)}`;
  return fmt((r.critHigh ?? r.critLow) as number);
}

function buildTable(r: TestResult, alpha: number): void {
  const label = r.dist.name;
  $("tableTitle").textContent =
    label === "z" ? "Z-table: critical z-values" : `T-table: critical t-values (df = ${fmt(r.df as number, 2)})`;
  const rows = [0.10, 0.05, 0.025, 0.01, 0.005].map((a) => {
    const one = r.dist.inv(1 - a);
    const two = r.dist.inv(1 - a / 2);
    const on = Math.abs(a - alpha) < 1e-12 ? ' class="on"' : "";
    return `<tr${on}><td>${a}</td><td>${fmt(one, 3)}</td><td>± ${fmt(two, 3)}</td></tr>`;
  });
  $("tableBody").innerHTML = rows.join("");
}

function run(): void {
  try {
    const t = getTest(), s = getSample(), tail = getTail();
    const alpha = Number(getAlpha());
    const two = s === "two";
    const input: TestInput = {
      test: t, sample: s, tail, alpha,
      mean1: num("mean1"), sd1: num("sd1"), n1: num("n1"),
      mean2: two ? num("mean2") : 0, sd2: two ? num("sd2") : 1, n2: two ? num("n2") : 2,
      mu0: num("mu0"),
    };
    const res = runTest(input);
    last = { res, alpha };
    showError("error", null);

    $("placeholder").hidden = true;
    const box = $("results");
    box.hidden = false;
    replay(box);

    const name = res.dist.name;
    $("lblStat").textContent = `Test statistic (${name})`;
    $("vStat").textContent = fmt(res.statistic);
    $("vP").textContent = fmtP(res.pValue);
    $("vCrit").textContent = criticalText(res);
    $("vSe").textContent = fmt(res.standardError);
    $("vDf").textContent = res.df === null ? "—" : fmt(res.df, 2);
    $("vAlpha").textContent = String(alpha);

    const decision = $("decision");
    decision.className = "decision " + (res.reject ? "reject" : "keep");
    $("decisionTitle").textContent = res.reject ? "Reject H₀" : "Fail to reject H₀";
    const where = res.reject ? "falls in the rejection region" : "falls in the acceptance region";
    $("decisionText").textContent =
      `At α = ${alpha}, the test statistic ${name} = ${fmt(res.statistic)} ${where} (critical value ${criticalText(res)}), ` +
      `and the p-value is ${fmtP(res.pValue)}. ` +
      (res.reject
        ? "There is sufficient evidence to support the alternative hypothesis H₁."
        : "There is not enough evidence to support the alternative hypothesis H₁.");

    buildTable(res, alpha);
    drawBell(canvas, res.dist, res.statistic, res.critLow, res.critHigh);
  } catch (e) {
    showError("error", (e as Error).message);
  }
}

const canvas = $<HTMLCanvasElement>("bell");
$("run").addEventListener("click", run);
$("mu0").addEventListener("input", refresh);
$("sampleData").addEventListener("click", () => {
  const set = (id: string, v: string) => { $<HTMLInputElement>(id).value = v; };
  set("mean1", "52.3"); set("sd1", "6.5"); set("n1", "36");
  set("mean2", "49.1"); set("sd2", "7.2"); set("n2", "40");
  set("mu0", getSample() === "one" ? "50" : "0");
  refresh();
});
window.addEventListener("resize", () => {
  if (last) drawBell(canvas, last.res.dist, last.res.statistic, last.res.critLow, last.res.critHigh, 0);
});
refresh();
