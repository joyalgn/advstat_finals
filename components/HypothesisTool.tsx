"use client";

import { useCallback, useRef, useState } from "react";
import type { Prisma } from "@prisma/client";
import { drawBell } from "../app/lib/charts";
import { saveAnalysisHistory } from "../app/history/actions";
import { useCanvasRedraw } from "../hooks/useCanvasRedraw";
import { runTest, type SampleType, type Tail, type TestInput, type TestResult, type TestType } from "../lib/stats";
import { fmt, fmtP } from "../lib/utils";

const INITIAL_VALUES = { mean1: "", sd1: "", n1: "", mean2: "", sd2: "", n2: "", mu0: "" };
type InputValues = typeof INITIAL_VALUES;

const ONE_SAMPLE_DATA = [
  { mean1: "52.3", sd1: "6.5", n1: "36", mean2: "", sd2: "", n2: "", mu0: "50" },
  { mean1: "48.7", sd1: "5.8", n1: "42", mean2: "", sd2: "", n2: "", mu0: "50" },
  { mean1: "74.2", sd1: "8.1", n1: "30", mean2: "", sd2: "", n2: "", mu0: "72" },
  { mean1: "63.6", sd1: "7.4", n1: "35", mean2: "", sd2: "", n2: "", mu0: "65" },
];
const TWO_SAMPLE_DATA = [
  { mean1: "52.3", sd1: "6.5", n1: "36", mean2: "49.1", sd2: "7.2", n2: "40", mu0: "0" },
  { mean1: "81.4", sd1: "9.2", n1: "32", mean2: "77.8", sd2: "8.5", n2: "29", mu0: "0" },
  { mean1: "24.6", sd1: "4.3", n1: "25", mean2: "26.1", sd2: "4.8", n2: "28", mu0: "0" },
  { mean1: "68.2", sd1: "7.6", n1: "38", mean2: "65.5", sd2: "8.1", n2: "34", mu0: "0" },
];

function numberValue(values: InputValues, key: keyof InputValues): number {
  const raw = values[key].trim();
  if (raw === "") throw new Error("Please fill in all the required fields.");
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error("Inputs must be valid numbers.");
  return value;
}

function hypothesisText(sample: SampleType, tail: Tail, mu: string) {
  const symbol = sample === "one" ? "μ" : "μ₁ − μ₂";
  const nullSymbol = tail === "two" ? "=" : tail === "left" ? "≥" : "≤";
  const alternativeSymbol = tail === "two" ? "≠" : tail === "left" ? "<" : ">";
  return { h0: `${symbol} ${nullSymbol} ${mu || "0"}`, h1: `${symbol} ${alternativeSymbol} ${mu || "0"}` };
}

function criticalText(result: TestResult): string {
  if (result.critLow !== null && result.critHigh !== null) return `± ${fmt(result.critHigh)}`;
  return fmt((result.critHigh ?? result.critLow) as number);
}

export default function HypothesisTool() {
  const [test, setTest] = useState<TestType>("z");
  const [sample, setSample] = useState<SampleType>("one");
  const [tail, setTail] = useState<Tail>("two");
  const [alpha, setAlpha] = useState("0.05");
  const [values, setValues] = useState<InputValues>(INITIAL_VALUES);
  const [hypotheses, setHypotheses] = useState(() => hypothesisText("one", "two", ""));
  const [result, setResult] = useState<TestResult | null>(null);
  const [resultAlpha, setResultAlpha] = useState(0.05);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const sampleIndex = useRef(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((duration?: number) => {
    if (result && canvasRef.current) drawBell(canvasRef.current, result.dist, result.statistic, result.critLow, result.critHigh, duration);
  }, [result]);
  useCanvasRedraw(canvasRef, draw, result);

  function updateHypotheses(nextSample: SampleType, nextTail: Tail, mu: string) {
    setHypotheses(hypothesisText(nextSample, nextTail, mu));
  }

  function setValue(key: keyof InputValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "mu0") updateHypotheses(sample, tail, value);
  }

  async function run() {
    setHistoryError("");
    let input: TestInput;
    let analysis: TestResult;
    try {
      input = {
        test, sample, tail, alpha: Number(alpha),
        mean1: numberValue(values, "mean1"), sd1: numberValue(values, "sd1"), n1: numberValue(values, "n1"),
        mean2: sample === "two" ? numberValue(values, "mean2") : 0,
        sd2: sample === "two" ? numberValue(values, "sd2") : 1,
        n2: sample === "two" ? numberValue(values, "n2") : 2,
        mu0: numberValue(values, "mu0"),
      };
      analysis = runTest(input);
      setResult(analysis);
      setResultAlpha(Number(alpha));
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run the test.");
      return;
    }

    try {
      const saved = await saveAnalysisHistory("Hypothesis Testing", {
        ...input,
        hypotheses,
      }, {
        test: input.test,
        sample: input.sample,
        tail: input.tail,
        alpha: input.alpha,
        statistic: analysis.statistic,
        pValue: analysis.pValue,
        criticalValue: criticalText(analysis),
        standardError: analysis.standardError,
        degreesOfFreedom: analysis.df,
        rejectNull: analysis.reject,
      } satisfies Prisma.InputJsonValue);
      if (!saved.success) setHistoryError(saved.message);
    } catch {
      setHistoryError("The analysis completed, but history could not be saved. Check your connection and try again.");
    }
  }

  function loadSample() {
    const samples = sample === "one" ? ONE_SAMPLE_DATA : TWO_SAMPLE_DATA;
    sampleIndex.current = (sampleIndex.current + 1) % samples.length;
    const nextValues = samples[sampleIndex.current];
    setValues(nextValues);
    updateHypotheses(sample, tail, nextValues.mu0);
    setResult(null);
    setError("");
    setHistoryError("");
  }

  const sdName = test === "z" ? "Population std. dev." : "Sample std. dev.";
  const symbol = test === "z" ? "σ" : "s";
  const tableRows = result ? [0.1, 0.05, 0.025, 0.01, 0.005].map((level) => ({
    level,
    one: result.dist.inv(1 - level),
    two: result.dist.inv(1 - level / 2),
  })) : [];

  return (
    <div className="tool">
      <section className="panel reveal" style={{ "--d": ".1s" } as React.CSSProperties}>
        <h2>1. Test setup</h2>
        <Segment label="Test" options={[["z", "Z-test"], ["t", "T-test"]]} value={test} onChange={(value) => setTest(value as TestType)} />
        <Segment label="Sample" options={[["one", "One-sample"], ["two", "Two-sample"]]} value={sample} onChange={(value) => { const next = value as SampleType; setSample(next); updateHypotheses(next, tail, values.mu0); }} />
        <Segment label="Alternative hypothesis (tail)" options={[["two", "Two-tailed"], ["left", "Left"], ["right", "Right"]]} value={tail} onChange={(value) => { const next = value as Tail; setTail(next); updateHypotheses(sample, next, values.mu0); }} />
        <Segment label="Level of significance (α)" options={[["0.10", "0.10"], ["0.05", "0.05"], ["0.01", "0.01"]]} value={alpha} onChange={setAlpha} />

        <h2 className="section-heading">2. Hypotheses</h2>
        <div className="field"><label htmlFor="h0">Null hypothesis (H₀)</label><input id="h0" type="text" value={hypotheses.h0} onChange={(event) => setHypotheses((current) => ({ ...current, h0: event.target.value }))} /></div>
        <div className="field"><label htmlFor="h1">Alternative hypothesis (H₁)</label><input id="h1" type="text" value={hypotheses.h1} onChange={(event) => setHypotheses((current) => ({ ...current, h1: event.target.value }))} /></div>
        <p className="hint">Written automatically from your setup, but you can edit the wording.</p>

        <h2 className="section-heading">3. Sample data</h2>
        <NumberField id="mean1" label="Sample mean (x̄₁)" value={values.mean1} onChange={(value) => setValue("mean1", value)} />
        <div className="grid2">
          <NumberField id="sd1" label={`${sdName} (${symbol}${sample === "two" ? "₁" : ""})`} value={values.sd1} onChange={(value) => setValue("sd1", value)} />
          <NumberField id="n1" label="Sample size (n₁)" value={values.n1} onChange={(value) => setValue("n1", value)} step="1" />
        </div>
        {sample === "two" && <>
          <NumberField id="mean2" label="Sample 2 mean (x̄₂)" value={values.mean2} onChange={(value) => setValue("mean2", value)} />
          <div className="grid2">
            <NumberField id="sd2" label={`${sdName} (${symbol}₂)`} value={values.sd2} onChange={(value) => setValue("sd2", value)} />
            <NumberField id="n2" label="Sample size (n₂)" value={values.n2} onChange={(value) => setValue("n2", value)} step="1" />
          </div>
        </>}
        <NumberField id="mu0" label={sample === "one" ? "Hypothesized mean (μ₀)" : "Hypothesized difference (D₀)"} value={values.mu0} onChange={(value) => setValue("mu0", value)} />
        <div className="row"><button className="btn" type="button" onClick={loadSample}>Reload sample data</button></div>
        <button className="btn primary block" type="button" onClick={run}>Run test</button>
        {error && <p className="error" role="alert">{error}</p>}
        {historyError && <p className="error" role="alert">{historyError}</p>}
      </section>

      <div>
        {!result ? (
          <section className="panel empty reveal" style={{ "--d": ".2s" } as React.CSSProperties}>Results will appear here after you run the test.</section>
        ) : (
          <section className="stack pop" key="hypothesis-results">
            <div className={`decision analysis-highlight ${result.reject ? "reject" : "keep"}`}>
              <h3>{result.reject ? "Reject H₀" : "Fail to reject H₀"}</h3>
              <p>At α = {resultAlpha}, the test statistic {result.dist.name} = {fmt(result.statistic)} {result.reject ? "falls in the rejection region" : "falls in the acceptance region"} (critical value {criticalText(result)}), and the p-value is {fmtP(result.pValue)}. {result.reject ? "There is sufficient evidence to support the alternative hypothesis H₁." : "There is not enough evidence to support the alternative hypothesis H₁."}</p>
            </div>
            <div className="stats-grid">
              <div className="stat"><small>Test statistic ({result.dist.name})</small><b>{fmt(result.statistic)}</b></div>
              <div className="stat"><small>p-value</small><b>{fmtP(result.pValue)}</b></div>
              <div className="stat"><small>Critical value(s)</small><b>{criticalText(result)}</b></div>
              <div className="stat"><small>Std. error</small><b>{fmt(result.standardError)}</b></div>
              <div className="stat"><small>Degrees of freedom</small><b>{result.df === null ? "—" : fmt(result.df, 2)}</b></div>
              <div className="stat"><small>Significance (α)</small><b>{resultAlpha}</b></div>
            </div>
            <section className="panel"><h2>Distribution curve</h2><canvas className="chart" ref={canvasRef} role="img" aria-label="Test distribution curve showing critical values and test statistic" /></section>
            <section className="panel">
              <h2>{result.dist.name === "z" ? "Z-table: critical z-values" : `T-table: critical t-values (df = ${fmt(result.df as number, 2)})`}</h2>
              <table><thead><tr><th>Alpha (α)</th><th>One-tailed</th><th>Two-tailed</th></tr></thead><tbody>
                {tableRows.map((row) => <tr className={Math.abs(row.level - resultAlpha) < 1e-12 ? "on" : undefined} key={row.level}><td>{row.level}</td><td>{fmt(row.one, 3)}</td><td>± {fmt(row.two, 3)}</td></tr>)}
              </tbody></table>
            </section>
          </section>
        )}
      </div>
    </div>
  );
}

function Segment({ label, options, value, onChange }: { label: string; options: [string, string][]; value: string; onChange: (value: string) => void }) {
  return <div className="field"><span className="lbl">{label}</span><div className="seg">{options.map(([option, text]) => <button type="button" key={option} className={value === option ? "active" : undefined} aria-pressed={value === option} onClick={() => onChange(option)}>{text}</button>)}</div></div>;
}

function NumberField({ id, label, value, onChange, step = "any" }: { id: string; label: string; value: string; onChange: (value: string) => void; step?: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type="number" step={step} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}