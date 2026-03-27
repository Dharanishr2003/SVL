import { useLocation, useSearchParams } from "react-router-dom";
import CompaniesGridPage from "./CompaniesGridPage";
import CompaniesListView from "./CompaniesListView";

export default function CompaniesPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const viewFromQuery = searchParams.get("view") === "grid" ? "grid" : "list";
  const view = location.pathname.endsWith("/companies-grid") ? "grid" : viewFromQuery;

  if (view === "grid") {
    return <CompaniesGridPage />;
  }

  return <CompaniesListView />;
}
