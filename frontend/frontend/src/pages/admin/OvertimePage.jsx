import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import {
  createOvertime,
  deleteOvertime,
  getOvertimes,
  updateOvertime,
} from "../../api/overtimeApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  employeeId: "",
  overtimeDate: "",
  overtimeHours: "",
  remainingHours: "",
  projectName: "",
  approvedBy: "",
  description: "",
  status: "Pending",
};

export default function OvertimePage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const data = await getOvertimes();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load overtime"));
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmployees([]);
      showError(extractApiErrorMessage(e, "Failed to load employees"));
    }
  };

  useEffect(() => {
    load();
    loadEmployees();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(b.overtimeDate || "").localeCompare(String(a.overtimeDate || ""))),
    [rows],
  );

  const employeeOptions = useMemo(
    () =>
      (employees || [])
        .map((e) => ({
          id: e?.id,
          name: e?.name || e?.employeeName || e?.fullName || "",
          dept: e?.dept || e?.department || "",
        }))
        .filter((e) => e.id != null && e.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );

  const openAdd = () => {
    setForm(initialForm);
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      employeeId: row?.employeeId ? String(row.employeeId) : "",
      overtimeDate: row?.overtimeDate ? String(row.overtimeDate).slice(0, 10) : "",
      overtimeHours: row?.overtimeHours != null ? String(row.overtimeHours) : "",
      remainingHours: row?.remainingHours != null ? String(row.remainingHours) : "",
      projectName: row?.projectName || "",
      approvedBy: row?.approvedBy || "",
      description: row?.description || "",
      status: row?.status || "Pending",
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
    if (!form.employeeId || !form.overtimeDate || !form.overtimeHours) {
      showError("Employee, overtime date and hours are required");
      return;
    }
    setSaving(true);
    try {
      await createOvertime({
        employeeId: Number(form.employeeId),
        overtimeDate: form.overtimeDate || null,
        overtimeHours: form.overtimeHours ? Number(form.overtimeHours) : null,
        remainingHours: form.remainingHours ? Number(form.remainingHours) : null,
        projectName: form.projectName?.trim() || "",
        approvedBy: form.approvedBy?.trim() || "",
        description: form.description?.trim() || "",
        status: form.status || "Pending",
      });
      setForm(initialForm);
      showSuccess("Overtime added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add overtime"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeId || !editForm.overtimeDate || !editForm.overtimeHours) {
      showError("Employee, overtime date and hours are required");
      return;
    }
    setSaving(true);
    try {
      await updateOvertime(selectedId, {
        employeeId: Number(editForm.employeeId),
        overtimeDate: editForm.overtimeDate || null,
        overtimeHours: editForm.overtimeHours ? Number(editForm.overtimeHours) : null,
        remainingHours: editForm.remainingHours ? Number(editForm.remainingHours) : null,
        projectName: editForm.projectName?.trim() || "",
        approvedBy: editForm.approvedBy?.trim() || "",
        description: editForm.description?.trim() || "",
        status: editForm.status || "Pending",
      });
      showSuccess("Overtime updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update overtime"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteOvertime(selectedId);
      showSuccess("Overtime deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete overtime"));
    } finally {
      setSaving(false);
    }
  };

  const resolveEmployee = (row) => {
    if (row?.employeeName) return { name: row.employeeName, dept: row.employeeDept || "" };
    const match = employeeOptions.find((e) => e.id === row?.employeeId);
    return match || { name: "-", dept: "" };
  };

  const renderStatus = (status) => {
    const val = String(status || "Pending").toLowerCase();
    if (val === "rejected") {
      return (
        <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1"></i>Rejected
        </span>
      );
    }
    if (val === "accepted") {
      return (
        <span className="badge badge-success d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1"></i>Accepted
        </span>
      );
    }
    return (
      <span className="badge badge-warning d-inline-flex align-items-center badge-xs">
        <i className="ti ti-point-filled me-1"></i>Pending
      </span>
    );
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Overtime</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">Overtime</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Overtime
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Overtime</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Overtime Hours</th>
                    <th>Project</th>
                    <th>Approved By</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7}>Loading...</td>
                    </tr>
                  ) : orderedRows.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No overtime records found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => {
                      const emp = resolveEmployee(row);
                      return (
                        <tr key={row.id || `${row.employeeId || "emp"}-${row.overtimeDate || "date"}`}>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <div className="ms-2">
                                <h6 className="fw-medium">{emp.name || "-"}</h6>
                                <span className="fs-12 fw-normal ">{emp.dept || ""}</span>
                              </div>
                            </div>
                          </td>
                          <td>{row.overtimeDate || "-"}</td>
                          <td>{row.overtimeHours ?? "-"}</td>
                          <td>{row.projectName || "-"}</td>
                          <td>{row.approvedBy || "-"}</td>
                          <td>{renderStatus(row.status)}</td>
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Overtime</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Employee <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            value={form.employeeId}
                            onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
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
                          <label className="form-label">Overtime Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.overtimeDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, overtimeDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Overtime Hours <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.overtimeHours}
                            onChange={(e) => setForm((prev) => ({ ...prev, overtimeHours: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Remaining Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.remainingHours}
                            onChange={(e) => setForm((prev) => ({ ...prev, remainingHours: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Project</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.projectName}
                            onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Approved By</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.approvedBy}
                            onChange={(e) => setForm((prev) => ({ ...prev, approvedBy: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
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
                      {saving ? "Adding..." : "Add Overtime"}
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Edit Overtime</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Employee <span className="text-danger">*</span></label>
                          <select
                            className="form-select"
                            value={editForm.employeeId}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, employeeId: e.target.value }))}
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
                          <label className="form-label">Overtime Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.overtimeDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, overtimeDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Overtime Hours <span className="text-danger">*</span></label>
                          <input
                            type="number"
                            className="form-control"
                            value={editForm.overtimeHours}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, overtimeHours: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Remaining Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editForm.remainingHours}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, remainingHours: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Project</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.projectName}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, projectName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Approved By</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.approvedBy}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, approvedBy: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={editForm.description}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
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
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
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
                <div className="modal-body text-center">
                  <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                    <i className="ti ti-trash-x fs-36"></i>
                  </span>
                  <h4 className="mb-1">Confirm Delete</h4>
                  <p className="mb-3">You want to delete this overtime, this cant be undone once you delete.</p>
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
