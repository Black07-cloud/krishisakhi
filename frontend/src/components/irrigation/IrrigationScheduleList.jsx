import { Calendar, Clock, CheckCircle2, XCircle, Trash2, MapPin, Sprout, AlertTriangle } from "lucide-react";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

const formatDate = (dateStr) => {
  if (!dateStr) return "Not set";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const STATUS_BADGES = {
  pending: "badge-status-pending",
  completed: "badge-status-completed",
  cancelled: "badge-status-cancelled",
};

const PRIORITY_BADGES = {
  urgent: "badge-prio-urgent",
  high: "badge-prio-high",
  normal: "badge-prio-normal",
  low: "badge-prio-low",
};

const IrrigationScheduleList = ({
  tasks = [],
  onUpdateStatus,
  onDelete,
  loading = false,
  farmName,
}) => {
  if (loading) {
    return (
      <div className="schedules-skeleton-list">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="irrigation-empty-schedules">
        <div className="empty-sched-icon">💧</div>
        <h3 className="empty-sched-title">No irrigation schedules yet</h3>
        <p className="empty-sched-desc">
          Create an irrigation schedule for {farmName || "your farm"} to start managing water for your crops.
        </p>
      </div>
    );
  }

  return (
    <div className="irrigation-schedules-container">
      <div className="schedules-header">
        <h3 className="section-title">
          <Clock size={18} /> Irrigation Schedules & Tasks ({tasks.length})
        </h3>
      </div>

      {/* Desktop Table View */}
      <div className="schedules-table-wrapper">
        <table className="irrigation-table">
          <thead>
            <tr>
              <th>Task / Reason</th>
              <th>Due Date & Time</th>
              <th>Priority</th>
              <th>Source</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const statusClass = STATUS_BADGES[task.status] || "badge-status-pending";
              const prioClass = PRIORITY_BADGES[task.priority] || "badge-prio-normal";

              return (
                <tr key={task._id} className={`task-row-${task.status}`}>
                  <td className="task-title-cell">
                    <span className="task-title-text">{task.title}</span>
                    {task.reason && <span className="task-reason-sub">{task.reason}</span>}
                  </td>

                  <td className="due-date-cell">
                    <Calendar size={13} /> {formatDate(task.dueAt)}
                  </td>

                  <td>
                    <span className={`prio-pill ${prioClass}`}>
                      {capitalize(task.priority || "normal")}
                    </span>
                  </td>

                  <td>
                    <span className="source-pill">
                      {capitalize(task.source || "manual")}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${statusClass}`}>
                      ● {capitalize(task.status || "pending")}
                    </span>
                  </td>

                  <td className="text-right">
                    <div className="action-buttons-group">
                      {task.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="btn-icon action-complete"
                            onClick={() => onUpdateStatus(task._id, "completed")}
                            title="Mark as Completed"
                            aria-label="Complete irrigation task"
                          >
                            <CheckCircle2 size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn-icon action-cancel"
                            onClick={() => onUpdateStatus(task._id, "cancelled")}
                            title="Cancel task"
                            aria-label="Cancel irrigation task"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="btn-icon action-delete"
                        onClick={() => onDelete(task)}
                        title="Delete task"
                        aria-label="Delete irrigation task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="schedules-mobile-cards">
        {tasks.map((task) => {
          const statusClass = STATUS_BADGES[task.status] || "badge-status-pending";
          const prioClass = PRIORITY_BADGES[task.priority] || "badge-prio-normal";

          return (
            <div key={task._id} className="irrigation-mobile-card">
              <div className="mobile-card-header">
                <h4 className="mobile-task-title">{task.title}</h4>
                <span className={`status-pill ${statusClass}`}>
                  {capitalize(task.status || "pending")}
                </span>
              </div>

              {task.reason && <p className="mobile-task-reason">{task.reason}</p>}

              <div className="mobile-task-meta">
                <span className="meta-due">
                  <Calendar size={13} /> {formatDate(task.dueAt)}
                </span>
                <span className={`prio-pill ${prioClass}`}>
                  {capitalize(task.priority || "normal")}
                </span>
              </div>

              <div className="mobile-card-actions">
                {task.status === "pending" && (
                  <>
                    <button
                      type="button"
                      className="btn-card-action action-complete"
                      onClick={() => onUpdateStatus(task._id, "completed")}
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>

                    <button
                      type="button"
                      className="btn-card-action action-cancel"
                      onClick={() => onUpdateStatus(task._id, "cancelled")}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="btn-card-action action-delete"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IrrigationScheduleList;
