import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createDepartmentMaster,
  getDepartmentsMaster,
  getDepartmentsMasterByBranch,
  updateDepartmentMaster,
  deleteDepartmentMaster,
} from "../../api/departmentsApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { getBranches } from "../../api/branchesApi";
import { getEmployees } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  branchId: "",
  name: "",
  status: "ACTIVE",
};

export default function DepartmentsPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedHeadOfficeId, setSelectedHeadOfficeId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [modalHeadOfficeId, setModalHeadOfficeId] = useState("");
  const [modalBranches, setModalBranches] = useState([]);
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
      const data = selectedBranchId
        ? await getDepartmentsMasterByBranch(selectedBranchId)
        : await getDepartmentsMaster();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load departments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedBranchId]);

  const loadMeta = async () => {
    try {
      const data = await getHeadOffices();
      setHeadOffices(Array.isArray(data) ? data : []);
    } catch {
      setHeadOffices([]);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedHeadOfficeId) {
        setBranches([]);
        setSelectedBranchId("");
        return;
      }
      try {
        const data = await getBranches(selectedHeadOfficeId);
        setBranches(Array.isArray(data) ? data : []);
      } catch {
        setBranches([]);
      }
      setSelectedBranchId("");
    })();
  }, [selectedHeadOfficeId]);

  useEffect(() => {
    (async () => {
      if (!modalHeadOfficeId) {
        setModalBranches([]);
        return;
      }
      try {
        const data = await getBranches(modalHeadOfficeId);
        setModalBranches(Array.isArray(data) ? data : []);
      } catch {
        setModalBranches([]);
      }
    })();
  }, [modalHeadOfficeId]);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const departmentCounts = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      const dept = String(e?.dept || e?.department || "").trim();
      if (!dept) return;
      map.set(dept.toLowerCase(), (map.get(dept.toLowerCase()) || 0) + 1);
    });
    return map;
  }, [employees]);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!form.branchId) {
      showError("Branch is required");
      return;
    }
    if (!form.name.trim()) {
      showError("Department name is required");
      return;
    }
    setSaving(true);
    try {
      await createDepartmentMaster({
        branchId: Number(form.branchId),
        name: form.name.trim(),
        status: form.status,
      });
      setForm(initialForm);
      showSuccess("Department added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add department"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setModalHeadOfficeId(selectedHeadOfficeId || "");
    setEditForm({
      branchId: String(row?.branchId || ""),
      name: row?.name || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.branchId) {
      showError("Branch is required");
      return;
    }
    if (!editForm.name.trim()) {
      showError("Department name is required");
      return;
    }
    setSaving(true);
    try {
      await updateDepartmentMaster(selectedId, {
        branchId: Number(editForm.branchId),
        name: editForm.name.trim(),
        status: editForm.status,
      });
      showSuccess("Department updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update department"));
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
      await deleteDepartmentMaster(selectedId);
      showSuccess("Department deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete department"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Departments</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active">Departments</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select"
              style={{ width: 240 }}
              value={selectedHeadOfficeId}
              onChange={(e) => setSelectedHeadOfficeId(e.target.value)}
            >
              <option value="">Select Head Office</option>
              {[...headOffices]
                .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                .map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
            </select>
            <select
              className="form-select"
              style={{ width: 240 }}
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={!selectedHeadOfficeId}
            >
              <option value="">{selectedHeadOfficeId ? "Select Branch" : "Select Head Office first"}</option>
              {[...branches]
                .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setModalHeadOfficeId(selectedHeadOfficeId || "");
                setForm((prev) => ({ ...initialForm, branchId: "" }));
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Department
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5>Department List</h5>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table">
                <thead className="thead-light">
                  <tr>
                    <th>Department</th>
                    <th>No of Employees</th>
                    <th>Status</th>
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
                      <td colSpan={4}>No departments found</td>
                    </tr>
                  ) : (
                    orderedRows.map((row) => {
                      const active = String(row?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
                      return (
                        <tr key={row.id || row.name}>
                          <td>{row.name || "-"}</td>
                          <td>
                            {departmentCounts.get(String(row.name || "").trim().toLowerCase()) ??
                              row.employeeCount ??
                              row.noOfEmployees ??
                              0}
                          </td>
                          <td>
                            <span
                              className={`badge d-inline-flex align-items-center badge-xs ${
                                active ? "badge-success" : "badge-danger"
                              }`}
                            >
                              <i className="ti ti-point-filled me-1"></i>
                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="action-icon d-inline-flex">
                              <button
                                type="button"
                                className="btn btn-link p-0 me-2"
                                onClick={() => openEdit(row)}
                                aria-label="Edit department"
                              >
                                <i className="ti ti-edit"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() => confirmDelete(row)}
                                aria-label="Delete department"
                              >
                                <i className="ti ti-trash"></i>
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
                  <h4 className="modal-title">Add Department</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddDepartment}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Head Office</label>
                          <select
                            className="form-select"
                            value={modalHeadOfficeId}
                            onChange={(e) => {
                              setModalHeadOfficeId(e.target.value);
                              setForm((prev) => ({ ...prev, branchId: "" }));
                            }}
                          >
                            <option value="">Select</option>
                            {[...headOffices]
                              .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                              .map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Branch</label>
                          <select
                            className="form-select"
                            value={form.branchId}
                            onChange={(e) => setForm((prev) => ({ ...prev, branchId: e.target.value }))}
                            disabled={!modalHeadOfficeId}
                          >
                            <option value="">{modalHeadOfficeId ? "Select" : "Select Head Office first"}</option>
                            {[...modalBranches]
                              .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
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
                      {saving ? "Adding..." : "Add Department"}
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
                  <h4 className="modal-title">Edit Department</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditDepartment}>
                  <div className="modal-body pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Head Office</label>
                          <select
                            className="form-select"
                            value={modalHeadOfficeId}
                            onChange={(e) => {
                              setModalHeadOfficeId(e.target.value);
                              setEditForm((prev) => ({ ...prev, branchId: "" }));
                            }}
                          >
                            <option value="">Select</option>
                            {[...headOffices]
                              .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                              .map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Branch</label>
                          <select
                            className="form-select"
                            value={editForm.branchId}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, branchId: e.target.value }))}
                            disabled={!modalHeadOfficeId}
                          >
                            <option value="">{modalHeadOfficeId ? "Select" : "Select Head Office first"}</option>
                            {[...modalBranches]
                              .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Department Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
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
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
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
                    {deleteTarget?.name ? ` "${deleteTarget.name}"` : " this department"}
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
