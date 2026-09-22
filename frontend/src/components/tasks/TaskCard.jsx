import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Trash2,
  Edit,
  Eye,
  Zap,
  Bot,
  UserCheck,
  Building,
  Sprout,
  MoreVertical,
} from "lucide-react";

const TYPE_CONFIG = {
  irrigation: { icon: "💧", label: "Irrigation", color: "#0284c7" },
  fertilizer: { icon: "🧪", label: "Fertilizer", color: "#16a34a" },
  pest: { icon: "🐛", label: "Pest Inspection", color: "#dc2626" },
  disease: { icon: "🦠", label: "Disease Alert", color: "#9333ea" },
  harvest: { icon: "🌾", label: "Harvest", color: "#d97706" },
  planting: { icon: "🌱", label: "Planting", color: "#059669" },
  inspection: { icon: "🔍", label: "Inspection", color: "#0891b2" },
  weather: { icon: "🌦️", label: "Weather Task", color: "#2563eb" },
  market: { icon: "📈", label: "Market Task", color: "#7c3aed" },
  general: { icon: "📋", label: "General Task", color: "#64748b" },
};

const PRIORITY_BADGES = {
  low: { label: "Low Priority", class: "prio-low", icon: "🔵" },
  normal: { label: "Normal", class: "prio-normal", icon: "🟢" },
  high: { label: "High Priority", class: "prio-high", icon: "🟠" },
  urgent: { label: "URGENT", class: "prio-urgent", icon: "🔴" },
};

const SOURCE_LABEL = {
  manual: { text: "Manual Task", icon: UserCheck, class: "source-manual" },
  automation: { text: "Farmio Automation", icon: Zap, class: "source-automation" },
  ai: { text: "Farmio Demo AI", icon: Bot, class: "source-ai" },
};

const TaskCard = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetails,
  onReschedule,
}) => {
  const typeInfo = TYPE_CONFIG[task.type] || TYPE_CONFIG.general;
  const prioInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.normal;
  const sourceInfo = SOURCE_LABEL[task.source] || SOURCE_LABEL.manual;
  const SourceIcon = sourceInfo.icon;

  const now = new Date();
  const dueDate = task.dueAt ? new Date(task.dueAt) : null;
  const isOverdue =
    dueDate &&
    dueDate < now &&
    (task.status === "pending" || task.status === "in_progress");

  const formatDueDate = (d) => {
    if (!d) return "No Due Date";
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`task-card ${isOverdue ? "task-card-overdue" : ""} task-status-${task.status}`}
    >
      <div className="task-card-header">
        <div className="task-type-badge">
          <span className="type-icon">{typeInfo.icon}</span>
          <span className="type-label">{typeInfo.label}</span>
        </div>

        <div className="task-badges">
          {isOverdue && (
            <span className="badge badge-overdue">
              <AlertTriangle className="badge-icon" /> OVERDUE
            </span>
          )}
          <span className={`badge ${prioInfo.class}`}>
            {prioInfo.icon} {prioInfo.label}
          </span>
        </div>
      </div>

      <div className="task-card-body" onClick={() => onViewDetails(task)}>
        <h4 className="task-title">{task.title}</h4>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta-grid">
          <div className="meta-item">
            <Building className="meta-icon" />
            <span>{task.farm?.name || "Farm"}</span>
          </div>

          {task.crop && (
            <div className="meta-item">
              <Sprout className="meta-icon" />
              <span>{task.crop?.name || "Crop"}</span>
            </div>
          )}

          <div className="meta-item">
            <Calendar className="meta-icon" />
            <span className={isOverdue ? "danger-text bold" : ""}>
              {formatDueDate(dueDate)}
            </span>
          </div>

          <div className="meta-item source-item">
            <SourceIcon className="meta-icon" />
            <span className={sourceInfo.class}>{sourceInfo.text}</span>
          </div>
        </div>

        {task.reason && (
          <div className="task-reason-box">
            <span className="reason-label">Reason:</span> {task.reason}
          </div>
        )}
      </div>

      <div className="task-card-footer">
        <div className="status-indicator-box">
          <span className={`status-pill status-${task.status}`}>
            {task.status === "completed" && "✓ Completed"}
            {task.status === "in_progress" && "⚙ In Progress"}
            {task.status === "pending" && (isOverdue ? "⚠️ Overdue" : "⏳ Pending")}
            {task.status === "cancelled" && "🚫 Cancelled"}
          </span>
        </div>

        <div className="task-actions">
          {task.status === "pending" && (
            <>
              <button
                type="button"
                className="btn-sm btn-outline-primary"
                onClick={() => onStatusChange(task._id, "in_progress")}
                title="Start Task"
              >
                <Play className="btn-icon-sm" /> Start
              </button>

              <button
                type="button"
                className="btn-sm btn-success"
                onClick={() => onStatusChange(task._id, "completed")}
                title="Mark Completed"
              >
                <CheckCircle className="btn-icon-sm" /> Complete
              </button>
            </>
          )}

          {task.status === "in_progress" && (
            <button
              type="button"
              className="btn-sm btn-success"
              onClick={() => onStatusChange(task._id, "completed")}
            >
              <CheckCircle className="btn-icon-sm" /> Complete
            </button>
          )}

          {isOverdue && task.status !== "completed" && onReschedule && (
            <button
              type="button"
              className="btn-sm btn-secondary"
              onClick={() => onReschedule(task)}
            >
              <Clock className="btn-icon-sm" /> Reschedule
            </button>
          )}

          <button
            type="button"
            className="btn-icon-only"
            onClick={() => onViewDetails(task)}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            className="btn-icon-only"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit size={16} />
          </button>

          <button
            type="button"
            className="btn-icon-only btn-icon-danger"
            onClick={() => onDelete(task._id)}
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
