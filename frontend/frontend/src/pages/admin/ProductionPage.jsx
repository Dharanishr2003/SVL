import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProductionRequests, updateDealStatus, getDealById } from "../../api/dealsApi";
import { getProductionRequirements } from "../../api/productionRequirementApi";
import { getDesignRequirement } from "../../api/designRequirementApi";
import { getUsers } from "../../api/userAdminApi";
import { createStockRequest, getStockItems, getStockRequests } from "../../api/stocksApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import StockRequestFormModal from "../../components/system/StockRequestFormModal";
import api from "../../utils/api";

function pickAssignedUserId(...sources) {
  for (const source of sources) {
    const value =
      source?.assignedTo ??
      source?.productionAssignedToUserId ??
      source?.production_assigned_to_user_id ??
      source?.ownerUserId ??
      source?.owner_user_id ??
      source?.allocatorId ??
      source?.allocator_id ??
      null;
    if (value != null && String(value).trim() !== "") return value;
  }
  return null;
}

function pickAssignedName(...sources) {
  for (const source of sources) {
    const value =
      source?.productionAssignedToUserName ??
      source?.productionAssignedToName ??
      source?.production_assigned_to_user_name ??
      source?.assignedToName ??
      source?.ownerName ??
      source?.owner_name ??
      source?.allocatorName ??
      source?.allocator_name ??
      "";
    if (String(value).trim()) return String(value).trim();
  }
  return "";
}

export default function ProductionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const role = String(user?.role || "").toUpperCase();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);
  const [showStockRequestModal, setShowStockRequestModal] = useState(false);
  const [stockRequestSubmitting, setStockRequestSubmitting] = useState(false);
  const [stockRequestError, setStockRequestError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [userNameMap, setUserNameMap] = useState({});
  const [stockStatusRequests, setStockStatusRequests] = useState([]);
  const [showStockStatusModal, setShowStockStatusModal] = useState(false);

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
      const data = await getProductionRequests();
      const rows = Array.isArray(data) ? data : [];
      const visibleStockRequests = await getStockRequests().catch(() => []);
      const enrichedRows = await Promise.all(
        rows.map(async (deal) => {
          const sourceLeadId = deal?.sourceLeadId;
          if (!sourceLeadId) return deal;
          try {
            const [dealDetails, designRequirement, productionRequirements, stockRows] = await Promise.all([
              getDealById(deal.id).catch(() => null),
              getDesignRequirement(sourceLeadId).catch(() => null),
              getProductionRequirements(sourceLeadId).catch(() => []),
              visibleStockRequests.filter(
                (req) =>
                  String(req?.dealId ?? "") === String(deal.id) ||
                  String(req?.leadId ?? "") === String(sourceLeadId),
              ),
            ]);
            const firstProduction = Array.isArray(productionRequirements) && productionRequirements.length > 0
              ? productionRequirements[0]
              : null;
            const stockRequests = Array.isArray(stockRows)
              ? [...stockRows].sort((a, b) => b.id - a.id)
              : [];
            const stockRequestId = stockRequests[0]?.id || null;

            // Resolve assigned user name â€” prefer production requirement's assignedTo, fall back to deal's productionAssignedToUserId
            let productionAssignedToName = pickAssignedName(firstProduction, dealDetails, deal) || "-";
            const assignedUserId = pickAssignedUserId(firstProduction, dealDetails, deal);
            if (assignedUserId && productionAssignedToName === "-") {
              productionAssignedToName =
                userNameMap[assignedUserId] ||
                (String(assignedUserId) === String(user?.id) ? "You" : "Assigned");
            }

            return {
              ...deal,
              stockRequests,
              stockRequestId,
              productionAssignedToUserId: assignedUserId,
              requirementType:
                firstProduction?.requirementType ||
                designRequirement?.requirementType ||
                deal?.requirementType ||
                "",
              requirementNotes:
                firstProduction?.additionalNotes ||
                firstProduction?.requirementNotes ||
                designRequirement?.designAdditionalNotes ||
                designRequirement?.requirementNotes ||
                deal?.requirementNotes ||
                "",
              productionAssignedToName,
            };
          } catch {
            return deal;
          }
        }),
      );
      setDeals(enrichedRows);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load production requests"));
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
    getStockItems()
      .then((rows) => setStockItems(Array.isArray(rows) ? rows : []))
      .catch(() => setStockItems([]));
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    getStockRequests()
      .then((rows) => setStockStatusRequests(Array.isArray(rows) ? rows : []))
      .catch(() => setStockStatusRequests([]));
  }, [user]);

  const downloadFinalDesign = async (deal) => {
    if (!deal?.designFinalFilePath || !deal?.designFinalFileName) return;
    try {
      const response = await api.get(deal.designFinalFilePath, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = deal.designFinalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to download final design"));
    }
  };

  const handleStockRequestSubmit = async ({ leadId, leadName, items }) => {
    setStockRequestSubmitting(true);
    setStockRequestError("");
    try {
      const payload = {
        requestedBy: user?.id,
        items,
      };
      
      // Include deal/lead info if a deal was selected
      if (selectedDeal?.id) {
        payload.dealId = selectedDeal.id;
        payload.leadId = selectedDeal?.sourceLeadId;
        payload.leadName = leadName || selectedDeal?.name || "";
      } else if (leadId) {
        // For global creation, use provided leadId/leadName if available
        payload.leadId = leadId;
        payload.leadName = leadName || "";
      }
      
      const req = await createStockRequest(payload);
      if (req?.id) {
        // Only update deal status if a deal was selected
        if (selectedDeal?.id) {
          await updateDealStatus(selectedDeal.id, "Stock Request");
        }
        setShowStockRequestModal(false);
        setSelectedDeal(null);
      }
    } catch (err) {
      setStockRequestError(extractApiErrorMessage(err, "Failed to create stock request"));
    } finally {
      setStockRequestSubmitting(false);
    }
  };

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Production Requests</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/admin-dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">CRM</li>
              <li className="breadcrumb-item active" aria-current="page">Production</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <h5 className="mb-0">
            Production Requests
          </h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setStockRequestError("");
                setSelectedDeal(null);
                setShowStockRequestModal(true);
              }}
            >
              <i className="ti ti-package me-1"></i>Create Stock Request
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowStockStatusModal(true)}
            >
              <i className="ti ti-package-check me-1"></i>Stock Request Status
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={load}>
              <i className="ti ti-refresh me-1"></i>Refresh
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : deals.length === 0 ? (
            <div className="text-center p-4 text-muted">No production requests found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Requirement Type</th>
                    <th>Requirement Notes</th>
                    <th>Status</th>
                    <th>Final Design</th>
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
                      <td>
                        <span className={`badge ${
                          deal.productionWorkStatus === "Completed"
                            ? "bg-success"
                            : deal.productionWorkStatus === "Started"
                            ? "bg-info"
                            : "bg-secondary"
                        }`}>
                          {deal.productionWorkStatus || "Not Started"}
                        </span>
                      </td>
                      <td>
                        {deal.designFinalFileName ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => downloadFinalDesign(deal)}
                          >
                            <i className="ti ti-download me-1"></i>{deal.designFinalFileName}
                          </button>
                        ) : "-"}
                      </td>
                      <td>{deal.productionAssignedToName || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/production-detail/${deal.id}`)}
                          >
                            <i className="ti ti-eye me-1"></i>View
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

      {/* Stock Request Status Modal */}
      {showStockStatusModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Stock Request Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStockStatusModal(false)}
                />
              </div>
              <div className="modal-body">
                {stockStatusRequests.length === 0 ? (
                  <div className="text-muted text-center py-4">
                    <i className="ti ti-package-off fs-5 d-block mb-2"></i>
                    No stock requests created yet.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {stockStatusRequests.map((stockReq) => (
                      <button
                        key={stockReq.id}
                        type="button"
                        className="btn btn-outline-primary text-start text-truncate"
                        onClick={() => {
                          navigate(`/stock-requests/${stockReq.id}/status`);
                          setShowStockStatusModal(false);
                        }}
                      >
                        <i className="ti ti-package me-1"></i>
                        {stockReq.leadName || stockReq.leadDisplayId || `Request #${stockReq.id}`}
                        {stockReq.status ? ` · ${stockReq.status}` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStockStatusModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StockRequestFormModal
        open={showStockRequestModal}
        leadId={selectedDeal?.id}
        initialLeadName={selectedDeal?.id ? `Deal #${selectedDeal?.id} - ${selectedDeal?.name || ""}` : ""}
        leadOptions={
          selectedDeal?.id
            ? [{ id: selectedDeal.id, displayId: selectedDeal.id, name: selectedDeal?.name || "" }]
            : []
        }
        itemOptions={stockItems}
        requireLeadId={false}
        onClose={() => {
          setShowStockRequestModal(false);
          setSelectedDeal(null);
        }}
        onSubmit={handleStockRequestSubmit}
        submitting={stockRequestSubmitting}
      />
    </div>
  );
}


