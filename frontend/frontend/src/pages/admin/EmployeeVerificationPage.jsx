import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getEmployeeVerification,
  resendProfileCompletionMail,
  verifyEmployeeFields,
} from "../../api/employeesApi";
import { useToast } from "../../components/system/ToastProvider";
import { extractApiErrorMessage } from "../../utils/errorMessage";

const FIELD_LABELS = {
  DATE_OF_BIRTH: "Date of Birth",
  GENDER: "Gender",
  CURRENT_ADDRESS: "Address",
  AADHAAR_NUMBER: "Aadhaar Number",
  PAN_NUMBER: "PAN Number",
  BANK_ACCOUNT_HOLDER_NAME: "Bank A/C Holder Name",
  BANK_ACCOUNT_NUMBER: "Bank A/C Number",
  BANK_IFSC: "IFSC Code",
  BANK_NAME_BRANCH: "Bank Name & Branch",
};

function statusBadge(status) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") return "badge-success";
  if (s === "REJECTED") return "badge-danger";
  if (s === "PENDING") return "badge-warning";
  return "badge-secondary";
}

export default function EmployeeVerificationPage() {
  const { employeeId } = useParams();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [fieldDecisions, setFieldDecisions] = useState({});
  const [fieldRemarks, setFieldRemarks] = useState({});
  const [docDecisions, setDocDecisions] = useState({});
  const [docRemarks, setDocRemarks] = useState({});
  const [lastLink, setLastLink] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getEmployeeVerification(employeeId);
      setData(res);
      setLastLink(null);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load verification"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const hasNonApproved = useMemo(() => {
    const anyFieldNonApproved = (data?.fields || []).some((f) => String(f.status || "").toUpperCase() !== "APPROVED");
    const anyDocNonApproved = (data?.documents || []).some((d) => String(d.status || "").toUpperCase() !== "APPROVED");
    return anyFieldNonApproved || anyDocNonApproved;
  }, [data]);

  async function handleSave() {
    const payload = {
      fieldDecisions: Object.entries(fieldDecisions)
        .filter(([, v]) => v)
        .map(([fieldKey, decision]) => ({
          fieldKey,
          decision,
          remarks: decision === "REJECT" ? (fieldRemarks[fieldKey] || "") : "",
        })),
      documentDecisions: Object.entries(docDecisions)
        .filter(([, v]) => v)
        .map(([documentId, decision]) => ({
          documentId: Number(documentId),
          decision,
          remarks: decision === "REJECT" ? (docRemarks[documentId] || "") : "",
        })),
    };

    if (payload.fieldDecisions.length === 0 && payload.documentDecisions.length === 0) {
      showError("No changes selected");
      return;
    }

    setSaving(true);
    try {
      const res = await verifyEmployeeFields(employeeId, payload);
      setData(res);
      setFieldDecisions({});
      setFieldRemarks({});
      setDocDecisions({});
      setDocRemarks({});
      showSuccess("Verification updated");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save verification"));
    } finally {
      setSaving(false);
    }
  }

  async function handleResendProfileCompletionMail() {
    setSaving(true);
    try {
      const res = await resendProfileCompletionMail(employeeId);
      setLastLink(res?.publicUrl || null);
      showSuccess("Profile completion mail sent");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to resend profile completion mail"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="page-title mb-1">Verify Employee Profile</h3>
            <div className="text-muted small">Employee ID: {employeeId}</div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" onClick={load} disabled={loading || saving}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading || saving}>
              {saving ? "Saving..." : "Save Decisions"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body">Loading...</div>
          </div>
        ) : (
          <>
            <div className="card mb-3">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-medium">Profile Status</div>
                  <div className="text-muted">{data?.profileStatus || "-"}</div>
                </div>
                <div>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleResendProfileCompletionMail}
                    disabled={saving || !hasNonApproved}
                    title={!hasNonApproved ? "No pending/rejected fields/files" : ""}
                  >
                    Resend Mail to Complete Profile
                  </button>
                </div>
              </div>
              {lastLink ? (
                <div className="card-footer">
                  <div className="fw-medium mb-1">Profile completion link</div>
                  <div className="d-flex gap-2 align-items-center">
                    <input className="form-control" readOnly value={lastLink} />
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(lastLink)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

                <div className="card mb-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Scalar Fields</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Field</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Decision</th>
                            <th>Remarks (for reject)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.fields || []).map((f) => (
                            <tr key={f.fieldKey}>
                              <td>{FIELD_LABELS[f.fieldKey] || f.fieldKey}</td>
                              <td className="text-muted">{f.valuePreview || "-"}</td>
                              <td>
                                <span className={`badge ${statusBadge(f.status)}`}>{f.status || "N/A"}</span>
                              </td>
                              <td style={{ minWidth: 180 }}>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      fieldDecisions[f.fieldKey] === "APPROVE" ? "btn-success" : "btn-outline-success"
                                    }`}
                                    onClick={() =>
                                      setFieldDecisions((p) => ({ ...p, [f.fieldKey]: "APPROVE" }))
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      fieldDecisions[f.fieldKey] === "REJECT" ? "btn-danger" : "btn-outline-danger"
                                    }`}
                                    onClick={() =>
                                      setFieldDecisions((p) => ({ ...p, [f.fieldKey]: "REJECT" }))
                                    }
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                      setFieldDecisions((p) => {
                                        const next = { ...p };
                                        delete next[f.fieldKey];
                                        return next;
                                      })
                                    }
                                    title="Clear decision"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </td>
                              <td style={{ minWidth: 260 }}>
                                <input
                                  className="form-control form-control-sm"
                                  value={fieldRemarks[f.fieldKey] || ""}
                                  onChange={(e) =>
                                    setFieldRemarks((p) => ({ ...p, [f.fieldKey]: e.target.value }))
                                  }
                                  disabled={fieldDecisions[f.fieldKey] !== "REJECT"}
                                  placeholder={f.remarks || "Add remarks"}
                                />
                              </td>
                            </tr>
                          ))}
                          {(data?.fields || []).length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No scalar fields configured
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Uploaded Documents</h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>File</th>
                            <th>Status</th>
                            <th>Decision</th>
                            <th>Remarks (for reject)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.documents || []).map((d) => (
                            <tr key={d.id}>
                              <td>{d.docType}</td>
                              <td>
                                {d.fileUrl ? (
                                  <a href={d.fileUrl} target="_blank" rel="noreferrer">
                                    {d.originalFilename || d.fileUrl}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>
                                <span className={`badge ${statusBadge(d.status)}`}>{d.status || "N/A"}</span>
                              </td>
                              <td style={{ minWidth: 180 }}>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      docDecisions[d.id] === "APPROVE" ? "btn-success" : "btn-outline-success"
                                    }`}
                                    onClick={() => setDocDecisions((p) => ({ ...p, [d.id]: "APPROVE" }))}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      docDecisions[d.id] === "REJECT" ? "btn-danger" : "btn-outline-danger"
                                    }`}
                                    onClick={() => setDocDecisions((p) => ({ ...p, [d.id]: "REJECT" }))}
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                      setDocDecisions((p) => {
                                        const next = { ...p };
                                        delete next[d.id];
                                        return next;
                                      })
                                    }
                                    title="Clear decision"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </td>
                              <td style={{ minWidth: 260 }}>
                                <input
                                  className="form-control form-control-sm"
                                  value={docRemarks[d.id] || ""}
                                  onChange={(e) => setDocRemarks((p) => ({ ...p, [d.id]: e.target.value }))}
                                  disabled={docDecisions[d.id] !== "REJECT"}
                                  placeholder={d.remarks || "Add remarks"}
                                />
                              </td>
                            </tr>
                          ))}
                          {(data?.documents || []).length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No documents uploaded yet
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
          </>
        )}
    </div>
  );
}
