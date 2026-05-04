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

function isActiveMaster(item) {
  return String(item?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
}

function withInactiveSelected(items, selectedId) {
  const list = Array.isArray(items) ? items : [];
  const active = list.filter(isActiveMaster);
  if (!selectedId) return active;

  const selected = list.find((it) => String(it?.id) === String(selectedId));
  if (!selected || isActiveMaster(selected)) return active;

  return [
    ...active,
    { ...selected, name: `${selected?.name || "Selected"} (Inactive)` },
  ];
}

export default function BranchesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [headOffices, setHeadOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    headOfficeId: "",
    status: "",
    q: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);

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
    load(filters.headOfficeId);
  }, [filters.headOfficeId]);

  const headOfficeOptions = useMemo(
    () =>
      [...headOffices]
        .filter(isActiveMaster)
        .sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      ),
    [headOffices],
  );

  const editHeadOfficeOptions = useMemo(() => {
    const list = withInactiveSelected(headOffices, editForm.headOfficeId);
    return [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [headOffices, editForm.headOfficeId]);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = String(filters.q || "").trim().toLowerCase();
    return orderedRows.filter((row) => {
      const status = String(row?.status || "ACTIVE").toUpperCase();
      const statusOk = !filters.status || status === String(filters.status).toUpperCase();
      const qOk = !q || String(row?.name || "").toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [orderedRows, filters.q, filters.status]);

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
      await load(filters.headOfficeId);
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
      await load(filters.headOfficeId);
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
      await load(filters.headOfficeId);
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
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setForm((prev) => ({ ...initialForm, headOfficeId: filters.headOfficeId || prev.headOfficeId || "" }));
                setShowAddModal(true);
              }}
            >
              Add Branch
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 >Branch List</h5>
            <button
              type="button"
              className="btn btn-outline-warning leads-toolbar-btn"
              onClick={() => {
                setDraftFilters(filters);
                setFilterOpen(true);
              }}
            >
              <i className="ti ti-filter me-1" />
              Filter
            </button>
          </div>
          {filterOpen && (
            <>
              <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ background: "rgba(0,0,0,0.35)", zIndex: 1048 }}
                onClick={() => setFilterOpen(false)}
              />
              <div
                className="position-fixed top-0 end-0 h-100 bg-white border-start shadow"
                style={{ width: 380, zIndex: 1049 }}
              >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                  <h6 className="mb-0">Filters</h6>
                  <button type="button" className="btn-close" onClick={() => setFilterOpen(false)} />
                </div>

                <div className="p-3">
                  
                  <div className="mb-3">
                    <label className="form-label">Head Office</label>
                    <select
                      className="form-select"
                      value={draftFilters.headOfficeId}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, headOfficeId: e.target.value }))
                      }
                      disabled={metaLoading}
                    >
                      <option value="">All</option>
                      {headOfficeOptions.map((ho) => (
                        <option key={ho.id} value={ho.id}>
                          {ho.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={draftFilters.status}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Search</label>
                    <input
                      className="form-control"
                      value={draftFilters.q}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, q: e.target.value }))
                      }
                      placeholder="Branch name"
                    />
                  </div>
                </div>

                <div className="p-3 border-top d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light w-50"
                    onClick={() => setDraftFilters({ headOfficeId: "", status: "", q: "" })}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setFilters(draftFilters);
                      setFilterOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
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
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No branches found
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
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
                            {editHeadOfficeOptions.map((ho) => (
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
