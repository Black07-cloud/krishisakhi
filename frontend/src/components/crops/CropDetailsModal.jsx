import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Sprout, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import CropLifecycle, { STAGE_ORDER } from "./CropLifecycle";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const CropDetailsModal = ({
  crop,
  lifecycleData,
  onClose,
  onEdit,
  onUpdateStage,
  updatingStage = false,
}) => {
  const [selectedStage, setSelectedStage] = useState(crop?.currentStage || "seed");
  const [stageNote, setStageNote] = useState("");
  const [showStageUpdater, setShowStageUpdater] = useState(false);

  useEffect(() => {
    if (crop) {
      setSelectedStage(crop.currentStage || "seed");
    }
  }, [crop]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !updatingStage) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, updatingStage]);

  if (!crop) return null;

  const farmName = typeof crop.farm === "object" ? crop.farm?.name : "Farm";
  const history = lifecycleData?.lifecycleHistory || crop.lifecycleHistory || [];
  const currentStage = lifecycleData?.currentStage || crop.currentStage || "seed";
  const isHarvested = crop.status === "harvested" || currentStage === "harvest";

  const handleStageSubmit = (e) => {
    e.preventDefault();
    if (!selectedStage || selectedStage === currentStage) return;
    onUpdateStage(crop._id, selectedStage, stageNote);
  };

  return (
    <div className="modal-backdrop" onClick={() => !updatingStage && onClose()}>
      <div
        className="modal-content modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="crop-details-title"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon-badge">🌱</span>
            <div>
              <h2 id="crop-details-title" className="modal-title">
                {crop.name}
              </h2>
              {crop.variety && <span className="modal-subtitle-text">{crop.variety}</span>}
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={updatingStage}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top Info Grid */}
          <div className="crop-details-top-grid">
            <div className="crop-detail-box">
              <span className="box-label">Associated Farm</span>
              <span className="box-value">
                <MapPin size={15} color="#16a34a" /> {farmName}
              </span>
            </div>

            <div className="crop-detail-box">
              <span className="box-label">Cultivated Area</span>
              <span className="box-value">
                {crop.area?.value ?? "N/A"} {crop.area?.unit ? capitalize(crop.area.unit) : "Acre"}
              </span>
            </div>

            <div className="crop-detail-box">
              <span className="box-label">Planting Date</span>
              <span className="box-value">
                <Calendar size={15} color="#2563eb" /> {formatDate(crop.plantingDate)}
              </span>
            </div>

            <div className="crop-detail-box">
              <span className="box-label">Expected Harvest</span>
              <span className="box-value">
                <Calendar size={15} color="#d97706" /> {formatDate(crop.expectedHarvestDate)}
              </span>
            </div>
          </div>

          {/* Growth Stage Timeline */}
          <CropLifecycle currentStage={currentStage} history={history} />

          {/* Update Stage Section */}
          <div className="update-stage-card">
            <div className="update-stage-header">
              <div className="update-stage-title-wrap">
                <Sprout size={18} color="#16a34a" />
                <h4>Update Growth Stage</h4>
              </div>
              <button
                type="button"
                className="btn-toggle-stage-updater"
                onClick={() => setShowStageUpdater(!showStageUpdater)}
              >
                {showStageUpdater ? "Hide Stage Form" : "Change Stage..."}
              </button>
            </div>

            {showStageUpdater && (
              <form onSubmit={handleStageSubmit} className="stage-updater-form">
                <div className="form-group">
                  <label htmlFor="select-new-stage" className="form-label">
                    Select New Stage:
                  </label>
                  <select
                    id="select-new-stage"
                    className="form-select"
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    disabled={updatingStage}
                  >
                    {STAGE_ORDER.map((st) => (
                      <option key={st.id} value={st.id} disabled={st.id === currentStage}>
                        {st.label} {st.id === currentStage ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="stage-note" className="form-label">
                    Note / Remarks <span className="sublabel">(Optional)</span>
                  </label>
                  <input
                    id="stage-note"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Applied fertilizer, healthy flowering visible"
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    disabled={updatingStage}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingStage || selectedStage === currentStage}
                >
                  {updatingStage ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Updating Stage...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      <span>Confirm Stage Update</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={updatingStage}
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(crop);
              }}
              disabled={updatingStage}
            >
              Edit Crop Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDetailsModal;
