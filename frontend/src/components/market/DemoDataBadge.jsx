import React from "react";
import { Info, CheckCircle2, Database } from "lucide-react";

const DemoDataBadge = ({ dataType = "demo", lastSyncedAt }) => {
  const isDemo = dataType === "demo";

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className={`market-data-indicator-banner ${isDemo ? "demo-banner" : "live-banner"}`}>
      <div className="banner-content">
        <div className="badge-pill">
          {isDemo ? <Database size={13} /> : <CheckCircle2 size={13} />}
          <span>{isDemo ? "Demo Market Data" : "Live Market Data"}</span>
        </div>

        <span className="banner-explanation">
          {isDemo
            ? "Prices are simulated daily for demonstration and will be replaced when a live government APMC API key is configured."
            : "Live verified government APMC market data stream."}
        </span>
      </div>

      {formattedSyncTime && (
        <span className="sync-timestamp">Updated: {formattedSyncTime}</span>
      )}
    </div>
  );
};

export default DemoDataBadge;
