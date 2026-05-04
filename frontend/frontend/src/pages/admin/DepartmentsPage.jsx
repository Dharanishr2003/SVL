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

function isActiveMaster(item) {
  return String(item?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
}

function withInactiveSelected(items, selectedId) {
  const list = Array.isArray(items) ? items : [];
  const active = list.filter(isActiveMaster);
  if (!selectedId) return active;

  const selected = list.find((it) => String(it?.id) === String(selectedId));
  if (!selected || isActiveMaster(selected)) return active;

  return [
    ...active,
    { ...selected, name: `${selected?.name || "Selected"} (Inactive)` },
  ];
}

export default function DepartmentsPage() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]); // for active filters
  const [filterBranches, setFilterBranches] = useState([]); // for drawer (draft filters)
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    headOfficeId: "",
    branchId: "",
    status: "",
    q: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);
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
      const data = filters.branchId
        ? await getDepartmentsMasterByBranch(filters.branchId)
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
  }, [filters.branchId]);

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
      if (!filters.headOfficeId) {
        setBranches([]);
        return;
      }
      try {
        const data = await getBranches(filters.headOfficeId);
        setBranches(Array.isArray(data) ? data : []);
      } catch {
        setBranches([]);
      }
    })();
  }, [filters.headOfficeId]);

  useEffect(() => {
    (async () => {
      const hoId = draftFilters.headOfficeId;
      if (!filterOpen || !hoId) {
        setFilterBranches([]);
        return;
      }
      try {
        const data = await getBranches(hoId);
        setFilterBranches(Array.isArray(data) ? data : []);
      } catch {
        setFilterBranches([]);
      }
    })();
  }, [filterOpen, draftFilters.headOfficeId]);

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

  const filteredRows = useMemo(() => {
    const q = String(filters.q || "").trim().toLowerCase();
    const branchIdSet = new Set((branches || []).map((b) => String(b.id)));
    return orderedRows.filter((row) => {
      const status = String(row?.status || "ACTIVE").toUpperCase();
      const statusOk = !filters.status || status === String(filters.status).toUpperCase();
      const qOk = !q || String(row?.name || "").toLowerCase().includes(q);
      const branchOk = !filters.branchId || String(row?.branchId || "") === String(filters.branchId);
      const hoOk =
        !filters.headOfficeId ||
        !!filters.branchId ||
        branchIdSet.has(String(row?.branchId || ""));
      return statusOk && qOk && branchOk && hoOk;
    });
  }, [orderedRows, filters.q, filters.status, filters.branchId, filters.headOfficeId, branches]);

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
    setEditForm({
      branchId: String(row?.branchId || ""),
      name: row?.name || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);

    const existingHo = filters.headOfficeId || "";
    setModalHeadOfficeId(existingHo);
    if (!existingHo && row?.branchId) {
      (async () => {
        try {
          const allBranches = await getBranches();
          const match = (Array.isArray(allBranches) ? allBranches : []).find(
            (b) => String(b?.id) === String(row.branchId),
          );
          if (match?.headOfficeId) {
            setModalHeadOfficeId(String(match.headOfficeId));
          }
        } catch {
          // ignore
        }
      })();
    }
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

  const editHeadOfficeOptions = useMemo(() => {
    const list = withInactiveSelected(headOffices, modalHeadOfficeId);
    return [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [headOffices, modalHeadOfficeId]);

  const editBranchOptions = useMemo(() => {
    const list = withInactiveSelected(modalBranches, editForm.branchId);
    return [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [modalBranches, editForm.branchId]);

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
            
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setModalHeadOfficeId(filters.headOfficeId || "");
                setForm((prev) => ({ ...initialForm, branchId: "" }));
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Department
            </button>
          </div>
        </div>

        <div className="card">
          {filterOpen && (
            <>
              <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{ background: "rgba(0,0,0,0.35)", zIndex: 1048 }}
                onClick={() => setFilterOpen(false)}
              />
              <div
                className="position-fixed top-0 end-0 h-100 bg-white border-start shadow"
                style={{ width: 380, zIndex: 1049 }}
              >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                  <h6 className="mb-0">Filters</h6>
                  <button type="button" className="btn-close" onClick={() => setFilterOpen(false)} />
                </div>

                <div className="p-3">
                  <div className="mb-3">
                    <label className="form-label">Head Office</label>
                    <select
                      className="form-select"
                      value={draftFilters.headOfficeId}
                      onChange={(e) => {
                        const headOfficeId = e.target.value;
                        setDraftFilters((prev) => ({
                          ...prev,
                          headOfficeId,
                          branchId: "",
                        }));
                      }}
                    >
                      <option value="">All</option>
                      {[...headOffices]
                        .filter(isActiveMaster)
                        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select"
                      value={draftFilters.branchId}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, branchId: e.target.value }))
                      }
                      disabled={!draftFilters.headOfficeId}
                    >
                      <option value="">{draftFilters.headOfficeId ? "All" : "Select head office first"}</option>
                      {[...filterBranches]
                        .filter(isActiveMaster)
                        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={draftFilters.status}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="">All</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Search</label>
                    <input
                      className="form-control"
                      value={draftFilters.q}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, q: e.target.value }))
                      }
                      placeholder="Department name"
                    />
                  </div>
                </div>

                <div className="p-3 border-top d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light w-50"
                    onClick={() => setDraftFilters({ headOfficeId: "", branchId: "", status: "", q: "" })}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50"
                    onClick={() => {
                      setFilters(draftFilters);
                      setFilterOpen(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 >Department List</h5>
            <button
              type="button"
              className="btn btn-outline-warning leads-toolbar-btn"
              onClick={() => {
                setDraftFilters(filters);
                setFilterOpen(true);
              }}
            >
              <i className="ti ti-filter me-1" />
              Filter
            </button>
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
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted">
                        No departments found
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
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
                            {editHeadOfficeOptions.map((h) => (
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
                            {editBranchOptions.map((b) => (
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
                              .filter(isActiveMaster)
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
                              .filter(isActiveMaster)
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
