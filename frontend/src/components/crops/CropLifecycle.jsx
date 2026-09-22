import { CheckCircle2, Clock } from "lucide-react";

export const STAGE_ORDER = [
  { id: "seed", label: "Seed" },
  { id: "germination", label: "Germination" },
  { id: "vegetative", label: "Vegetative" },
  { id: "flowering", label: "Flowering" },
  { id: "fruiting", label: "Fruiting" },
  { id: "maturity", label: "Maturity" },
  { id: "harvest", label: "Harvest" },
];

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const CropLifecycle = ({ currentStage = "seed", history = [] }) => {
  const currentIndex = STAGE_ORDER.findIndex((s) => s.id === currentStage);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="crop-lifecycle-container">
      <h4 className="lifecycle-title">Growth Stage Timeline</h4>

      {/* Stage Progress Bar / Steps */}
      <div className="stage-timeline">
        {STAGE_ORDER.map((stageObj, idx) => {
          const isPassed = idx < safeIndex;
          const isCurrent = idx === safeIndex;
          const isUpcoming = idx > safeIndex;

          let stepClass = "stage-step";
          if (isPassed) stepClass += " step-passed";
          if (isCurrent) stepClass += " step-current";
          if (isUpcoming) stepClass += " step-upcoming";

          return (
            <div key={stageObj.id} className={stepClass}>
              <div className="step-circle" title={stageObj.label}>
                {isPassed ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <span className="current-dot" />
                ) : (
                  <span className="step-num">{idx + 1}</span>
                )}
              </div>
              <span className="step-label">{stageObj.label}</span>
              {idx < STAGE_ORDER.length - 1 && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      {/* Lifecycle History Log */}
      {history && history.length > 0 && (
        <div className="lifecycle-history-section">
          <h5 className="history-title">Stage Change Log</h5>
          <div className="history-list">
            {history
              .slice()
              .reverse()
              .map((item, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-icon">
                    <Clock size={14} />
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <span className="history-stage-badge">
                        {capitalize(item.stage)}
                      </span>
                      <span className="history-date">
                        {formatDate(item.changedAt || item.date)}
                      </span>
                    </div>
                    {item.note && <p className="history-note">{item.note}</p>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropLifecycle;
