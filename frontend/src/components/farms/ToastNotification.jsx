import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className={`toast-notification ${isSuccess ? "toast-success" : "toast-error"}`} role="alert">
      <div className="toast-icon">
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button type="button" className="toast-close-btn" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};

export default ToastNotification;
