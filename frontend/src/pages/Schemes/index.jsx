import { BookOpen } from "lucide-react";
import PlaceholderPage from "../../components/common/PlaceholderPage/PlaceholderPage";

const Schemes = () => (
  <PlaceholderPage
    icon={BookOpen}
    title="Government Schemes"
    description="Discover central and state government subsidies, loans, and support programmes available for farmers. Filter by crop type, region, and eligibility."
    color="#7c3aed"
    bg="#ede9fe"
    actions={[
      { label: "Browse Schemes" },
      { label: "Back to Dashboard", to: "/dashboard" },
    ]}
  />
);

export default Schemes;
