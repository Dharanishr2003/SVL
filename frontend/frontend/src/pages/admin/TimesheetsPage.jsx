import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import {
  createTimesheet,
  deleteTimesheet,
  getTimesheets,
  updateTimesheet,
} from "../../api/timesheetsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  employeeId: "",
  projectName: "",
  deadline: "",
  totalHours: "",
  remainingHours: "",
  workDate: "",
  workedHours: "",
};

export default function TimesheetsPage() {
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
      const data = await getTimesheets();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load timesheets"));
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
    () => [...rows].sort((a, b) => String(b.workDate || "").localeCompare(String(a.workDate || ""))),
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
      projectName: row?.projectName || "",
      deadline: row?.deadline ? String(row.deadline).slice(0, 10) : "",
      totalHours: row?.totalHours != null ? String(row.totalHours) : "",
      remainingHours: row?.remainingHours != null ? String(row.remainingHours) : "",
      workDate: row?.workDate ? String(row.workDate).slice(0, 10) : "",
      workedHours: row?.workedHours != null ? String(row.workedHours) : "",
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
    if (!form.employeeId || !form.projectName || !form.workDate) {
      showError("Employee, project and date are required");
      return;
    }
    setSaving(true);
    try {
      await createTimesheet({
        employeeId: Number(form.employeeId),
        projectName: form.projectName.trim(),
        deadline: form.deadline || null,
        totalHours: form.totalHours ? Number(form.totalHours) : null,
        remainingHours: form.remainingHours ? Number(form.remainingHours) : null,
        workDate: form.workDate || null,
        workedHours: form.workedHours ? Number(form.workedHours) : null,
      });
      setForm(initialForm);
      showSuccess("Timesheet added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add timesheet"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeId || !editForm.projectName || !editForm.workDate) {
      showError("Employee, project and date are required");
      return;
    }
    setSaving(true);
    try {
      await updateTimesheet(selectedId, {
        employeeId: Number(editForm.employeeId),
        projectName: editForm.projectName.trim(),
        deadline: editForm.deadline || null,
        totalHours: editForm.totalHours ? Number(editForm.totalHours) : null,
        remainingHours: editForm.remainingHours ? Number(editForm.remainingHours) : null,
        workDate: editForm.workDate || null,
        workedHours: editForm.workedHours ? Number(editForm.workedHours) : null,
      });
      showSuccess("Timesheet updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update timesheet"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteTimesheet(selectedId);
      showSuccess("Timesheet deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete timesheet"));
    } finally {
      setSaving(false);
    }
  };

  const resolveEmployee = (row) => {
    if (row?.employeeName) return { name: row.employeeName, dept: row.employeeDept || row.employeeDesignation || "" };
    const match = employeeOptions.find((e) => e.id === row?.employeeId);
    return match || { name: "-", dept: "" };
  };

  return (
    <>
      <div className="content">

        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Timesheets</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">Timesheets</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Today&#39;s Work
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Timesheet</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Assigned Hours</th>
                    <th>Worked Hours</th>
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
                      <td colSpan={6}>No timesheets found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => {
                      const emp = resolveEmployee(row);
                      return (
                        <tr key={row.id || `${row.employeeId || "emp"}-${row.workDate || "date"}`}>
                          <td>
                            <div className="d-flex align-items-center file-name-icon">
                              <div className="ms-2">
                                <h6 className="fw-medium">{emp.name || "-"}</h6>
                                <span className="fs-12 fw-normal ">{emp.dept || ""}</span>
                              </div>
                            </div>
                          </td>
                          <td>{row.workDate || "-"}</td>
                          <td>{row.projectName || "-"}</td>
                          <td>{row.totalHours ?? "-"}</td>
                          <td>{row.workedHours ?? "-"}</td>
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
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Todays Work</h4>
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
                          <label className="form-label">Project <span className="text-danger">*</span></label>
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
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.deadline}
                            onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Total Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.totalHours}
                            onChange={(e) => setForm((prev) => ({ ...prev, totalHours: e.target.value }))}
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.workDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, workDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={form.workedHours}
                            onChange={(e) => setForm((prev) => ({ ...prev, workedHours: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Adding..." : "Add Changes"}
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
                  <h4 className="modal-title">Edit Todays Work</h4>
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
                          <label className="form-label">Project <span className="text-danger">*</span></label>
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
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.deadline}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, deadline: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Total Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editForm.totalHours}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, totalHours: e.target.value }))}
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date <span className="text-danger">*</span></label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.workDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, workDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Hours</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editForm.workedHours}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, workedHours: e.target.value }))}
                          />
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
                  <p className="mb-3">You want to delete this timesheet, this cant be undone once you delete.</p>
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
