import Link from "next/link";

export const metadata = {
  title: "STATAXIS — Where Data Finds Direction",
  description:
    "Explore paired data with simple linear regression and assess evidence with one- and two-sample Z- and T-tests in STATAXIS.",
};

const observations = [
  [112, 262], [150, 233], [184, 251], [205, 198], [242, 217], [275, 175],
  [307, 196], [333, 152], [365, 166], [398, 127], [431, 147], [464, 104],
  [502, 118], [535, 82],
];

function Scatterplot() {
  return (
    <figure className="landing-plot">
      <div className="plot-heading">
        <span>FIG. 01 / LINEAR ASSOCIATION</span>
        <span className="plot-live"><i /> ILLUSTRATIVE MODEL</span>
      </div>
      <svg className="scatter-svg" viewBox="0 0 640 360" role="img" aria-labelledby="plot-title plot-desc">
        <title id="plot-title">Illustrative scatterplot with a fitted regression line</title>
        <desc id="plot-desc">Fourteen sample points trend upward around a straight regression line. This illustration is not a live analysis.</desc>
        <defs>
          <pattern id="plot-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="48" y="20" width="548" height="282" fill="url(#plot-grid)" />
        <path className="plot-axis" d="M48 20V302H596" />
        <path className="plot-tick" d="M48 231H596M48 160H596M48 89H596" />
        <text className="plot-label" x="48" y="327">LOWER X</text>
        <text className="plot-label" x="548" y="327">HIGHER X</text>
        <text className="plot-y-label" x="13" y="166" transform="rotate(-90 13 166)">OUTCOME · Y</text>
        <path className="regression-line" d="M82 278L565 63" />
        {observations.map(([x, y], index) => (
          <circle className="scatter-point" style={{ "--point-delay": `${index * 75}ms` } as React.CSSProperties} key={`${x}-${y}`} cx={x} cy={y} r={index % 4 === 0 ? 5 : 4} />
        ))}
        <circle className="line-marker" cx="324" cy="170" r="5" />
        <text className="line-equation" x="384" y="213">Ŷ = a + bX</text>
      </svg>
      <figcaption>
        <span>Paired observations · fitted linear trend</span>
        <span>Conceptual illustration</span>
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page" id="top">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="STATAXIS home">STAT<span>AXIS</span><sup>ADVSTAT</sup></Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#instruments">Instruments</a>
          <a href="#about-stataxis">About</a>
        </nav>
        <div className="landing-actions">
          <Link className="landing-login" href="/login">Log in</Link>
          <Link className="landing-register" href="/register">Get started <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="landing-kicker"><span>01</span> A STATISTICAL WORKSPACE FOR CLEARER THINKING</p>
          <h1>Numbers Have<br />Patterns.<br /><em>Find Yours.</em></h1>
          <p className="hero-description">
            STATAXIS turns paired observations and sample statistics into a clearer view of relationships and evidence—with tools for regression and hypothesis testing.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/login">Enter the workspace <span aria-hidden="true">↗</span></Link>
            <a className="text-link" href="#instruments">Explore the instruments <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-footnote"><span className="footnote-rule" /> BUILT FOR THE STUDY OF ADVANCED STATISTICS</div>
        </div>
        <div className="hero-visual">
          <div className="visual-index"><span>FIELD NOTE / 001</span><span>RELATIONSHIP, MAPPED</span></div>
          <Scatterplot />
          <span className="visual-coordinate" aria-hidden="true">X / Y</span>
        </div>
        <div className="hero-coordinate" aria-hidden="true">STATAXIS<br />PAIRED OBSERVATIONS / X · Y</div>
      </section>

      <section className="landing-tools" id="instruments">
        <div className="section-intro">
          <p className="landing-kicker"><span>02</span> THE INSTRUMENTS</p>
          <h2>Two ways to<br /><em>read the evidence.</em></h2>
          <p>Purpose-built statistical tools. Enter your observations or sample summaries, then inspect the measures and visualizations that follow.</p>
        </div>
        <div className="instrument-list">
          <article className="instrument instrument-regression">
            <div className="instrument-meta"><span>01 / RELATIONSHIPS</span><span>PAIRED DATA</span></div>
            <div className="instrument-body">
              <span className="instrument-mark" aria-hidden="true">↗</span>
              <div>
                <h3>Simple Linear<br />Regression</h3>
                <p>Fit a line to paired X and Y values. Review the equation, correlation <i>r</i>, R², relationship strength, and an optional Y prediction for an entered X.</p>
              </div>
            </div>
            <Link className="instrument-link" href="/login">Open in workspace <span aria-hidden="true">↗</span></Link>
          </article>
          <article className="instrument instrument-hypothesis">
            <div className="instrument-meta"><span>02 / INFERENCE</span><span>ONE OR TWO SAMPLES</span></div>
            <div className="instrument-body">
              <span className="instrument-mark" aria-hidden="true">H₀</span>
              <div>
                <h3>Hypothesis<br />Testing</h3>
                <p>Run one- or two-sample Z- and T-tests with left-, right-, or two-tailed alternatives. Examine the statistic, p-value, critical values, and decision.</p>
              </div>
            </div>
            <Link className="instrument-link" href="/login">Open in workspace <span aria-hidden="true">↗</span></Link>
          </article>
        </div>
      </section>

      <section className="landing-about" id="about-stataxis">
        <div className="about-marker"><span>03</span><span>WHY STATAXIS</span></div>
        <div className="about-copy">
          <p className="landing-kicker">A CLASSROOM IDEA, MADE PRACTICAL</p>
          <h2>Statistics is not just an answer.<br /><em>It is a way of asking.</em></h2>
          <p>Created as an Advanced Statistics learning project, STATAXIS gives students a hands-on place to work through linear relationships and tests about population means. It brings the inputs, visual evidence, and key results into one focused workspace—so the reasoning stays in view.</p>
          <p className="about-signoff">OBSERVE CAREFULLY. TEST WITH PURPOSE. INTERPRET WITH CONTEXT.</p>
        </div>
        <div className="about-equation" aria-hidden="true"><span>∑</span><small>DATA<br />→ DIRECTION</small></div>
      </section>

      <section className="landing-invitation">
        <div><p className="landing-kicker"><span>04</span> YOUR NEXT QUESTION STARTS HERE</p>
          <h2>Find the direction<br /><em>in your data.</em></h2>
        </div>
        <div className="invitation-actions">
          <p>Bring your observations. STATAXIS will help you see what they say.</p>
          <Link className="primary-link" href="/register">Get started <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" href="/login">Already have an account? Log in</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <Link className="landing-brand" href="/">STAT<span>AXIS</span><sup>ADVSTAT</sup></Link>
        <span>ADVANCED STATISTICS · LEARNING WORKSPACE</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
