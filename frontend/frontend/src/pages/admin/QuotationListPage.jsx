import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createPortal } from "react-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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
  openQuotationPdfPreview,
  setQuotationDraft,
} from "../../utils/quotationUtils";
import { getQuotationTemplate } from "../../api/quotationTemplateApi";
import PageSizeSelector from "../../components/admin/PageSizeSelector";
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
  if (["MANAGER", "ADMIN", "SUPER_ADMIN"].includes(userRole)) {
    return (
      quotation.status === QUOTATION_STATUS_DRAFT ||
      quotation.status === QUOTATION_STATUS_VERIFICATION_PENDING
    );
  }
  if (userRole === "TEAM_LEAD") {
    return (
      quotation.status === QUOTATION_STATUS_VERIFICATION_PENDING &&
      canTeamLeadApproveQuotation(quotation, user)
    );
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
  const [selectedQuotationDetails, setSelectedQuotationDetails] = useState(null);

  // New state variables for search, sorting, and pagination
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Kebab actions state
  const [activeActionsRow, setActiveActionsRow] = useState(null);
  const [actionsMenuPos, setActionsMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleOutsideClickOrScroll = () => {
      setActiveActionsRow(null);
    };
    window.addEventListener("click", handleOutsideClickOrScroll);
    window.addEventListener("scroll", handleOutsideClickOrScroll, true);
    return () => {
      window.removeEventListener("click", handleOutsideClickOrScroll);
      window.removeEventListener("scroll", handleOutsideClickOrScroll, true);
    };
  }, []);

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

  const handleView = (quotation) => {
    setActionError("");
    openQuotationPdfPreview(quotation, quotationTemplate || {})
      .catch((error) => {
        console.error("Failed to open quotation PDF preview", error);
        setActionError("Failed to open quotation PDF preview.");
      });
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

  // Sorting & searching handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchText]);

  const filteredQuotations = useMemo(() => {
    const term = searchText.toLowerCase().trim();
    let result = quotations;
    if (term) {
      result = quotations.filter((q) => {
        const qNo = (q.quotationNumber || "").toLowerCase();
        const customer = (q.clientName || q.customerName || "").toLowerCase();
        const status = (q.status || "").toLowerCase();
        return qNo.includes(term) || customer.includes(term) || status.includes(term);
      });
    }

    return [...result].sort((a, b) => {
      let aVal = "";
      let bVal = "";

      if (sortField === "quotationNumber") {
        aVal = a.quotationNumber || "";
        bVal = b.quotationNumber || "";
      } else if (sortField === "customer") {
        aVal = a.clientName || a.customerName || "";
        bVal = b.clientName || b.customerName || "";
      } else if (sortField === "status") {
        aVal = a.status || "";
        bVal = b.status || "";
      } else if (sortField === "date") {
        aVal = a.quotationDate || a.createdAt || "";
        bVal = b.quotationDate || b.createdAt || "";
      } else if (sortField === "total") {
        const totalA = Number(a.grandTotal ?? a.totals?.grandTotal ?? 0);
        const totalB = Number(b.grandTotal ?? b.totals?.grandTotal ?? 0);
        return sortOrder === "asc" ? totalA - totalB : totalB - totalA;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [quotations, searchText, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredQuotations.length / pageSize);
  const pagedQuotations = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, page, pageSize]);

  return (
    <>
      <div className="content">
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="leads-header-title mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Quotation List</h2>
            <p className="leads-header-subtitle text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {isEmployee
                ? "Track verification status for your quotations."
                : "Review and approve verification requests."}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/quotation"
              className="btn btn-primary create-lead-btn d-flex align-items-center gap-2"
              style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
            >
              <i className="ti ti-plus" />
              Create Quotation
            </Link>
          </div>
        </div>
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

        <div className="card table-list-card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body">
            {/* Redesigned Controls Row */}
            <div className="leads-controls-bar d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              {/* Search Box */}
              <div className="d-flex align-items-center gap-2 p-1 border" style={{ borderRadius: 12, backgroundColor: "#f8fafc", width: "100%", maxWidth: 350 }}>
                <i className="ti ti-search text-muted ms-2" style={{ fontSize: "1.1rem" }} />
                <input
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none"
                  placeholder="Search by quotation no., customer, status..."
                  style={{ height: 36, fontSize: "0.9rem" }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="py-5 text-center text-muted">
                <LoadingSpinner size="page" label="Loading quotations" />
              </div>
            ) : pagedQuotations.length === 0 ? (
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
            ) : (
              <>
                <div
                  className="table-responsive leads-table-wrap border-0 shadow-sm mb-4"
                  style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x", borderRadius: 12, minHeight: "260px" }}
                >
                  <table className="table table-hover align-middle leads-table mb-0">
                    <thead>
                      <tr>
                        <th
                          className="col-qno text-muted"
                          style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort("quotationNumber")}
                        >
                          Quotation No. {sortField === "quotationNumber" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                        </th>
                        <th
                          className="col-customer text-muted"
                          style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort("customer")}
                        >
                          Customer {sortField === "customer" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                        </th>
                        <th
                          className="col-status text-muted"
                          style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort("status")}
                        >
                          Status {sortField === "status" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                        </th>
                        <th
                          className="col-date text-muted"
                          style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort("date")}
                        >
                          Date {sortField === "date" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                        </th>
                        <th
                          className="col-total text-muted"
                          style={{ fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}
                          onClick={() => handleSort("total")}
                        >
                          Total {sortField === "total" && <span className="ms-1 sort-indicator text-muted">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                        </th>
                        <th className="col-notes text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Notes</th>
                        <th className="col-actions text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedQuotations.map((quotation) => {
                        const status = quotation.status || QUOTATION_STATUS_DRAFT;
                        const statusUi = getStatusUi(status);
                        const canApprove = canApproveQuotation(quotation, userRole, user);
                        const isApprovedOrAccepted = status === QUOTATION_STATUS_APPROVED || status === QUOTATION_STATUS_ACCEPTED;

                        return (
                          <tr key={quotation.id}>
                            <td className="col-qno fw-semibold" style={{ color: "#1e293b", fontSize: "0.9rem" }}>{quotation.quotationNumber || "-"}</td>
                            <td className="col-customer" style={{ fontSize: "0.9rem" }}>{quotation.clientName || quotation.customerName || "-"}</td>
                            <td className="col-status">
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
                            <td className="col-date" style={{ fontSize: "0.9rem" }}>{formatDate(quotation.quotationDate || quotation.createdAt)}</td>
                            <td className="col-total fw-semibold text-success" style={{ fontSize: "0.9rem" }}>Rs. {Number(quotation.grandTotal ?? quotation.totals?.grandTotal ?? 0).toFixed(2)}</td>
                            <td className="col-notes" style={{ fontSize: "0.85rem" }}>
                              <div className="small">
                                <div>
                                  <strong>Employee:</strong> {quotation.verificationRequestNotes || "-"}
                                </div>
                                <div>
                                  <strong>Branch Head:</strong> {quotation.approvalNotes || "-"}
                                </div>
                              </div>
                            </td>
                            <td className="col-actions">
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-kebab-actions d-flex align-items-center justify-content-center"
                                  style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "transparent", color: "#64748b" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeActionsRow?.id === quotation.id) {
                                      setActiveActionsRow(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setActionsMenuPos({
                                        top: rect.top + window.scrollY,
                                        left: rect.right + window.scrollX,
                                      });
                                      setActiveActionsRow(quotation);
                                    }
                                  }}
                                >
                                  <i className="ti ti-dots-vertical" style={{ fontSize: "1.15rem" }} />
                                </button>
                                {canApprove && (
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                    style={{ padding: "6px 12px", borderRadius: 8, fontSize: "0.85rem", fontWeight: "600" }}
                                    onClick={() => openApproveDialog(quotation)}
                                  >
                                    <i className="ti ti-circle-check"></i>
                                    Approve
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

                {/* Pagination Footer */}
                <div className="leads-pagination-footer d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-3 border-top">
                  <span className="entries-info text-muted small">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredQuotations.length)} of {filteredQuotations.length} entries
                  </span>

                  <div className="pagination-numbers-container d-flex align-items-center gap-1">
                    <button
                      type="button"
                      className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, borderRadius: 6 }}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <i className="ti ti-chevron-left" />
                    </button>

                    {(() => {
                      const buttons = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, page - 2);
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      if (maxVisible - 1 > endPage - startPage) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      if (startPage > 1) {
                        buttons.push(
                          <button
                            key={1}
                            className={`btn-pagination-num btn btn-sm border-0 ${page === 1 ? 'btn-primary text-white' : 'btn-light'}`}
                            style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === 1 ? "#3b82f6" : undefined }}
                            onClick={() => setPage(1)}
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          buttons.push(<span key="dots-start" className="pagination-dots px-1 text-muted">...</span>);
                        }
                      }

                      for (let i = startPage; endPage >= i; i++) {
                        buttons.push(
                          <button
                            key={i}
                            className={`btn-pagination-num btn btn-sm border-0 ${page === i ? 'btn-primary text-white' : 'btn-light'}`}
                            style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === i ? "#3b82f6" : undefined }}
                            onClick={() => setPage(i)}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (totalPages > endPage) {
                        if (totalPages - 1 > endPage) {
                          buttons.push(<span key="dots-end" className="pagination-dots px-1 text-muted">...</span>);
                        }
                        buttons.push(
                          <button
                            key={totalPages}
                            className={`btn-pagination-num btn btn-sm border-0 ${page === totalPages ? 'btn-primary text-white' : 'btn-light'}`}
                            style={{ width: 32, height: 32, borderRadius: 6, fontWeight: "500", backgroundColor: page === totalPages ? "#3b82f6" : undefined }}
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return buttons;
                    })()}

                    <button
                      type="button"
                      className="btn-pagination-arrow btn btn-sm btn-light border-0 d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, borderRadius: 6 }}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <i className="ti ti-chevron-right" />
                    </button>
                  </div>

                  <PageSizeSelector
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    setPage={setPage}
                  />
                </div>
              </>
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

      {selectedQuotationDetails && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "18px" }}>
                <div className="modal-header bg-light" style={{ borderTopLeftRadius: "18px", borderTopRightRadius: "18px" }}>
                  <h5 className="modal-title fw-bold" style={{ color: "#45597a" }}>
                    Details ({selectedQuotationDetails.quotationNumber || "Draft"})
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedQuotationDetails(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="d-flex flex-column gap-3">
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Customer:</div>
                      <div className="col-8 fw-bold">{selectedQuotationDetails.clientName || selectedQuotationDetails.customerName || "-"}</div>
                    </div>
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Status:</div>
                      <div className="col-8">
                        <span className={getStatusUi(selectedQuotationDetails.status || QUOTATION_STATUS_DRAFT).className}>
                          {selectedQuotationDetails.status || QUOTATION_STATUS_DRAFT}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Date:</div>
                      <div className="col-8">{formatDate(selectedQuotationDetails.quotationDate || selectedQuotationDetails.createdAt)}</div>
                    </div>
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Total:</div>
                      <div className="col-8 fw-bold text-success">
                        Rs. {Number(selectedQuotationDetails.grandTotal ?? selectedQuotationDetails.totals?.grandTotal ?? 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Employee Notes:</div>
                      <div className="col-8">{selectedQuotationDetails.verificationRequestNotes || "-"}</div>
                    </div>
                    <div className="row">
                      <div className="col-4 text-muted fw-semibold">Branch Head Notes:</div>
                      <div className="col-8">{selectedQuotationDetails.approvalNotes || "-"}</div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* Actions inside the details modal */}
                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        handleEdit(selectedQuotationDetails);
                        setSelectedQuotationDetails(null);
                      }}
                      disabled={isEmployee && !(selectedQuotationDetails.status === QUOTATION_STATUS_DRAFT || selectedQuotationDetails.status === QUOTATION_STATUS_NEGOTIATING)}
                    >
                      <i className="ti ti-edit me-2"></i>
                      Edit Quotation
                    </button>
                    {selectedQuotationDetails.status !== QUOTATION_STATUS_DRAFT && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          handleView(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-eye me-2"></i>
                        View PDF Preview
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => {
                        handleDownload(selectedQuotationDetails);
                        setSelectedQuotationDetails(null);
                      }}
                      disabled={isEmployee && !(selectedQuotationDetails.status === QUOTATION_STATUS_APPROVED || selectedQuotationDetails.status === QUOTATION_STATUS_ACCEPTED)}
                    >
                      <i className="ti ti-file-download me-2"></i>
                      Download PDF
                    </button>
                    {isEmployee && selectedQuotationDetails.status === QUOTATION_STATUS_APPROVED && (
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => {
                          handleMarkSent(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-mail-forward me-2"></i>
                        Mark as Sent
                      </button>
                    )}
                    {isEmployee && selectedQuotationDetails.status === QUOTATION_STATUS_SENT && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          openCustomerResponseDialog(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-help me-2"></i>
                        Customer Response
                      </button>
                    )}
                    {isEmployee && selectedQuotationDetails.status === QUOTATION_STATUS_DRAFT && (
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => {
                          openVerifyDialog(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-send me-2"></i>
                        Send for Verification
                      </button>
                    )}
                    {isEmployee && selectedQuotationDetails.status === QUOTATION_STATUS_NEGOTIATING && (
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => {
                          openVerifyDialog(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-send me-2"></i>
                        Re-send for Approval
                      </button>
                    )}
                    {isHigherAuthority && (
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => {
                          openApproveDialog(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                        disabled={!canApproveQuotation(selectedQuotationDetails, userRole, user)}
                      >
                        <i className="ti ti-circle-check me-2"></i>
                        {selectedQuotationDetails.status === QUOTATION_STATUS_APPROVED ? "Approved" : "Approve"}
                      </button>
                    )}
                    {userRole === "SUPER_ADMIN" && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                          handleDelete(selectedQuotationDetails);
                          setSelectedQuotationDetails(null);
                        }}
                      >
                        <i className="ti ti-trash me-2"></i>
                        Delete Quotation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show quotation-list-backdrop"></div>
        </>
      )}

      {activeActionsRow && createPortal(
        <div
          className="floating-actions-menu shadow-lg border"
          style={{
            position: "absolute",
            top: actionsMenuPos.top,
            left: actionsMenuPos.left,
            transform: "translate(-100%, -100%) translateY(-5px)",
            zIndex: 9999,
            background: "#fff",
            borderRadius: 8,
            padding: "6px 0",
            minWidth: 180
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edit */}
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              handleEdit(activeActionsRow);
              setActiveActionsRow(null);
            }}
            disabled={isEmployee && !(activeActionsRow.status === QUOTATION_STATUS_DRAFT || activeActionsRow.status === QUOTATION_STATUS_NEGOTIATING)}
          >
            <i className="ti ti-edit" style={{ fontSize: "1rem", color: "#64748b" }} /> Edit Quotation
          </button>

          {/* View PDF Preview */}
          {activeActionsRow.status !== QUOTATION_STATUS_DRAFT && (
            <button
              className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                handleView(activeActionsRow);
                setActiveActionsRow(null);
              }}
            >
              <i className="ti ti-eye" style={{ fontSize: "1rem", color: "#64748b" }} /> View Preview
            </button>
          )}

          {/* Download PDF */}
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              handleDownload(activeActionsRow);
              setActiveActionsRow(null);
            }}
            disabled={isEmployee && !(activeActionsRow.status === QUOTATION_STATUS_APPROVED || activeActionsRow.status === QUOTATION_STATUS_ACCEPTED)}
          >
            <i className="ti ti-file-download" style={{ fontSize: "1rem", color: "#64748b" }} /> Download PDF
          </button>

          {/* Log */}
          <button
            className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
            style={{ fontSize: "0.85rem" }}
            onClick={() => {
              openLogDialog(activeActionsRow);
              setActiveActionsRow(null);
            }}
          >
            <i className="ti ti-history" style={{ fontSize: "1rem", color: "#64748b" }} /> View Log
          </button>

          {/* Send for Verification */}
          {isEmployee && activeActionsRow.status === QUOTATION_STATUS_DRAFT && (
            <button
              className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                openVerifyDialog(activeActionsRow);
                setActiveActionsRow(null);
              }}
            >
              <i className="ti ti-send" style={{ fontSize: "1rem", color: "#64748b" }} /> Send for Verification
            </button>
          )}

          {/* Re-send for Approval */}
          {isEmployee && activeActionsRow.status === QUOTATION_STATUS_NEGOTIATING && (
            <button
              className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                openVerifyDialog(activeActionsRow);
                setActiveActionsRow(null);
              }}
            >
              <i className="ti ti-send" style={{ fontSize: "1rem", color: "#64748b" }} /> Re-send for Approval
            </button>
          )}

          {/* Approve */}
          {isHigherAuthority && (
            <button
              className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                openApproveDialog(activeActionsRow);
                setActiveActionsRow(null);
              }}
              disabled={!canApproveQuotation(activeActionsRow, userRole, user)}
            >
              <i className="ti ti-circle-check" style={{ fontSize: "1rem", color: "#64748b" }} /> Approve
            </button>
          )}

          {/* Delete */}
          {userRole === "SUPER_ADMIN" && (
            <button
              className="dropdown-item py-2 px-3 text-start d-flex align-items-center gap-2 text-danger"
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                handleDelete(activeActionsRow);
                setActiveActionsRow(null);
              }}
            >
              <i className="ti ti-trash" style={{ fontSize: "1rem", color: "#ef4444" }} /> Delete
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
