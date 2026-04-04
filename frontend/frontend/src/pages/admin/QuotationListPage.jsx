import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  approveQuotation,
  getQuotations,
  sendQuotationForVerification,
} from "../../api/quotationApi";
import {
  QUOTATION_STATUS_APPROVED,
  QUOTATION_STATUS_DRAFT,
  QUOTATION_STATUS_VERIFICATION_PENDING,
  downloadQuotationPdf,
  setQuotationDraft,
} from "../../utils/quotationUtils";

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

function normalizeRole(value) {
  return String(value || "").trim().toUpperCase();
}

function isHigherAuthorityRole(role) {
  return ["TEAM_LEAD", "MANAGER", "ADMIN", "SUPER_ADMIN"].includes(role);
}

function getStatusUi(status) {
  if (status === QUOTATION_STATUS_APPROVED) {
    return { label: "Approved", className: "badge bg-success" };
  }
  if (status === QUOTATION_STATUS_VERIFICATION_PENDING) {
    return { label: "Verification Pending", className: "badge bg-warning text-dark" };
  }
  return { label: "Draft", className: "badge bg-secondary" };
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

  const updateSingleQuotation = (updatedQuotation) => {
    setQuotations((previous) =>
      previous.map((quotation) => (quotation.id === updatedQuotation.id ? updatedQuotation : quotation)),
    );
  };

  const handleEdit = (quotation) => {
    setQuotationDraft(quotation);
    navigate("/quotation");
  };

  const handleDownload = (quotation) => {
    try {
      downloadQuotationPdf(quotation);
    } catch (error) {
      console.error("Failed to download quotation PDF", error);
      setActionError("Failed to download quotation PDF.");
    }
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

  const closeNotesDialog = () => {
    setNotesDialog({ open: false, mode: null, quotationId: null, notes: "" });
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
                    const canEditForEmployee = status === QUOTATION_STATUS_DRAFT;
                    const canDownloadForEmployee = status === QUOTATION_STATUS_APPROVED;
                    const canApprove = canApproveQuotation(quotation, userRole, user);

                    return (
                      <tr key={quotation.id}>
                        <td>{quotation.quotationNumber || "-"}</td>
                        <td>{quotation.customerName || "-"}</td>
                        <td>
                          <span className={statusUi.className}>{statusUi.label}</span>
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

                            {isEmployee && (
                              <button
                                type="button"
                                className="btn btn-warning btn-sm"
                                onClick={() => openVerifyDialog(quotation)}
                                disabled={status !== QUOTATION_STATUS_DRAFT}
                              >
                                <i className="ti ti-send me-1"></i>
                                {status === QUOTATION_STATUS_DRAFT && "Verify Quotation"}
                                {status === QUOTATION_STATUS_VERIFICATION_PENDING && "Sent for Verification"}
                                {status === QUOTATION_STATUS_APPROVED && "Approved"}
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

      {notesDialog.open && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {notesDialog.mode === "verify" ? "Send for Verification" : "Approve Quotation"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeNotesDialog}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">
                    {notesDialog.mode === "verify"
                      ? "Verification Notes (optional)"
                      : "Approval Notes (optional)"}
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeNotesDialog}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={submitNotesDialog}>
                    {notesDialog.mode === "verify" ? "Send Verification" : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
