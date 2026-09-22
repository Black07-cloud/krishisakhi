import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Sprout, RefreshCw, AlertCircle } from "lucide-react";
import {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
  updateCropStage,
  getCropLifecycle,
} from "../../api/cropApi";
import { getFarms } from "../../api/farmApi";
import CropSummary from "../../components/crops/CropSummary";
import CropFilters from "../../components/crops/CropFilters";
import CropCard from "../../components/crops/CropCard";
import CropDetailsModal from "../../components/crops/CropDetailsModal";
import CropFormModal from "../../components/crops/CropFormModal";
import ConfirmDeleteCropModal from "../../components/crops/ConfirmDeleteCropModal";
import ToastNotification from "../../components/farms/ToastNotification";
import "./Crops.css";

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [farmFilter, setFarmFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [viewingCrop, setViewingCrop] = useState(null);
  const [lifecycleData, setLifecycleData] = useState(null);
  const [deletingCrop, setDeletingCrop] = useState(null);

  // Loading flags for modal actions
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Fetch crops & farms from real backend APIs
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropsRes, farmsRes] = await Promise.all([getCrops(), getFarms()]);

      // Extract crops array safely
      const cropList = cropsRes?.data?.data ?? (Array.isArray(cropsRes?.data) ? cropsRes.data : []);
      setCrops(Array.isArray(cropList) ? cropList : []);

      // Extract farms array safely
      const farmList = farmsRes?.data?.data ?? (Array.isArray(farmsRes?.data) ? farmsRes.data : []);
      setFarms(Array.isArray(farmList) ? farmList : []);
    } catch (err) {
      console.error("Failed to load crops data:", err);
      setError("Unable to load crops. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch specific crop lifecycle history when opening view modal
  const handleViewCrop = async (cropObj) => {
    setViewingCrop(cropObj);
    setLifecycleData(null);
    try {
      const res = await getCropLifecycle(cropObj._id);
      if (res?.data?.data) {
        setLifecycleData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch crop lifecycle details:", err);
      // Fallback to local crop history if API fails
    }
  };

  // Filter & Sort crops
  const filteredCrops = useMemo(() => {
    let list = crops.filter((crop) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = crop.name?.toLowerCase().includes(q);
        const varietyMatch = crop.variety?.toLowerCase().includes(q);
        const farmName = typeof crop.farm === "object" ? crop.farm?.name : "";
        const farmMatch = farmName?.toLowerCase().includes(q);
        if (!nameMatch && !varietyMatch && !farmMatch) {
          return false;
        }
      }

      // Farm filter
      if (farmFilter !== "all") {
        const farmId = typeof crop.farm === "object" ? crop.farm?._id : crop.farm;
        if (farmId !== farmFilter) return false;
      }

      // Stage filter
      if (stageFilter !== "all" && crop.currentStage !== stageFilter) return false;

      // Status filter
      if (statusFilter !== "all" && crop.status !== statusFilter) return false;

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "planting") {
        return new Date(b.plantingDate || 0) - new Date(a.plantingDate || 0);
      }
      if (sortBy === "harvest") {
        return new Date(a.expectedHarvestDate || 0) - new Date(b.expectedHarvestDate || 0);
      }
      // Newest by default
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [crops, searchQuery, farmFilter, stageFilter, statusFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFarmFilter("all");
    setStageFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  // Handle Create or Update Crop Submit
  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingCrop) {
        await updateCrop(editingCrop._id, payload);
        showToast("Crop updated successfully.");
        setEditingCrop(null);
      } else {
        await createCrop(payload);
        showToast("Crop added successfully.");
        setShowAddModal(false);
      }
      await fetchData();
    } catch (err) {
      console.error("Save crop error:", err);
      showToast("Unable to save crop. Please check your inputs and try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Stage Update
  const handleUpdateStage = async (cropId, newStage, note) => {
    setUpdatingStage(true);
    try {
      await updateCropStage(cropId, newStage);
      showToast("Crop stage updated successfully.");
      // Refresh viewing modal data & list
      await fetchData();
      const updatedLifecycleRes = await getCropLifecycle(cropId);
      if (updatedLifecycleRes?.data?.data) {
        setLifecycleData(updatedLifecycleRes.data.data);
      }
    } catch (err) {
      console.error("Update stage error:", err);
      showToast("Unable to update stage. Please try again.", "error");
    } finally {
      setUpdatingStage(false);
    }
  };

  // Handle Delete Crop Confirm
  const handleDeleteConfirm = async (cropId) => {
    setDeleting(true);
    try {
      await deleteCrop(cropId);
      showToast("Crop deleted successfully.");
      setDeletingCrop(null);
      await fetchData();
    } catch (err) {
      console.error("Delete crop error:", err);
      showToast("Unable to delete crop. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="crops-page">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="crops-page-header">
        <div className="crops-header-title-wrap">
          <h1 className="crops-title">
            <Sprout size={26} color="#16a34a" /> My Crops
          </h1>
          <p className="crops-subtitle">
            Track your crops, growth stages and harvest progress.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-crop"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} />
          <span>Add Crop</span>
        </button>
      </div>

      {/* Summary Cards */}
      <CropSummary crops={crops} loading={loading} />

      {/* Search & Filters */}
      <CropFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        farmFilter={farmFilter}
        onFarmChange={setFarmFilter}
        stageFilter={stageFilter}
        onStageChange={setStageFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        farms={farms}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content List / Skeleton / Error / Empty States */}
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
          <button type="button" className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      ) : crops.length === 0 ? (
        /* Empty State — No crops */
        <div className="farms-empty-state">
          <div className="empty-icon">🌱</div>
          <h2 className="empty-title">No crops added yet</h2>
          <p className="empty-desc">
            Add your crops to start tracking growth, irrigation and harvest progress.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add Your First Crop
          </button>
        </div>
      ) : filteredCrops.length === 0 ? (
        /* Empty State — Filter returned 0 */
        <div className="farms-empty-state">
          <div className="empty-icon">🔍</div>
          <h2 className="empty-title">No matching crops found</h2>
          <p className="empty-desc">
            No crops match your search or filter selection.
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
        /* Crops Grid */
        <div className="crops-grid">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop._id}
              crop={crop}
              onView={handleViewCrop}
              onEdit={(c) => setEditingCrop(c)}
              onDelete={(c) => setDeletingCrop(c)}
            />
          ))}
        </div>
      )}

      {/* View Crop Details Modal */}
      {viewingCrop && (
        <CropDetailsModal
          crop={viewingCrop}
          lifecycleData={lifecycleData}
          onClose={() => {
            setViewingCrop(null);
            setLifecycleData(null);
          }}
          onEdit={(c) => setEditingCrop(c)}
          onUpdateStage={handleUpdateStage}
          updatingStage={updatingStage}
        />
      )}

      {/* Add / Edit Crop Modal */}
      {(showAddModal || editingCrop) && (
        <CropFormModal
          crop={editingCrop}
          farms={farms}
          onClose={() => {
            setShowAddModal(false);
            setEditingCrop(null);
          }}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingCrop && (
        <ConfirmDeleteCropModal
          crop={deletingCrop}
          onClose={() => setDeletingCrop(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Crops;
