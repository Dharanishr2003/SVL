import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartmentsMaster } from "../../api/departmentsApi";
import { createPolicy, deletePolicy, getPolicies, updatePolicy } from "../../api/policiesApi";
import api from "../../utils/api";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  name: "",
  description: "",
  departmentId: "",
};

export default function PolicyPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPolicies();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load policies"));
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const deps = await getDepartmentsMaster();
      setDepartments(Array.isArray(deps) ? deps : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load departments"));
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadMeta();
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const departmentOptions = useMemo(() => {
    return (departments || [])
      .map((d) => ({ id: d?.id, name: d?.name }))
      .filter((d) => d.id != null && d.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departments]);

  const formatDate = (value) => {
    if (!value) return "-";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "-";
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Policy name is required");
      return;
    }
    if (!form.departmentId) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      await createPolicy(
        {
          name: form.name.trim(),
          description: form.description?.trim() || "",
          departmentId: Number(form.departmentId),
        },
        file,
      );
      setForm(initialForm);
      setFile(null);
      showSuccess("Policy added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add policy"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      name: row?.name || "",
      description: row?.description || "",
      departmentId: row?.departmentId ? String(row.departmentId) : "",
    });
    setEditFile(null);
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const openView = (row) => {
    setViewRow(row || null);
    setShowViewModal(true);
  };

  const handleViewFile = async () => {
    if (!viewRow?.id) return;
    try {
      const response = await api.get(`/api/policies/${viewRow.id}/file`, {
        responseType: "blob",
      });
      const blob = response?.data;
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 30000);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to open file"));
    }
  };

  const handleEditPolicy = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.name.trim()) {
      showError("Policy name is required");
      return;
    }
    if (!editForm.departmentId) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      await updatePolicy(
        selectedId,
        {
          name: editForm.name.trim(),
          description: editForm.description?.trim() || "",
          departmentId: Number(editForm.departmentId),
        },
        editFile,
      );
      showSuccess("Policy updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update policy"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row || null);
    setSelectedId(row?.id || null);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deletePolicy(selectedId);
      showSuccess("Policy deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete policy"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Policies</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">HR</li>
                <li className="breadcrumb-item active">Policies</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setForm(initialForm);
                setFile(null);
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Policy
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5>Policies List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>⋮ Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  ) : orderedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No policies found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => (
                      <tr key={row.id || row.name}>
                        <td>
                          <h6 className="fs-14 fw-medium text-gray-9">{row.name || "-"}</h6>
                        </td>
                        <td>{row.departmentName || "-"}</td>
                        <td>{row.description || "-"}</td>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>
                          <div className="action-icon d-inline-flex">
                            <button
                              type="button"
                              className="btn btn-link p-0 me-2"
                              onClick={() => openView(row)}
                              aria-label="View policy"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 me-2"
                              onClick={() => openEdit(row)}
                              aria-label="Edit policy"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger"
                              onClick={() => confirmDelete(row)}
                              aria-label="Delete policy"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Policy</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddPolicy}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Policy Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={form.departmentId}
                            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {departmentOptions.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Upload Policy</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white border me-2" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Adding..." : "Add Policy"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showEditModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Policy</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditPolicy}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Policy Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            value={editForm.description}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={editForm.departmentId}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {departmentOptions.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Upload Policy</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                          />
                          <small className="text-muted">Leave blank to keep existing file.</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white border me-2" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showDeleteModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Confirm Delete</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowDeleteModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete
                    {deleteTarget?.name ? ` "${deleteTarget.name}"` : " this policy"}
                    ?
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light me-2" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {showViewModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Policy Details</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowViewModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Policy Name</label>
                      <div className="form-control bg-light">{viewRow?.name || "-"}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department</label>
                      <div className="form-control bg-light">{viewRow?.departmentName || "-"}</div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description</label>
                      <div className="form-control bg-light" style={{ minHeight: 90 }}>
                        {viewRow?.description || "-"}
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Created Date</label>
                      <div className="form-control bg-light">{formatDate(viewRow?.createdAt)}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">File</label>
                      <div className="form-control bg-light d-flex align-items-center justify-content-between">
                        <span>{viewRow?.fileName || "No file"}</span>
                        {viewRow?.id ? (
                          <button type="button" className="btn btn-sm btn-light" onClick={handleViewFile}>
                            View File
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">File Type</label>
                      <div className="form-control bg-light">{viewRow?.fileType || "-"}</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">File Size</label>
                      <div className="form-control bg-light">
                        {viewRow?.fileSize ? `${viewRow.fileSize} bytes` : "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowViewModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}
