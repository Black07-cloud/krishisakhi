import { useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

const ConfirmDeleteScanModal = ({ scan, onClose, onConfirm, deleting = false }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !deleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, deleting]);

  if (!scan) return null;

  const cropName = typeof scan.crop === "object" ? scan.crop?.name : "Crop";
  const diseaseName = scan.detectedDisease || "Scan record";

  return (
    <div className="modal-backdrop" onClick={() => !deleting && onClose()}>
      <div
        className="modal-content modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-delete-scan-title"
        aria-modal="true"
      >
        <div className="modal-header header-danger">
          <div className="modal-title-group">
            <div className="icon-badge-danger">
              <AlertTriangle size={20} />
            </div>
            <h3 id="confirm-delete-scan-title" className="modal-title">
              Delete Disease Scan
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
            Are you sure you want to delete the scan for <strong>"{cropName}"</strong> ({diseaseName})?
          </p>
          <p className="confirm-subtext">
            This will permanently remove the scan record and stored image.
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
            onClick={() => onConfirm(scan._id)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Deleting...</span>
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

export default ConfirmDeleteScanModal;
