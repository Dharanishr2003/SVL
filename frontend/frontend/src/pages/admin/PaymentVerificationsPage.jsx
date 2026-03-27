import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { downloadLeadPaymentProofFile as downloadLeadPaymentProofFileApi, downloadLeadRequirementFile, getLeads, updateLeadDetails } from "../../api/leadsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

export default function PaymentVerificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPendingVerifications = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all pending payment verifications
      const leads = await getLeads({ limit: 1000, offset: 0 });
      console.log("✓ API returned leads count:", leads.length);
      if (leads.length > 0) {
        console.log("✓ Sample lead:", leads[0]);
      }
      
      // Filter client-side:
      // 1. Admin/Manager: see all pending verifications
      // 2. Employees: ONLY see verifications assigned to them via round-robin
      const pending = (Array.isArray(leads) ? leads : []).filter((lead) => {
        const isPending = lead.paymentVerificationStatus === "PENDING";
        
        // Only show PENDING verifications
        if (!isPending) return false;
        
        // Super Admin, Admin and Manager can see all pending verifications
        if (user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MANAGER")) {
          return true;
        }
        
        // Employees ONLY see verifications explicitly assigned to them
        if (!user?.id) return false;
        const isAssignedToUser = String(lead.paymentVerificationAssignedToUserId) === String(user.id);
        if (isAssignedToUser) {
          console.log("✓ Payment verification found for user");
        }
        return isAssignedToUser;
      });
      
      console.log("✓ Filtered pending count:", pending.length, "User ID:", user?.id);
      setPendingVerifications(pending);
    } catch (e) {
      console.error("✗ Fetch error:", e);
      setError(extractApiErrorMessage(e, "Failed to load verifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user !== undefined) {
      fetchPendingVerifications();
    }
  }, [user]);

  const handleApprove = (lead) => {
    navigate(`/payment-verifications/${lead.id}/approve`);
  };

  const handleReject = async (leadId) => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setApproving(leadId);
    try {
      await updateLeadDetails(leadId, {
        paymentVerificationStatus: "REJECTED",
        paymentVerificationRejectionReason: rejectionReason,
      });
      showSuccess("Payment verification rejected");
      setPendingVerifications((prev) =>
        prev.filter((item) => item.id !== leadId)
      );
      setRejectingId(null);
      setRejectionReason("");
    } catch (e) {
      setError(extractApiErrorMessage(e, "Failed to reject verification"));
    } finally {
      setApproving(null);
    }
  };

  const downloadPaymentProofFile = async (lead) => {
    try {
      const { blob, contentDisposition } = await downloadLeadPaymentProofFileApi(lead.id);
      if (!blob) return;
      const match = /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(contentDisposition || "");
      const fallback = lead.paymentProofFileName || `payment-proof-${lead.id}`;
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
      setError(extractApiErrorMessage(e, "Failed to download payment proof file"));
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
      setError(extractApiErrorMessage(e, "Failed to download requirement file"));
    }
  };

  const handleViewDetails = (lead) => {
    navigate(`/payment-verifications/${lead.id}`);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h4>Payment Verifications</h4>
          <p className="text-muted">Review and approve/reject payment verifications</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => fetchPendingVerifications()}
          disabled={loading}
          style={{ height: "fit-content" }}
        >
          <i className="ti ti-refresh me-1"></i>
          Refresh
        </button>
          </div>
   

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : pendingVerifications.length === 0 ? (
          <div className="alert alert-info">
            No pending payment verifications at this time.
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Lead Name</th>
                    <th>Paid Amount</th>
                    <th>Assigned To</th>
                    <th>Notes</th>
                    <th>Proof Document</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVerifications.map((lead) => {
                    const verificationAmount = parseFloat(lead.paymentVerificationAmount) || 0;
                    return (
                    <tr key={lead.id}>
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/lead/${lead.id}`);
                          }}
                          className="text-primary"
                        >
                          #{lead.leadId || lead.id}
                        </a>
                      </td>
                      <td>{lead.name || "-"}</td>
                      <td>
                        <strong>
                          ₹{verificationAmount.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        {lead.paymentVerificationAssignedToUserId ? (
                          <span className="badge bg-info">
                            {lead.paymentVerificationAssignedToUserName ||
                              (lead.paymentVerificationAssignedToUserId === user?.id ? "You" : "Assigned")}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <small>{lead.paymentProofNotes || "-"}</small>
                      </td>
                      <td>
                        {lead.paymentProofFileName ? (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => downloadPaymentProofFile(lead)}
                          >
                            <i className="ti ti-download me-1"></i> Download
                          </button>
                        ) : (
                          <span className="text-muted">No file</span>
                        )}
                      </td>
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
                                disabled={approving === lead.id}
                              >
                                {approving === lead.id ? "Rejecting..." : "Confirm"}
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex gap-1" style={{ flexWrap: "wrap" }}>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewDetails(lead)}
                              title="View payment details"
                            >
                              <i className="ti ti-eye me-1"></i> View
                            </button>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApprove(lead)}
                              disabled={approving !== null}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => setRejectingId(lead.id)}
                              disabled={approving !== null}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

    </>
  );
}