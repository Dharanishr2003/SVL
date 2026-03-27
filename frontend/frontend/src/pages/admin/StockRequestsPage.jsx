import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/admin/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import {
  getStockRequests,
  createStockRequest,
  getStockItems,
  updateStockRequest,
  deleteStockRequest,
} from "../../api/stocksApi";
import { useToast } from "../../components/system/ToastProvider";
import StockRequestFormModal from "../../components/system/StockRequestFormModal";
import useConfirmDialog from "../../components/system/useConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { getLeads } from "../../api/leadsApi";
import { getLeadFlow } from "../../api/flowApi";
import { LEAD_FLOW_STATUSES } from "../../constants/leadFlowStatuses";

export default function StockRequestsPage() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const isAccountUser = role === "ACCOUNT";
  const isAdminUser = role === "ADMIN" || role === "SUPER_ADMIN";
  const { showConfirm, confirmDialog } = useConfirmDialog();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [leadOptions, setLeadOptions] = useState([]);
  const [flowRules, setFlowRules] = useState([]);
  const [editStatus, setEditStatus] = useState("");

  const parseRequestItems = useCallback((items) => {
    if (!items) return [];
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const matchesAssignedUser = useCallback(
    (request) => {
      if (!user?.id) return false;
      const currentUserId = String(user.id);
      const currentUserNames = [
        user?.email,
        String(user?.email || "").trim().split("@")[0],
        user?.username,
        user?.name,
        user?.fullName,
        user?.displayName,
      ]
        .filter((value) => value && String(value).trim())
        .map((value) => String(value).trim().toLowerCase());
      const assignedValues = [
        request?.assignedTo,
        request?.assignedToId,
        request?.assignedToUserId,
        request?.assigned_to,
        request?.assigned_to_id,
        request?.assigned_to_user_id,
      ]
        .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
        .map((value) => String(value));
      const assignedNames = [
        request?.assignedToName,
        request?.assigned_to_name,
        request?.assignedToUsername,
        request?.assigned_to_username,
      ]
        .filter((value) => value && String(value).trim())
        .map((value) => String(value).trim().toLowerCase());
      return (
        assignedValues.includes(currentUserId) ||
        assignedNames.some((name) => currentUserNames.includes(name))
      );
    },
    [user?.id],
  );

  const flowStatusNames = useMemo(() => {
    return new Set(
      (flowRules || [])
        .map((rule) => String(rule?.status || "").trim().toLowerCase())
        .filter(Boolean),
    );
  }, [flowRules]);

  const stockRequestFlowStatuses = useMemo(() => {
    const baseStatuses = [
      "Stock Request",
      "Accounts Review",
      "Approval",
      "Rejected",
    ];
    if (flowStatusNames.size === 0) {
      return baseStatuses;
    }
    const filtered = baseStatuses.filter((status) =>
      flowStatusNames.has(String(status || "").trim().toLowerCase()),
    );
    return filtered.length ? filtered : baseStatuses;
  }, [flowStatusNames]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isAssigneeFacingRole = role === "PRODUCTION" || role === "EMPLOYEE";
      const rows = await getStockRequests();
      const normalizedRows = Array.isArray(rows) ? rows : [];
      const visibleRows = isAssigneeFacingRole
        ? normalizedRows.filter((request) => matchesAssignedUser(request))
        : normalizedRows;
      setRequests(visibleRows);
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to load stock requests");
      console.error(e);
      showError(message, { title: "Stock Requests" });
    } finally {
      setLoading(false);
    }
  }, [matchesAssignedUser, role, showError]);

  useEffect(() => {
    let active = true;
    const loadFlow = async () => {
      try {
        const flow = await getLeadFlow();
        if (!active) return;
        setFlowRules(Array.isArray(flow?.rules) ? flow.rules : []);
      } catch (e) {
        console.error("failed to load flow", e);
        if (active) setFlowRules([]);
      }
    };
    loadFlow();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setEditStatus(editingRequest?.status || stockRequestFlowStatuses[0] || "");
  }, [editingRequest, stockRequestFlowStatuses]);

  const statusOptions = useMemo(() => {
    if (!isAccountUser) return [];
    const seen = new Set();
    const values = [];
    if (editingRequest?.status) {
      values.push(editingRequest.status);
      seen.add(editingRequest.status);
    }
    stockRequestFlowStatuses.forEach((status) => {
      if (status && !seen.has(status)) {
        values.push(status);
        seen.add(status);
      }
    });
    return values;
  }, [editingRequest?.status, isAccountUser, stockRequestFlowStatuses]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    const loadLeadOptions = async () => {
      try {
        // Filter parameters based on user role
        const params = { size: 1000 };
        // For Production users, show only their assigned leads
        if (role === "PRODUCTION") {
          params.owner = user?.id;
        }
        const rows = await getLeads(params);
        if (!active) return;
        setLeadOptions(
          Array.isArray(rows)
            ? rows
                .filter((row) => row?.id != null && (row?.name || row?.leadName || row?.leadId))
                .map((row) => {
                  const displayId = row.leadId || row.id;
                  const name = row.leadName || row.name || `Lead ${displayId}`;
                  return {
                    id: row.id,
                    name,
                    displayId,
                    label: `${displayId} · ${name}`,
                  };
                })
            : [],
        );
      } catch (e) {
        console.error("failed to load lead options", e);
      }
    };
    loadLeadOptions();
    return () => {
      active = false;
    };
  }, [role, user?.id]);

  useEffect(() => {
    let active = true;
    const loadItems = async () => {
      try {
        const rows = await getStockItems();
        if (!active) return;
        setStockItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error("Failed to load stock items", e);
      }
    };
    loadItems();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateSubmit = useCallback(
    async ({ leadId, leadName, items }) => {
      if (!leadId) return;
      setCreating(true);
      try {
        const resolvedLeadName =
          leadName || leadOptions.find((opt) => String(opt.id) === String(leadId))?.name || "";
        const payload = {
          leadId,
          leadName: resolvedLeadName,
          requestedBy: user?.id,
          items,
        };
        const req = await createStockRequest(payload);
        if (req?.id) {
          showSuccess("Stock request routed to Accounts", {
            title: "Stock Requests",
          });
          setShowCreateModal(false);
          await load();
        }
      } catch (e) {
        const message = extractApiErrorMessage(e, "Failed to create stock request");
        showError(message, { title: "Stock Requests" });
      } finally {
        setCreating(false);
      }
    },
    [leadOptions, load, showSuccess, user?.id],
  );

  // const openChat = (req) => {
  //   navigate(`/stock-requests/${req.id}/chat`);
  // };

  const openDetail = (req) => {
    navigate(`/stock-requests/${req.id}`);
  };


  const openEditModal = (req) => {
    if (!isAccountUser) return;
    setEditingRequest(req);
  };

  const closeEditModal = () => {
    setEditingRequest(null);
  };

  const editingRows = useMemo(
    () => (editingRequest ? parseRequestItems(editingRequest.items || "[]") : []),
    [editingRequest, parseRequestItems],
  );

  const handleEditSubmit = async ({ items, status }) => {
    if (!editingRequest?.id) return;
    setUpdating(true);
    try {
      const payload = { items };
      if (status) {
        payload.status = status;
      }
      await updateStockRequest(editingRequest.id, payload);
      showSuccess("Stock request updated", { title: "Stock Requests" });
      closeEditModal();
      await load();
    } catch (e) {
      const message = extractApiErrorMessage(e, "Failed to update stock request");
      showError(message, { title: "Stock Requests" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = useCallback(
    (req) => {
      if (!isAdminUser) return;
      showConfirm({
        title: "Delete stock request",
        message: `Are you sure you want to delete request ${req.leadDisplayId || req.leadId || req.id}? This cannot be undone.`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        onConfirm: async () => {
          setDeletingRequestId(req.id);
          try {
            await deleteStockRequest(req.id);
            showSuccess("Stock request deleted", { title: "Stock Requests" });
            await load();
          } catch (e) {
            const message = extractApiErrorMessage(e, "Failed to delete stock request");
            showError(message, { title: "Stock Requests" });
          } finally {
            setDeletingRequestId(null);
          }
        },
      });
    },
    [isAdminUser, load, showError, showConfirm, showSuccess],
  );

  if (loading) return <PageLoader />;

  return (
    <div className="container-fluid">
      <PageHeader
        title="Stock Requests"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Stock Requests", path: "" },
        ]}
      />

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div />
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Requested By</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.requestedByName || req.requestedBy || ""}</td>
                    <td>{req.assignedToName || req.assignedTo || ""}</td>
                    <td>
                      {req.status}
                      {req.billFilePath && (
                        <span className="badge bg-info text-dark ms-1" title="Bill uploaded">Bill</span>
                      )}
                    </td>
                    <td>
                      {isAccountUser && (
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => openEditModal(req)}
                        >
                          Edit
                        </button>
                      )}
                      {isAdminUser && (
                        <button
                          className="btn btn-sm btn-outline-danger me-1"
                          onClick={() => handleDelete(req)}
                          disabled={deletingRequestId === req.id}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => openDetail(req)}
                      >
                        View
                      </button>
                      {/* <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => openChat(req)}
                      >
                        Chat
                      </button> */}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StockRequestFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        submitting={creating}
        requireLeadId
        title="Create Stock Request"
        itemOptions={stockItems}
        leadOptions={leadOptions}
      />
      <StockRequestFormModal
        open={Boolean(editingRequest)}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        submitting={updating}
        title="Edit Stock Request"
        itemOptions={stockItems}
        initialRows={editingRows}
        initialLeadName={editingRequest?.leadName || editingRequest?.leadDisplayId}
      />
      {confirmDialog}
    </div>
  );
}
