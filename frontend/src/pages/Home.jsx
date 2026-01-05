import Header from "../components/Header";
import "../styles/home.css";

const Home = () => {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-container">
          
          {/* Left Content */}
          <div className="home-content">
            <h1>
              Premium Eye Care <br />
              <span>& Stylish Eyewear</span>
            </h1>

            <p>
              Discover high-quality frames, expert eye testing, and personalized
              lens solutions designed for your comfort and style.
            </p>

            <div className="home-buttons">
              <button className="btn-primary">Browse Frames</button>
              <button className="btn-outline">Book Eye Test</button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="home-visual">
            Eyewear Visual
          </div>

        </div>
      </section>
    </>
  );
};

export default Home;
