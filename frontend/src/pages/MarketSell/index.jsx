import React, { useState, useEffect } from "react";
import {
  ShoppingBasket,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getFarms } from "../../api/farmApi";
import { getCropsByFarm } from "../../api/cropApi";
import {
  createListing,
  getTodayMarketPrices,
  generateListingDescription,
} from "../../api/marketApi";
import { formatCurrency } from "../../components/finance/SummaryCards";
import "./MarketSell.css";

const MarketSell = () => {
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState("");
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState("");
  const [cropName, setCropName] = useState("Tomato");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("quintal");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("quintal");
  const [availableFrom, setAvailableFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [availableUntil, setAvailableUntil] = useState("");
  const [contactPreference, setContactPreference] = useState("both");

  // Market Reference state
  const [marketRef, setMarketRef] = useState(null);
  const [loadingRef, setLoadingRef] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch user farms
  useEffect(() => {
    let isMounted = true;
    const fetchFarms = async () => {
      try {
        const res = await getFarms();
        if (isMounted) {
          const list = res?.data || res || [];
          setFarms(Array.isArray(list) ? list : []);
          if (list.length > 0) {
            setFarmId(list[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load farms:", err);
      }
    };
    fetchFarms();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch crops for selected farm
  useEffect(() => {
    let isMounted = true;
    const fetchCrops = async () => {
      if (!farmId) {
        setCrops([]);
        return;
      }
      try {
        const res = await getCropsByFarm(farmId);
        if (isMounted) {
          const list = res?.data || res || [];
          setCrops(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load crops:", err);
      }
    };
    fetchCrops();
    return () => {
      isMounted = false;
    };
  }, [farmId]);

  // 3. Fetch Market Reference whenever cropName changes
  useEffect(() => {
    let isMounted = true;
    const fetchRefPrice = async () => {
      if (!cropName.trim()) return;
      setLoadingRef(true);
      try {
        const res = await getTodayMarketPrices({ crop: cropName.trim(), limit: 5 });
        if (isMounted && res && res.success && res.data && res.data.length > 0) {
          setMarketRef(res.data[0]);
        } else if (isMounted) {
          setMarketRef(null);
        }
      } catch (err) {
        console.error("Market ref error:", err);
      } finally {
        if (isMounted) setLoadingRef(false);
      }
    };

    fetchRefPrice();
    return () => {
      isMounted = false;
    };
  }, [cropName]);

  const handleCropSelect = (e) => {
    const selectedId = e.target.value;
    setCropId(selectedId);
    const selectedCropObj = crops.find((c) => c._id === selectedId);
    if (selectedCropObj) {
      setCropName(selectedCropObj.name);
      if (!title) {
        setTitle(`Fresh ${selectedCropObj.name} Harvest Available`);
      }
    }
  };

  const handleAiDescription = async () => {
    setGeneratingAi(true);
    try {
      const selectedFarmObj = farms.find((f) => f._id === farmId);
      const res = await generateListingDescription({
        cropName,
        quantity,
        quantityUnit,
        expectedPrice,
        priceUnit,
        location: selectedFarmObj?.location,
      });

      if (res && res.description) {
        setDescription(res.description);
      }
    } catch (err) {
      console.error("AI description failed:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!farmId) {
      setError("Please select a farm.");
      return;
    }

    if (!title.trim() || !cropName.trim()) {
      setError("Please provide a crop name and title.");
      return;
    }

    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!expectedPrice || isNaN(expectedPrice) || Number(expectedPrice) <= 0) {
      setError("Please enter a valid expected price.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        farmId,
        cropId: cropId || undefined,
        cropName: cropName.trim(),
        title: title.trim(),
        description: description.trim(),
        quantity: Number(quantity),
        quantityUnit,
        expectedPrice: Number(expectedPrice),
        priceUnit,
        availableFrom,
        availableUntil: availableUntil || undefined,
        contactPreference,
      };

      await createListing(payload);
      navigate("/market/my-listings");
    } catch (err) {
      console.error("Submit listing error:", err);
      setError(
        err?.data?.message || err?.message || "Failed to publish crop listing."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="market-page">
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/market" className="secondary-header-btn" style={{ padding: "0.5rem 1rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Market Intelligence</span>
        </Link>
      </div>

      <div className="market-sell-container">
        <div className="finance-header-left" style={{ marginBottom: "1rem" }}>
          <div className="finance-header-icon">
            <ShoppingBasket size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>Sell Your Crop</h1>
            <p>Publish a listing for buyers across regional markets.</p>
          </div>
        </div>

        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Current Market Reference Information Box */}
        <div className="market-ref-box">
          <div className="market-ref-header">
            <h4>
              Current Market Reference ({cropName || "Crop"})
            </h4>
            <span className="badge-pill" style={{ background: "#dcfce7", color: "#15803d" }}>
              {marketRef?.dataType === "live" ? "Live Mandi Data" : "Market Reference"}
            </span>
          </div>
          {loadingRef ? (
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Loading market price reference...
            </p>
          ) : marketRef ? (
            <div className="market-ref-content">
              <div className="ref-price-item">
                <span className="ref-label">Modal Price</span>
                <span className="ref-val">
                  {formatCurrency(marketRef.modalPrice)} / {marketRef.unit}
                </span>
              </div>
              <div className="ref-price-item">
                <span className="ref-label">Market Mandi</span>
                <span className="ref-val" style={{ fontSize: "1rem", color: "#334155" }}>
                  {marketRef.market} ({marketRef.district || marketRef.state})
                </span>
              </div>
              <div className="ref-price-item">
                <span className="ref-label">Price Range</span>
                <span className="ref-val" style={{ fontSize: "1rem", color: "#475569" }}>
                  {formatCurrency(marketRef.minPrice)} – {formatCurrency(marketRef.maxPrice)}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              No recent market reference available for {cropName}. Set your price independently.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="market-sell-form">
          {/* Farm & Crop Selection */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sell-farm-select" className="form-label">
                Farm <span className="required-star">*</span>
              </label>
              <select
                id="sell-farm-select"
                className="form-select"
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  setCropId("");
                }}
                required
              >
                <option value="">-- Select Farm --</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sell-crop-select" className="form-label">
                Select Crop from Farm (Optional)
              </label>
              <select
                id="sell-crop-select"
                className="form-select"
                value={cropId}
                onChange={handleCropSelect}
                disabled={!farmId}
              >
                <option value="">-- Custom / Harvest Produce --</option>
                {crops.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.variety ? `(${c.variety})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop Name & Title */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sell-cropname-input" className="form-label">
                Crop Name <span className="required-star">*</span>
              </label>
              <input
                id="sell-cropname-input"
                type="text"
                className="form-input"
                placeholder="e.g. Tomato, Onion, Paddy"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sell-title-input" className="form-label">
                Listing Title <span className="required-star">*</span>
              </label>
              <input
                id="sell-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Fresh Red Tomatoes Harvest Available"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sell-quantity-input" className="form-label">
                Quantity <span className="required-star">*</span>
              </label>
              <input
                id="sell-quantity-input"
                type="number"
                step="any"
                min="0.01"
                className="form-input"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sell-qunit-select" className="form-label">
                Quantity Unit
              </label>
              <select
                id="sell-qunit-select"
                className="form-select"
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
              >
                <option value="quintal">Quintal</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="ton">Tonne (ton)</option>
              </select>
            </div>
          </div>

          {/* Expected Price & Unit */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sell-price-input" className="form-label">
                Expected Price (₹) <span className="required-star">*</span>
              </label>
              <div className="amount-input-wrapper">
                <IndianRupee size={16} className="amount-currency-icon" />
                <input
                  id="sell-price-input"
                  type="number"
                  step="any"
                  min="0.01"
                  className="form-input amount-input"
                  placeholder="e.g. 2600"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sell-punit-select" className="form-label">
                Price Unit
              </label>
              <select
                id="sell-punit-select"
                className="form-select"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
              >
                <option value="quintal">per Quintal</option>
                <option value="kg">per Kilogram</option>
                <option value="ton">per Tonne</option>
              </select>
            </div>
          </div>

          {/* Dates & Contact Preference */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="sell-from-date" className="form-label">
                Available From
              </label>
              <input
                id="sell-from-date"
                type="date"
                className="form-input"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sell-until-date" className="form-label">
                Available Until (Optional)
              </label>
              <input
                id="sell-until-date"
                type="date"
                className="form-input"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Preference */}
          <div className="form-group">
            <label htmlFor="sell-contact-pref" className="form-label">
              Buyer Contact Preference
            </label>
            <select
              id="sell-contact-pref"
              className="form-select"
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value)}
            >
              <option value="in_app">In-App Messages & Enquiries Only</option>
              <option value="both">In-App + Phone Number Contact</option>
            </select>
          </div>

          {/* Description & AI Generator */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="sell-desc-input" className="form-label">
                Crop Description & Quality Notes
              </label>
              <button
                type="button"
                className="ai-gen-btn"
                onClick={handleAiDescription}
                disabled={generatingAi}
              >
                <Sparkles size={14} />
                <span>{generatingAi ? "Generating..." : "Generate AI Description"}</span>
              </button>
            </div>
            <textarea
              id="sell-desc-input"
              className="form-textarea"
              rows="3"
              placeholder="Add details regarding crop variety, grade, harvest condition, packaging..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
          </div>

          <div className="scheme-modal-footer" style={{ padding: 0, marginTop: "1rem", background: "transparent" }}>
            <Link to="/market" className="modal-close-action-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="official-link-btn primary"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish Crop Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketSell;
