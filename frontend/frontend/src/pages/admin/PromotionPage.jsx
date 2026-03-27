import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPromotion, deletePromotion, getPromotions, updatePromotion } from "../../api/promotionsApi";
import { getEmployees } from "../../api/employeesApi";
import { getDepartmentsMaster } from "../../api/departmentsApi";
import { getDesignations } from "../../api/designationsApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  employeeName: "",
  department: "",
  designationFrom: "",
  designationTo: "",
  promotionDate: "",
};

export default function PromotionPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
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
      const data = await getPromotions();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load promotions"));
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const [emps, deps, desigs] = await Promise.all([
        getEmployees(),
        getDepartmentsMaster(),
        getDesignations(),
      ]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setDepartments(Array.isArray(deps) ? deps : []);
      setDesignations(Array.isArray(desigs) ? desigs : []);
    } catch (e) {
      setEmployees([]);
      setDepartments([]);
      setDesignations([]);
      showError(extractApiErrorMessage(e, "Failed to load master data"));
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadMeta();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(b.promotionDate || "").localeCompare(String(a.promotionDate || ""))),
    [rows],
  );

  const employeeOptions = useMemo(
    () =>
      (employees || [])
        .map((e) => ({
          id: e?.id,
          name: e?.name || e?.employeeName || e?.fullName || "",
          designation: e?.designation || "",
          department: e?.dept || e?.department || "",
        }))
        .filter((e) => e.id != null && e.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  );

  const departmentOptions = useMemo(
    () =>
      (departments || [])
        .map((d) => d?.name)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .sort((a, b) => a.localeCompare(b)),
    [departments],
  );

  const designationOptions = useMemo(
    () =>
      (designations || [])
        .map((d) => d?.name)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .sort((a, b) => a.localeCompare(b)),
    [designations],
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.employeeName) {
      showError("Employee is required");
      return;
    }
    if (!form.promotionDate) {
      showError("Promotion date is required");
      return;
    }
    setSaving(true);
    try {
      const selectedEmployee = employeeOptions.find((e) => String(e.id) === String(form.employeeName));
      await createPromotion({
        employeeId: Number(form.employeeName),
        employeeName: selectedEmployee?.name || "",
        department: form.department || "",
        designationFrom: form.designationFrom || "",
        designationTo: form.designationTo || "",
        promotionDate: form.promotionDate,
      });
      setForm(initialForm);
      showSuccess("Promotion added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add promotion"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      employeeName: row?.employeeId ? String(row.employeeId) : "",
      department: row?.department || "",
      designationFrom: row?.designationFrom || "",
      designationTo: row?.designationTo || "",
      promotionDate: row?.promotionDate ? String(row.promotionDate).slice(0, 10) : "",
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.employeeName) {
      showError("Employee is required");
      return;
    }
    if (!editForm.promotionDate) {
      showError("Promotion date is required");
      return;
    }
    setSaving(true);
    try {
      const selectedEmployee = employeeOptions.find((e) => String(e.id) === String(editForm.employeeName));
      await updatePromotion(selectedId, {
        employeeId: Number(editForm.employeeName),
        employeeName: selectedEmployee?.name || "",
        department: editForm.department || "",
        designationFrom: editForm.designationFrom || "",
        designationTo: editForm.designationTo || "",
        promotionDate: editForm.promotionDate,
      });
      showSuccess("Promotion updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update promotion"));
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
      await deletePromotion(selectedId);
      showSuccess("Promotion deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete promotion"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Promotion</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Performance</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Promotion
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center"
                onClick={() => setShowAddModal(true)}
              >
                <i className="ti ti-circle-plus me-2"></i>Add Promotion
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                <h5 className="d-flex align-items-center">Promotion List</h5>
              </div>
              <div className="card-body p-0">
                <div className="custom-datatable-filter table-responsive">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Promoted Employee</th>
                        <th>Department</th>
                        <th>Designation From</th>
                        <th>Designation To</th>
                        <th>Promotion Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6}>Loading...</td>
                        </tr>
                      ) : orderedRows.length === 0 ? (
                        <tr>
                          <td colSpan={6}>No promotions found</td>
                        </tr>
                      ) : (
                        orderedRows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.employeeName || "-"}</td>
                            <td>{row.department || "-"}</td>
                            <td>{row.designationFrom || "-"}</td>
                            <td>{row.designationTo || "-"}</td>
                            <td>{formatDate(row.promotionDate)}</td>
                            <td>
                              <div className="action-icon d-inline-flex">
                                <button
                                  type="button"
                                  className="btn btn-link p-0 me-2"
                                  onClick={() => openEdit(row)}
                                  aria-label="Edit promotion"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-danger"
                                  onClick={() => confirmDelete(row)}
                                  aria-label="Delete promotion"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
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
                  <h4 className="modal-title">Add Promotion</h4>
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
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion For</label>
                          <select
                            className="form-select"
                            value={form.employeeName}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              const emp = employeeOptions.find((x) => String(x.id) === String(nextId));
                              setForm((prev) => ({
                                ...prev,
                                employeeName: nextId,
                                designationFrom: emp?.designation || prev.designationFrom,
                                department: emp?.department || prev.department,
                              }));
                            }}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {employeeOptions.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
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
                          <label className="form-label">Promotion From</label>
                          <select
                            className="form-select"
                            value={form.designationFrom}
                            onChange={(e) => setForm((prev) => ({ ...prev, designationFrom: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {designationOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion To</label>
                          <select
                            className="form-select"
                            value={form.designationTo}
                            onChange={(e) => setForm((prev) => ({ ...prev, designationTo: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {designationOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.promotionDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, promotionDate: e.target.value }))}
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
                      {saving ? "Adding..." : "Add Promotion"}
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
                  <h4 className="modal-title">Edit Promotion</h4>
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
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion For</label>
                          <select
                            className="form-select"
                            value={editForm.employeeName}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              const emp = employeeOptions.find((x) => String(x.id) === String(nextId));
                              setEditForm((prev) => ({
                                ...prev,
                                employeeName: nextId,
                                designationFrom: emp?.designation || prev.designationFrom,
                                department: emp?.department || prev.department,
                              }));
                            }}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {employeeOptions.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
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
                          <label className="form-label">Promotion From</label>
                          <select
                            className="form-select"
                            value={editForm.designationFrom}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, designationFrom: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {designationOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion To</label>
                          <select
                            className="form-select"
                            value={editForm.designationTo}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, designationTo: e.target.value }))}
                            disabled={metaLoading}
                          >
                            <option value="">Select</option>
                            {designationOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Promotion Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.promotionDate}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, promotionDate: e.target.value }))}
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
                    {deleteTarget?.employeeName ? ` "${deleteTarget.employeeName}"` : " this promotion"}
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
