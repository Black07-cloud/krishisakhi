import { Sprout } from "lucide-react";
import { capitalize, fmtDate, STAGE_PROGRESS } from "./dashboardUtils";

const CropRow = ({ crop, farmName }) => {
  const progress = STAGE_PROGRESS[crop.currentStage] ?? 0;

  return (
    <div className="crop-card-row">
      <div className="crop-avatar">
        <Sprout size={20} color="#059669" />
      </div>

      <div className="crop-card-info" style={{ flex: 1 }}>
        <div className="crop-card-name">
          {crop.name}
          {crop.variety ? ` — ${crop.variety}` : ""}
        </div>
        <div className="crop-card-meta">
          {farmName && <span>{farmName} · </span>}
          {crop.area?.value
            ? `${crop.area.value} ${crop.area.unit || "acre"} · `
            : ""}
          Planted {fmtDate(crop.plantingDate)}
        </div>
        <div className="crop-stage-bar">
          <div
            className="crop-stage-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
        <span className="badge badge-green">{capitalize(crop.currentStage)}</span>
        {crop.expectedHarvestDate && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Harvest {fmtDate(crop.expectedHarvestDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export default CropRow;
