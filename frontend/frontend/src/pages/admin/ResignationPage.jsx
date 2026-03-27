import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import { createResignation, deleteResignation, getResignations, updateResignation } from "../../api/resignationApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  employeeId: "",
  employeeName: "",
  department: "",
  reason: "",
  noticeDate: "",
  resignationDate: "",
};

export default function ResignationPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const data = await getResignations();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load resignations"));
    } finally {
      setLoading(false);
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
    loadEmployees();
  }, []);

  const employeeOptions = useMemo(
    () =>
      (employees || [])
        .map((e) => ({
          id: e?.id,
          name: e?.name || e?.employeeName || e?.fullName || "",
          department: e?.dept || e?.department || "",
        }))
        .filter((e) => e.id != null && e.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(b.noticeDate || "").localeCompare(String(a.noticeDate || ""))),
    [rows],
  );

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

  const openAdd = () => {
    setForm(initialForm);
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      employeeId: row?.employeeId ? String(row.employeeId) : "",
      employeeName: row?.employeeName || "",
      department: row?.department || "",
      reason: row?.reason || "",
      noticeDate: row?.noticeDate ? String(row.noticeDate).slice(0, 10) : "",
      resignationDate: row?.resignationDate ? String(row.resignationDate).slice(0, 10) : "",
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row || null);
    setSelectedId(row?.id || null);
    setShowDeleteModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employeeName.trim()) {
      showError("Resigning employee is required");
      return;
    }
    if (!form.department.trim()) {
      showError("Department is required");
      return;
    }
    if (!form.reason.trim()) {
      showError("Reason is required");
      return;
    }
    if (!form.noticeDate || !form.resignationDate) {
      showError("Notice and resignation dates are required");
      return;
    }
    setSaving(true);
    try {
      await createResignation({
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        employeeName: form.employeeName.trim(),
        department: form.department.trim(),
        reason: form.reason.trim(),
        noticeDate: form.noticeDate,
        resignationDate: form.resignationDate,
      });
      setForm(initialForm);
      showSuccess("Resignation added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add resignation"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeName.trim()) {
      showError("Resigning employee is required");
      return;
    }
    if (!editForm.department.trim()) {
      showError("Department is required");
      return;
    }
    if (!editForm.reason.trim()) {
      showError("Reason is required");
      return;
    }
    if (!editForm.noticeDate || !editForm.resignationDate) {
      showError("Notice and resignation dates are required");
      return;
    }
    setSaving(true);
    try {
      await updateResignation(selectedId, {
        employeeId: editForm.employeeId ? Number(editForm.employeeId) : null,
        employeeName: editForm.employeeName.trim(),
        department: editForm.department.trim(),
        reason: editForm.reason.trim(),
        noticeDate: editForm.noticeDate,
        resignationDate: editForm.resignationDate,
      });
      showSuccess("Resignation updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update resignation"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteResignation(selectedId);
      showSuccess("Resignation deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete resignation"));
    } finally {
      setSaving(false);
    }
  };

  const handleEmployeeChange = (value, setter) => {
    const match = employeeOptions.find((e) => String(e.id) === String(value));
    setter((prev) => ({
      ...prev,
      employeeId: value,
      employeeName: match?.name || "",
      department: match?.department || "",
    }));
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Resignation</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Resignation
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Resignation
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h5 className="d-flex align-items-center">Resignation List</h5>
              </div>
              <div className="card-body p-0">
                <div className="custom-datatable-filter table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Resigning Employee</th>
                        <th>Department</th>
                        <th>Reason</th>
                        <th>Notice Date</th>
                        <th>Resignation Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6}>Loading...</td>
                        </tr>
                      ) : orderedRows.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No resignations found</td>
                        </tr>
                      ) : (
                        orderedRows.map((row) => (
                          <tr key={row.id || `${row.employeeId}-${row.noticeDate}`}>
                            <td>{row.employeeName || "-"}</td>
                            <td>{row.department || "-"}</td>
                            <td>{row.reason || "-"}</td>
                            <td>{formatDate(row.noticeDate)}</td>
                            <td>{formatDate(row.resignationDate)}</td>
                            <td>
                              <div className="d-inline-flex gap-2">
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEdit(row)}>
                                  Edit
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(row)}>
                                  Delete
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
        </div>
      </div>

      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Resignation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Resigning Employee</label>
                          <select
                            className="form-select"
                            value={form.employeeId}
                            onChange={(e) => handleEmployeeChange(e.target.value, setForm)}
                          >
                            <option value="">Select</option>
                            {employeeOptions.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <input type="text" className="form-control" value={form.department} readOnly />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Notice Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.noticeDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, noticeDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Resignation Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.resignationDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, resignationDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Reason</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.reason}
                            onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
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
                      {saving ? "Adding..." : "Add Resignation"}
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
                  <h4 className="modal-title">Edit Resignation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Resigning Employee</label>
                          <select
                            className="form-select"
                            value={editForm.employeeId}
                            onChange={(e) => handleEmployeeChange(e.target.value, setEditForm)}
                          >
                            <option value="">Select</option>
                            {employeeOptions.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <input type="text" className="form-control" value={editForm.department} readOnly />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Notice Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.noticeDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, noticeDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Resignation Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.resignationDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, resignationDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Reason</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editForm.reason}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))}
                          />
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
                <div className="modal-body text-center">
                  <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                    <i className="ti ti-trash-x fs-36"></i>
                  </span>
                  <h4 className="mb-1">Confirm Delete</h4>
                  <p className="mb-3">You want to delete this resignation, this cant be undone once you delete.</p>
                  <div className="d-flex justify-content-center">
                    <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                      {saving ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
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
