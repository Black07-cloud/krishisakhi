import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Calendar, Bot, Zap } from "lucide-react";

const TaskStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="task-stats-grid skeleton-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="task-stat-card skeleton-card">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line large"></div>
          </div>
        ))}
      </div>
    );
  }

  const s = stats || {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    today: 0,
    highPriority: 0,
    aiGenerated: 0,
    automationGenerated: 0,
  };

  return (
    <div className="task-stats-grid">
      <div className="task-stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Tasks</span>
          <div className="stat-icon-bg primary">
            <ListTodo className="stat-icon" />
          </div>
        </div>
        <div className="stat-value">{s.total}</div>
        <div className="stat-subtitle">{s.completed} completed</div>
      </div>

      <div className="task-stat-card">
        <div className="stat-header">
          <span className="stat-title">Pending & In Progress</span>
          <div className="stat-icon-bg warning">
            <Clock className="stat-icon" />
          </div>
        </div>
        <div className="stat-value">{s.pending + (s.inProgress || 0)}</div>
        <div className="stat-subtitle">{s.inProgress || 0} active now</div>
      </div>

      <div className="task-stat-card">
        <div className="stat-header">
          <span className="stat-title">Due Today</span>
          <div className="stat-icon-bg info">
            <Calendar className="stat-icon" />
          </div>
        </div>
        <div className="stat-value">{s.today}</div>
        <div className="stat-subtitle">Requires focus today</div>
      </div>

      <div className={`task-stat-card ${s.overdue > 0 ? "highlight-overdue" : ""}`}>
        <div className="stat-header">
          <span className="stat-title">Overdue Tasks</span>
          <div className="stat-icon-bg danger">
            <AlertTriangle className="stat-icon" />
          </div>
        </div>
        <div className="stat-value danger-text">{s.overdue}</div>
        <div className="stat-subtitle">Passed due date</div>
      </div>

      <div className="task-stat-card">
        <div className="stat-header">
          <span className="stat-title">AI & Automation</span>
          <div className="stat-icon-bg ai">
            <Zap className="stat-icon" />
          </div>
        </div>
        <div className="stat-value">{(s.aiGenerated || 0) + (s.automationGenerated || 0)}</div>
        <div className="stat-subtitle">
          {s.automationGenerated || 0} Auto • {s.aiGenerated || 0} AI
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
