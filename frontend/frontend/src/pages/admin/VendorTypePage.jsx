import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getVendorTypes,
  createVendorType,
  updateVendorType,
  deleteVendorType,
} from "../../api/vendorTypesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = { typeName: "" };

export default function VendorTypePage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [emptyNoticeShown, setEmptyNoticeShown] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getVendorTypes();
      setRows(Array.isArray(data) ? data : []);
      if ((!data || data.length === 0) && !emptyNoticeShown) {
        showSuccess("No vendor types added yet", { title: "Vendor Types" });
        setEmptyNoticeShown(true);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 500) {
        setRows([]);
        if (!emptyNoticeShown) {
          showSuccess("No vendor types added yet", { title: "Vendor Types" });
          setEmptyNoticeShown(true);
        }
      } else {
        setRows([]);
        const message = extractApiErrorMessage(e, "Failed to load vendor types");
        showError(message, { title: "Vendor Types" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => (r.typeName || "").toLowerCase().includes(q));
  }, [rows, search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.typeName.trim()) {
      showError("Type name is required", { title: "Vendor Types" });
      return;
    }
    setSaving(true);
    try {
      await createVendorType({ typeName: form.typeName.trim() });
      setForm(initialForm);
      showSuccess("Vendor type added successfully", { title: "Vendor Types" });
      setShowAddModal(false);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to add vendor type");
      showError(message, { title: "Vendor Types" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({ typeName: row.typeName || "" });
    setSelectedId(row.id);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.typeName.trim()) {
      showError("Type name is required", { title: "Vendor Types" });
      return;
    }
    setSaving(true);
    try {
      await updateVendorType(selectedId, { typeName: editForm.typeName.trim() });
      showSuccess("Vendor type updated successfully", { title: "Vendor Types" });
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to update vendor type");
      showError(message, { title: "Vendor Types" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row);
    setSelectedId(row.id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteVendorType(selectedId);
      showSuccess("Vendor type deleted", { title: "Vendor Types" });
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      const message = extractApiErrorMessage(e2, "Failed to delete vendor type");
      showError(message, { title: "Vendor Types" });
    } finally {
      setSaving(false);
    }
  };

  const closeBtn = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Vendor Types</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/stocks/vendor-types">Vendor Types</Link>
                </li>
                <li className="breadcrumb-item active">Vendor Types</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setForm(initialForm);
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Type
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Type List</h5>
            <span className="badge bg-primary">{filteredRows.length} type{filteredRows.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Type Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3}>Loading...</td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={3}>No vendor types found</td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={row.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">{row.typeName || "—"}</td>
                        <td>
                          <div className="action-icon d-inline-flex">
                            <button
                              type="button"
                              className="btn btn-link p-0 me-2"
                              onClick={() => openEdit(row)}
                              aria-label="Edit type"
                            >
                              <i className="ti ti-edit"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-danger"
                              onClick={() => confirmDelete(row)}
                              aria-label="Delete type"
                            >
                              <i className="ti ti-trash"></i>
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

      {/* Add/Edit/Delete modals are similar to previous pages */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Vendor Type</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    {closeBtn}
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Type Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.typeName}
                            onChange={(e) => setForm((p) => ({ ...p, typeName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {showEditModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Vendor Type</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    {closeBtn}
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Type Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.typeName}
                            onChange={(e) => setEditForm((p) => ({ ...p, typeName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
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
                    {closeBtn}
                  </button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete "{deleteTarget?.typeName}"?
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? "Deleting..." : "Delete"}
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
