import Link from "next/link";
import Footer from "../../../components/Footer";
import ClearHistoryButton from "../../../components/ClearHistoryButton";
import { requireAuthenticatedUser } from "../../auth/session";
import { prisma } from "../../../lib/prisma";

export const metadata = { title: "Analysis History | STATAXIS" };

interface RegressionPairs {
  xs: number[];
  ys: number[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function numericPairs(xs: unknown, ys: unknown): RegressionPairs | null {
  if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length || xs.length < 2) return null;
  if (!xs.every((value) => typeof value === "number" && Number.isFinite(value))
    || !ys.every((value) => typeof value === "number" && Number.isFinite(value))) return null;
  return { xs, ys };
}

function parseRegressionPairs(input: unknown, depth = 0): RegressionPairs | null {
  if (depth > 3) return null;
  if (typeof input === "string") {
    try {
      const parsed = parseRegressionPairs(JSON.parse(input), depth + 1);
      if (parsed) return parsed;
    } catch {
      // Older records may contain plain text or malformed JSON rather than serialized data.
    }

    const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const pairs: [number, number][] = [];
    for (const [index, line] of lines.entries()) {
      const parts = line.split(/[,\s;]+/).filter(Boolean);
      if (parts.length !== 2) {
        if (index === 0) continue;
        return null;
      }
      const values = parts.map(Number);
      if (!values.every(Number.isFinite)) {
        if (index === 0) continue;
        return null;
      }
      pairs.push([values[0], values[1]]);
    }
    return pairs.length >= 2
      ? { xs: pairs.map(([x]) => x), ys: pairs.map(([, y]) => y) }
      : null;
  }

  if (Array.isArray(input)) {
    const pairs = input.flatMap((row) => {
      if (Array.isArray(row) && row.length >= 2) {
        const x = Number(row[0]);
        const y = Number(row[1]);
        return Number.isFinite(x) && Number.isFinite(y) ? [[x, y]] : [];
      }
      if (isRecord(row)) {
        const x = Number(row.x ?? row.X);
        const y = Number(row.y ?? row.Y);
        return Number.isFinite(x) && Number.isFinite(y) ? [[x, y]] : [];
      }
      return [];
    });
    return pairs.length >= 2
      ? { xs: pairs.map(([x]) => x), ys: pairs.map(([, y]) => y) }
      : null;
  }

  if (!isRecord(input)) return null;
  const directPairs = numericPairs(input.xs, input.ys);
  if (directPairs) return directPairs;
  for (const key of ["observations", "data", "dataset", "input"]) {
    if (key in input) {
      const pairs = parseRegressionPairs(input[key], depth + 1);
      if (pairs) return pairs;
    }
  }
  return null;
}

function resultMetric(result: unknown, ...keys: string[]): string | null {
  if (!isRecord(result)) return null;
  for (const key of keys) {
    const value = result[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) {
      return key === "sampleSize" || key === "n" ? String(value) : value.toFixed(4);
    }
  }
  return null;
}

function formatPhilippineTime(date: Date): string {
  return `${new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)} PHT`;
}

function parseStoredObject(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function findField(source: Record<string, unknown>, aliases: string[], depth = 0): { found: boolean; value: unknown } {
  if (depth > 3) return { found: false, value: undefined };
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(source, alias)) return { found: true, value: source[alias] };
  }
  for (const [key, value] of Object.entries(source)) {
    if (isRecord(value) && ["settings", "sample", "sample1", "sample2", "sampleData", "hypotheses", "parameters", "input", "data", "results", "result", "testResult", "output"].includes(key.toLowerCase())) {
      const match = findField(value, aliases, depth + 1);
      if (match.found) return match;
    }
  }
  return { found: false, value: undefined };
}

function displayHistoryValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "N/A";
  if (typeof value === "string") return value.trim().toLowerCase() === "null" ? "N/A" : value;
  try {
    return JSON.stringify(value, null, 2) ?? "N/A";
  } catch {
    return "N/A";
  }
}

function fieldValue(source: Record<string, unknown>, aliases: string[], formatter = displayHistoryValue): string {
  const field = findField(source, aliases);
  return field.found ? formatter(field.value) : "N/A";
}

function formatTestType(value: unknown): string {
  if (typeof value !== "string") return displayHistoryValue(value);
  const test = value.toLowerCase();
  if (test === "z") return "Z-test";
  if (test === "t") return "T-test";
  return value;
}

function formatSampleType(value: unknown): string {
  if (typeof value !== "string") return isRecord(value) || Array.isArray(value) ? "N/A" : displayHistoryValue(value);
  if (value.toLowerCase() === "one") return "One-sample";
  if (value.toLowerCase() === "two") return "Two-sample";
  return value;
}

function formatTail(value: unknown): string {
  if (typeof value !== "string") return displayHistoryValue(value);
  if (value.toLowerCase() === "two") return "Two-tailed";
  if (value.toLowerCase() === "left") return "Left-tailed";
  if (value.toLowerCase() === "right") return "Right-tailed";
  return value;
}

function HistoryFieldGroup({ title, fields }: { title: string; fields: [string, string][] }) {
  return (
    <section className="history-hypothesis-group">
      <h3>{title}</h3>
      <dl>
        {fields.map(([label, value]) => (
          <div className="history-hypothesis-field" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function HistoryPage() {
  const user = await requireAuthenticatedUser();
  const records = await prisma.analysisHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, method: true, inputData: true, resultData: true, createdAt: true },
  });

  return (
    <>
      <main className="container">
        <section className="page-head reveal">
          <h1>Analysis History</h1>
          <p>Review your completed analyses, datasets, and key results. Only records saved to your account are shown.</p>
        </section>
        <ClearHistoryButton hasRecords={records.length > 0} />
        {records.length === 0 ? (
          <section className="panel history-empty">
            <h2>No analyses yet</h2>
            <p>Run a regression or hypothesis test and it will appear here for future reference.</p>
            <div className="row">
              <Link className="btn" href="/regression">Open regression</Link>
              <Link className="btn" href="/hypothesis">Open hypothesis testing</Link>
            </div>
          </section>
        ) : (
          <section className="history-list" aria-label="Previous analyses">
            {records.map((record) => (
              <details className="panel history-record" key={record.id}>
                <summary>
                  <span className="history-record-heading">
                    <strong>{record.method}</strong>
                    <time dateTime={record.createdAt.toISOString()}>{formatPhilippineTime(record.createdAt)}</time>
                  </span>
                  <span className="history-record-caret" aria-hidden="true">⌄</span>
                </summary>
                <div className="history-record-details">
                  {record.method === "Simple Linear Regression" ? (
                    (() => {
                      const pairs = parseRegressionPairs(record.inputData);
                      const equation = resultMetric(record.resultData, "equation", "regressionEquation");
                      const sampleSize = resultMetric(record.resultData, "sampleSize", "n") ?? (pairs ? String(pairs.xs.length) : null);
                      const correlation = resultMetric(record.resultData, "correlation", "r");
                      const rSquared = resultMetric(record.resultData, "rSquared", "r2");
                      const strength = resultMetric(record.resultData, "strength", "relationshipStrength");
                      const direction = resultMetric(record.resultData, "direction", "relationshipDirection");
                      const hasMetrics = Boolean(sampleSize || correlation || rSquared || strength || direction);

                      return pairs ? (
                        <div className="history-analysis-body history-regression">
                          <section className="history-data-section">
                            <h2 className="history-section-title">Input observations</h2>
                            <div className="history-table-wrap">
                              <table className="history-observations">
                                <thead><tr><th scope="col">Observation</th><th scope="col">X</th><th scope="col">Y</th></tr></thead>
                                <tbody>
                                  {pairs.xs.map((x, index) => (
                                    <tr key={index}><th scope="row">{index + 1}</th><td>{x}</td><td>{pairs.ys[index]}</td></tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </section>
                          {equation && <section className="history-equation history-featured-result"><span>Regression equation</span><strong>{equation}</strong></section>}
                          {hasMetrics ? (
                            <section className="history-results">
                              <h2 className="history-section-title">Key results</h2>
                              <div className="history-metrics">
                                {[
                                  ["Sample size", sampleSize],
                                  ["Correlation (r)", correlation],
                                  ["R²", rSquared],
                                  ["Relationship strength", strength],
                                  ["Direction", direction],
                                ].map(([label, value]) => (
                                  <div className="history-metric" key={label}>
                                    <span>{label}</span>
                                    <strong>{value ?? "—"}</strong>
                                  </div>
                                ))}
                              </div>
                            </section>
                          ) : (
                            <section className="history-fallback">
                              <h2>Saved results</h2>
                              <pre>{JSON.stringify(record.resultData, null, 2)}</pre>
                            </section>
                          )}
                        </div>
                      ) : (
                        <div className="history-analysis-body history-data-grid">
                          <section>
                            <h2>Input data</h2>
                            <pre>{JSON.stringify(record.inputData, null, 2)}</pre>
                          </section>
                          <section>
                            <h2>Key results</h2>
                            <pre>{JSON.stringify(record.resultData, null, 2)}</pre>
                          </section>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const input = parseStoredObject(record.inputData);
                      const results = parseStoredObject(record.resultData);
                      if (!input || !results) {
                        return (
                          <div className="history-data-grid">
                            <section>
                              <h2>Input data</h2>
                              <pre>{typeof record.inputData === "string" ? record.inputData : JSON.stringify(record.inputData, null, 2) ?? "N/A"}</pre>
                            </section>
                            <section>
                              <h2>Key results</h2>
                              <pre>{typeof record.resultData === "string" ? record.resultData : JSON.stringify(record.resultData, null, 2) ?? "N/A"}</pre>
                            </section>
                          </div>
                        );
                      }

                      const test = findField(input, ["test", "testType", "method"]);
                      const sample = findField(input, ["sample", "sampleType", "sampleCount", "design"]);
                      const tail = findField(input, ["tail", "alternative", "alternativeTail"]);
                      const alpha = findField(input, ["alpha", "significanceLevel", "significance", "level"]);
                      const sampleFields: [string, string][] = [
                        ["Sample 1 mean", fieldValue(input, ["mean1", "sampleMean1", "xbar1", "mean", "sampleMean"])],
                        ["Sample 1 standard deviation", fieldValue(input, ["sd1", "stdDev1", "standardDeviation1", "sigma1", "sd", "standardDeviation"])],
                        ["Sample 1 size", fieldValue(input, ["n1", "sampleSize1", "size1", "n"])],
                        ["Sample 2 mean", fieldValue(input, ["mean2", "sampleMean2", "xbar2"])],
                        ["Sample 2 standard deviation", fieldValue(input, ["sd2", "stdDev2", "standardDeviation2", "sigma2"])],
                        ["Sample 2 size", fieldValue(input, ["n2", "sampleSize2", "size2"])],
                      ];
                      const decision = findField(results, ["rejectNull", "reject", "rejected", "rejectsNull", "rejectH0", "nullRejected"]);
                      const decisionText = decision.found && typeof decision.value === "boolean"
                        ? decision.value ? "Reject the null hypothesis" : "Do not reject the null hypothesis"
                        : decision.found && typeof decision.value === "string"
                          ? decision.value
                          : fieldValue(results, ["decision", "conclusion"]);
                      const metric = (label: string, value: string) => (
                        <div className="history-metric" key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      );
                      const knownInputKeys = new Set([
                        "test", "testType", "method", "sample", "sampleType", "sampleCount", "design",
                        "tail", "alternative", "alternativeTail", "alpha", "significanceLevel", "significance", "level",
                        "mean1", "sampleMean1", "xbar1", "mean", "sampleMean", "sd1", "stdDev1", "standardDeviation1", "sigma1", "sd", "standardDeviation", "n1", "sampleSize1", "size1", "n",
                        "mean2", "sampleMean2", "xbar2", "sd2", "stdDev2", "standardDeviation2", "sigma2", "n2", "sampleSize2", "size2",
                        "mu0", "hypothesizedMean", "populationMean", "d0", "hypothesizedDifference",
                        "hypotheses", "h0", "h1", "nullHypothesis", "alternativeHypothesis",
                      ]);
                      const extras = Object.fromEntries(Object.entries(input).filter(([key]) => !knownInputKeys.has(key)));
                      const knownResultKeys = new Set([
                        "test", "testType", "alpha", "significanceLevel", "statistic", "testStatistic", "value",
                        "pValue", "pvalue", "p", "criticalValue", "critical", "criticalValues", "standardError",
                        "standard_error", "se", "rejectNull", "reject", "rejected", "rejectsNull", "rejectH0",
                        "nullRejected", "decision", "conclusion",
                      ]);
                      const resultExtras = Object.fromEntries(Object.entries(results).filter(([key]) => !knownResultKeys.has(key)));

                      return (
                        <div className="history-analysis-body history-hypothesis">
                          <section className="history-hypothesis-input">
                            <h2 className="history-section-title">Input data</h2>
                            {test.found || sample.found || tail.found || alpha.found || sampleFields.some(([, value]) => value !== "N/A") ? (
                              <>
                                <HistoryFieldGroup title="Test settings" fields={[
                                  ["Test type", test.found ? formatTestType(test.value) : "N/A"],
                                  ["Sample design", sample.found ? formatSampleType(sample.value) : "N/A"],
                                  ["Alternative tail", tail.found ? formatTail(tail.value) : "N/A"],
                                  ["Significance level (α)", alpha.found ? displayHistoryValue(alpha.value) : "N/A"],
                                ]} />
                                <HistoryFieldGroup title="Sample information" fields={sampleFields} />
                                <HistoryFieldGroup title="Population parameters" fields={[
                                  ["Hypothesized mean (μ₀)", fieldValue(input, ["mu0", "hypothesizedMean", "populationMean"])],
                                  ["Hypothesized difference (D₀)", fieldValue(input, ["d0", "hypothesizedDifference"])],
                                ]} />
                                <HistoryFieldGroup title="Hypotheses" fields={[
                                  ["Null hypothesis (H₀)", fieldValue(input, ["h0", "nullHypothesis"])],
                                  ["Alternative hypothesis (H₁)", fieldValue(input, ["h1", "alternativeHypothesis"])],
                                ]} />
                              </>
                            ) : (
                              <pre>{JSON.stringify(input, null, 2)}</pre>
                            )}
                            {Object.keys(extras).length > 0 && (
                              <details className="history-extra">
                                <summary>Other saved input fields</summary>
                                <pre>{JSON.stringify(extras, null, 2)}</pre>
                              </details>
                            )}
                          </section>
                          <section className="history-hypothesis-results">
                            <h2 className="history-section-title">Key results</h2>
                            <div className={`history-decision history-featured-result${decision.found && typeof decision.value === "boolean" ? decision.value ? " is-reject" : " is-retain" : ""}`}>
                              <span>Statistical decision</span>
                              <strong>{decisionText}</strong>
                            </div>
                            <div className="history-metrics">
                              {metric("Test type", formatTestType(test.found ? test.value : findField(results, ["test", "testType"]).value))}
                              {metric("Significance level (α)", fieldValue(results, ["alpha", "significanceLevel"]) !== "N/A"
                                ? fieldValue(results, ["alpha", "significanceLevel"])
                                : alpha.found ? displayHistoryValue(alpha.value) : "N/A")}
                              {metric("Test statistic", fieldValue(results, ["statistic", "testStatistic", "value"]))}
                              {metric("p-value", fieldValue(results, ["pValue", "pvalue", "p"]))}
                              {metric("Critical value", fieldValue(results, ["criticalValue", "critical", "criticalValues"]))}
                              {metric("Standard error", fieldValue(results, ["standardError", "standard_error", "se"]))}
                            </div>
                            {Object.keys(resultExtras).length > 0 && (
                              <details className="history-extra">
                                <summary>Other saved result fields</summary>
                                <pre>{JSON.stringify(resultExtras, null, 2)}</pre>
                              </details>
                            )}
                          </section>
                        </div>
                      );
                    })()
                  )}
                  <Link className="btn history-open-button" href={record.method === "Simple Linear Regression" ? "/regression" : "/hypothesis"}>
                    Open {record.method === "Simple Linear Regression" ? "Regression" : "Hypothesis Testing"}
                  </Link>
                </div>
              </details>
            ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
