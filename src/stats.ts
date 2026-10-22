// All statistics live here (no DOM code), so they are easy to test and explain.

/* ───────────── Special functions ───────────── */

/** Error function. Taylor series for small |x|, asymptotic expansion for large |x|. */
export function erf(x: number): number {
  const ax = Math.abs(x);
  if (ax < 3) {
    let sum = ax;
    let term = ax;
    for (let n = 1; n < 100; n++) {
      term *= -(ax * ax) / n;
      sum += term / (2 * n + 1);
    }
    return Math.sign(x) * (2 / Math.sqrt(Math.PI)) * sum;
  }
  const x2 = ax * ax;
  let s = 1;
  let t = 1;
  for (let n = 1; n < 8; n++) {
    t *= -(2 * n - 1) / (2 * x2);
    s += t;
  }
  const erfc = (Math.exp(-x2) / (ax * Math.sqrt(Math.PI))) * s;
  return Math.sign(x) * (1 - erfc);
}

export const normPdf = (x: number): number => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
export const normCdf = (x: number): number => 0.5 * (1 + erf(x / Math.SQRT2));

/** Log-gamma (Lanczos approximation). */
function lgamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Continued fraction for the incomplete beta function. */
function betacf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
function betaInc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2)
    ? (bt * betacf(a, b, x)) / a
    : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

export function tPdf(x: number, df: number): number {
  return (
    (Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2)) / Math.sqrt(df * Math.PI)) *
    Math.pow(1 + (x * x) / df, -(df + 1) / 2)
  );
}

export function tCdf(t: number, df: number): number {
  const oneTail = 0.5 * betaInc(df / (df + t * t), df / 2, 0.5);
  return t > 0 ? 1 - oneTail : oneTail;
}

/** Inverse of a monotone CDF by bisection (simple and reliable). */
function invert(cdf: (x: number) => number, p: number, lo: number, hi: number): number {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ───────────── Distributions ───────────── */

export interface Dist {
  name: string; // "z" or "t"
  pdf: (x: number) => number;
  cdf: (x: number) => number;
  inv: (p: number) => number;
}

export const normalDist = (): Dist => ({
  name: "z",
  pdf: normPdf,
  cdf: normCdf,
  inv: (p) => invert(normCdf, p, -12, 12),
});

export const tDist = (df: number): Dist => ({
  name: "t",
  pdf: (x) => tPdf(x, df),
  cdf: (x) => tCdf(x, df),
  inv: (p) => invert((x) => tCdf(x, df), p, -1e5, 1e5),
});

/* ───────────── Simple linear regression ───────────── */

export interface RegressionResult {
  n: number;
  meanX: number;
  meanY: number;
  slope: number;      // b
  intercept: number;  // a
  r: number;
  r2: number;
  strength: string;
  direction: string;
  equation: string;
}

export function describeStrength(r: number): string {
  const a = Math.abs(r);
  if (a >= 0.9) return "Very strong";
  if (a >= 0.7) return "Strong";
  if (a >= 0.4) return "Moderate";
  if (a >= 0.1) return "Weak";
  return "Negligible";
}

export function linearRegression(xs: number[], ys: number[]): RegressionResult {
  const n = xs.length;
  if (n < 2) throw new Error("Enter at least 2 data points.");
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  if (sxx === 0) throw new Error("All X values are the same, so a regression line cannot be computed.");
  if (syy === 0) throw new Error("All Y values are the same, so the correlation coefficient is undefined.");
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r = sxy / Math.sqrt(sxx * syy);
  const sign = slope < 0 ? "-" : "+";
  return {
    n, meanX, meanY, slope, intercept, r,
    r2: r * r,
    strength: describeStrength(r),
    direction: r > 0 ? "positive" : r < 0 ? "negative" : "no",
    equation: `Y = ${intercept.toFixed(4)} ${sign} ${Math.abs(slope).toFixed(4)}X`,
  };
}

/** Turn pasted text ("x, y" per line) into two number arrays. */
export function parsePairs(text: string): { xs: number[]; ys: number[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const xs: number[] = [];
  const ys: number[] = [];
  lines.forEach((line, i) => {
    const parts = line.split(/[\s,;]+/).filter((p) => p.length > 0);
    const nums = parts.map(Number);
    const valid = parts.length === 2 && nums.every((v) => Number.isFinite(v));
    if (!valid) {
      if (i === 0) return; // allow a header row such as "X,Y"
      throw new Error(`Line ${i + 1} is not a valid "X, Y" pair: "${line}"`);
    }
    xs.push(nums[0]);
    ys.push(nums[1]);
  });
  return { xs, ys };
}

/* ───────────── Hypothesis testing (z-test and t-test) ───────────── */

export type TestType = "z" | "t";
export type SampleType = "one" | "two";
export type Tail = "two" | "left" | "right";

export interface TestInput {
  test: TestType;
  sample: SampleType;
  tail: Tail;
  alpha: number;
  mean1: number; sd1: number; n1: number;
  mean2: number; sd2: number; n2: number;
  mu0: number; // hypothesized mean (one-sample) or difference (two-sample)
}

export interface TestResult {
  statistic: number;
  standardError: number;
  df: number | null;
  dist: Dist;
  critLow: number | null;
  critHigh: number | null;
  pValue: number;
  reject: boolean;
}

export function runTest(i: TestInput): TestResult {
  const two = i.sample === "two";
  if (!(i.alpha > 0 && i.alpha < 1)) throw new Error("Significance level must be between 0 and 1.");
  const minN = i.test === "t" ? 2 : 1;
  const checkSample = (label: string, sd: number, n: number) => {
    if (!(sd > 0)) throw new Error(`${label}: the standard deviation must be greater than 0.`);
    if (!Number.isInteger(n) || n < minN) throw new Error(`${label}: n must be a whole number of at least ${minN}.`);
  };
  checkSample(two ? "Sample 1" : "Sample", i.sd1, i.n1);
  if (two) checkSample("Sample 2", i.sd2, i.n2);

  let se: number;
  let diff: number;
  let df: number | null = null;
  if (!two) {
    se = i.sd1 / Math.sqrt(i.n1);
    diff = i.mean1 - i.mu0;
    if (i.test === "t") df = i.n1 - 1;
  } else {
    const v1 = (i.sd1 * i.sd1) / i.n1;
    const v2 = (i.sd2 * i.sd2) / i.n2;
    se = Math.sqrt(v1 + v2);
    diff = i.mean1 - i.mean2 - i.mu0;
    // Welch–Satterthwaite degrees of freedom (unequal variances)
    if (i.test === "t") df = (v1 + v2) ** 2 / ((v1 * v1) / (i.n1 - 1) + (v2 * v2) / (i.n2 - 1));
  }

  const statistic = diff / se;
  const dist = i.test === "z" ? normalDist() : tDist(df as number);

  let critLow: number | null = null;
  let critHigh: number | null = null;
  let pValue: number;
  let reject: boolean;
  if (i.tail === "two") {
    critHigh = dist.inv(1 - i.alpha / 2);
    critLow = -critHigh;
    pValue = Math.min(1, 2 * dist.cdf(-Math.abs(statistic)));
    reject = Math.abs(statistic) > critHigh;
  } else if (i.tail === "right") {
    critHigh = dist.inv(1 - i.alpha);
    pValue = dist.cdf(-statistic);
    reject = statistic > critHigh;
  } else {
    critLow = dist.inv(i.alpha);
    pValue = dist.cdf(statistic);
    reject = statistic < critLow;
  }
  return { statistic, standardError: se, df, dist, critLow, critHigh, pValue, reject };
}
