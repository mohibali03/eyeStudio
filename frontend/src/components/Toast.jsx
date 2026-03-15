import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import "../styles/toast.css";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}><X size={16} /></button>
    </div>
  );
};

export default Toast;
