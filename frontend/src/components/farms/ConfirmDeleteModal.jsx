import { useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

const ConfirmDeleteModal = ({ farm, onClose, onConfirm, deleting = false }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, deleting]);

  if (!farm) return null;

  return (
    <div className="modal-backdrop" onClick={() => !deleting && onClose()}>
      <div
        className="modal-content modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-delete-title"
        aria-modal="true"
      >
        <div className="modal-header header-danger">
          <div className="modal-title-group">
            <div className="icon-badge-danger">
              <AlertTriangle size={20} />
            </div>
            <h3 id="confirm-delete-title" className="modal-title">
              Delete Farm
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body confirm-body">
          <p className="confirm-text">
            Are you sure you want to remove <strong>"{farm.name}"</strong>?
          </p>
          <p className="confirm-subtext">
            This action will remove the farm from your active dashboard view.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(farm._id)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
