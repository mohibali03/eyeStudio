import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import "../styles/footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-section">
        <span className="footer-logo"><span>eye</span>Studio</span>
        <p className="footer-description">Your vision, our mission. Premium eyewear and professional eye care services in Vadodara.</p>
        <div className="footer-social">
          <a href="https://www.instagram.com/eye_studio_optical_store/" target="_blank" rel="noopener noreferrer" title="Instagram">
            <Instagram size={18} />
          </a>
        </div>
      </div>

      <div className="footer-section">
        <h4>Quick Links</h4>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/lens-guide">Lens Guide</Link></li>
          <li><Link to="/book-test">Book Eye Test</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Contact Us</h4>
        <div className="contact-info">
          <div className="contact-item">
            <MapPin size={14} />
            GF/3, Shyamal Sapphire, Beside HP Petrol Pump Vasna, Gotri, Vadodara, Gujarat 390012
          </div>
          <div className="contact-item"><Phone size={14} /> +91 87809 39861</div>
          <div className="contact-item"><Phone size={14} /> +91 85116 92987</div>
          <div className="contact-item"><Phone size={14} /> +91 70167 45471</div>
        </div>
      </div>

      <div className="footer-section">
        <h4>Business Hours</h4>
        <div className="contact-info">
          <div className="contact-item"><Clock size={14} /> Mon – Sun: 10:00 AM – 8:00 PM</div>
        </div>
        <Link to="/book-test">
          <button className="footer-btn">Book Eye Test</button>
        </Link>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2024 eyeStudio. All rights reserved.</p>
      <p>Designed with care for your vision.</p>
    </div>
  </footer>
);

export default Footer;
