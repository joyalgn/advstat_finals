import Link from "next/link";
import HomeCanvas from "./HomeCanvas";

export default function DashboardHome() {
  return (
    <main className="home-dashboard">
      <HomeCanvas />
      <div className="home-grid">
        <section className="home-intro bento-card reveal" style={{ "--d": ".05s" } as React.CSSProperties}>
          <span className="eyebrow">Advanced statistics</span>
          <h1>Welcome to ADVSTAT</h1>
          <p>Explore relationships in data and make informed decisions with clear statistical analysis.</p>
          <span className="home-tag"><span className="status-dot" /> Analysis workspace</span>
        </section>
        <section className="home-summary bento-card reveal" style={{ "--d": ".12s" } as React.CSSProperties}>
          <span className="summary-label">STATISTICAL TOOLKIT</span>
          <div className="summary-count">02</div>
          <p>Tools available in your workspace.</p>
          <div className="summary-meta"><span>Regression</span><span>Hypothesis</span></div>
        </section>
        <Link className="home-tool regression-tool-card bento-card reveal" style={{ "--d": ".2s" } as React.CSSProperties} href="/regression">
          <div className="tool-card-top"><span className="tool-index">01</span><span className="tool-category">RELATIONSHIPS</span></div>
          <div className="tool-card-copy"><h2>Simple Linear Regression</h2><p>Model paired data, measure correlation, and predict outcomes.</p></div>
          <div className="tool-card-bottom"><span>Equation · r · R² · predictions</span><span className="tool-arrow" aria-hidden="true">↗</span></div>
        </Link>
        <Link className="home-tool hypothesis-tool-card bento-card reveal" style={{ "--d": ".27s" } as React.CSSProperties} href="/hypothesis">
          <div className="tool-card-top"><span className="tool-index gold-index">02</span><span className="tool-category">INFERENCE</span></div>
          <div className="tool-card-copy"><h2>Hypothesis Testing</h2><p>Run Z- and T-tests with critical values, p-values, and clear decisions.</p></div>
          <div className="tool-card-bottom"><span>One- or two-sample · three tails</span><span className="tool-arrow" aria-hidden="true">↗</span></div>
        </Link>
      </div>
    </main>
  );
}