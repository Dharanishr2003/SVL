import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createGoalTracking,
  deleteGoalTracking,
  getGoalTrackingList,
  updateGoalTracking,
} from "../../api/goalTrackingApi";
import { getGoalTypes } from "../../api/goalTypeApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  goalType: "",
  subject: "",
  targetAchievement: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "Active",
  progressPercent: "0",
};

export default function GoalTrackingPage() {
  const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState([]);
  const [goalTypes, setGoalTypes] = useState([]);
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
      const data = await getGoalTrackingList();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load goals"));
    } finally {
      setLoading(false);
    }
  };

  const loadGoalTypes = async () => {
    try {
      const data = await getGoalTypes();
      setGoalTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setGoalTypes([]);
      showError(extractApiErrorMessage(e, "Failed to load goal types"));
    }
  };

  useEffect(() => {
    load();
    loadGoalTypes();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || ""))),
    [rows],
  );

  const goalTypeOptions = useMemo(
    () =>
      (goalTypes || [])
        .map((g) => ({ id: g?.id, name: g?.name }))
        .filter((g) => g.id != null && g.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [goalTypes],
  );

  const openAdd = () => {
    setForm(initialForm);
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      goalType: row?.goalType || "",
      subject: row?.subject || "",
      targetAchievement: row?.targetAchievement || "",
      startDate: row?.startDate ? String(row.startDate).slice(0, 10) : "",
      endDate: row?.endDate ? String(row.endDate).slice(0, 10) : "",
      description: row?.description || "",
      status: row?.status || "Active",
      progressPercent: row?.progressPercent != null ? String(row.progressPercent) : "0",
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row || null);
    setSelectedId(row?.id || null);
    setShowDeleteModal(true);
  };

  const normalizeProgress = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    if (num < 0) return 0;
    if (num > 100) return 100;
    return Math.round(num);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.goalType || !form.subject) {
      showError("Goal type and subject are required");
      return;
    }
    setSaving(true);
    try {
      await createGoalTracking({
        goalType: form.goalType.trim(),
        subject: form.subject.trim(),
        targetAchievement: form.targetAchievement?.trim() || "",
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        description: form.description?.trim() || "",
        status: form.status || "Active",
        progressPercent: normalizeProgress(form.progressPercent),
      });
      setForm(initialForm);
      showSuccess("Goal added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add goal"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.goalType || !editForm.subject) {
      showError("Goal type and subject are required");
      return;
    }
    setSaving(true);
    try {
      await updateGoalTracking(selectedId, {
        goalType: editForm.goalType.trim(),
        subject: editForm.subject.trim(),
        targetAchievement: editForm.targetAchievement?.trim() || "",
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        description: editForm.description?.trim() || "",
        status: editForm.status || "Active",
        progressPercent: normalizeProgress(editForm.progressPercent),
      });
      showSuccess("Goal updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update goal"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deleteGoalTracking(selectedId);
      showSuccess("Goal deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete goal"));
    } finally {
      setSaving(false);
    }
  };

  const renderStatus = (status) => {
    if (String(status || "Active").toLowerCase() === "inactive") {
      return (
        <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
          <i className="ti ti-point-filled me-1"></i>Inactive
        </span>
      );
    }
    return (
      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
        <i className="ti ti-point-filled me-1"></i>Active
      </span>
    );
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Goal Tracking</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">Goal Tracking</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Goal
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Goal Tracking List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Goal Type</th>
                    <th>Subject</th>
                    <th>Target Achievement</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9}>Loading...</td>
                    </tr>
                  ) : orderedRows.length === 0 ? (
                    <tr>
                      <td colSpan={9}>No goals found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => (
                      <tr key={row.id || `${row.goalType || "goal"}-${row.subject || "item"}`}>
                        <td>{row.goalType || "-"}</td>
                        <td>{row.subject || "-"}</td>
                        <td>{row.targetAchievement || "-"}</td>
                        <td>{row.startDate || "-"}</td>
                        <td>{row.endDate || "-"}</td>
                        <td>{row.description || "-"}</td>
                        <td>{renderStatus(row.status)}</td>
                        <td>
                          <span className="fs-12 mb-1">Completed {row.progressPercent ?? 0}%</span>
                          <div
                            className="progress"
                            role="progressbar"
                            aria-label="Progress"
                            aria-valuenow={row.progressPercent ?? 0}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{ width: "87px", height: "5px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${row.progressPercent ?? 0}%` }}
                            ></div>
                          </div>
                        </td>
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

      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Goal Tracking</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Goal Type</label>
                          <select
                            className="form-select"
                            value={form.goalType}
                            onChange={(e) => setForm((prev) => ({ ...prev, goalType: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {goalTypeOptions.map((g) => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Subject</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.subject}
                            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Target Achievement</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.targetAchievement}
                            onChange={(e) => setForm((prev) => ({ ...prev, targetAchievement: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.startDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.endDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Progress (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control"
                            value={form.progressPercent}
                            onChange={(e) => setForm((prev) => ({ ...prev, progressPercent: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
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
                      {saving ? "Adding..." : "Add Goal Tracking"}
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
                  <h4 className="modal-title">Edit Goal Tracking</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Goal Type</label>
                          <select
                            className="form-select"
                            value={editForm.goalType}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, goalType: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {goalTypeOptions.map((g) => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Subject</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.subject}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Target Achievement</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.targetAchievement}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, targetAchievement: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.startDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.endDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            value={editForm.description}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Progress (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control"
                            value={editForm.progressPercent}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, progressPercent: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={editForm.status}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
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
                  <p className="mb-3">You want to delete this goal, this cant be undone once you delete.</p>
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
