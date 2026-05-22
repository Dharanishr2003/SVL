import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createHeadOffice,
  deleteHeadOffice,
  getHeadOffices,
  updateHeadOffice,
} from "../../api/headOfficesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import "../../../public/assets/css/addModalShared.css";

const initialForm = {
  name: "",
  location: "",
  status: "ACTIVE",
};

function AddHeadOfficeModal({ form, saving, onClose, onSubmit, onFormChange }) {
  return (
    <div className="avm-backdrop" role="presentation">
      <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="avm-modal-header">
          <h2 className="avm-modal-title">Add Head Office</h2>
          <button type="button" className="avm-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="avm-body">
            <div className="row g-3">
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">
                    Head Office Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="avm-input"
                    value={form.name}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">Location</label>
                  <input
                    type="text"
                    className="avm-input"
                    value={form.location}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">Status</label>
                  <select
                    className="avm-select"
                    value={form.status}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="avm-footer">
            <div />
            <div className="avm-footer-right">
              <button type="button" className="avm-btn light" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="avm-btn primary" disabled={saving}>
                {saving ? "Adding..." : "Add Head Office"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditHeadOfficeModal({ form, saving, onClose, onSubmit, onFormChange }) {
  return (
    <div className="avm-backdrop" role="presentation">
      <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="avm-modal-header">
          <h2 className="avm-modal-title">Edit Head Office</h2>
          <button type="button" className="avm-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="avm-body">
            <div className="row g-3">
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">
                    Head Office Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="avm-input"
                    value={form.name}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">Location</label>
                  <input
                    type="text"
                    className="avm-input"
                    value={form.location}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="avm-field">
                  <label className="avm-label">Status</label>
                  <select
                    className="avm-select"
                    value={form.status}
                    onChange={(e) => onFormChange((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="avm-footer">
            <div />
            <div className="avm-footer-right">
              <button type="button" className="avm-btn light" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="avm-btn primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteHeadOfficeModal({ deleteTarget, saving, onClose, onDelete }) {
  return (
    <div className="avm-backdrop" role="presentation">
      <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="avm-modal-header">
          <h2 className="avm-modal-title">Confirm Delete</h2>
          <button type="button" className="avm-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="avm-body">
          <p>
            Are you sure you want to delete{" "}
            {deleteTarget?.name ? `"${deleteTarget.name}"` : "this head office"}?
          </p>
        </div>
        <div className="avm-footer">
          <div />
          <div className="avm-footer-right">
            <button type="button" className="avm-btn light" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="avm-btn primary" onClick={onDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeadOfficesPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHeadOffices();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load head offices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Head Office name is required");
      return;
    }
    setSaving(true);
    try {
      await createHeadOffice({
        name: form.name.trim(),
        location: form.location?.trim() || "",
        status: form.status,
      });
      showSuccess("Head Office added");
      setForm(initialForm);
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add head office"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      name: row?.name || "",
      location: row?.location || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.name.trim()) {
      showError("Head Office name is required");
      return;
    }
    setSaving(true);
    try {
      await updateHeadOffice(selectedId, {
        name: editForm.name.trim(),
        location: editForm.location?.trim() || "",
        status: editForm.status,
      });
      showSuccess("Head Office updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update head office"));
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
      await deleteHeadOffice(selectedId);
      showSuccess("Head Office deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete head office"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Head Offices</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Head Offices
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center">
            <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Add Head Office
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
                      <th>Name</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No head offices found
                        </td>
                      </tr>
                    ) : (
                      orderedRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.location || "-"}</td>
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
                            <button
                              type="button"
                              className="btn btn-sm btn-light me-2"
                              onClick={() => openEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => confirmDelete(row)}
                            >
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
        <AddHeadOfficeModal
          form={form}
          saving={saving}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          onFormChange={setForm}
        />
      )}
      {showEditModal && (
        <EditHeadOfficeModal
          form={editForm}
          saving={saving}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          onFormChange={setEditForm}
        />
      )}
      {showDeleteModal && (
        <DeleteHeadOfficeModal
          deleteTarget={deleteTarget}
          saving={saving}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
