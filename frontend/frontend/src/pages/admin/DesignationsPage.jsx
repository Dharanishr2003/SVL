import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createDesignation,
  deleteDesignation,
  getDesignations,
  updateDesignation,
} from "../../api/designationsApi";
import { getDepartmentsMaster } from "../../api/departmentsApi";
import { getEmployees } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  name: "",
  department: "",
  status: "ACTIVE",
};

export default function DesignationsPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDesignations();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load designations"));
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

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    load();
    loadMeta();
    loadEmployees();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const departmentOptions = useMemo(() => {
    const names = (departments || [])
      .map((d) => d?.name)
      .filter((v) => typeof v === "string" && v.trim().length > 0);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [departments]);

  const designationCounts = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      const d = String(e?.designation || "").trim();
      if (!d) return;
      map.set(d.toLowerCase(), (map.get(d.toLowerCase()) || 0) + 1);
    });
    return map;
  }, [employees]);

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Designation name is required");
      return;
    }
    if (!form.department.trim()) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      await createDesignation({
        name: form.name.trim(),
        department: form.department.trim(),
        status: form.status,
      });
      setForm(initialForm);
      showSuccess("Designation added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add designation"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      name: row?.name || "",
      department: row?.department || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEditDesignation = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.name.trim()) {
      showError("Designation name is required");
      return;
    }
    if (!editForm.department.trim()) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      await updateDesignation(selectedId, {
        name: editForm.name.trim(),
        department: editForm.department.trim(),
        status: editForm.status,
      });
      showSuccess("Designation updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update designation"));
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
      await deleteDesignation(selectedId);
      showSuccess("Designation deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete designation"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Designations</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active">Designations</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => setShowAddModal(true)}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Designation
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5>Designation List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>No of Employees</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  ) : orderedRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No designations found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => {
                      const active = String(row?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
                      return (
                        <tr key={row.id || `${row.name}-${row.department}`}>
                          <td>{row.name || "-"}</td>
                          <td>{row.department || "-"}</td>
                          <td>
                            {designationCounts.get(String(row.name || "").trim().toLowerCase()) ??
                              row.employeeCount ??
                              row.noOfEmployees ??
                              0}
                          </td>
                          <td>
                            <span
                              className={`badge d-inline-flex align-items-center badge-xs ${
                                active ? "badge-success" : "badge-danger"
                              }`}
                            >
                              <i className="ti ti-point-filled me-1"></i>
                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="action-icon d-inline-flex">
                              <button
                                type="button"
                                className="btn btn-link p-0 me-2"
                                onClick={() => openEdit(row)}
                                aria-label="Edit designation"
                              >
                                <i className="ti ti-edit"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() => confirmDelete(row)}
                                aria-label="Delete designation"
                              >
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Designation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddDesignation}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Designation Name</label>
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
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={form.department}
                            onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {departmentOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
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
                      {saving ? "Adding..." : "Add Designation"}
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
                  <h4 className="modal-title">Edit Designation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditDesignation}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Designation Name</label>
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
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={editForm.department}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {editForm.department &&
                              !departmentOptions.includes(editForm.department) && (
                                <option value={editForm.department}>{editForm.department}</option>
                              )}
                            {departmentOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
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
                    {deleteTarget?.name ? ` "${deleteTarget.name}"` : " this designation"}
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
    </>
  );
}
