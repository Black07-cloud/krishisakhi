import { ScanLine } from "lucide-react";
import PlaceholderPage from "../../components/common/PlaceholderPage/PlaceholderPage";

const Disease = () => (
  <PlaceholderPage
    icon={ScanLine}
    title="Disease Detection"
    description="Upload photos of your crops and get instant AI-powered disease diagnosis with treatment recommendations. Early detection saves your harvest."
    color="#dc2626"
    bg="#fee2e2"
    actions={[
      { label: "Scan a Crop" },
      { label: "Back to Dashboard", to: "/dashboard" },
    ]}
  />
);

export default Disease;
