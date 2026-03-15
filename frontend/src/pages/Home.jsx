import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Glasses, FlaskConical, Sparkles, ArrowRight, Star } from "lucide-react";
import "../styles/home.css";

const Home = () => (
  <>
    <Header />

    {/* Hero */}
    <section className="home-hero">
      <div className="home-container">
        <div className="home-content">
          <div className="home-badge">
            <Star size={13} fill="currentColor" /> Trusted by 1000+ customers in Vadodara
          </div>
          <h1>Premium Eye Care<br /><span>&amp; Stylish Eyewear</span></h1>
          <p>Discover high-quality frames, expert eye testing, and personalized lens solutions designed for your comfort and style.</p>
          <div className="home-buttons">
            <Link to="/products"><button className="btn-hero-primary">Browse Frames <ArrowRight size={16} style={{display:"inline",verticalAlign:"middle",marginLeft:4}} /></button></Link>
            <Link to="/book-test"><button className="btn-hero-outline">Book Eye Test</button></Link>
          </div>
          <div className="home-stats">
            <div className="home-stat-item"><p className="home-stat-num">1000+</p><p className="home-stat-lbl">Happy Customers</p></div>
            <div className="home-stat-item"><p className="home-stat-num">500+</p><p className="home-stat-lbl">Frame Styles</p></div>
            <div className="home-stat-item"><p className="home-stat-num">10+</p><p className="home-stat-lbl">Years Experience</p></div>
          </div>
        </div>
        <div className="home-visual">
          <svg viewBox="0 0 200 80" className="glasses-icon">
            <ellipse cx="50" cy="40" rx="35" ry="30" fill="none" stroke="white" strokeWidth="4"/>
            <ellipse cx="150" cy="40" rx="35" ry="30" fill="none" stroke="white" strokeWidth="4"/>
            <line x1="85" y1="40" x2="115" y2="40" stroke="white" strokeWidth="4"/>
            <line x1="15" y1="40" x2="5" y2="35" stroke="white" strokeWidth="4"/>
            <line x1="185" y1="40" x2="195" y2="35" stroke="white" strokeWidth="4"/>
          </svg>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="features-section">
      <p className="section-label">Why Choose Us</p>
      <h2 className="section-title">Everything You Need for Perfect Vision</h2>
      <p className="section-sub">From premium frames to expert eye care, we provide comprehensive optical solutions tailored to your needs.</p>
      <div className="features-container">
        {[
          { icon: Glasses,      title: "Premium Frames",  desc: "Stylish and durable eyewear for every occasion, from casual to professional." },
          { icon: FlaskConical, title: "Expert Testing",  desc: "Professional eye examinations by certified optometrists using modern equipment." },
          { icon: Sparkles,     title: "Quality Lenses",  desc: "Advanced lens technology for perfect vision with anti-glare and UV protection." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-icon-wrap"><Icon size={26} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="cta-section">
      <div className="cta-container">
        <h2>Ready to See Clearly?</h2>
        <p>Book your eye test today and get personalized recommendations from our certified optometrists.</p>
        <Link to="/book-test">
          <button className="btn-hero-primary">Book Now — It's Free</button>
        </Link>
      </div>
    </section>

    <Footer />
  </>
);

export default Home;
