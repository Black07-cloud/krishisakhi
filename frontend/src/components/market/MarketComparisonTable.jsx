import React, { useState, useEffect } from "react";
import { Store, MapPin, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { getMarketComparison } from "../../api/marketApi";
import { formatCurrency } from "../finance/SummaryCards";

const MarketComparisonTable = ({ cropName = "Tomato" }) => {
  const [comparisonList, setComparisonList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await getMarketComparison({ crop: cropName });
        if (res && res.success && isMounted) {
          setComparisonList(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load market comparison:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchComparison();
    return () => {
      isMounted = false;
    };
  }, [cropName]);

  return (
    <div className="chart-card market-comparison-card">
      <div className="chart-header">
        <div className="chart-title-row">
          <Store size={18} className="chart-icon" />
          <h3>Compare Mandi Prices for {cropName}</h3>
        </div>
        <span className="chart-subtitle">Mandis sorted by modal price for price comparison</span>
      </div>

      {loading ? (
        <div className="chart-empty-state">
          <p>Loading mandi comparison data...</p>
        </div>
      ) : comparisonList.length === 0 ? (
        <div className="chart-empty-state">
          <p>No nearby market prices available to compare for {cropName}.</p>
        </div>
      ) : (
        <div className="transaction-table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Market Mandi</th>
                <th>District / State</th>
                <th>Min Price</th>
                <th>Modal Price</th>
                <th>Max Price</th>
                <th>Daily Change</th>
              </tr>
            </thead>
            <tbody>
              {comparisonList.map((item, idx) => {
                const isPositive = (item.priceChangePercent || 0) >= 0;
                return (
                  <tr key={idx} className="transaction-row">
                    <td>
                      <span className="category-title">{item.market}</span>
                    </td>
                    <td>
                      <span className="scheme-state">
                        <MapPin size={13} />
                        {item.district ? `${item.district}, ${item.state}` : item.state}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{formatCurrency(item.minPrice)}</td>
                    <td>
                      <span className="amount-text text-main" style={{ fontSize: "1.05rem" }}>
                        {formatCurrency(item.modalPrice)} / {item.unit}
                      </span>
                    </td>
                    <td style={{ color: "#64748b" }}>{formatCurrency(item.maxPrice)}</td>
                    <td>
                      <span className={`type-badge ${isPositive ? "income" : "expense"}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{isPositive ? `+${item.priceChangePercent}%` : `${item.priceChangePercent}%`}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketComparisonTable;
