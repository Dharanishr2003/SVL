import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import { createLeavePolicy, deleteLeavePolicy, getLeavePolicies, updateLeavePolicy } from "../../api/leaveSettingsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import "../../../public/assets/css/addModalShared.css";

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
  const [employeeSearch, setEmployeeSearch] = useState("");
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

  const filteredEmployeeOptions = useMemo(() => {
    const term = String(employeeSearch || "").trim().toLowerCase();
    if (!term) return employeeOptions;
    return employeeOptions.filter((emp) => String(emp.name || "").toLowerCase().includes(term));
  }, [employeeOptions, employeeSearch]);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const openAdd = () => {
    setForm(initialForm);
    setEmployeeSearch("");
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      name: row?.name || "",
      daysPerYear: row?.daysPerYear ?? "",
      employeeIds: Array.isArray(row?.employeeIds) ? row.employeeIds : [],
    });
    setEmployeeSearch("");
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
      <input
        type="text"
        className="form-control form-control-sm mb-2"
        placeholder="Search employee..."
        value={employeeSearch}
        onChange={(e) => setEmployeeSearch(e.target.value)}
      />
      {filteredEmployeeOptions.length === 0 ? (
        <div className="text-muted">No employees</div>
      ) : (
        filteredEmployeeOptions.map((emp) => {
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
        <div className="avm-backdrop" role="presentation">
          <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="avm-modal-header">
              <h2 className="avm-modal-title">Add Policy</h2>
              <button type="button" className="avm-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">
                x
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="avm-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="avm-field">
                      <label className="avm-label">Policy Name</label>
                      <input
                        type="text"
                        className="avm-input"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="avm-field">
                      <label className="avm-label">No of Days</label>
                      <input
                        type="number"
                        min="0"
                        className="avm-input"
                        value={form.daysPerYear}
                        onChange={(e) => setForm((prev) => ({ ...prev, daysPerYear: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Members</label>
                      {renderEmployeeList(form.employeeIds, setForm)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="avm-footer">
                <div></div>
                <div className="avm-footer-right">
                  <button type="button" className="avm-btn light" onClick={() => setShowAddModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="avm-btn primary" disabled={saving}>
                    {saving ? "Adding..." : "Add Policy"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="avm-backdrop" role="presentation">
          <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="avm-modal-header">
              <h2 className="avm-modal-title">Edit Policy</h2>
              <button type="button" className="avm-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                x
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="avm-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="avm-field">
                      <label className="avm-label">Policy Name</label>
                      <input
                        type="text"
                        className="avm-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="avm-field">
                      <label className="avm-label">No of Days</label>
                      <input
                        type="number"
                        min="0"
                        className="avm-input"
                        value={editForm.daysPerYear}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, daysPerYear: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Members</label>
                      {renderEmployeeList(editForm.employeeIds, setEditForm)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="avm-footer">
                <div></div>
                <div className="avm-footer-right">
                  <button type="button" className="avm-btn light" onClick={() => setShowEditModal(false)} disabled={saving}>
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
      )}

      {showDeleteModal && (
        <div className="avm-backdrop" role="presentation">
          <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="avm-modal-header">
              <h2 className="avm-modal-title">Confirm Delete</h2>
              <button type="button" className="avm-modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close">
                x
              </button>
            </div>
            <div className="avm-body">
              <p>
                Are you sure you want to delete
                {deleteTarget?.name ? ` "${deleteTarget.name}"` : " this policy"}
                ?
              </p>
            </div>
            <div className="avm-footer">
              <div></div>
              <div className="avm-footer-right">
                <button type="button" className="avm-btn light" onClick={() => setShowDeleteModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="avm-btn danger" onClick={handleDelete} disabled={saving}>
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
