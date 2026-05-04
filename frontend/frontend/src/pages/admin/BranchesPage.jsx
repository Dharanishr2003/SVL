import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch,
} from "../../api/branchesApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  headOfficeId: "",
  name: "",
  status: "ACTIVE",
};

export default function BranchesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [headOffices, setHeadOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedHeadOfficeId, setSelectedHeadOfficeId] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const data = await getHeadOffices();
      setHeadOffices(Array.isArray(data) ? data : []);
    } catch (e) {
      setHeadOffices([]);
      showError(extractApiErrorMessage(e, "Failed to load head offices"));
    } finally {
      setMetaLoading(false);
    }
  };

  const load = async (headOfficeId) => {
    setLoading(true);
    try {
      const data = await getBranches(headOfficeId || undefined);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load branches"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    load(selectedHeadOfficeId);
  }, [selectedHeadOfficeId]);

  const headOfficeOptions = useMemo(
    () =>
      [...headOffices].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      ),
    [headOffices],
  );

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.headOfficeId) {
      showError("Head Office is required");
      return;
    }
    if (!form.name.trim()) {
      showError("Branch name is required");
      return;
    }
    setSaving(true);
    try {
      await createBranch({
        headOfficeId: Number(form.headOfficeId),
        name: form.name.trim(),
        status: form.status,
      });
      showSuccess("Branch added");
      setForm((prev) => ({ ...initialForm, headOfficeId: prev.headOfficeId || "" }));
      setShowAddModal(false);
      await load(selectedHeadOfficeId);
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add branch"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      headOfficeId: String(row?.headOfficeId || ""),
      name: row?.name || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.headOfficeId) {
      showError("Head Office is required");
      return;
    }
    if (!editForm.name.trim()) {
      showError("Branch name is required");
      return;
    }
    setSaving(true);
    try {
      await updateBranch(selectedId, {
        headOfficeId: Number(editForm.headOfficeId),
        name: editForm.name.trim(),
        status: editForm.status,
      });
      showSuccess("Branch updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load(selectedHeadOfficeId);
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update branch"));
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
      await deleteBranch(selectedId);
      showSuccess("Branch deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load(selectedHeadOfficeId);
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete branch"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Branches</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Branches
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select"
              style={{ width: 260 }}
              value={selectedHeadOfficeId}
              onChange={(e) => setSelectedHeadOfficeId(e.target.value)}
              disabled={metaLoading}
            >
              <option value="">All Head Offices</option>
              {headOfficeOptions.map((ho) => (
                <option key={ho.id} value={ho.id}>
                  {ho.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-primary" onClick={() => {
              setForm((prev) => ({ ...initialForm, headOfficeId: selectedHeadOfficeId || prev.headOfficeId || "" }));
              setShowAddModal(true);
            }}>
              Add Branch
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Head Office</th>
                      <th>Branch</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No branches found
                        </td>
                      </tr>
                    ) : (
                      orderedRows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            {headOffices.find((h) => String(h.id) === String(row.headOfficeId))?.name ||
                              row.headOfficeId}
                          </td>
                          <td>{row.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                String(row.status || "ACTIVE").toUpperCase() === "ACTIVE"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {String(row.status || "ACTIVE").toUpperCase()}
                            </span>
                          </td>
                          <td className="text-end">
                            <button type="button" className="btn btn-sm btn-light me-2" onClick={() => openEdit(row)}>
                              Edit
                            </button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => confirmDelete(row)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Branch</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)} />
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Head Office</label>
                          <select
                            className="form-select"
                            value={form.headOfficeId}
                            onChange={(e) => setForm((prev) => ({ ...prev, headOfficeId: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {headOfficeOptions.map((ho) => (
                              <option key={ho.id} value={ho.id}>
                                {ho.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Branch Name</label>
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
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Adding..." : "Add Branch"}
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
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Branch</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)} />
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Head Office</label>
                          <select
                            className="form-select"
                            value={editForm.headOfficeId}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, headOfficeId: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {headOfficeOptions.map((ho) => (
                              <option key={ho.id} value={ho.id}>
                                {ho.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Branch Name</label>
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
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light me-2" onClick={() => setShowEditModal(false)}>
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
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowDeleteModal(false)} />
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete
                    {deleteTarget?.name ? ` \"${deleteTarget.name}\"` : " this branch"}?
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
    </>
  );
}

