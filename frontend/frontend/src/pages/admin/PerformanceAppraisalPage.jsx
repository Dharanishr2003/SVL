import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployees } from "../../api/employeesApi";
import {
  createPerformanceAppraisal,
  deletePerformanceAppraisal,
  getPerformanceAppraisals,
  updatePerformanceAppraisal,
} from "../../api/performanceAppraisalApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const technicalTemplate = [
  { indicator: "Customer Experience", expectedValue: "Intermediate" },
  { indicator: "Marketing", expectedValue: "Advanced" },
  { indicator: "Management", expectedValue: "Advanced" },
  { indicator: "Administration", expectedValue: "Advanced" },
  { indicator: "Presentation Skill", expectedValue: "Expert / Leader" },
  { indicator: "Quality Of Work", expectedValue: "Expert / Leader" },
  { indicator: "Efficiency", expectedValue: "Expert / Leader" },
];

const organizationalTemplate = [
  { indicator: "Integrity", expectedValue: "Beginner" },
  { indicator: "Professionalism", expectedValue: "Beginner" },
  { indicator: "Team Work", expectedValue: "Intermediate" },
  { indicator: "Critical Thinking", expectedValue: "Advanced" },
  { indicator: "Conflict Management", expectedValue: "Intermediate" },
  { indicator: "Attendance", expectedValue: "Intermediate" },
  { indicator: "Ability To Meet Deadline", expectedValue: "Advanced" },
];

const scoreOptions = ["None", "Beginner", "Intermediate", "Advanced", "Expert / Leader"];

const buildCompetencies = (template, values) => {
  const map = new Map((values || []).map((v) => [v.indicator, v]));
  return template.map((t) => ({
    indicator: t.indicator,
    expectedValue: t.expectedValue,
    setValue: map.get(t.indicator)?.setValue || "",
  }));
};

const createInitialForm = () => ({
  employeeId: "",
  appraisalDate: "",
  status: "Active",
  technicalCompetencies: buildCompetencies(technicalTemplate, []),
  organizationalCompetencies: buildCompetencies(organizationalTemplate, []),
});

export default function PerformanceAppraisalPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(createInitialForm());
  const [editForm, setEditForm] = useState(createInitialForm());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPerformanceAppraisals();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load appraisals"));
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const employeeList = await getEmployees();
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load employees"));
    }
  };

  useEffect(() => {
    load();
    loadMeta();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(b.appraisalDate || "").localeCompare(String(a.appraisalDate || ""))),
    [rows],
  );

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

  const openAdd = () => {
    setForm(createInitialForm());
    setShowAddModal(true);
  };

  const openEdit = (row) => {
    setEditForm({
      employeeId: row?.employeeId ? String(row.employeeId) : "",
      appraisalDate: row?.appraisalDate ? String(row.appraisalDate).slice(0, 10) : "",
      status: row?.status || "Active",
      technicalCompetencies: buildCompetencies(technicalTemplate, row?.technicalCompetencies || []),
      organizationalCompetencies: buildCompetencies(organizationalTemplate, row?.organizationalCompetencies || []),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row || null);
    setSelectedId(row?.id || null);
    setShowDeleteModal(true);
  };

  const updateCompetency = (setFn, groupKey, index, value) => {
    setFn((prev) => {
      const next = { ...prev };
      const list = [...next[groupKey]];
      list[index] = { ...list[index], setValue: value };
      next[groupKey] = list;
      return next;
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      showError("Employee is required");
      return;
    }
    setSaving(true);
    try {
      await createPerformanceAppraisal({
        employeeId: Number(form.employeeId),
        appraisalDate: form.appraisalDate || null,
        status: form.status,
        technicalCompetencies: form.technicalCompetencies,
        organizationalCompetencies: form.organizationalCompetencies,
      });
      setForm(createInitialForm());
      showSuccess("Appraisal added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add appraisal"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeId) {
      showError("Employee is required");
      return;
    }
    setSaving(true);
    try {
      await updatePerformanceAppraisal(selectedId, {
        employeeId: Number(editForm.employeeId),
        appraisalDate: editForm.appraisalDate || null,
        status: editForm.status,
        technicalCompetencies: editForm.technicalCompetencies,
        organizationalCompetencies: editForm.organizationalCompetencies,
      });
      showSuccess("Appraisal updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update appraisal"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await deletePerformanceAppraisal(selectedId);
      showSuccess("Appraisal deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete appraisal"));
    } finally {
      setSaving(false);
    }
  };

  const renderCompetencyTable = (list, onChange) => (
    <div className="table-responsive">
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th>Indicator</th>
            <th>Expected Value</th>
            <th>Set Value</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, idx) => (
            <tr key={`${item.indicator}-${idx}`}>
              <td>{item.indicator}</td>
              <td>{item.expectedValue}</td>
              <td>
                <select
                  className="form-select"
                  value={item.setValue || ""}
                  onChange={(e) => onChange(idx, e.target.value)}
                >
                  <option value="">Select</option>
                  {scoreOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Performance Appraisal</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">Performance Appraisal</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={openAdd}>
                <i className="ti ti-circle-plus me-2"></i>Add Appraisal
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Performance Appraisal List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Appraisal Date</th>
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
                      <td colSpan={6}>No appraisals found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => (
                      <tr key={row.id || `${row.employeeId}-${row.appraisalDate}`}>
                        <td>{row.employeeName || "-"}</td>
                        <td>{row.designation || "-"}</td>
                        <td>{row.department || "-"}</td>
                        <td>{row.appraisalDate || "-"}</td>
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
                  <h4 className="modal-title">Add Appraisal</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleAdd}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Employee</label>
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Appraisal Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.appraisalDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, appraisalDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="col-md-12"><div className="mb-2"><h5 className="fw-medium">Technical Competencies</h5></div></div>
                      <div className="col-md-12">
                        {renderCompetencyTable(form.technicalCompetencies, (idx, value) =>
                          updateCompetency(setForm, "technicalCompetencies", idx, value),
                        )}
                      </div>

                      <div className="col-md-12"><div className="mb-2"><h5 className="fw-medium">Organizational Competencies</h5></div></div>
                      <div className="col-md-12">
                        {renderCompetencyTable(form.organizationalCompetencies, (idx, value) =>
                          updateCompetency(setForm, "organizationalCompetencies", idx, value),
                        )}
                      </div>

                      <div className="col-md-12">
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
                      {saving ? "Adding..." : "Add Appraisal"}
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
                  <h4 className="modal-title">Edit Appraisal</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleEdit}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Employee</label>
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Appraisal Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.appraisalDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, appraisalDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="col-md-12"><div className="mb-2"><h5 className="fw-medium">Technical Competencies</h5></div></div>
                      <div className="col-md-12">
                        {renderCompetencyTable(editForm.technicalCompetencies, (idx, value) =>
                          updateCompetency(setEditForm, "technicalCompetencies", idx, value),
                        )}
                      </div>

                      <div className="col-md-12"><div className="mb-2"><h5 className="fw-medium">Organizational Competencies</h5></div></div>
                      <div className="col-md-12">
                        {renderCompetencyTable(editForm.organizationalCompetencies, (idx, value) =>
                          updateCompetency(setEditForm, "organizationalCompetencies", idx, value),
                        )}
                      </div>

                      <div className="col-md-12">
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
                  <p className="mb-3">You want to delete this appraisal, this cant be undone once you delete.</p>
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
