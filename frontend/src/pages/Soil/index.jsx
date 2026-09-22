import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, Plus, MapPin, RefreshCw, AlertCircle, Bot, ArrowRight } from "lucide-react";
import { getFarms } from "../../api/farmApi";
import {
  getLatestSoilRecord,
  getSoilHistory,
  getSoilIntelligence,
  createSoilRecord,
  updateSoilRecord,
  deleteSoilRecord,
} from "../../api/soilApi";
import SoilSummary from "../../components/soil/SoilSummary";
import SoilHistory from "../../components/soil/SoilHistory";
import SoilTrend from "../../components/soil/SoilTrend";
import SoilFormModal from "../../components/soil/SoilFormModal";
import SoilDetailsModal from "../../components/soil/SoilDetailsModal";
import ConfirmDeleteSoilModal from "../../components/soil/ConfirmDeleteSoilModal";
import ToastNotification from "../../components/farms/ToastNotification";
import "./Soil.css";

const Soil = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Selected farm soil data
  const [latestRecord, setLatestRecord] = useState(null);
  const [soilHistory, setSoilHistory] = useState([]);
  const [soilIntelligence, setSoilIntelligence] = useState(null);
  const [loadingSoil, setLoadingSoil] = useState(false);
  const [soilError, setSoilError] = useState(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Action loading states
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 1. Fetch user's farms list
  const fetchFarmsList = useCallback(async () => {
    setLoadingFarms(true);
    try {
      const res = await getFarms();
      const farmList = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      const validFarms = Array.isArray(farmList) ? farmList : [];
      setFarms(validFarms);
      if (validFarms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(validFarms[0]._id);
      }
    } catch (err) {
      console.error("Failed to load farms:", err);
    } finally {
      setLoadingFarms(false);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    fetchFarmsList();
  }, [fetchFarmsList]);

  // 2. Fetch soil data for currently selected farm
  const fetchSoilDataForFarm = useCallback(async (farmId) => {
    if (!farmId) return;
    setLoadingSoil(true);
    setSoilError(null);
    try {
      // Run requests in parallel using all available soil API functions
      const [latestRes, historyRes, intelligenceRes] = await Promise.allSettled([
        getLatestSoilRecord(farmId),
        getSoilHistory(farmId),
        getSoilIntelligence(farmId),
      ]);

      // Latest record
      if (latestRes.status === "fulfilled" && latestRes.value?.data?.data) {
        setLatestRecord(latestRes.value.data.data);
      } else {
        setLatestRecord(null);
      }

      // History records
      if (historyRes.status === "fulfilled" && historyRes.value?.data?.data) {
        setSoilHistory(Array.isArray(historyRes.value.data.data) ? historyRes.value.data.data : []);
      } else {
        setSoilHistory([]);
      }

      // Intelligence summary
      if (intelligenceRes.status === "fulfilled" && intelligenceRes.value?.data?.data) {
        setSoilIntelligence(intelligenceRes.value.data.data);
      } else {
        setSoilIntelligence(null);
      }
    } catch (err) {
      console.error("Failed to fetch soil data for farm:", err);
      setSoilError("Unable to load soil information. Please try again.");
    } finally {
      setLoadingSoil(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchSoilDataForFarm(selectedFarmId);
    }
  }, [selectedFarmId, fetchSoilDataForFarm]);

  const selectedFarmObj = farms.find((f) => f._id === selectedFarmId);

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingRecord) {
        await updateSoilRecord(editingRecord._id, payload);
        showToast("Soil record updated successfully.");
        setEditingRecord(null);
      } else {
        await createSoilRecord(payload);
        showToast("Soil record added successfully.");
        setShowAddModal(false);
      }
      await fetchSoilDataForFarm(payload.farm || selectedFarmId);
    } catch (err) {
      console.error("Save soil record error:", err);
      showToast("Unable to save soil record. Please check your inputs and try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async (recordId) => {
    setDeleting(true);
    try {
      await deleteSoilRecord(recordId);
      showToast("Soil record deleted successfully.");
      setDeletingRecord(null);
      await fetchSoilDataForFarm(selectedFarmId);
    } catch (err) {
      console.error("Delete soil record error:", err);
      showToast("Unable to delete soil record. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="soil-page">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="soil-page-header">
        <div className="soil-header-title-wrap">
          <h1 className="soil-title">
            <FlaskConical size={26} color="#16a34a" /> Soil Health
          </h1>
          <p className="soil-subtitle">
            Monitor your soil condition, nutrients and moisture to make better farming decisions.
          </p>
        </div>

        {farms.length > 0 && (
          <button
            type="button"
            className="btn-add-soil"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            <span>Add Soil Record</span>
          </button>
        )}
      </div>

      {/* Farm Selector Bar */}
      {loadingFarms ? (
        <div className="soil-farm-selector-bar">
          <span className="farms-summary-label">Loading your farms...</span>
        </div>
      ) : farms.length === 0 ? (
        <div className="farms-empty-state">
          <div className="empty-icon">🌾</div>
          <h2 className="empty-title">No farms available</h2>
          <p className="empty-desc">
            You must add a farm before managing soil records.
          </p>
          <Link to="/farms" className="btn btn-primary">
            <Plus size={16} /> Add Farm
          </Link>
        </div>
      ) : (
        <>
          <div className="soil-farm-selector-bar">
            <div className="farm-select-label-group">
              <label htmlFor="select-active-farm">
                <MapPin size={16} color="#16a34a" /> Select Farm:
              </label>
              <select
                id="select-active-farm"
                className="soil-farm-select"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
              >
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.location?.district || f.location?.state || "Farm"})
                  </option>
                ))}
              </select>
            </div>

            {selectedFarmObj && (
              <span className="farm-meta-info-badge">
                Soil Type: <strong>{selectedFarmObj.soilType ? selectedFarmObj.soilType.toUpperCase() : "OTHER"}</strong> • Area: {selectedFarmObj.area?.value} {selectedFarmObj.area?.unit || "Acre"}
              </span>
            )}
          </div>

          {/* Main Soil Content Area */}
          {soilError ? (
            <div className="farms-error-state">
              <AlertCircle size={32} />
              <h3>{soilError}</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchSoilDataForFarm(selectedFarmId)}
              >
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          ) : (
            <>
              {/* Latest Soil Summary Report & Metric Cards */}
              <SoilSummary
                latestRecord={latestRecord}
                farm={selectedFarmObj}
                intelligence={soilIntelligence}
                loading={loadingSoil}
                onAddRecord={() => setShowAddModal(true)}
              />

              {/* Historical Soil Trend Component */}
              <SoilTrend records={soilHistory} />

              {/* Soil History Table & Mobile Cards */}
              <SoilHistory
                records={soilHistory}
                onView={(rec) => setViewingRecord(rec)}
                onEdit={(rec) => setEditingRecord(rec)}
                onDelete={(rec) => setDeletingRecord(rec)}
                loading={loadingSoil}
              />

              {/* AI Assistance Guidance Promo */}
              <div className="soil-ai-promo-banner">
                <div className="ai-promo-content">
                  <div className="ai-promo-icon">
                    <Bot size={28} />
                  </div>
                  <div className="ai-promo-text">
                    <h3>Need help understanding your soil?</h3>
                    <p>
                      Farmio AI can help interpret your farm information, deficiency alerts, and provide practical fertilizer guidance.
                    </p>
                  </div>
                </div>

                <Link to="/ai" className="btn-ask-ai">
                  <span>Ask Farmio AI</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </>
      )}

      {/* View Soil Details Modal */}
      {viewingRecord && (
        <SoilDetailsModal
          record={viewingRecord}
          farm={selectedFarmObj}
          intelligence={soilIntelligence}
          onClose={() => setViewingRecord(null)}
          onEdit={(rec) => setEditingRecord(rec)}
        />
      )}

      {/* Add / Edit Soil Record Modal */}
      {(showAddModal || editingRecord) && (
        <SoilFormModal
          record={editingRecord}
          farms={farms}
          selectedFarmId={selectedFarmId}
          onClose={() => {
            setShowAddModal(false);
            setEditingRecord(null);
          }}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      )}

      {/* Confirm Delete Soil Modal */}
      {deletingRecord && (
        <ConfirmDeleteSoilModal
          record={deletingRecord}
          onClose={() => setDeletingRecord(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Soil;
