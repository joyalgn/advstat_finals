"use client";

import { useCallback, useRef, useState } from "react";
import type { Prisma } from "@prisma/client";
import { drawScatter } from "../app/lib/charts";
import { saveAnalysisHistory } from "../app/history/actions";
import { useCanvasRedraw } from "../hooks/useCanvasRedraw";
import { linearRegression, parsePairs } from "../lib/stats";
import { fmt } from "../lib/utils";

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

interface ObservationRow {
  id: number;
  x: string;
  y: string;
}

function blankRows(firstId: number, count: number): ObservationRow[] {
  return Array.from({ length: count }, (_, index) => ({ id: firstId + index, x: "", y: "" }));
}

function generateRandomSample(): { x: string; y: string }[] {
  const count = Math.floor(Math.random() * 5) + 8;
  const baseSlope = (Math.random() * 4 + 1.5).toFixed(2);
  const baseIntercept = Math.floor(Math.random() * 30) + 10;
  
  const sampleRows: { x: string; y: string }[] = [];

  for (let i = 1; i <= count; i++) {
    const xVal = i * Math.floor(Math.random() * 2 + 1);
    const noise = Math.random() * 8 - 4;
    const yVal = Math.max(1, Math.round(Number(baseSlope) * xVal + baseIntercept + noise));

    sampleRows.push({
      x: String(xVal),
      y: String(yVal),
    });
  }

  return sampleRows;
}

const DEFAULT_X_LABEL = "X Value";
const DEFAULT_Y_LABEL = "Y Value";

export default function RegressionTool() {
  const [rows, setRows] = useState<ObservationRow[]>(() => blankRows(0, 3));
  const [labels, setLabels] = useState({ x: DEFAULT_X_LABEL, y: DEFAULT_Y_LABEL });
  const nextRowId = useRef(3);
  const [result, setResult] = useState<Analysis | null>(null);
  const [predX, setPredX] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const data = [
    ...rows
      .filter((row) => row.x.trim() !== "" || row.y.trim() !== "")
      .map((row) => `${row.x.trim()}, ${row.y.trim()}`),
  ].join("\n");

  const xLabel = labels.x.trim() || DEFAULT_X_LABEL;
  const yLabel = labels.y.trim() || DEFAULT_Y_LABEL;

  const draw = useCallback(
    (duration?: number) => {
      if (result && canvasRef.current) {
        drawScatter(canvasRef.current, result.xs, result.ys, result.intercept, result.slope, duration, xLabel, yLabel);
      }
    },
    [result, xLabel, yLabel]
  );

  useCanvasRedraw(canvasRef, draw, result);

  async function runAnalysis(value = data) {
    setHistoryError("");
    let analysis: Analysis;
    try {
      const { xs, ys } = parsePairs(value);
      const res = linearRegression(xs, ys);
      analysis = {
        xs,
        ys,
        intercept: res.intercept,
        slope: res.slope,
        equation: res.equation,
        r: res.r,
        r2: res.r2,
        strength: res.strength,
        direction: res.direction,
        n: res.n,
      };
      setResult(analysis);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to analyze the data.");
      return;
    }

    try {
      const saved = await saveAnalysisHistory(
        "Simple Linear Regression",
        {
          observations: value,
          xLabel,
          yLabel,
        },
        {
          equation: analysis.equation,
          correlation: analysis.r,
          rSquared: analysis.r2,
          strength: analysis.strength,
          direction: analysis.direction,
          sampleSize: analysis.n,
        } satisfies Prisma.InputJsonValue
      );
      if (!saved.success) setHistoryError(saved.message);
    } catch {
      setHistoryError("The analysis completed, but history could not be saved. Check your connection and try again.");
    }
  }

  function clearData() {
    setRows(blankRows(nextRowId.current, 3));
    nextRowId.current += 3;
    setLabels({ x: DEFAULT_X_LABEL, y: DEFAULT_Y_LABEL });
    setResult(null);
    setPredX("");
    setError("");
    setHistoryError("");
  }

  function updateRow(id: number, key: "x" | "y", value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setError("");
  }

  function addRow() {
    setRows((current) => [...current, ...blankRows(nextRowId.current++, 1)]);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
    setError("");
  }

  function loadSample() {
    const randomPairs = generateRandomSample();

    const sampleRows = randomPairs.map((pair) => ({
      id: nextRowId.current++,
      x: pair.x,
      y: pair.y,
    }));

    setRows(sampleRows);
    setResult(null);
    setPredX("");
    setError("");
    setHistoryError("");
  }

  const prediction =
    result && predX.trim() !== "" && Number.isFinite(Number(predX))
      ? result.intercept + result.slope * Number(predX)
      : null;

  return (
    <div className="tool">
      <section className="panel regression-input-panel reveal" style={{ "--d": ".1s" } as React.CSSProperties}>
        <header className="regression-input-heading">
          <span className="regression-input-step">01 · DATA</span>
          <h2>Regression data</h2>
          <p>
            Enter a numerical value for each variable in every row. Add optional names for the variables to make the
            table and chart easier to read.
          </p>
        </header>
        <div className="regression-variable-names">
          <label>
            X variable name
            <input
              type="text"
              maxLength={40}
              value={labels.x}
              onChange={(event) => setLabels((current) => ({ ...current, x: event.target.value }))}
              placeholder={DEFAULT_X_LABEL}
            />
          </label>
          <label>
            Y variable name
            <input
              type="text"
              maxLength={40}
              value={labels.y}
              onChange={(event) => setLabels((current) => ({ ...current, y: event.target.value }))}
              placeholder={DEFAULT_Y_LABEL}
            />
          </label>
        </div>
        <div className="regression-table-scroll">
          <table className="regression-entry-table" aria-label="Regression observation data">
            <thead>
              <tr>
                <th scope="col" className="regression-row-heading">
                  #
                </th>
                <th scope="col">
                  <span className="regression-variable-label">{xLabel}</span>
                  <span className="regression-variable-axis">X</span>
                </th>
                <th scope="col">
                  <span className="regression-variable-label">{yLabel}</span>
                  <span className="regression-variable-axis">Y</span>
                </th>
                <th scope="col" className="regression-remove-heading" aria-label="Row actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <th scope="row" className="regression-row-number">
                    {String(index + 1).padStart(2, "0")}
                  </th>
                  <td>
                    <input
                      className="regression-cell-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={row.x}
                      aria-label={`${xLabel} (X), observation ${index + 1}`}
                      onChange={(event) => updateRow(row.id, "x", event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="regression-cell-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={row.y}
                      aria-label={`${yLabel} (Y), observation ${index + 1}`}
                      onChange={(event) => updateRow(row.id, "y", event.target.value)}
                    />
                  </td>
                  <td className="regression-remove-cell">
                    <button
                      className="regression-remove-row"
                      type="button"
                      aria-label={`Remove observation ${index + 1}`}
                      title={`Remove observation ${index + 1}`}
                      onClick={() => removeRow(row.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="regression-table-controls">
          <span>
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </span>
          <button className="btn regression-add-row" type="button" onClick={addRow}>
            <span aria-hidden="true">+</span> Add Row
          </button>
        </div>
        <div className="row regression-input-actions">
          <button className="btn" type="button" onClick={loadSample}>
            Reload Sample
          </button>
          <button className="btn" type="button" onClick={clearData}>
            Clear
          </button>
        </div>
        <button className="btn primary block regression-run-button" type="button" onClick={() => runAnalysis()}>
          Run Analysis
        </button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {historyError && (
          <p className="error" role="alert">
            {historyError}
          </p>
        )}
      </section>

      <div>
        {!result ? (
          <section className="panel empty reveal" style={{ "--d": ".2s" } as React.CSSProperties}>
            Results will appear here after you run the analysis.
          </section>
        ) : (
          <section className="stack pop" key="regression-results">
            <div className="stats-grid">
              <div className="stat wide analysis-highlight">
                <small>Regression equation</small>
                <b>{result.equation}</b>
              </div>
              <div className="stat">
                <small>Correlation (r)</small>
                <b>{fmt(result.r)}</b>
              </div>
              <div className="stat">
                <small>R²</small>
                <b>{fmt(result.r2)}</b>
              </div>
              <div className="stat">
                <small>Strength</small>
                <b>{result.strength}</b>
              </div>
              <div className="stat">
                <small>Data points (n)</small>
                <b>{result.n}</b>
              </div>
            </div>
            <section className="panel">
              <h2>Scatter diagram with regression line</h2>
              <canvas
                className="chart"
                ref={canvasRef}
                role="img"
                aria-label={`Scatter diagram of ${yLabel} by ${xLabel} with fitted regression line`}
              />
            </section>
            <section className="panel">
              <h2>Interpretation</h2>
              <p className="interpretation">
                The correlation coefficient r = {fmt(result.r)} shows a {result.strength.toLowerCase()}{" "}
                {result.direction} linear relationship between {xLabel} and {yLabel}. About{" "}
                {(result.r2 * 100).toFixed(1)}% of the variation in {yLabel} is explained by {xLabel}. For every 1-unit
                increase in {xLabel}, {yLabel} changes by about {fmt(result.slope)} units on average.
              </p>
              <div className="predict">
                <div className="field">
                  <label htmlFor="pred-x">Predict Y for X =</label>
                  <input
                    id="pred-x"
                    type="number"
                    step="any"
                    value={predX}
                    onChange={(event) => setPredX(event.target.value)}
                    placeholder="e.g. 11"
                  />
                </div>
                <output aria-live="polite">{prediction === null ? "—" : fmt(prediction)}</output>
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  );
}