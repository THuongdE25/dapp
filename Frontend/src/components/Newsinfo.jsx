import Newsdata from "../data/Newsdata";

function Newinfo({ inf }) {
  return (
    <>
      <div className="col-md-4 mb-4">
        <div className="card product-card">
          <div className="img-wrapper">
            <img
              src={inf.img}
              alt="newscake"
              className="card-img-top product-img"
            />
          </div>
          <div className="card-body text-center">
            <h6 className="fw-bold">{inf.name}</h6>
            <p className="fw-bold">{inf.text}</p>
          </div>
        </div>
      </div>
    </>
  );
}
export default Newinfo;
