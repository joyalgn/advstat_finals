"use client";

import { useCallback, useRef, useState } from "react";
import { drawScatter } from "../app/lib/charts";
import { useCanvasRedraw } from "../hooks/useCanvasRedraw";
import { linearRegression, parsePairs } from "../lib/stats";
import { fmt } from "../lib/utils";

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

interface Analysis {
  xs: number[];
  ys: number[];
  intercept: number;
  slope: number;
  equation: string;
  r: number;
  r2: number;
  strength: string;
  direction: string;
  n: number;
}

export default function RegressionTool() {
  const [data, setData] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);
  const [predX, setPredX] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((duration?: number) => {
    if (result && canvasRef.current) {
      drawScatter(canvasRef.current, result.xs, result.ys, result.intercept, result.slope, duration);
    }
  }, [result]);
  useCanvasRedraw(canvasRef, draw, result);

  function runAnalysis(value = data) {
    try {
      const { xs, ys } = parsePairs(value);
      const res = linearRegression(xs, ys);
      setResult({ xs, ys, intercept: res.intercept, slope: res.slope, equation: res.equation, r: res.r, r2: res.r2, strength: res.strength, direction: res.direction, n: res.n });
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze the data.");
    }
  }

  function clearData() {
    setData("");
    setResult(null);
    setPredX("");
    setError("");
  }

  const prediction = result && predX.trim() !== "" && Number.isFinite(Number(predX))
    ? result.intercept + result.slope * Number(predX)
    : null;

  return (
    <div className="tool">
      <section className="panel reveal" style={{ "--d": ".1s" } as React.CSSProperties}>
        <h2>1. Data input</h2>
        <label htmlFor="regression-data">One &quot;X, Y&quot; pair per line</label>
        <textarea id="regression-data" rows={12} value={data} onChange={(event) => setData(event.target.value)} placeholder={'1, 52\n2, 55\n3, 61'} />
        <div className="row">
          <button className="btn" type="button" onClick={() => { setData(SAMPLE); runAnalysis(SAMPLE); }}>Load sample</button>
          <button className="btn" type="button" onClick={clearData}>Clear</button>
        </div>
        <button className="btn primary block" type="button" onClick={() => runAnalysis()}>Run analysis</button>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <div>
        {!result ? (
          <section className="panel empty reveal" style={{ "--d": ".2s" } as React.CSSProperties}>Results will appear here after you run the analysis.</section>
        ) : (
          <section className="stack pop" key="regression-results">
            <div className="stats-grid">
              <div className="stat wide"><small>Regression equation</small><b>{result.equation}</b></div>
              <div className="stat"><small>Correlation (r)</small><b>{fmt(result.r)}</b></div>
              <div className="stat"><small>R²</small><b>{fmt(result.r2)}</b></div>
              <div className="stat"><small>Strength</small><b>{result.strength}</b></div>
              <div className="stat"><small>Data points (n)</small><b>{result.n}</b></div>
            </div>
            <section className="panel">
              <h2>Scatter diagram with regression line</h2>
              <canvas className="chart" ref={canvasRef} role="img" aria-label="Scatter diagram with fitted regression line" />
            </section>
            <section className="panel">
              <h2>Interpretation</h2>
              <p className="interpretation">The correlation coefficient r = {fmt(result.r)} shows a {result.strength.toLowerCase()} {result.direction} linear relationship between X and Y. About {(result.r2 * 100).toFixed(1)}% of the variation in Y is explained by X. For every 1-unit increase in X, Y changes by about {fmt(result.slope)} units on average.</p>
              <div className="predict">
                <div className="field"><label htmlFor="pred-x">Predict Y for X =</label><input id="pred-x" type="number" step="any" value={predX} onChange={(event) => setPredX(event.target.value)} placeholder="e.g. 11" /></div>
                <output aria-live="polite">{prediction === null ? "—" : fmt(prediction)}</output>
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  );
}