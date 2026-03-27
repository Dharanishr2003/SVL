import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CandidatesGridPage from "./CandidatesGridPage";
import CandidatesListPage from "./CandidatesListPage";

const CandidatesPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const viewFromQuery = searchParams.get("view") === "grid" ? "grid" : "list";
  const view = location.pathname.endsWith("/candidates-grid")
    ? "grid"
    : viewFromQuery;

  if (view === "grid") {
    return <CandidatesGridPage />;
  }

  return <CandidatesListPage />;
};

export default CandidatesPage;
