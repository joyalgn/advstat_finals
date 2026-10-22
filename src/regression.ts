import { $, fmt, showError, replay } from "./utils.js";
import { linearRegression, parsePairs, RegressionResult } from "./stats.js";
import { drawScatter } from "./charts.js";

const SAMPLE = `Hours Studied, Exam Score
1, 52
2, 55
3, 61
4, 64
5, 70
6, 74
7, 79
8, 83
9, 88
10, 92`;

const input = $<HTMLTextAreaElement>("data");
const results = $("results");
const placeholder = $("placeholder");
const canvas = $<HTMLCanvasElement>("scatter");
let current: { xs: number[]; ys: number[]; res: RegressionResult } | null = null;

function run(): void {
  try {
    const { xs, ys } = parsePairs(input.value);
    const res = linearRegression(xs, ys);
    current = { xs, ys, res };
    showError("error", null);

    placeholder.hidden = true;
    results.hidden = false;
    replay(results);

    $("eq").textContent = res.equation;
    $("r").textContent = fmt(res.r);
    $("r2").textContent = fmt(res.r2);
    $("strength").textContent = res.strength;
    $("n").textContent = String(res.n);
    $("interp").textContent =
      `The correlation coefficient r = ${fmt(res.r)} shows a ${res.strength.toLowerCase()} ${res.direction} linear relationship between X and Y. ` +
      `About ${(res.r2 * 100).toFixed(1)}% of the variation in Y is explained by X. ` +
      `For every 1-unit increase in X, Y changes by about ${fmt(res.slope)} units on average.`;
    predict();
    drawScatter(canvas, xs, ys, res.intercept, res.slope);
  } catch (e) {
    showError("error", (e as Error).message);
  }
}

function predict(): void {
  const out = $("predOut");
  const v = $<HTMLInputElement>("predX").value.trim();
  if (!current || v === "" || !Number.isFinite(Number(v))) { out.textContent = "—"; return; }
  out.textContent = fmt(current.res.intercept + current.res.slope * Number(v));
}

$("run").addEventListener("click", run);
$("sample").addEventListener("click", () => { input.value = SAMPLE; run(); });
$("clear").addEventListener("click", () => {
  input.value = "";
  current = null;
  results.hidden = true;
  placeholder.hidden = false;
  showError("error", null);
});
$("predX").addEventListener("input", predict);
$<HTMLInputElement>("file").addEventListener("change", async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  input.value = await file.text();
  run();
});
window.addEventListener("resize", () => {
  if (current) drawScatter(canvas, current.xs, current.ys, current.res.intercept, current.res.slope, 0);
});
