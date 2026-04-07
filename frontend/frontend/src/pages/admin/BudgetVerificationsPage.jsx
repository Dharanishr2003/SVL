import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { downloadLeadRequirementFile, getLeads, updateLeadDetails } from "../../api/leadsApi";
import { getDesignRequirement } from "../../api/designRequirementApi";
import { getUsers, getUserById } from "../../api/userAdminApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import api from "../../utils/api";

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function DetailField({ label, value, className = "col-md-4" }) {
  return (
    <div className={className}>
      <div className="border rounded-3 h-100 p-3 bg-light">
        <div className="text-muted small text-uppercase fw-semibold mb-1">{label}</div>
        <div className="fw-semibold text-dark text-break">{value || "-"}</div>
      </div>
    </div>
  );
}

function FileField({ label, fileName, filePath, onDownload, className = "col-md-6" }) {
  if (!fileName) return null;
  return (
    <div className={className}>
      <div className="border rounded-3 h-100 p-3 bg-light">
        <div className="text-muted small text-uppercase fw-semibold mb-2">{label}</div>
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div className="fw-semibold text-break">{fileName}</div>
          {filePath ? (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onDownload(filePath, fileName)}
            >
              <i className="ti ti-download me-1"></i>Download
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function BudgetVerificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [pendingBudgets, setPendingBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userNameMap, setUserNameMap] = useState({});
  const [detailLead, setDetailLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailDesignRequirement, setDetailDesignRequirement] = useState(null);

  const getAssignedDisplayName = (lead) => {
    const assignedUserId = lead?.budgetVerificationAssignedToUserId;
    if (!assignedUserId) return "Unassigned";

    const directName =
      lead?.budgetVerificationAssignedToUserName ||
      lead?.budgetVerificationAssignedToUsername ||
      lead?.budgetVerificationAssignedToUserFullName ||
      lead?.budgetVerificationAssignedToUserFullName ||
      lead?.budgetVerificationAssignedToUser?.name ||
      lead?.budgetVerificationAssignedToUser?.fullName ||
      lead?.budgetVerificationAssignedToUser?.username ||
      lead?.assignedToUserName ||
      lead?.assignedToUsername ||
      lead?.assignedToUserFullName ||
      lead?.assignedToFullName;

    if (directName) return directName;

    const cachedName = userNameMap[assignedUserId];
    if (cachedName) return cachedName;

    if (String(assignedUserId) === String(user?.id)) return "You";
    return "Unknown employee";
  };

  const fetchPendingBudgets = async () => {
    setLoading(true);
    try {
      const leads = await getLeads({ limit: 1000, offset: 0 });
      const pending = (Array.isArray(leads) ? leads : []).filter((lead) => {
        const isPending = lead.budgetVerificationStatus === "PENDING";
        if (!isPending) return false;
        if (user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MANAGER")) {
          return true;
        }
        if (!user?.id) return false;
        const isAssignedToUser = String(lead.budgetVerificationAssignedToUserId) === String(user.id);
        if (isAssignedToUser) {
          console.log("✓ Budget verification found for user");
        }
        return isAssignedToUser;
      });
      console.log("Total leads:", leads.length, "Pending for user:", pending.length, "User ID:", user?.id);
      setPendingBudgets(pending);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load budget verifications"));
    } finally {
      setLoading(false);
    }
  };

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

      const missingIds = (Array.isArray(pendingBudgets) ? pendingBudgets : [])
        .map((lead) => lead?.budgetVerificationAssignedToUserId)
        .filter((id) => id != null && !map[id]);

      const uniqueMissingIds = [...new Set(missingIds.map((id) => String(id)))];
      await Promise.all(
        uniqueMissingIds.map(async (id) => {
          const userData = await getUserById(id).catch(() => null);
          if (!userData) return;
          const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(" ").trim();
          map[userData.id] = fullName || userData.username || "";
        }),
      );

      setUserNameMap(map);
    } catch (e) {
      console.error("Failed to load user names:", e);
    }
  };

  useEffect(() => {
    if (user !== undefined) {
      fetchPendingBudgets();
    }
  }, [user]);

  useEffect(() => {
    if (user !== undefined) {
      loadUserNames();
    }
  }, [user, pendingBudgets]);

  const handleCalculate = (lead) => {
    navigate(`/budget-verifications/${lead.id}/calculate`);
  };

  const openRequirementDetails = async (lead) => {
    setDetailLead(lead);
    setDetailLoading(true);
    setDetailDesignRequirement(null);
    try {
      const designReq = await getDesignRequirement(lead.id);
      setDetailDesignRequirement(designReq || null);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load requirement details"));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRequirementDetails = () => {
    setDetailLead(null);
    setDetailDesignRequirement(null);
    setDetailLoading(false);
  };

  const handleReject = async (leadId) => {
    if (!rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }
    setRejecting(leadId);
    try {
      await updateLeadDetails(leadId, {
        budgetVerificationStatus: "REJECTED",
        budgetVerificationRejectionReason: rejectionReason,
      });
      showSuccess("Budget verification rejected");
      setPendingBudgets((prev) => prev.filter((item) => item.id !== leadId));
      setRejectingId(null);
      setRejectionReason("");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to reject budget verification"));
    } finally {
      setRejecting(null);
    }
  };

  const downloadRequirementFile = async (lead) => {
    try {
      const { blob, contentDisposition } = await downloadLeadRequirementFile(lead.id);
      if (!blob) return;
      const match = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(contentDisposition || "");
      const fallback = lead.requirementFileName || `requirement-${lead.id}`;
      const fileName = decodeURIComponent((match?.[1] || fallback).replace(/\"/g, "").trim());
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to download requirement file"));
    }
  };

  const downloadProtectedFile = async (filePath, fileName) => {
    try {
      const response = await api.get(filePath, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to download file"));
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Budget Verifications</h4>
          <p className="text-muted">Calculate and approve budgets for requirements</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchPendingBudgets}
          disabled={loading}
          style={{ height: "fit-content" }}
        >
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : pendingBudgets.length === 0 ? (
        <div className="alert alert-info">No pending budget verifications at this time.</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Lead Name</th>
                  <th>Requirement Type</th>
                  <th>Assigned To</th>
                  <th>Notes</th>
              
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBudgets.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); navigate(`/leads/${lead.id}`); }}
                        className="text-primary"
                      >
                        #{lead.leadId || lead.id}
                      </a>
                    </td>
                    <td>{lead.name || "-"}</td>
                    <td>
                      {lead.requirementType ? (
                        <div className="d-flex flex-column gap-2">
                          <span className="badge bg-secondary align-self-start">{lead.requirementType}</span>
                          <button
                            className="btn btn-sm btn-outline-primary align-self-start"
                            onClick={() => openRequirementDetails(lead)}
                          >
                            <i className="ti ti-eye me-1"></i>View
                          </button>
                        </div>
                      ) : "-"}
                    </td>
                    <td>
                      <span className={`badge ${lead.budgetVerificationAssignedToUserId ? "bg-info" : "bg-secondary"}`}>
                        {getAssignedDisplayName(lead)}
                      </span>
                    </td>
                    <td><small>{lead.requirementNotes || "-"}</small></td>
                    
                    <td>
                      {rejectingId === lead.id ? (
                        <div className="d-flex gap-1 flex-column">
                          <textarea
                            className="form-control form-control-sm"
                            rows="2"
                            placeholder="Rejection reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReject(lead.id)}
                              disabled={rejecting === lead.id}
                            >
                              {rejecting === lead.id ? "Rejecting..." : "Confirm Reject"}
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleCalculate(lead)}
                          >
                            <i className="ti ti-calculator me-1"></i>Calculate Budget
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => { setRejectingId(lead.id); setRejectionReason(""); }}
                          >
                            <i className="ti ti-x me-1"></i>Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailLead && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" aria-modal="true" role="dialog">
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Requirement Details for #{detailLead.leadId || detailLead.id}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeRequirementDetails} />
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-4">
                    <DetailField label="Lead Name" value={detailLead.name} />
                    <div className="col-md-4">
                      <div className="border rounded-3 h-100 p-3 bg-light">
                        <div className="text-muted small text-uppercase fw-semibold mb-2">Selected Category</div>
                        <span className="badge bg-secondary fs-6">{detailLead.requirementType || "-"}</span>
                      </div>
                    </div>
                    <DetailField label="Notes" value={detailLead.requirementNotes} />
                  </div>

                  {detailLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {detailDesignRequirement && (
                        <div className="card mb-4">
                          <div className="card-header">
                            <h6 className="mb-0"><i className="ti ti-palette me-2"></i>Design Requirement Details</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <DetailField label="Requirement Type" value={detailDesignRequirement.requirementType} />
                              <DetailField label="Product Type" value={detailDesignRequirement.designProductType} />
                              <DetailField label="Size" value={detailDesignRequirement.designSize} />
                              <DetailField label="Orientation" value={detailDesignRequirement.designOrientation} />
                              <DetailField label="Pages" value={detailDesignRequirement.designNumPages} />
                              <DetailField label="Purpose" value={detailDesignRequirement.designPurpose} />
                              <DetailField label="Priority" value={detailDesignRequirement.designPriority} />
                              <DetailField label="Brand Colors" value={detailDesignRequirement.designBrandColors} className="col-md-6" />
                              <DetailField label="Fonts" value={detailDesignRequirement.designFonts} className="col-md-6" />
                              <DetailField label="Target Audience" value={detailDesignRequirement.designTargetAudience} className="col-md-6" />
                              <DetailField label="Style Preference" value={detailDesignRequirement.designStylePref} className="col-md-6" />
                              <DetailField label="Deadline" value={detailDesignRequirement.designDeadline ? formatDateTime(detailDesignRequirement.designDeadline) : "-"} className="col-md-6" />
                              <DetailField label="Reference Links" value={detailDesignRequirement.designReferenceLinks} className="col-md-6" />
                              <DetailField label="Description" value={detailDesignRequirement.designDescription} className="col-md-12" />
                              <DetailField label="Additional Notes" value={detailDesignRequirement.designAdditionalNotes || detailDesignRequirement.requirementNotes} className="col-md-12" />
                              <FileField
                                label="Brand Guidelines"
                                fileName={detailDesignRequirement.designBrandGuidelinesFileName}
                                filePath={detailDesignRequirement.designBrandGuidelinesFilePath}
                                onDownload={downloadProtectedFile}
                              />
                              <FileField
                                label="Logo File"
                                fileName={detailDesignRequirement.designLogoFileName}
                                filePath={detailDesignRequirement.designLogoFilePath}
                                onDownload={downloadProtectedFile}
                              />
                              <FileField
                                label="Client Images"
                                fileName={detailDesignRequirement.designImagesFileName}
                                filePath={detailDesignRequirement.designImagesFilePath}
                                onDownload={downloadProtectedFile}
                              />
                              <FileField
                                label="Reference Images"
                                fileName={detailDesignRequirement.designReferenceImagesFileName}
                                filePath={detailDesignRequirement.designReferenceImagesFilePath}
                                onDownload={downloadProtectedFile}
                              />
                              <FileField
                                label="Previous Designs"
                                fileName={detailDesignRequirement.designPreviousDesignsFileName}
                                filePath={detailDesignRequirement.designPreviousDesignsFilePath}
                                onDownload={downloadProtectedFile}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {!detailDesignRequirement && (
                        <div className="text-muted">No submitted requirement details found for this lead.</div>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeRequirementDetails}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
}
