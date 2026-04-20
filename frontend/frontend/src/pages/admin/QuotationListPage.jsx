import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  approveQuotation,
  deleteQuotation,
  getQuotations,
  markQuotationAccepted,
  markQuotationNegotiating,
  markQuotationRejected,
  markQuotationSent,
  sendQuotationForVerification,
} from "../../api/quotationApi";
import {
  QUOTATION_STATUS_ACCEPTED,
  QUOTATION_STATUS_APPROVED,
  QUOTATION_STATUS_DRAFT,
  QUOTATION_STATUS_NEGOTIATING,
  QUOTATION_STATUS_REJECTED,
  QUOTATION_STATUS_SENT,
  QUOTATION_STATUS_VERIFICATION_PENDING,
  downloadQuotationPdf,
  setQuotationDraft,
} from "../../utils/quotationUtils";
import { getQuotationTemplate } from "../../api/quotationTemplateApi";
import "./QuotationListPage.css";

function formatDate(value) {
  if (!value) {
    return "-";
  }
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  try {
    return new Date(value).toLocaleString("en-IN");
  } catch {
    return value;
  }
}

function normalizeRole(value) {
  return String(value || "").trim().toUpperCase();
}

function isHigherAuthorityRole(role) {
  return ["TEAM_LEAD", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

function getStatusUi(status) {
  switch (status) {
    case QUOTATION_STATUS_APPROVED:
      return { label: "Approved", className: "badge bg-success" };
    case QUOTATION_STATUS_VERIFICATION_PENDING:
      return { label: "Verification Pending", className: "badge bg-warning text-dark" };
    case QUOTATION_STATUS_SENT:
      return { label: "Sent to Customer", className: "badge bg-info text-dark" };
    case QUOTATION_STATUS_NEGOTIATING:
      return { label: "Negotiating", className: "badge bg-warning text-dark" };
    case QUOTATION_STATUS_REJECTED:
      return { label: "Rejected", className: "badge bg-danger" };
    case QUOTATION_STATUS_ACCEPTED:
      return { label: "Accepted", className: "badge bg-success" };
    default:
      return { label: "Draft", className: "badge bg-secondary" };
  }
}

function canTeamLeadApproveQuotation(quotation, user) {
  const ownerRole = normalizeRole(quotation.createdByRole);
  const quotationTeam = String(quotation.createdByTeam || "").trim().toLowerCase();
  const userTeam = String(user?.team || user?.teamName || "").trim().toLowerCase();
  if (!quotationTeam || !userTeam) {
    return false;
  }
  return ownerRole === "EMPLOYEE" && quotationTeam === userTeam;
}

function canApproveQuotation(quotation, userRole, user) {
  if (quotation.status !== QUOTATION_STATUS_VERIFICATION_PENDING) {
    return false;
  }
  if (["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return true;
  }
  if (userRole === "TEAM_LEAD") {
    return canTeamLeadApproveQuotation(quotation, user);
  }
  return false;
}

export default function QuotationListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role);
  const isEmployee = userRole === "EMPLOYEE";
  const isHigherAuthority = isHigherAuthorityRole(userRole);

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [notesDialog, setNotesDialog] = useState({
    open: false,
    mode: null,
    quotationId: null,
    notes: "",
  });
  const [customerResponseDialog, setCustomerResponseDialog] = useState({
    open: false,
    quotationId: null,
  });
  const [logDialog, setLogDialog] = useState({
    open: false,
    quotation: null,
  });
  const [quotationTemplate, setQuotationTemplate] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getQuotations()
      .then((rows) => {
        if (!ignore) {
          setQuotations(Array.isArray(rows) ? rows : []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setActionError("Failed to load quotations.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    getQuotationTemplate()
      .then((data) => { if (!ignore) setQuotationTemplate(data || {}); })
      .catch(() => { if (!ignore) setQuotationTemplate({}); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const updateSingleQuotation = (updatedQuotation) => {
    setQuotations((previous) =>
      previous.map((quotation) => (quotation.id === updatedQuotation.id ? updatedQuotation : quotation)),
    );
  };

  const handleEdit = (quotation) => {
    setQuotationDraft(quotation);
    navigate("/quotation");
  };

  const handleDownload = async (quotation) => {
    try {
      await downloadQuotationPdf(quotation, quotationTemplate || {});
    } catch (error) {
      console.error("Failed to download quotation PDF", error);
      setActionError("Failed to download quotation PDF.");
    }
  };

  const handleDelete = (quotation) => {
    setNotesDialog({ open: true, mode: "delete", quotationId: quotation.id, notes: "" });
  };

  const openVerifyDialog = (quotation) => {
    setNotesDialog({
      open: true,
      mode: "verify",
      quotationId: quotation.id,
      notes: quotation.verificationRequestNotes || "",
    });
  };

  const openApproveDialog = (quotation) => {
    setNotesDialog({
      open: true,
      mode: "approve",
      quotationId: quotation.id,
      notes: quotation.approvalNotes || "",
    });
  };

  const handleMarkSent = async (quotation) => {
    setActionError("");
    try {
      const updated = await markQuotationSent(quotation.id);
      if (updated) updateSingleQuotation(updated);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to mark quotation as sent.";
      setActionError(message);
    }
  };

  const openMarkNegotiatingDialog = (quotation) => {
    setNotesDialog({ open: true, mode: "mark-negotiating", quotationId: quotation.id, notes: "" });
  };

  const openMarkRejectedDialog = (quotation) => {
    setNotesDialog({ open: true, mode: "mark-rejected", quotationId: quotation.id, notes: "" });
  };

  const openMarkAcceptedDialog = (quotation) => {
    setNotesDialog({ open: true, mode: "mark-accepted", quotationId: quotation.id, notes: "" });
  };

  const closeNotesDialog = () => {
    setNotesDialog({ open: false, mode: null, quotationId: null, notes: "" });
  };

  const openCustomerResponseDialog = (quotation) => {
    setCustomerResponseDialog({ open: true, quotationId: quotation.id });
  };

  const closeCustomerResponseDialog = () => {
    setCustomerResponseDialog({ open: false, quotationId: null });
  };

  const openLogDialog = (quotation) => {
    setLogDialog({ open: true, quotation });
  };

  const closeLogDialog = () => {
    setLogDialog({ open: false, quotation: null });
  };

  const buildQuotationLogs = (quotation) => {
    if (!quotation) return [];
    const items = [
      {
        key: "created",
        title: "Quotation Created",
        actor: quotation.createdByName || quotation.createdByEmail || "",
        actorRole: quotation.createdByRole || "",
        createdAt: quotation.createdAt,
        details: quotation.customerName
          ? `Created for customer ${quotation.customerName}`
          : "Quotation draft created",
      },
      {
        key: "verify",
        title: "Sent For Verification",
        actor: quotation.verificationRequestedByName || "",
        actorRole: quotation.verificationRequestedByRole || "",
        createdAt: quotation.verificationRequestedAt,
        details: quotation.verificationRequestNotes || "",
      },
      {
        key: "approved",
        title: "Quotation Approved",
        actor: quotation.approvedByName || "",
        actorRole: quotation.approvedByRole || "",
        createdAt: quotation.approvedAt,
        details: quotation.approvalNotes || "",
      },
      {
        key: "sent",
        title: "Sent To Customer",
        actor: quotation.sentByName || "",
        actorRole: "",
        createdAt: quotation.sentAt,
        details: "",
      },
      {
        key: "negotiating",
        title: "Marked As Negotiating",
        actor: quotation.negotiatingByName || "",
        actorRole: "",
        createdAt: quotation.negotiatingAt,
        details: quotation.negotiatingNotes || "",
      },
      {
        key: "rejected",
        title: "Marked As Rejected",
        actor: quotation.rejectedByName || "",
        actorRole: "",
        createdAt: quotation.rejectedAt,
        details: quotation.rejectionNotes || "",
      },
      {
        key: "accepted",
        title: "Marked As Accepted",
        actor: quotation.acceptedByName || "",
        actorRole: "",
        createdAt: quotation.acceptedAt,
        details: quotation.acceptanceNotes || "",
      },
    ];

    return items
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const handleCustomerResponse = async (responseType) => {
    setActionError("");
    try {
      let updated = null;
      if (responseType === "accepted") {
        openMarkAcceptedDialog(quotations.find((q) => q.id === customerResponseDialog.quotationId));
      } else if (responseType === "negotiating") {
        openMarkNegotiatingDialog(quotations.find((q) => q.id === customerResponseDialog.quotationId));
      } else if (responseType === "rejected") {
        openMarkRejectedDialog(quotations.find((q) => q.id === customerResponseDialog.quotationId));
      }
      if (updated) {
        updateSingleQuotation(updated);
      }
      closeCustomerResponseDialog();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to process customer response.";
      setActionError(message);
    }
  };

  const submitNotesDialog = async () => {
    const quotation = quotations.find((row) => row.id === notesDialog.quotationId);
    if (!quotation) {
      closeNotesDialog();
      return;
    }

    setActionError("");
    try {
      let updated = null;
      if (notesDialog.mode === "verify") {
        updated = await sendQuotationForVerification(quotation.id, notesDialog.notes);
      } else if (notesDialog.mode === "approve") {
        updated = await approveQuotation(quotation.id, notesDialog.notes);
      } else if (notesDialog.mode === "mark-negotiating") {
        updated = await markQuotationNegotiating(quotation.id, notesDialog.notes);
      } else if (notesDialog.mode === "mark-rejected") {
        updated = await markQuotationRejected(quotation.id, notesDialog.notes);
      } else if (notesDialog.mode === "mark-accepted") {
        updated = await markQuotationAccepted(quotation.id, notesDialog.notes);
      } else if (notesDialog.mode === "delete") {
        await deleteQuotation(quotation.id);
        setQuotations((previous) => previous.filter((q) => q.id !== quotation.id));
      }
      if (updated) {
        updateSingleQuotation(updated);
      }
      closeNotesDialog();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to process quotation action.";
      setActionError(message);
    }
  };

  return (
    <>
      <div className="content">
        <div className="page-breadcrumb d-none d-md-flex align-items-center mb-3">
          <Link to="/admin-dashboard" className="breadcrumb-item">
            <i className="ti ti-smart-home"></i>
          </Link>
          <span className="breadcrumb-item active">Quotation List</span>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">Quotation List</h4>
            <p className="text-muted mb-0">
              {isEmployee
                ? "Track verification status for your quotations."
                : "Review and approve verification requests."}
            </p>
          </div>
          <Link to="/quotation" className="btn btn-primary">
            <i className="ti ti-plus me-1"></i>
            Create Quotation
          </Link>
        </div>

        {successMessage && (
          <div className="alert alert-success alert-dismissible">
            <i className="ti ti-circle-check me-2"></i>
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage("")} />
          </div>
        )}
        {actionError && (
          <div className="alert alert-danger">
            <i className="ti ti-alert-circle me-2"></i>
            {actionError}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="py-5 text-center text-muted">Loading quotations...</div>
            ) : quotations.length ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Quotation No.</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => {
                      const status = quotation.status || QUOTATION_STATUS_DRAFT;
                      const statusUi = getStatusUi(status);
                      const canEditForEmployee = status === QUOTATION_STATUS_DRAFT || status === QUOTATION_STATUS_NEGOTIATING;
                      const canDownloadForEmployee = status === QUOTATION_STATUS_APPROVED || status === QUOTATION_STATUS_ACCEPTED;
                      const canApprove = canApproveQuotation(quotation, userRole, user);

                      return (
                        <tr key={quotation.id}>
                          <td>{quotation.quotationNumber || "-"}</td>
                          <td>{quotation.customerName || "-"}</td>
                          <td>
                            <span className={statusUi.className}>
                              {status === QUOTATION_STATUS_VERIFICATION_PENDING && quotation.negotiatingAt
                                ? "Re-verification Pending"
                                : status === QUOTATION_STATUS_APPROVED && quotation.negotiatingAt
                                ? "Re-verification Approved"
                                : statusUi.label}
                            </span>
                            {isEmployee && status === QUOTATION_STATUS_APPROVED && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  className="btn btn-info btn-sm w-100"
                                  onClick={() => handleMarkSent(quotation)}
                                >
                                  <i className="ti ti-mail-forward me-1"></i>
                                  Mark as Sent
                                </button>
                              </div>
                            )}
                            {isEmployee && status === QUOTATION_STATUS_SENT && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm w-100"
                                  onClick={() => openCustomerResponseDialog(quotation)}
                                >
                                  <i className="ti ti-help me-1"></i>
                                  Customer Response
                                </button>
                              </div>
                            )}
                          </td>
                          <td>{formatDate(quotation.quotationDate)}</td>
                          <td>Rs. {Number(quotation.totals?.grandTotal || 0).toFixed(2)}</td>
                          <td>
                            <div className="small">
                              <div>
                                <strong>Emp:</strong> {quotation.verificationRequestNotes || "-"}
                              </div>
                              <div>
                                <strong>Auth:</strong> {quotation.approvalNotes || "-"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEdit(quotation)}
                                disabled={isEmployee && !canEditForEmployee}
                              >
                                <i className="ti ti-edit me-1"></i>
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => handleDownload(quotation)}
                                disabled={isEmployee && !canDownloadForEmployee}
                              >
                                <i className="ti ti-file-download me-1"></i>
                                PDF
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => openLogDialog(quotation)}
                              >
                                <i className="ti ti-history me-1"></i>
                                Log
                              </button>

                              {isEmployee && status === QUOTATION_STATUS_DRAFT && (
                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm"
                                  onClick={() => openVerifyDialog(quotation)}
                                >
                                  <i className="ti ti-send me-1"></i>
                                  Send for Verification
                                </button>
                              )}

                              {isEmployee && status === QUOTATION_STATUS_NEGOTIATING && (
                                <button
                                  type="button"
                                  className="btn btn-warning btn-sm"
                                  onClick={() => openVerifyDialog(quotation)}
                                >
                                  <i className="ti ti-send me-1"></i>
                                  Re-send for Approval
                                </button>
                              )}

                              {isHigherAuthority && (
                                <button
                                  type="button"
                                  className="btn btn-info btn-sm"
                                  onClick={() => openApproveDialog(quotation)}
                                  disabled={!canApprove}
                                >
                                  <i className="ti ti-circle-check me-1"></i>
                                  {status === QUOTATION_STATUS_APPROVED ? "Approved" : "Approve"}
                                </button>
                              )}

                              {userRole === "SUPER_ADMIN" && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(quotation)}
                                >
                                  <i className="ti ti-trash me-1"></i>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <h5 className="mb-2">No quotations found</h5>
                <p className="text-muted mb-3">
                  {isEmployee
                    ? "Create your first quotation and send it for verification."
                    : "No verification requests are available for your scope."}
                </p>
                <Link to="/quotation" className="btn btn-primary">
                  Create Quotation
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {notesDialog.open && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {notesDialog.mode === "verify" && "Send for Verification"}
                    {notesDialog.mode === "approve" && "Approve Quotation"}
                    {notesDialog.mode === "mark-negotiating" && "Mark as Negotiating"}
                    {notesDialog.mode === "mark-rejected" && "Mark as Rejected"}
                    {notesDialog.mode === "mark-accepted" && "Mark as Accepted"}
                    {notesDialog.mode === "delete" && "Delete Quotation"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeNotesDialog}></button>
                </div>
                <div className="modal-body">
                  {notesDialog.mode === "delete" ? (
                    <div>
                      <p className="text-warning">
                        <i className="ti ti-alert-triangle me-2"></i>
                        <strong>Are you sure you want to delete this quotation?</strong>
                      </p>
                      <p className="text-muted small">This action cannot be undone. The quotation and all its data will be permanently removed.</p>
                    </div>
                  ) : (
                    <>
                      <label className="form-label">
                        {notesDialog.mode === "verify" && "Verification Notes (optional)"}
                        {notesDialog.mode === "approve" && "Approval Notes (optional)"}
                        {notesDialog.mode === "mark-negotiating" && "Negotiation Notes (required)"}
                        {notesDialog.mode === "mark-rejected" && "Rejection Notes (required)"}
                        {notesDialog.mode === "mark-accepted" && "Acceptance Notes (optional)"}
                      </label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={notesDialog.notes}
                        onChange={(event) =>
                          setNotesDialog((previous) => ({ ...previous, notes: event.target.value }))
                        }
                        placeholder="Add notes..."
                      />
                      {(notesDialog.mode === "mark-negotiating" || notesDialog.mode === "mark-rejected") && !notesDialog.notes.trim() && (
                        <div className="form-text text-danger">Notes are required.</div>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeNotesDialog}>
                    {notesDialog.mode === "delete" ? "Cancel" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    className={notesDialog.mode === "delete" ? "btn btn-danger" : "btn btn-primary"}
                    onClick={submitNotesDialog}
                    disabled={
                      (notesDialog.mode === "mark-negotiating" || notesDialog.mode === "mark-rejected")
                      && !notesDialog.notes.trim()
                    }
                  >
                    {notesDialog.mode === "verify" && "Send Verification"}
                    {notesDialog.mode === "approve" && "Approve"}
                    {notesDialog.mode === "mark-negotiating" && "Save"}
                    {notesDialog.mode === "mark-rejected" && "Save"}
                    {notesDialog.mode === "mark-accepted" && "Save"}
                    {notesDialog.mode === "delete" && "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show quotation-list-backdrop"></div>
        </>
      )}

      {customerResponseDialog.open && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Customer Response</h5>
                  <button type="button" className="btn-close" onClick={closeCustomerResponseDialog}></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-4">Select customer's response to the quotation:</p>
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-success btn-lg"
                      onClick={() => handleCustomerResponse("accepted")}
                    >
                      <i className="ti ti-circle-check me-2"></i>
                      Accepted
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning btn-lg"
                      onClick={() => handleCustomerResponse("negotiating")}
                    >
                      <i className="ti ti-refresh me-2"></i>
                      Negotiating
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-lg"
                      onClick={() => handleCustomerResponse("rejected")}
                    >
                      <i className="ti ti-x me-2"></i>
                      Rejected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show quotation-list-backdrop"></div>
        </>
      )}

      {logDialog.open && (
        <>
          <div className="quotation-log-overlay">
            <div className="quotation-log-card">
              <div className="quotation-log-header">
                <div>
                  <h5 className="mb-1">
                    <i className="ti ti-history me-2"></i>
                    Quotation Log
                  </h5>
                  <div className="quotation-log-subtitle">
                    {logDialog.quotation?.quotationNumber || "Quotation"}
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={closeLogDialog}></button>
              </div>
              <div className="quotation-log-body">
                {buildQuotationLogs(logDialog.quotation).length === 0 ? (
                  <div className="text-muted text-center py-4">No quotation activity yet.</div>
                ) : (
                  <div className="quotation-log-list">
                    {buildQuotationLogs(logDialog.quotation).map((log) => (
                      <div key={log.key} className="quotation-log-item">
                        <div className="quotation-log-item-head">
                          <h6 className="mb-1">{log.title}</h6>
                          <span className="quotation-log-time">{formatDateTime(log.createdAt)}</span>
                        </div>
                        {(log.actor || log.actorRole) && (
                          <div className="quotation-log-meta">
                            {log.actor ? `By: ${log.actor}` : "By: -"}
                            {log.actorRole ? ` (${log.actorRole})` : ""}
                          </div>
                        )}
                        {log.details ? <div className="quotation-log-details">{log.details}</div> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="quotation-log-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={closeLogDialog}>
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show quotation-list-backdrop"></div>
        </>
      )}
    </>
  );
}
