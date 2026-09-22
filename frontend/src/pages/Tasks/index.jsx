import { ClipboardList } from "lucide-react";
import PlaceholderPage from "../../components/common/PlaceholderPage/PlaceholderPage";

const Tasks = () => (
  <PlaceholderPage
    icon={ClipboardList}
    title="Farm Tasks"
    description="Organise and track all farm activities — from sowing and fertilising to harvesting. Assign tasks, set reminders, and mark completions."
    color="#d97706"
    bg="#fef3c7"
    actions={[
      { label: "Create a Task" },
      { label: "Back to Dashboard", to: "/dashboard" },
    ]}
  />
);

export default Tasks;
