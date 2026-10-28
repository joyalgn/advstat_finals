import Link from "next/link";
import Footer from "../../../components/Footer";

export const metadata = { title: "Stats Guide | STATAXIS" };

export default function GuidePage() {
  return (
    <>
      <main className="container">
        <section className="page-head reveal">
          <h1>Stats Guide</h1>
          <p>A beginner-friendly reference for choosing inputs, running the tools, and understanding the results STATAXIS reports.</p>
        </section>
        <div className="guide-list">
          <article className="panel guide-section">
            <span className="eyebrow">01 · Relationships</span>
            <h2>Simple Linear Regression</h2>
            <p>Regression describes how a numeric outcome changes as another numeric variable changes. Use it to summarize a linear relationship or estimate an outcome for a chosen input.</p>
            <h3>Inputs and procedure</h3>
            <ul>
              <li><strong>Independent variable (X):</strong> the value used to explain or predict changes.</li>
              <li><strong>Dependent variable (Y):</strong> the measured outcome paired with each X value.</li>
              <li>Enter at least two paired numeric observations, one <code>X, Y</code> pair per line. Each row must refer to the same observation.</li>
              <li>Run the analysis, review the fitted line and relationship measures, and optionally enter an X value to predict Y.</li>
            </ul>
            <h3>Equation and interpretation</h3>
            <div className="guide-formula">Ŷ = a + bX</div>
            <ul>
              <li><strong>a (intercept):</strong> the model’s estimated Y when X is zero.</li>
              <li><strong>b (slope):</strong> the average change in predicted Y for a one-unit increase in X.</li>
              <li><strong>Correlation (r):</strong> ranges from −1 to +1 and describes the direction and strength of the linear association. Values near either endpoint indicate stronger linear association; values near zero indicate weaker association.</li>
              <li><strong>R²:</strong> the proportion of variation in Y accounted for by the fitted linear model (reported as a proportion from 0 to 1).</li>
              <li><strong>Prediction:</strong> substitute an X value into the equation to obtain its estimated Ŷ. Predictions beyond the observed X range may be unreliable.</li>
            </ul>
            <p className="guide-note">Association does not by itself establish that X causes Y. A linear model may also be a poor summary when the data have strong curvature or influential outliers.</p>
            <Link className="btn" href="/regression">Open Simple Linear Regression</Link>
          </article>

          <article className="panel guide-section">
            <span className="eyebrow">02 · Inference</span>
            <h2>Hypothesis Testing</h2>
            <p>A hypothesis test uses sample evidence to assess a claim about a population mean or the difference between two population means. STATAXIS provides one- and two-sample Z- and T-tests, with left-, right-, or two-tailed alternatives.</p>
            <h3>Inputs and procedure</h3>
            <ul>
              <li>Choose <strong>Z</strong> when the population standard deviation is known, or <strong>T</strong> when using sample standard deviations.</li>
              <li>Choose one sample or two independent samples. Enter each sample’s mean, standard deviation, and sample size. For one sample, also enter the hypothesized mean μ₀; for two samples, enter the hypothesized difference D₀.</li>
              <li>Select the alternative’s direction and a significance level α (such as 0.05), then run the test.</li>
            </ul>
            <h3>Hypotheses and formulas</h3>
            <p><strong>H₀ (null hypothesis)</strong> represents the reference claim, such as μ = μ₀ or μ₁ − μ₂ = D₀. <strong>H₁ (alternative hypothesis)</strong> states the difference being tested: ≠ for two tails, &lt; for a left tail, or &gt; for a right tail.</p>
            <div className="guide-formula">One sample: (x̄ − μ₀) / (σ/√n) for Z; (x̄ − μ₀) / (s/√n) for T</div>
            <div className="guide-formula">Two samples: ((x̄₁ − x̄₂) − D₀) / √(σ₁²/n₁ + σ₂²/n₂) for Z, or replace σ with s for T</div>
            <p>The denominator is the standard error. For two samples, the T-test uses Welch’s degrees-of-freedom approximation rather than assuming equal variances. For a Z-test, the entered standard deviations are treated as known population values.</p>
            <h3>Reading the decision</h3>
            <ul>
              <li><strong>Significance level (α):</strong> the cutoff chosen before testing for how much evidence against H₀ is required.</li>
              <li><strong>Test statistic:</strong> the observed difference expressed in standard-error units, compared against the reference Z or T distribution.</li>
              <li><strong>Critical value:</strong> the boundary of the rejection region for the selected α and tail direction. A statistic beyond the relevant boundary leads to rejection of H₀.</li>
              <li><strong>p-value:</strong> assuming H₀ is true, the probability of a result at least as extreme as the observed statistic. Reject H₀ when p ≤ α; otherwise, fail to reject H₀.</li>
            </ul>
            <p className="guide-note">“Fail to reject” does not prove H₀ true; it means the sample did not provide enough evidence at the selected significance level. Statistical significance does not necessarily mean a difference is practically important.</p>
            <Link className="btn" href="/hypothesis">Open Hypothesis Testing</Link>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
