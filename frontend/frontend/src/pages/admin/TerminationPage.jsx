import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import { createTermination, deleteTermination, getTerminations, updateTermination } from "../../api/terminationApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import "../../../public/assets/css/addModalShared.css";

const initialForm = {
  employeeId: "",
  employeeName: "",
  terminationType: "",
  noticeDate: "",
  reason: "",
  terminationDate: "",
};

export default function TerminationPage() {
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
      const data = await getTerminations();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load terminations"));
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
      terminationType: row?.terminationType || "",
      noticeDate: row?.noticeDate ? String(row.noticeDate).slice(0, 10) : "",
      reason: row?.reason || "",
      terminationDate: row?.terminationDate ? String(row.terminationDate).slice(0, 10) : "",
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
      showError("Terminated employee is required");
      return;
    }
    if (!form.terminationType.trim()) {
      showError("Termination type is required");
      return;
    }
    if (!form.noticeDate || !form.terminationDate) {
      showError("Notice and termination dates are required");
      return;
    }
    if (!form.reason.trim()) {
      showError("Reason is required");
      return;
    }
    setSaving(true);
    try {
      await createTermination({
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        employeeName: form.employeeName.trim(),
        terminationType: form.terminationType.trim(),
        noticeDate: form.noticeDate,
        reason: form.reason.trim(),
        terminationDate: form.terminationDate,
      });
      setForm(initialForm);
      showSuccess("Termination added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add termination"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeName.trim()) {
      showError("Terminated employee is required");
      return;
    }
    if (!editForm.terminationType.trim()) {
      showError("Termination type is required");
      return;
    }
    if (!editForm.noticeDate || !editForm.terminationDate) {
      showError("Notice and termination dates are required");
      return;
    }
    if (!editForm.reason.trim()) {
      showError("Reason is required");
      return;
    }
    setSaving(true);
    try {
      await updateTermination(selectedId, {
        employeeId: editForm.employeeId ? Number(editForm.employeeId) : null,
        employeeName: editForm.employeeName.trim(),
        terminationType: editForm.terminationType.trim(),
        noticeDate: editForm.noticeDate,
        reason: editForm.reason.trim(),
        terminationDate: editForm.terminationDate,
      });
      showSuccess("Termination updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update termination"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteTermination(selectedId);
      showSuccess("Termination deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete termination"));
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
    }));
  };

  return (
    <>
      <div className="content wf-shell">

        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Termination</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Termination
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Termination
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h5 className="d-flex align-items-center">Termination List</h5>
              </div>
              <div className="card-body p-0">
                <div className="custom-datatable-filter table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Resigning Employee</th>
                        <th>Department</th>
                        <th>Termination Type</th>
                        <th>Notice Date</th>
                        <th>Reason</th>
                        <th>Resignation Date</th>
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
                          <td colSpan={7}>No terminations found</td>
                        </tr>
                      ) : (
                        orderedRows.map((row) => (
                          <tr key={row.id || `${row.employeeId}-${row.noticeDate}`}>
                            <td>{row.employeeName || "-"}</td>
                            <td>{row.department || "-"}</td>
                            <td>{row.terminationType || "-"}</td>
                            <td>{formatDate(row.noticeDate)}</td>
                            <td>{row.reason || "-"}</td>
                            <td>{formatDate(row.terminationDate)}</td>
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
        <div className="avm-backdrop" role="presentation">
          <div className="avm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="avm-modal-header">
              <h2 className="avm-modal-title">Add Termination</h2>
              <button type="button" className="avm-modal-close" onClick={() => setShowAddModal(false)} aria-label="Close">x</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="avm-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Terminated Employee</label>
                      <select className="avm-select" value={form.employeeId} onChange={(e) => handleEmployeeChange(e.target.value, setForm)}>
                        <option value="">Select</option>
                        {employeeOptions.map((e) => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Termination Type</label>
                      <input type="text" className="avm-input" value={form.terminationType} onChange={(e) => setForm((prev) => ({ ...prev, terminationType: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Notice Date</label>
                      <input type="date" className="avm-input" value={form.noticeDate} onChange={(e) => setForm((prev) => ({ ...prev, noticeDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Reason</label>
                      <textarea className="avm-input" rows="3" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Resignation Date</label>
                      <input type="date" className="avm-input" value={form.terminationDate} onChange={(e) => setForm((prev) => ({ ...prev, terminationDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="avm-footer">
                <div></div>
                <div className="avm-footer-right">
                  <button type="button" className="avm-btn light" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="avm-btn primary" disabled={saving}>{saving ? "Adding..." : "Add Termination"}</button>
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
              <h2 className="avm-modal-title">Edit Termination</h2>
              <button type="button" className="avm-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">x</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="avm-body">
                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Terminated Employee</label>
                      <select className="avm-select" value={editForm.employeeId} onChange={(e) => handleEmployeeChange(e.target.value, setEditForm)}>
                        <option value="">Select</option>
                        {employeeOptions.map((e) => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Termination Type</label>
                      <input type="text" className="avm-input" value={editForm.terminationType} onChange={(e) => setEditForm((prev) => ({ ...prev, terminationType: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Notice Date</label>
                      <input type="date" className="avm-input" value={editForm.noticeDate} onChange={(e) => setEditForm((prev) => ({ ...prev, noticeDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Reason</label>
                      <textarea className="avm-input" rows="3" value={editForm.reason} onChange={(e) => setEditForm((prev) => ({ ...prev, reason: e.target.value }))} />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="avm-field">
                      <label className="avm-label">Resignation Date</label>
                      <input type="date" className="avm-input" value={editForm.terminationDate} onChange={(e) => setEditForm((prev) => ({ ...prev, terminationDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="avm-footer">
                <div></div>
                <div className="avm-footer-right">
                  <button type="button" className="avm-btn light" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="avm-btn primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
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
              <button type="button" className="avm-modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close">x</button>
            </div>
            <div className="avm-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                <i className="ti ti-trash-x fs-36"></i>
              </span>
              <h4 className="mb-1">Confirm Delete</h4>
              <p className="mb-3">You want to delete this termination, this cant be undone once you delete.</p>
            </div>
            <div className="avm-footer">
              <div></div>
              <div className="avm-footer-right">
                <button type="button" className="avm-btn light" onClick={() => setShowDeleteModal(false)} disabled={saving}>Cancel</button>
                <button type="button" className="avm-btn danger" onClick={handleDelete} disabled={saving}>{saving ? "Deleting..." : "Yes, Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
