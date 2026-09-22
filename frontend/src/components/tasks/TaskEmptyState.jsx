import React from "react";
import { CheckCircle2, ListTodo, Plus, CalendarCheck, ShieldCheck } from "lucide-react";

const TaskEmptyState = ({ type = "all", onAddTask }) => {
  if (type === "upcoming") {
    return (
      <div className="task-empty-state">
        <div className="empty-icon-wrapper success-bg">
          <CalendarCheck className="empty-icon text-success" />
        </div>
        <h3>No upcoming tasks</h3>
        <p>You have no scheduled tasks for the coming days.</p>
        {onAddTask && (
          <button type="button" className="btn-primary" onClick={onAddTask}>
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>
    );
  }

  if (type === "overdue") {
    return (
      <div className="task-empty-state">
        <div className="empty-icon-wrapper success-bg">
          <ShieldCheck className="empty-icon text-success" />
        </div>
        <h3>Great! You have no overdue tasks</h3>
        <p>All your tasks are up to date and completed on schedule.</p>
      </div>
    );
  }

  if (type === "completed") {
    return (
      <div className="task-empty-state">
        <div className="empty-icon-wrapper">
          <CheckCircle2 className="empty-icon" />
        </div>
        <h3>No completed task history yet</h3>
        <p>Completed tasks will be archived here for your records.</p>
      </div>
    );
  }

  return (
    <div className="task-empty-state">
      <div className="empty-icon-wrapper">
        <ListTodo className="empty-icon" />
      </div>
      <h3>Your farm task list is empty</h3>
      <p>Create your first task to start organizing your farm work.</p>
      {onAddTask && (
        <button type="button" className="btn-primary" onClick={onAddTask}>
          <Plus size={18} /> Add Task
        </button>
      )}
    </div>
  );
};

export default TaskEmptyState;
