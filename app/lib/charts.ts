// Canvas charts (no libraries): animated scatter plot and bell curve.
import type { Dist } from "./stats";

const C = {
  axis: "#958785",
  grid: "#E4DFD3",
  text: "#66785F",
  point: "#66785F",
  line: "#D4A85B",
  curve: "#25352D",
  reject: "rgba(140,81,74,0.18)",
  accept: "rgba(102,120,95,0.12)",
  stat: "#66785F",
  background: "#F4F1E8",
};

const DARK_C = {
  axis: "#AAB4A4",
  grid: "#45554A",
  text: "#DCE2D5",
  point: "#AEBDA3",
  line: "#D4A85B",
  curve: "#F4F1E8",
  reject: "rgba(217,147,137,0.22)",
  accept: "rgba(102,120,95,0.18)",
  stat: "#D4A85B",
  background: "#2E4036",
};

function chartColors() {
  return document.documentElement.dataset.theme === "light" ? C : DARK_C;
}

/* ── helpers ── */

const tokens = new WeakMap<HTMLElement, number>();

/** Run draw(t) with t going 0 → 1 (eased). A new call on the same canvas cancels the old one. */
function animate(el: HTMLElement, duration: number, draw: (t: number) => void): void {
  const id = (tokens.get(el) ?? 0) + 1;
  tokens.set(el, id);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (duration <= 0 || reduce) {
    draw(1);
    return;
  }
  const start = performance.now();
  const frame = (now: number) => {
    if (tokens.get(el) !== id) return;
    const raw = Math.min(1, Math.max(0, (now - start) / duration));
    draw(1 - Math.pow(1 - raw, 3));
    if (raw < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function setup(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function niceScale(min: number, max: number, target = 6) {
  if (min === max) { min -= 1; max += 1; }
  const raw = (max - min) / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}

const tickText = (v: number, step: number) =>
  v.toFixed(Math.max(0, -Math.floor(Math.log10(step)))).replace(/^-0(\.0+)?$/, "0$1");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ── scatter diagram with regression line ── */

export function drawScatter(
  canvas: HTMLCanvasElement,
  xs: number[], ys: number[],
  a: number, b: number,
  duration = 1200
): void {
  const colors = chartColors();
  const { ctx, w, h } = setup(canvas);
  const pad = { l: 58, r: 22, t: 18, b: 46 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yAll = [...ys, a + b * xMin, a + b * xMax];
  const yMin = Math.min(...yAll), yMax = Math.max(...yAll);
  const sx = niceScale(xMin - (xMax - xMin) * 0.05, xMax + (xMax - xMin) * 0.05);
  const sy = niceScale(yMin - (yMax - yMin) * 0.08, yMax + (yMax - yMin) * 0.08);
  const px = (x: number) => pad.l + ((x - sx.lo) / (sx.hi - sx.lo)) * pw;
  const py = (y: number) => pad.t + ph - ((y - sy.lo) / (sy.hi - sy.lo)) * ph;

  animate(canvas, duration, (t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";

    // grid + tick labels
    ctx.lineWidth = 1;
    ctx.fillStyle = colors.text;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let v = sy.lo; v <= sy.hi + sy.step / 2; v += sy.step) {
      ctx.strokeStyle = colors.grid;
      ctx.beginPath(); ctx.moveTo(pad.l, py(v)); ctx.lineTo(pad.l + pw, py(v)); ctx.stroke();
      ctx.fillText(tickText(v, sy.step), pad.l - 8, py(v));
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let v = sx.lo; v <= sx.hi + sx.step / 2; v += sx.step) {
      ctx.strokeStyle = colors.grid;
      ctx.beginPath(); ctx.moveTo(px(v), pad.t); ctx.lineTo(px(v), pad.t + ph); ctx.stroke();
      ctx.fillText(tickText(v, sx.step), px(v), pad.t + ph + 8);
    }
    // axes
    ctx.strokeStyle = colors.axis;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph);
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("X", pad.l + pw / 2, h - 6);
    ctx.save();
    ctx.translate(14, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0);
    ctx.restore();

    // points (pop in one after another)
    xs.forEach((x, i) => {
      const k = clamp01(t * 1.7 - (i / xs.length) * 0.7);
      if (k <= 0) return;
      ctx.fillStyle = colors.point;
      ctx.beginPath(); ctx.arc(px(x), py(ys[i]), 5 * k, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = colors.background; ctx.lineWidth = 1.5; ctx.stroke();
    });

    // regression line (draws left → right)
    const k = clamp01((t - 0.35) / 0.65);
    if (k > 0) {
      const x2 = xMin + (xMax - xMin) * k;
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(px(xMin), py(a + b * xMin)); ctx.lineTo(px(x2), py(a + b * x2)); ctx.stroke();
    }
  });
}

/* ── bell curve with rejection / acceptance regions ── */

export function drawBell(
  canvas: HTMLCanvasElement,
  dist: Dist,
  stat: number,
  critLow: number | null,
  critHigh: number | null,
  duration = 1400
): void {
  const colors = chartColors();
  const { ctx, w, h } = setup(canvas);
  const pad = { l: 24, r: 24, t: 24, b: 36 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;

  const m = Math.ceil(Math.max(4, Math.abs(stat) + 0.8, Math.abs(critLow ?? 0) + 0.8, Math.abs(critHigh ?? 0) + 0.8));
  const top = dist.pdf(0) * 1.18;
  const px = (x: number) => pad.l + ((x + m) / (2 * m)) * pw;
  const py = (y: number) => pad.t + ph - (y / top) * ph;
  const base = py(0);

  const region = (x0: number, x1: number, color: string) => {
    ctx.beginPath();
    ctx.moveTo(px(x0), base);
    const steps = 120;
    for (let s = 0; s <= steps; s++) {
      const x = x0 + ((x1 - x0) * s) / steps;
      ctx.lineTo(px(x), py(dist.pdf(x)));
    }
    ctx.lineTo(px(x1), base);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  animate(canvas, duration, (t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";

    // everything under the curve is revealed from left to right
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.l - 2, 0, pw * t + 4, h);
    ctx.clip();

    const lo = critLow ?? -m;
    const hi = critHigh ?? m;
    region(lo, hi, colors.accept);
    if (critLow !== null) region(-m, critLow, colors.reject);
    if (critHigh !== null) region(critHigh, m, colors.reject);

    ctx.beginPath();
    for (let s = 0; s <= 300; s++) {
      const x = -m + (2 * m * s) / 300;
      if (s === 0) ctx.moveTo(px(x), py(dist.pdf(x)));
      else ctx.lineTo(px(x), py(dist.pdf(x)));
    }
    ctx.strokeStyle = colors.curve;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // axis + ticks
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, base); ctx.lineTo(pad.l + pw, base); ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let v = -m; v <= m; v++) {
      ctx.beginPath(); ctx.moveTo(px(v), base); ctx.lineTo(px(v), base + 5); ctx.stroke();
      ctx.fillText(String(v), px(v), base + 8);
    }

    // labels, critical lines and the test statistic fade in at the end
    ctx.globalAlpha = clamp01((t - 0.6) / 0.4);
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    ctx.fillText("Fail to reject H₀", px((lo + hi) / 2), base - 14);
    if (critLow !== null && px(critLow) - pad.l > 80) { ctx.fillText("Reject H₀", (pad.l + px(critLow)) / 2, base - 14); }
    if (critHigh !== null && pad.l + pw - px(critHigh) > 80) { ctx.fillText("Reject H₀", (px(critHigh) + pad.l + pw) / 2, base - 14); }

    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = colors.line;
    ctx.fillStyle = colors.line;
    const crit = (v: number, side: "left" | "right") => {
      ctx.beginPath(); ctx.moveTo(px(v), pad.t); ctx.lineTo(px(v), base); ctx.stroke();
      ctx.textAlign = side === "right" ? "left" : "right";
      ctx.fillText(v.toFixed(3), px(v) + (side === "right" ? 6 : -6), pad.t + ph * 0.5);
    };
    if (critLow !== null) crit(critLow, "left");
    if (critHigh !== null) crit(critHigh, "right");

    ctx.setLineDash([]);
    ctx.strokeStyle = colors.stat;
    ctx.fillStyle = colors.stat;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(px(stat), pad.t); ctx.lineTo(px(stat), base); ctx.stroke();
    ctx.beginPath(); ctx.arc(px(stat), base, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = "bold 12px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = stat >= 0 ? "left" : "right";
    ctx.fillText(`${dist.name} = ${stat.toFixed(3)}`, px(stat) + (stat >= 0 ? 8 : -8), pad.t + 8);
    ctx.globalAlpha = 1;
  });
}
