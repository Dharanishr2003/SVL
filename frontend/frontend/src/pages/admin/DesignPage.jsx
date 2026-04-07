import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDesignRequests, getDealById } from "../../api/dealsApi";
import { getDesignRequirement } from "../../api/designRequirementApi";
import { getUsers } from "../../api/userAdminApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

function pickAssignedUserId(...sources) {
  for (const source of sources) {
    const value =
      source?.assignedTo ??
      source?.designAssignedToUserId ??
      source?.design_assigned_to_user_id ??
      null;
    if (value != null && String(value).trim() !== "") return value;
  }
  return null;
}

function pickAssignedName(...sources) {
  for (const source of sources) {
    const value =
      source?.designAssignedToName ??
      source?.design_assigned_to_name ??
      "";
    if (String(value).trim()) return String(value).trim();
  }
  return "";
}

export default function DesignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const { showSuccess, showError } = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userNameMap, setUserNameMap] = useState({});

  const loadUserNames = async () => {
    try {
      const usersData = await getUsers(0, 500);
      const map = {};
      if (Array.isArray(usersData?.items)) {
        usersData.items.forEach((u) => {
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
          map[u.id] = fullName || u.username || "";
        });
      }
      setUserNameMap(map);
    } catch {
      setUserNameMap({});
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDesignRequests();
      const rows = Array.isArray(data) ? data : [];
      const enrichedRows = await Promise.all(
        rows.map(async (deal) => {
          const sourceLeadId = deal?.sourceLeadId;
          if (!sourceLeadId) return deal;
          try {
            const [dealDetails, designRequirement] = await Promise.all([
              getDealById(deal.id).catch(() => null),
              getDesignRequirement(sourceLeadId).catch(() => null),
            ]);

            const resolvedRequirementType =
              designRequirement?.requirementType ||
              deal?.requirementType ||
              "";

            const resolvedRequirementNotes =
              designRequirement?.designAdditionalNotes ||
              designRequirement?.requirementNotes ||
              deal?.requirementNotes ||
              "";

            // Resolve assigned user name — prefer design requirement's assignedTo, fall back to deal's designAssignedToUserId
            let designAssignedToName = pickAssignedName(designRequirement, dealDetails, deal) || "-";
            const assignedUserId = pickAssignedUserId(designRequirement, dealDetails, deal);
            if (assignedUserId && designAssignedToName === "-") {
              designAssignedToName =
                userNameMap[assignedUserId] ||
                (String(assignedUserId) === String(user?.id) ? "You" : "Assigned");
            }

            return {
              ...deal,
              requirementType: resolvedRequirementType,
              requirementNotes: resolvedRequirementNotes,
              designAssignedToUserId: assignedUserId,
              designAssignedToName,
            };
          } catch {
            return deal;
          }
        }),
      );
      setDeals(enrichedRows);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load design requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user !== undefined) load();
  }, [user, userNameMap]);

  useEffect(() => {
    if (user !== undefined) loadUserNames();
  }, [user]);

  useEffect(() => {
    if (user === undefined) return;
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [user, userNameMap]);

  return (
    <div className="content">
      {/* Breadcrumb */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Design Requests</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/admin-dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">CRM</li>
              <li className="breadcrumb-item active" aria-current="page">
                Design
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <h5 className="mb-0">
            Design Requests
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={load}
          >
            <i className="ti ti-refresh me-1"></i>Refresh
          </button>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">Loading…</div>
          ) : deals.length === 0 ? (
            <div className="text-center p-4 text-muted">
              No design requests found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Requirement Type</th>
                    <th>Requirement Notes</th>
                    <th>Assigned to</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal, idx) => (
                    <tr key={deal.id}>
                      <td>{idx + 1}</td>
                      <td>{deal.requirementType || "-"}</td>
                      <td>{deal.requirementNotes || "-"}</td>
                      <td>{deal.designAssignedToName || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/design-work/${deal.id}`)}
                          >
                            <i className="ti ti-play me-1"></i>Start Work
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/design-detail/${deal.id}`)}
                          >
                            <i className="ti ti-eye me-1"></i>View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2014 - 2025 &copy; SmartHR.</p>
        <p>
          Designed &amp; Developed By{" "}
          <a href="javascript:void(0);" className="text-primary">
            Dreams
          </a>
        </p>
      </div>
    </div>
  );
}
