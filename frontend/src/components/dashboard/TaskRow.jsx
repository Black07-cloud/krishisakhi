import { Calendar } from "lucide-react";
import { capitalize, fmtDate, PRIORITY_COLOR } from "./dashboardUtils";

const TaskRow = ({ task }) => {
  const prio = PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.normal;

  return (
    <div className="task-card-row">
      <div
        className="task-priority-bar"
        style={{ background: prio.bar }}
        title={`${capitalize(task.priority)} priority`}
      />
      <div className="task-card-info">
        <div className="task-card-title">{task.title}</div>
        <div className="task-card-meta">
          <span className={`badge ${prio.badge}`}>{capitalize(task.priority)}</span>
          {task.type && (
            <span className="badge badge-gray">{capitalize(task.type)}</span>
          )}
          {task.dueAt && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Calendar size={11} />
              {fmtDate(task.dueAt)}
            </span>
          )}
          {task.source === "automation" && (
            <span className="badge badge-purple">Auto</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskRow;
