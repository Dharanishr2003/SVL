import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartmentsMaster } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import {
  createPerformanceIndicator,
  deletePerformanceIndicator,
  getPerformanceIndicators,
  updatePerformanceIndicator,
} from "../../api/performanceIndicatorApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  designationId: "",
  departmentId: "",
  approvedBy: "",
  customerExperience: "",
  marketing: "",
  management: "",
  administration: "",
  presentationSkills: "",
  qualityOfWork: "",
  efficiency: "",
  integrity: "",
  professionalism: "",
  teamWork: "",
  criticalThinking: "",
  conflictManagement: "",
  attendance: "",
  abilityToMeetDeadline: "",
  status: "Active",
};

const scoreOptions = ["Advanced", "Intermediate", "Average", "None"];

export default function PerformanceIndicatorPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
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
      const data = await getPerformanceIndicators();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load indicators"));
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [deps, desigs] = await Promise.all([getDepartmentsMaster(), getDesignations()]);
      setDepartments(Array.isArray(deps) ? deps : []);
      setDesignations(Array.isArray(desigs) ? desigs : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load departments/designations"));
    }
  };

  useEffect(() => {
    load();
    loadMeta();
  }, []);

  const departmentOptions = useMemo(
    () =>
      (departments || [])
        .map((d) => ({ id: d?.id, name: d?.name }))
        .filter((d) => d.id != null && d.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      (designations || [])
        .map((d) => ({ id: d?.id, name: d?.name }))
        .filter((d) => d.id != null && d.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [designations],
  );

  const orderedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        String(b.createdDate || "").localeCompare(String(a.createdDate || "")),
      ),
    [rows],
  );

  const openAdd = () => {
    setForm(initialForm);
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      designationId: row?.designationId ? String(row.designationId) : "",
      departmentId: row?.departmentId ? String(row.departmentId) : "",
      approvedBy: row?.approvedBy || "",
      customerExperience: row?.customerExperience || "",
      marketing: row?.marketing || "",
      management: row?.management || "",
      administration: row?.administration || "",
      presentationSkills: row?.presentationSkills || "",
      qualityOfWork: row?.qualityOfWork || "",
      efficiency: row?.efficiency || "",
      integrity: row?.integrity || "",
      professionalism: row?.professionalism || "",
      teamWork: row?.teamWork || "",
      criticalThinking: row?.criticalThinking || "",
      conflictManagement: row?.conflictManagement || "",
      attendance: row?.attendance || "",
      abilityToMeetDeadline: row?.abilityToMeetDeadline || "",
      status: row?.status || "Active",
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
    if (!form.designationId || !form.departmentId) {
      showError("Designation and department are required");
      return;
    }
    setSaving(true);
    try {
      await createPerformanceIndicator({
        ...form,
        designationId: Number(form.designationId),
        departmentId: Number(form.departmentId),
      });
      setForm(initialForm);
      showSuccess("Indicator added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add indicator"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.designationId || !editForm.departmentId) {
      showError("Designation and department are required");
      return;
    }
    setSaving(true);
    try {
      await updatePerformanceIndicator(selectedId, {
        ...editForm,
        designationId: Number(editForm.designationId),
        departmentId: Number(editForm.departmentId),
      });
      showSuccess("Indicator updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update indicator"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deletePerformanceIndicator(selectedId);
      showSuccess("Indicator deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete indicator"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Performance Indicator</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">Performance Indicator</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Indicator
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Performance Indicator List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Approved By</th>
                    <th>Created Date</th>
                    <th>Status</th>
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
                      <td colSpan={6}>No indicators found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => (
                      <tr key={row.id || `${row.designationId}-${row.departmentId}`}>
                        <td>{row.designationName || "-"}</td>
                        <td>{row.departmentName || "-"}</td>
                        <td>{row.approvedBy || "-"}</td>
                        <td>{row.createdDate ? new Date(row.createdDate).toLocaleDateString("en-GB") : "-"}</td>
                        <td>
                          {String(row.status || "Active").toLowerCase() === "inactive" ? (
                            <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1"></i>Inactive
                            </span>
                          ) : (
                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1"></i>Active
                            </span>
                          )}
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add New Indicator</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                          <select
                            className="form-select"
                            value={form.designationId}
                            onChange={(e) => setForm((prev) => ({ ...prev, designationId: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {designationOptions.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <select
                            className="form-select"
                            value={form.departmentId}
                            onChange={(e) => setForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {departmentOptions.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
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

                      <div className="col-md-12"><div className="mb-3"><h5 className="fw-medium">Technical</h5></div></div>

                      {[
                        ["Customer Experience", "customerExperience"],
                        ["Marketing", "marketing"],
                        ["Management", "management"],
                        ["Administration", "administration"],
                        ["Presentation Skills", "presentationSkills"],
                        ["Quality of Work", "qualityOfWork"],
                        ["Efficiency", "efficiency"],
                      ].map(([label, key]) => (
                        <div className="col-md-3" key={key}>
                          <div className="mb-3">
                            <label className="form-label">{label}</label>
                            <select className="form-select" value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}>
                              <option value="">Select</option>
                              {scoreOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12"><div className="mb-3"><h5 className="fw-medium">Organizational</h5></div></div>

                      {[
                        ["Integrity", "integrity"],
                        ["Professionalism", "professionalism"],
                        ["Team Work", "teamWork"],
                        ["Critical Thinking", "criticalThinking"],
                        ["Conflict Management", "conflictManagement"],
                        ["Attendance", "attendance"],
                        ["Ability To Meet Deadline", "abilityToMeetDeadline"],
                      ].map(([label, key]) => (
                        <div className="col-md-3" key={key}>
                          <div className="mb-3">
                            <label className="form-label">{label}</label>
                            <select className="form-select" value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}>
                              <option value="">Select</option>
                              {scoreOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select className="form-select" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                            <option value="">Select</option>
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
                      {saving ? "Adding..." : "Add Indicator"}
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
                  <h4 className="modal-title">Edit New Indicator</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Designation</label>
                          <select className="form-select" value={editForm.designationId} onChange={(e) => setEditForm((prev) => ({ ...prev, designationId: e.target.value }))}>
                            <option value="">Select</option>
                            {designationOptions.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department</label>
                          <select className="form-select" value={editForm.departmentId} onChange={(e) => setEditForm((prev) => ({ ...prev, departmentId: e.target.value }))}>
                            <option value="">Select</option>
                            {departmentOptions.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Approved By</label>
                          <input type="text" className="form-control" value={editForm.approvedBy} onChange={(e) => setEditForm((prev) => ({ ...prev, approvedBy: e.target.value }))} />
                        </div>
                      </div>

                      <div className="col-md-12"><div className="mb-3"><h5 className="fw-medium">Technical</h5></div></div>
                      {[
                        ["Customer Experience", "customerExperience"],
                        ["Marketing", "marketing"],
                        ["Management", "management"],
                        ["Administration", "administration"],
                        ["Presentation Skills", "presentationSkills"],
                        ["Quality of Work", "qualityOfWork"],
                        ["Efficiency", "efficiency"],
                      ].map(([label, key]) => (
                        <div className="col-md-3" key={key}>
                          <div className="mb-3">
                            <label className="form-label">{label}</label>
                            <select className="form-select" value={editForm[key]} onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}>
                              <option value="">Select</option>
                              {scoreOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12"><div className="mb-3"><h5 className="fw-medium">Organizational</h5></div></div>
                      {[
                        ["Integrity", "integrity"],
                        ["Professionalism", "professionalism"],
                        ["Team Work", "teamWork"],
                        ["Critical Thinking", "criticalThinking"],
                        ["Conflict Management", "conflictManagement"],
                        ["Attendance", "attendance"],
                        ["Ability To Meet Deadline", "abilityToMeetDeadline"],
                      ].map(([label, key]) => (
                        <div className="col-md-3" key={key}>
                          <div className="mb-3">
                            <label className="form-label">{label}</label>
                            <select className="form-select" value={editForm[key]} onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}>
                              <option value="">Select</option>
                              {scoreOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select className="form-select" value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}>
                            <option value="">Select</option>
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
                  <p className="mb-3">You want to delete this indicator, this cant be undone once you delete.</p>
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
