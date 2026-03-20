import Newsdata from "../data/Newsdata";
import Newinfo from "../components/newsinfo";

function News() {
  return (
    <>
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold">Tin tức nổi bật</h2>
        <div className="row">
          {Newsdata.slice(0, 5).map((inf) => (
            <Newinfo key={inf.id} inf={inf} />
          ))}
        </div>
      </div>
    </>
  );
}
export default News;
