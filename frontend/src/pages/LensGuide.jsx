import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Eye, Glasses, Sparkles, Monitor, Sun, Shield } from "lucide-react";
import "../styles/lensguide.css";

const lensTypes = [
  { icon: Eye,      title: "Single Vision",   description: "Perfect for correcting one field of vision — either distance or near.", bestFor: "Reading, driving, or general use" },
  { icon: Glasses,  title: "Bifocal",          description: "Two distinct viewing areas for distance and near vision in one lens.", bestFor: "People who need both distance and reading correction" },
  { icon: Sparkles, title: "Progressive",      description: "Seamless transition between multiple focal points without visible lines.", bestFor: "Natural vision at all distances" },
  { icon: Monitor,  title: "Blue Light",       description: "Filters harmful blue light from digital screens to reduce eye strain.", bestFor: "Computer users and digital device users" },
  { icon: Sun,      title: "Photochromic",     description: "Automatically darkens in sunlight and clears indoors for convenience.", bestFor: "People who move between indoor and outdoor frequently" },
  { icon: Shield,   title: "Anti-Reflective",  description: "Reduces glare and reflections for clearer, more comfortable vision.", bestFor: "Night driving and computer work" },
];

const LensGuide = () => (
  <>
    <Header />
    <div className="lensguide-page">
      <div className="lensguide-hero">
        <h1>Lens Guide</h1>
        <p>Choose the perfect lens type for your lifestyle and vision needs. Our experts are here to help you decide.</p>
      </div>

      <div className="lens-grid">
        {lensTypes.map(({ icon: Icon, title, description, bestFor }) => (
          <div key={title} className="lens-card">
            <div className="lens-icon-wrap"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p className="lens-description">{description}</p>
            <div className="lens-bestfor">
              <strong>Best for:</strong> {bestFor}
            </div>
          </div>
        ))}
      </div>

      <div className="lensguide-cta">
        <h2>Need Help Choosing?</h2>
        <p>Our certified optometrists can help you find the perfect lens for your lifestyle and vision requirements.</p>
        <Link to="/book-test">
          <button className="consult-btn">Book a Consultation</button>
        </Link>
      </div>
    </div>
    <Footer />
  </>
);

export default LensGuide;
