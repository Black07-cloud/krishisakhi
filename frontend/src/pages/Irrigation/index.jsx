import { Droplets } from "lucide-react";
import PlaceholderPage from "../../components/common/PlaceholderPage/PlaceholderPage";

const Irrigation = () => (
  <PlaceholderPage
    icon={Droplets}
    title="Irrigation"
    description="Get AI-powered irrigation schedules based on soil moisture, weather forecasts, and crop water requirements for each of your farms."
    color="#0369a1"
    bg="#e0f2fe"
    actions={[
      { label: "View Recommendations" },
      { label: "Back to Dashboard", to: "/dashboard" },
    ]}
  />
);

export default Irrigation;
