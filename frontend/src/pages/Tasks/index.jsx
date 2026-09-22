import React, { useState, useEffect, useCallback } from "react";
import {
  ListTodo,
  Plus,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import {
  getTasks,
  getUpcomingTasks,
  getOverdueTasks,
  getCompletedTasks,
  getTaskStats,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  runFarmAutomation,
} from "../../api/taskApi";
import { getFarms } from "../../api/farmApi";
import { getCrops } from "../../api/cropApi";

import TaskStats from "../../components/tasks/TaskStats";
import TaskFilters from "../../components/tasks/TaskFilters";
import TaskCard from "../../components/tasks/TaskCard";
import TaskForm from "../../components/tasks/TaskForm";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import TaskEmptyState from "../../components/tasks/TaskEmptyState";

import "./Tasks.css";

const Tasks = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, upcoming, overdue, completed
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    farmId: "",
    cropId: "",
    status: "",
    priority: "",
    type: "",
    source: "",
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Notification message
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Fetch Farms & Crops metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [farmsRes, cropsRes] = await Promise.all([
          getFarms(),
          getCrops(),
        ]);
        if (farmsRes.data?.data || farmsRes.data?.farms) {
          setFarms(farmsRes.data.data || farmsRes.data.farms || []);
        }
        if (cropsRes.data?.data || cropsRes.data?.crops) {
          setCrops(cropsRes.data.data || cropsRes.data.crops || []);
        }
      } catch (err) {
        console.error("Failed to load farms/crops metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Statistics
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getTaskStats();
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to load task stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Tasks depending on activeTab & filters
  const loadTasks = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        if (activeTab === "upcoming") {
          const res = await getUpcomingTasks(7);
          if (res.data?.success) {
            setTasks(res.data.tasks || []);
            setPagination({
              page: 1,
              limit: 50,
              total: res.data.tasks?.length || 0,
              pages: 1,
            });
          }
        } else if (activeTab === "overdue") {
          const res = await getOverdueTasks();
          if (res.data?.success) {
            setTasks(res.data.tasks || []);
            setPagination({
              page: 1,
              limit: 50,
              total: res.data.tasks?.length || 0,
              pages: 1,
            });
          }
        } else if (activeTab === "completed") {
          const res = await getCompletedTasks({
            page,
            limit: pagination.limit,
          });
          if (res.data?.success) {
            setTasks(res.data.tasks || []);
            setPagination(
              res.data.pagination || { page: 1, limit: 12, total: 0, pages: 1 },
            );
          }
        } else {
          // "all" tab with full query filters
          const queryParams = {
            page,
            limit: pagination.limit,
            ...filters,
          };
          const res = await getTasks(queryParams);
          if (res.data?.success) {
            setTasks(res.data.tasks || res.data.data || []);
            setPagination(
              res.data.pagination || { page: 1, limit: 12, total: 0, pages: 1 },
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        showToast("Error loading tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, filters, pagination.limit],
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTasks(1);
  }, [loadTasks, activeTab, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      farmId: "",
      cropId: "",
      status: "",
      priority: "",
      type: "",
      source: "",
    });
  };

  // Status Action Handlers
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTaskStatus(taskId, newStatus);
      if (res.data?.success) {
        showToast(`Task status updated to ${newStatus}`);
        loadTasks(pagination.page);
        loadStats();
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      showToast(err.response?.data?.message || "Failed to update task status");
    }
  };

  // Create or Edit Submit
  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        const res = await updateTask(editingTask._id, payload);
        if (res.data?.success) {
          showToast("Task updated successfully!");
          setIsFormOpen(false);
          setEditingTask(null);
          loadTasks(pagination.page);
          loadStats();
        }
      } else {
        const res = await createTask(payload);
        if (res.data?.success) {
          showToast("Task created successfully!");
          setIsFormOpen(false);
          loadTasks(1);
          loadStats();
        }
      }
    } catch (err) {
      console.error("Form submit error:", err);
      showToast(err.response?.data?.message || "Could not save task");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await deleteTask(taskId);
      if (res.data?.success) {
        showToast("Task deleted successfully");
        loadTasks(pagination.page);
        loadStats();
      }
    } catch (err) {
      console.error("Delete task error:", err);
      showToast(err.response?.data?.message || "Could not delete task");
    }
  };

  // Run Farm Automation Handler
  const handleRunAutomation = async () => {
    if (farms.length === 0) {
      showToast("Please add a farm first before running automation.");
      return;
    }

    const farmId = farms[0]._id;
    setActionLoading(true);
    try {
      const res = await runFarmAutomation(farmId);
      if (res.data?.success) {
        const count =
          res.data.data?.tasksCreated || res.data.data?.stageTasksCreated || 0;
        showToast(
          `Farm automation executed. ${count} automated tasks generated/updated.`,
        );
        loadTasks(1);
        loadStats();
      }
    } catch (err) {
      console.error("Automation error:", err);
      showToast("Failed to run automation rules.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="farm-tasks-container">
      {/* Toast alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#1e293b",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
            zIndex: 9999,
            fontSize: "0.9rem",
            fontWeight: "600",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="tasks-header">
        <div className="tasks-header-left">
          <h1>
            <ListTodo className="text-primary" size={28} /> Farm Tasks &
            Reminders
          </h1>
          <p>
            Organize farm activities, execute AI recommendations, and track
            upcoming deadlines.
          </p>
        </div>

        <div className="tasks-header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleRunAutomation}
            disabled={actionLoading}
          >
            <Zap size={18} className="text-warning" /> Run Farm Automation
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <TaskStats stats={stats} loading={statsLoading} />

      {/* Tab Navigation */}
      <div className="tasks-tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <ListTodo size={18} /> All Tasks
          {stats && <span className="tab-badge">{stats.total || 0}</span>}
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          <Calendar size={18} /> Upcoming (7 Days)
          {stats && <span className="tab-badge">{stats.today || 0} today</span>}
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "overdue" ? "active" : ""}`}
          onClick={() => setActiveTab("overdue")}
        >
          <AlertTriangle size={18} /> Overdue Tasks
          {stats && stats.overdue > 0 && (
            <span className="tab-badge danger">{stats.overdue}</span>
          )}
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <CheckCircle2 size={18} /> Completed History
          {stats && <span className="tab-badge">{stats.completed || 0}</span>}
        </button>
      </div>

      {/* Filters (only for 'all' tab) */}
      {activeTab === "all" && (
        <TaskFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          farms={farms}
          crops={crops}
        />
      )}

      {/* Tasks Content Grid */}
      {loading ? (
        <div className="tasks-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="task-card skeleton-card">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line large"></div>
              <div className="skeleton-line medium"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <TaskEmptyState
          type={activeTab}
          onAddTask={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteTask}
                onViewDetails={(t) => {
                  setSelectedTask(t);
                  setIsDetailsOpen(true);
                }}
                onReschedule={(t) => {
                  setEditingTask(t);
                  setIsFormOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Showing page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.pages}</strong> ({pagination.total} total
                tasks)
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadTasks(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadTasks(pagination.page + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Task Form Modal (Create / Edit) */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        farms={farms}
        crops={crops}
        loading={actionLoading}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={(t) => {
          setEditingTask(t);
          setIsFormOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Tasks;
