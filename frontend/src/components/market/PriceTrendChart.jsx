import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { getMarketTrend } from "../../api/marketApi";

const PriceTrendChart = ({ cropName = "Tomato" }) => {
  const [days, setDays] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrend = async () => {
      setLoading(true);
      try {
        const res = await getMarketTrend({ crop: cropName, days });
        if (res && res.success && isMounted) {
          setTrendData(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load market trend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTrend();
    return () => {
      isMounted = false;
    };
  }, [cropName, days]);

  const maxPriceVal = Math.max(
    ...trendData.map((d) => d.modalPrice || 0),
    100
  );

  return (
    <div className="chart-card market-trend-card">
      <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div className="chart-title-row">
            <TrendingUp size={18} className="chart-icon" />
            <h3>{cropName} Price Trend</h3>
          </div>
          <span className="chart-subtitle">Historical modal price movements (₹/quintal)</span>
        </div>

        <div className="timeframe-toggle">
          <button
            className={`time-btn ${days === 7 ? "active" : ""}`}
            onClick={() => setDays(7)}
          >
            7 Days
          </button>
          <button
            className={`time-btn ${days === 30 ? "active" : ""}`}
            onClick={() => setDays(30)}
          >
            30 Days
          </button>
        </div>
      </div>

      {loading ? (
        <div className="chart-empty-state">
          <p>Loading price trend...</p>
        </div>
      ) : trendData.length === 0 ? (
        <div className="chart-empty-state">
          <p>No historical trend records found for {cropName}.</p>
        </div>
      ) : (
        <div className="monthly-chart-wrapper" style={{ marginTop: "1rem" }}>
          <div className="monthly-bars-container" style={{ height: "190px" }}>
            {trendData.map((item, idx) => {
              const heightPct = Math.max(((item.modalPrice || 0) / maxPriceVal) * 100, 10);
              const formattedDate = item.priceDate
                ? new Date(item.priceDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : `Day ${idx + 1}`;

              return (
                <div key={idx} className="monthly-bar-group">
                  <span className="bar-hover-val">₹{item.modalPrice}</span>
                  <div className="bars-pair" style={{ height: "100%" }}>
                    <div
                      className="monthly-bar income-bar"
                      style={{ height: `${heightPct}%`, width: "16px", borderRadius: "4px 4px 0 0" }}
                      title={`${formattedDate}: ₹${item.modalPrice}/quintal (${item.market || ""})`}
                    />
                  </div>
                  <span className="month-label" style={{ fontSize: "0.7rem" }}>
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTrendChart;
