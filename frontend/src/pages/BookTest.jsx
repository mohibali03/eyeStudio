import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { API_BASE_URL } from "../config/api";
import { Eye, Glasses, FileText, Clock, CheckCircle } from "lucide-react";
import "../styles/booktest.css";

const BookTest = () => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setToast({ message: "Phone number must be exactly 10 digits.", type: "error" });
      return;
    }
    const res = await fetch(`${API_BASE_URL}/eye-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setSubmitted(true);
      setFormData({ name: "", phone: "" });
      setToast({ message: "Booking successful! We'll contact you soon.", type: "success" });
    } else {
      setToast({ message: "Failed to book test. Please try again.", type: "error" });
    }
  };

  const infoItems = [
    { icon: Eye,      title: "Comprehensive Eye Exam",    sub: "Full vision and health assessment" },
    { icon: Glasses,  title: "Frame Selection Help",      sub: "Expert guidance on choosing frames" },
    { icon: FileText, title: "Prescription Consultation", sub: "Detailed prescription report" },
    { icon: Clock,    title: "30-Minute Appointment",     sub: "Quick and thorough examination" },
  ];

  return (
    <>
      <Header />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="booktest-page">
        <div className="booktest-wrapper">
          <div className="booktest-card">
            <h1>Book Your Eye Test</h1>
            <p className="booktest-subtitle">Get a professional eye examination at your convenience. Our certified optometrists are ready to help.</p>

            {submitted && (
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",padding:"12px 16px",borderRadius:8,fontSize:13,fontWeight:600,marginBottom:20}}>
                <CheckCircle size={16} /> Booking confirmed! We'll contact you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="booktest-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
              </div>
              <button type="submit" className="submit-btn">Book Appointment</button>
            </form>
          </div>

          <div className="booktest-info-card">
            <h3>What to Expect</h3>
            {infoItems.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="info-item">
                <div className="info-item-icon"><Icon size={16} /></div>
                <div className="info-item-text">
                  <p>{title}</p>
                  <span>{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookTest;
