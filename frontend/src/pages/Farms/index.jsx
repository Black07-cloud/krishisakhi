import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { getFarms, createFarm, updateFarm, deleteFarm } from "../../api/farmApi";
import FarmSummary from "../../components/farms/FarmSummary";
import FarmFilters from "../../components/farms/FarmFilters";
import FarmCard from "../../components/farms/FarmCard";
import FarmDetailsModal from "../../components/farms/FarmDetailsModal";
import FarmFormModal from "../../components/farms/FarmFormModal";
import ConfirmDeleteModal from "../../components/farms/ConfirmDeleteModal";
import ToastNotification from "../../components/farms/ToastNotification";
import "./Farms.css";

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [soilFilter, setSoilFilter] = useState("all");
  const [irrigationFilter, setIrrigationFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [viewingFarm, setViewingFarm] = useState(null);
  const [deletingFarm, setDeletingFarm] = useState(null);

  // Action loading state
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch farms from real backend
  const fetchFarmsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFarms();
      // Handle response structures: res.data.data or res.data
      const data = res?.data?.data ?? (Array.isArray(res?.data) ? res.data : []);
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch farms:", err);
      setError("Unable to load farms. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmsList();
  }, [fetchFarmsList]);

  // Filtered farms
  const filteredFarms = useMemo(() => {
    return farms.filter((farm) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = farm.name?.toLowerCase().includes(q);
        const villageMatch = farm.location?.village?.toLowerCase().includes(q);
        const districtMatch = farm.location?.district?.toLowerCase().includes(q);
        const stateMatch = farm.location?.state?.toLowerCase().includes(q);
        if (!nameMatch && !villageMatch && !districtMatch && !stateMatch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "active" && farm.isActive === false) return false;
      if (statusFilter === "inactive" && farm.isActive !== false) return false;

      // Soil filter
      if (soilFilter !== "all" && farm.soilType !== soilFilter) return false;

      // Irrigation filter
      if (irrigationFilter !== "all" && farm.irrigationType !== irrigationFilter) return false;

      return true;
    });
  }, [farms, searchQuery, statusFilter, soilFilter, irrigationFilter]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSoilFilter("all");
    setIrrigationFilter("all");
  };

  // Handle Create / Update Submit
  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingFarm) {
        await updateFarm(editingFarm._id, payload);
        showToast("Farm updated successfully.");
        setEditingFarm(null);
      } else {
        await createFarm(payload);
        showToast("Farm added successfully.");
        setShowAddModal(false);
      }
      await fetchFarmsList();
    } catch (err) {
      console.error("Save farm error:", err);
      showToast("Unable to save farm. Please check your input and try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async (farmId) => {
    setDeleting(true);
    try {
      await deleteFarm(farmId);
      showToast("Farm removed successfully.");
      setDeletingFarm(null);
      await fetchFarmsList();
    } catch (err) {
      console.error("Delete farm error:", err);
      showToast("Unable to remove farm. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="farms-page">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="farms-page-header">
        <div className="farms-header-title-wrap">
          <h1 className="farms-title">
            <MapPin size={26} color="#16a34a" /> My Farms
          </h1>
          <p className="farms-subtitle">
            Manage your farms, locations, soil and irrigation information.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-farm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Add Farm</span>
        </button>
      </div>

      {/* Summary Cards */}
      <FarmSummary farms={farms} loading={loading} />

      {/* Search and Filters */}
      <FarmFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        soilFilter={soilFilter}
        onSoilChange={setSoilFilter}
        irrigationFilter={irrigationFilter}
        onIrrigationChange={setIrrigationFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <div className="farms-skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : error ? (
        <div className="farms-error-state">
          <AlertCircle size={32} />
          <h3>{error}</h3>
          <button type="button" className="btn btn-secondary" onClick={fetchFarmsList}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      ) : farms.length === 0 ? (
        /* Empty State — No farms in system */
        <div className="farms-empty-state">
          <div className="empty-icon">🌾</div>
          <h2 className="empty-title">No farms added yet</h2>
          <p className="empty-desc">
            Add your first farm to start managing crops, soil, irrigation and AI insights.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add Your First Farm
          </button>
        </div>
      ) : filteredFarms.length === 0 ? (
        /* Empty State — Filter returned 0 results */
        <div className="farms-empty-state">
          <div className="empty-icon">🔍</div>
          <h2 className="empty-title">No matching farms found</h2>
          <p className="empty-desc">
            No farms match your search query or filter criteria.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetFilters}
          >
            <RefreshCw size={15} /> Reset Filters
          </button>
        </div>
      ) : (
        /* Farm List Grid */
        <div className="farms-grid">
          {filteredFarms.map((farm) => (
            <FarmCard
              key={farm._id}
              farm={farm}
              onView={(f) => setViewingFarm(f)}
              onEdit={(f) => setEditingFarm(f)}
              onDelete={(f) => setDeletingFarm(f)}
            />
          ))}
        </div>
      )}

      {/* View Farm Modal */}
      {viewingFarm && (
        <FarmDetailsModal
          farm={viewingFarm}
          onClose={() => setViewingFarm(null)}
          onEdit={(f) => setEditingFarm(f)}
        />
      )}

      {/* Add / Edit Farm Modal */}
      {(showAddModal || editingFarm) && (
        <FarmFormModal
          farm={editingFarm}
          onClose={() => {
            setShowAddModal(false);
            setEditingFarm(null);
          }}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingFarm && (
        <ConfirmDeleteModal
          farm={deletingFarm}
          onClose={() => setDeletingFarm(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Farms;
