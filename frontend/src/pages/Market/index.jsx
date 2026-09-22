import React, { useState, useEffect, useCallback } from "react";
import {
  Store,
  ShoppingBasket,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getTodayMarketPrices, syncMarketPrices } from "../../api/marketApi";
import DemoDataBadge from "../../components/market/DemoDataBadge";
import PriceTrendChart from "../../components/market/PriceTrendChart";
import MarketComparisonTable from "../../components/market/MarketComparisonTable";
import { formatCurrency } from "../../components/finance/SummaryCards";
import "./Market.css";

const Market = () => {
  const [todayPrices, setTodayPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataType, setDataType] = useState("demo");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  // Load today's prices
  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTodayMarketPrices({
        crop: searchQuery || undefined,
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        limit: 50,
      });

      if (res && res.success) {
        setTodayPrices(res.data || []);
        setDataType(res.dataType || "demo");
        setLastSyncedAt(res.lastSyncedAt);

        // Auto set selectedCrop to first crop if current crop not in data
        if (res.data && res.data.length > 0 && !searchQuery) {
          const firstCrop = res.data[0].cropName || res.data[0].crop;
          if (firstCrop) setSelectedCrop(firstCrop);
        }
      } else {
        throw new Error(res?.message || "Failed to load market prices.");
      }
    } catch (err) {
      console.error("Error loading market prices:", err);
      setError(err?.message || "Unable to load market data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedState, selectedDistrict]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncMarketPrices();
      await fetchPrices();
    } catch (err) {
      console.error("Failed to refresh prices:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter prices client-side for immediate responsive search matching
  const filteredPrices = todayPrices.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const cropMatch = p.cropName?.toLowerCase().includes(q) || p.crop?.toLowerCase().includes(q);
    const marketMatch = p.market?.toLowerCase().includes(q);
    const distMatch = p.district?.toLowerCase().includes(q);
    return cropMatch || marketMatch || distMatch;
  });

  // Extract unique states & districts for filter selects
  const statesList = Array.from(new Set(todayPrices.map((p) => p.state).filter(Boolean)));
  const districtsList = Array.from(new Set(todayPrices.map((p) => p.district).filter(Boolean)));
  const cropsList = Array.from(new Set(todayPrices.map((p) => p.cropName || p.crop).filter(Boolean)));

  return (
    <div className="market-page">
      {/* Header */}
      <header className="finance-header">
        <div className="finance-header-left">
          <div className="finance-header-icon">
            <Store size={26} />
          </div>
          <div>
            <h1>Market Intelligence</h1>
            <p>Track live mandi prices, compare markets, and sell your produce.</p>
          </div>
        </div>

        <div className="market-header-actions">
          <Link to="/market/sell" className="add-transaction-btn">
            <ShoppingBasket size={18} />
            <span>Sell Your Crop</span>
          </Link>
          <Link to="/market/buy" className="secondary-header-btn">
            <Store size={18} />
            <span>Buy Crops</span>
          </Link>
          <button
            className="clear-filters-btn"
            style={{ height: "44px" }}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh daily prices"
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      {/* Demo / Live Data Status Banner */}
      <DemoDataBadge dataType={dataType} lastSyncedAt={lastSyncedAt} />

      {/* Filter & Search Bar */}
      <div className="scheme-filters-container">
        <div className="scheme-search-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="scheme-search-input"
              placeholder="Search crop or mandi (e.g. Tomato, Onion, Salem, Koyambedu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="scheme-filter-controls" style={{ display: "flex" }}>
          <div className="filter-group">
            <label htmlFor="mkt-crop-select">Active Crop Analysis</label>
            <select
              id="mkt-crop-select"
              className="scheme-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {cropsList.length > 0 ? (
                cropsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              ) : (
                <option value="Tomato">Tomato</option>
              )}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mkt-state-select">State</label>
            <select
              id="mkt-state-select"
              className="scheme-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mkt-district-select">District</label>
            <select
              id="mkt-district-select"
              className="scheme-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="scheme-error-state" style={{ border: "none" }}>
          <p>Loading today's mandi prices...</p>
        </div>
      ) : error ? (
        <div className="scheme-error-state">
          <div className="error-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load market data</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchPrices}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {/* Today's Market Prices Section */}
          <section className="transaction-list-section" style={{ marginBottom: "2rem" }}>
            <div className="section-title-bar">
              <h2>Today's Mandi Prices</h2>
              <span className="results-count">
                {filteredPrices.length} mandi records
              </span>
            </div>

            {filteredPrices.length === 0 ? (
              <div className="transaction-empty-box">
                <p>No market prices found for your current search criteria.</p>
              </div>
            ) : (
              <div className="transaction-table-wrapper">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Market Mandi</th>
                      <th>District / State</th>
                      <th>Min Price</th>
                      <th>Modal Price</th>
                      <th>Max Price</th>
                      <th>Daily Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.map((p) => {
                      const isPositive = (p.priceChangePercent || 0) >= 0;
                      return (
                        <tr
                          key={p._id || p.id || `${p.cropName}-${p.market}`}
                          className="transaction-row"
                          onClick={() => setSelectedCrop(p.cropName || p.crop)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="tx-cell-category">
                            <span className="category-title">{p.cropName || p.crop}</span>
                            {p.variety && <span className="tx-description-sub">Var: {p.variety}</span>}
                          </td>
                          <td className="farm-name-text">{p.market}</td>
                          <td className="scheme-state">
                            <MapPin size={13} />
                            {p.district ? `${p.district}, ${p.state}` : p.state}
                          </td>
                          <td style={{ color: "#64748b" }}>{formatCurrency(p.minPrice)}</td>
                          <td>
                            <span className="amount-text text-main" style={{ fontSize: "1.05rem" }}>
                              {formatCurrency(p.modalPrice)} <span style={{ fontSize: "0.8rem", color: "#64748b" }}>/ {p.unit}</span>
                            </span>
                          </td>
                          <td style={{ color: "#64748b" }}>{formatCurrency(p.maxPrice)}</td>
                          <td>
                            <span className={`type-badge ${isPositive ? "income" : "expense"}`}>
                              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              <span>{isPositive ? `+${p.priceChangePercent}%` : `${p.priceChangePercent}%`}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Interactive Market Analytics Grid */}
          <div className="market-analytics-grid">
            <PriceTrendChart cropName={selectedCrop} />
            <MarketComparisonTable cropName={selectedCrop} />
          </div>
        </>
      )}

      {/* AI Assistant Banner */}
      <div className="ai-help-banner">
        <div className="ai-help-content">
          <div className="ai-help-icon-wrapper">
            <Bot size={22} />
          </div>
          <div>
            <h4>Need help understanding the market?</h4>
            <p>Ask Farmio AI to analyze mandi price trends and compare nearby markets.</p>
          </div>
        </div>
        <Link to="/ai" className="ask-ai-btn">
          Ask Farmio AI
        </Link>
      </div>
    </div>
  );
};

export default Market;
