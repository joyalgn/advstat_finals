import Footer from "../../../components/Footer";
import RegressionTool from "../../../components/RegressionTool";

export default function RegressionPage() {
  return <><main className="container"><section className="page-head reveal"><h1>Simple Linear Regression</h1><p>Enter paired (X, Y) values to compute the regression equation Y = a + bX, the correlation coefficient r, and the strength of the relationship.</p></section><RegressionTool /></main><Footer /></>;
}