import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import { createLeavePolicy, deleteLeavePolicy, getLeavePolicies, updateLeavePolicy } from "../../api/leaveSettingsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  name: "",
  daysPerYear: "",
  employeeIds: [],
};

export default function LeaveSettingsPage() {
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
      const data = await getLeavePolicies();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load leave policies"));
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
        }))
        .filter((e) => e.id != null && e.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const openAdd = () => {
    setForm(initialForm);
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      name: row?.name || "",
      daysPerYear: row?.daysPerYear ?? "",
      employeeIds: Array.isArray(row?.employeeIds) ? row.employeeIds : [],
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row || null);
    setSelectedId(row?.id || null);
    setShowDeleteModal(true);
  };

  const toggleEmployee = (setFn, currentIds, id) => {
    if (currentIds.includes(id)) {
      setFn(currentIds.filter((v) => v !== id));
    } else {
      setFn([...currentIds, id]);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Policy name is required");
      return;
    }
    const days = Number(form.daysPerYear);
    if (!Number.isFinite(days) || days < 0) {
      showError("Days must be a valid number");
      return;
    }
    setSaving(true);
    try {
      await createLeavePolicy({
        name: form.name.trim(),
        daysPerYear: days,
        employeeIds: form.employeeIds,
      });
      setForm(initialForm);
      showSuccess("Policy added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add policy"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.name.trim()) {
      showError("Policy name is required");
      return;
    }
    const days = Number(editForm.daysPerYear);
    if (!Number.isFinite(days) || days < 0) {
      showError("Days must be a valid number");
      return;
    }
    setSaving(true);
    try {
      await updateLeavePolicy(selectedId, {
        name: editForm.name.trim(),
        daysPerYear: days,
        employeeIds: editForm.employeeIds,
      });
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

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteLeavePolicy(selectedId);
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

  const renderEmployeeList = (currentIds, setIds) => (
    <div className="border rounded p-2" style={{ maxHeight: 220, overflowY: "auto" }}>
      {employeeOptions.length === 0 ? (
        <div className="text-muted">No employees</div>
      ) : (
        employeeOptions.map((emp) => {
          const id = Number(emp.id);
          const checked = currentIds.includes(id);
          return (
            <div className="form-check" key={id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`emp-${id}-${setIds === setEditForm ? "edit" : "add"}`}
                checked={checked}
                onChange={() =>
                  toggleEmployee(
                    (next) =>
                      setIds((prev) => ({
                        ...prev,
                        employeeIds: next,
                      })),
                    currentIds,
                    id,
                  )
                }
              />
              <label className="form-check-label" htmlFor={`emp-${id}-${setIds === setEditForm ? "edit" : "add"}`}>
                {emp.name}
              </label>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <div className="content">

        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Leave Policy</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active">Leave Policy</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2">
            <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
              <i className="ti ti-circle-plus me-2"></i>Add Policy
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5>Policy List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Policy Name</th>
                    <th>No of Days</th>
                    <th>No of Members</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  ) : orderedRows.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No policies found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => (
                      <tr key={row.id || row.name}>
                        <td>
                          <h6 className="fs-14 fw-medium text-gray-9">{row.name || "-"}</h6>
                        </td>
                        <td>{row.daysPerYear ?? "-"}</td>
                        <td>{Array.isArray(row.employeeIds) ? row.employeeIds.length : 0}</td>
                        <td>
                          <div className="d-inline-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEdit(row)}
                              aria-label="Edit policy"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => confirmDelete(row)}
                              aria-label="Delete policy"
                            >
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
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6">
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">No of Days</label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={form.daysPerYear}
                            onChange={(e) => setForm((prev) => ({ ...prev, daysPerYear: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Members</label>
                          {renderEmployeeList(form.employeeIds, setForm)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>
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
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6">
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">No of Days</label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={editForm.daysPerYear}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, daysPerYear: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Members</label>
                          {renderEmployeeList(editForm.employeeIds, setEditForm)}
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
    </>
  );
}
