import Footer from "../../../components/Footer";
import HomeCanvas from "../../../components/HomeCanvas";
import HypothesisTool from "../../../components/HypothesisTool";
import styles from "../animated-tools.module.css";

export const metadata = { title: "Hypothesis Testing | STATAXIS" };

export default function HypothesisPage() {
  return (
    <div className={styles.animatedPage}>
      <HomeCanvas />
      <main className="container">
        <section className="page-head reveal">
          <h1>Statistical Analysis: Hypothesis Testing</h1>
          <p>Choose the test, state your hypotheses, select the significance level, and enter the sample statistics. The system computes the test statistic, critical values and the decision.</p>
        </section>
        <HypothesisTool />
      </main>
      <Footer />
    </div>
  );
}