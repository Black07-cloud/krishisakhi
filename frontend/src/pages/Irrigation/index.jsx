import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Droplets, Plus, MapPin, Sprout, RefreshCw, AlertCircle, Search, Filter } from "lucide-react";
import { getFarms } from "../../api/farmApi";
import { getCropsByFarm } from "../../api/cropApi";
import { getFarmIrrigation } from "../../api/irrigationApi";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "../../api/taskApi";
import IrrigationSummary from "../../components/irrigation/IrrigationSummary";
import IrrigationStatusCard from "../../components/irrigation/IrrigationStatusCard";
import IrrigationScheduleList from "../../components/irrigation/IrrigationScheduleList";
import IrrigationFormModal from "../../components/irrigation/IrrigationFormModal";
import ConfirmDeleteIrrigationModal from "../../components/irrigation/ConfirmDeleteIrrigationModal";
import WaterSavingAdvice from "../../components/irrigation/WaterSavingAdvice";
import ToastNotification from "../../components/farms/ToastNotification";
import "./Irrigation.css";

const Irrigation = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Crops for selected farm
  const [crops, setCrops] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState("all");
  const [loadingCrops, setLoadingCrops] = useState(false);

  // Farm Irrigation recommendation data from backend
  const [farmIrrigationData, setFarmIrrigationData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Irrigation schedules / tasks from backend
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  // Loading flags
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 1. Fetch user's farms
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

  // 2. Fetch crops, irrigation status & tasks when selected farm changes
  const fetchFarmData = useCallback(async (farmId) => {
    if (!farmId) return;
    setLoadingCrops(true);
    setLoadingStatus(true);
    setLoadingTasks(true);
    setTasksError(null);

    // Reset sub-selections
    setSelectedCropId("all");

    // Fetch in parallel using real API endpoints
    const [cropsRes, irrRes, tasksRes] = await Promise.allSettled([
      getCropsByFarm(farmId),
      getFarmIrrigation(farmId),
      getTasks({ farm: farmId, type: "irrigation" }),
    ]);

    // Crops
    if (cropsRes.status === "fulfilled" && cropsRes.value?.data?.data) {
      const cropList = Array.isArray(cropsRes.value.data.data) ? cropsRes.value.data.data : [];
      setCrops(cropList);
    } else {
      setCrops([]);
    }
    setLoadingCrops(false);

    // Status recommendation
    if (irrRes.status === "fulfilled" && irrRes.value?.data?.data) {
      setFarmIrrigationData(irrRes.value.data.data);
    } else {
      setFarmIrrigationData(null);
    }
    setLoadingStatus(false);

    // Tasks / Schedules
    if (tasksRes.status === "fulfilled" && tasksRes.value?.data?.data) {
      const taskList = Array.isArray(tasksRes.value.data.data) ? tasksRes.value.data.data : [];
      setTasks(taskList);
    } else {
      setTasks([]);
      if (tasksRes.status === "rejected") {
        setTasksError("Unable to load irrigation tasks. Please try again.");
      }
    }
    setLoadingTasks(false);
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchFarmData(selectedFarmId);
    }
  }, [selectedFarmId, fetchFarmData]);

  const selectedFarmObj = farms.find((f) => f._id === selectedFarmId);

  // Filtered tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Crop filter (if crop matched in title/reason)
      if (selectedCropId !== "all") {
        const cropObj = crops.find((c) => c._id === selectedCropId);
        if (cropObj) {
          const cropName = cropObj.name.toLowerCase();
          const matchTitle = t.title?.toLowerCase().includes(cropName);
          const matchReason = t.reason?.toLowerCase().includes(cropName);
          if (!matchTitle && !matchReason) return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const reasonMatch = t.reason?.toLowerCase().includes(q);
        const prioMatch = t.priority?.toLowerCase().includes(q);
        if (!titleMatch && !reasonMatch && !prioMatch) return false;
      }

      return true;
    });
  }, [tasks, selectedCropId, crops, statusFilter, searchQuery]);

  // Handle Create Schedule
  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await createTask(payload);
      showToast("Irrigation task scheduled successfully.");
      setShowAddModal(false);
      await fetchFarmData(selectedFarmId);
    } catch (err) {
      console.error("Create schedule error:", err);
      showToast("Unable to schedule irrigation. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update (Complete / Cancel)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      showToast(`Irrigation status updated to ${newStatus}.`);
      await fetchFarmData(selectedFarmId);
    } catch (err) {
      console.error("Update task status error:", err);
      showToast("Unable to update status. Please try again.", "error");
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async (taskId) => {
    setDeleting(true);
    try {
      await deleteTask(taskId);
      showToast("Irrigation task deleted successfully.");
      setDeletingTask(null);
      await fetchFarmData(selectedFarmId);
    } catch (err) {
      console.error("Delete task error:", err);
      showToast("Unable to delete task. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="irrigation-page">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="irrigation-page-header">
        <div className="irrigation-header-title-wrap">
          <h1 className="irrigation-title">
            <Droplets size={26} color="#16a34a" /> Irrigation
          </h1>
          <p className="irrigation-subtitle">
            Plan, monitor and manage irrigation for your crops.
          </p>
        </div>

        {farms.length > 0 && (
          <button
            type="button"
            className="btn-add-schedule"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            <span>Schedule Irrigation</span>
          </button>
        )}
      </div>

      {/* Selectors Bar (Farm & Crop) */}
      {loadingFarms ? (
        <div className="irrigation-selectors-bar">
          <span className="irrigation-summary-label">Loading your farms...</span>
        </div>
      ) : farms.length === 0 ? (
        <div className="farms-empty-state">
          <div className="empty-icon">🌾</div>
          <h2 className="empty-title">No farms available</h2>
          <p className="empty-desc">
            You must add a farm before managing irrigation schedules.
          </p>
          <Link to="/farms" className="btn btn-primary">
            <Plus size={16} /> Add Farm
          </Link>
        </div>
      ) : (
        <>
          <div className="irrigation-selectors-bar">
            <div className="selector-group">
              <div className="selector-item">
                <label htmlFor="irr-select-farm">
                  <MapPin size={16} color="#16a34a" /> Select Farm:
                </label>
                <select
                  id="irr-select-farm"
                  className="irrigation-select"
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

              {crops.length > 0 && (
                <div className="selector-item">
                  <label htmlFor="irr-select-crop">
                    <Sprout size={16} color="#16a34a" /> Select Crop:
                  </label>
                  <select
                    id="irr-select-crop"
                    className="irrigation-select"
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                  >
                    <option value="all">All Farm Crops ({crops.length})</option>
                    {crops.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.variety ? `(${c.variety})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="selector-group">
              <div className="farms-search-box" style={{ minWidth: "200px" }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search schedules"
                />
              </div>

              <div className="filter-select-wrapper">
                <Filter size={14} className="filter-icon" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Scheduled (Pending)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Helper Notice if no crops in selected farm */}
          {crops.length === 0 && !loadingCrops && (
            <div className="soil-intelligence-alert" style={{ background: "#e0f2fe", borderColor: "#bae6fd", color: "#0369a1" }}>
              <Sprout size={18} color="#0284c7" />
              <span>
                No active crops associated with <strong>{selectedFarmObj?.name}</strong>. Add a crop to receive crop-specific water requirements.
              </span>
              <Link to="/crops" className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>
                <Plus size={14} /> Add Crop
              </Link>
            </div>
          )}

          {/* Summary Cards */}
          <IrrigationSummary tasks={tasks} loading={loadingTasks} />

          {/* Prominent Current Irrigation Status Banner */}
          <IrrigationStatusCard
            farmIrrigationData={farmIrrigationData}
            loading={loadingStatus}
            farmName={selectedFarmObj?.name}
          />

          {/* Irrigation Schedule List / Table */}
          {tasksError ? (
            <div className="farms-error-state">
              <AlertCircle size={32} />
              <h3>{tasksError}</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fetchFarmData(selectedFarmId)}
              >
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          ) : (
            <IrrigationScheduleList
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onDelete={(t) => setDeletingTask(t)}
              loading={loadingTasks}
              farmName={selectedFarmObj?.name}
            />
          )}

          {/* Water Saving Recommendations & AI Banner */}
          <WaterSavingAdvice
            adviceText={farmIrrigationData?.irrigation?.waterSavingAdvice}
          />
        </>
      )}

      {/* Add Schedule Form Modal */}
      {showAddModal && (
        <IrrigationFormModal
          farms={farms}
          crops={crops}
          selectedFarmId={selectedFarmId}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      )}

      {/* Delete Schedule Confirmation Modal */}
      {deletingTask && (
        <ConfirmDeleteIrrigationModal
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Irrigation;
