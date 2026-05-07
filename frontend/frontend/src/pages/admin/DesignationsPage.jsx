import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createDesignation,
  deleteDesignation,
  getDesignations,
  updateDesignation,
} from "../../api/designationsApi";
import { getDepartmentsMaster, getDepartmentsMasterByBranch } from "../../api/departmentsApi";
import { getHeadOffices } from "../../api/headOfficesApi";
import { getBranches } from "../../api/branchesApi";
import { getEmployees } from "../../api/employeesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const initialForm = {
  name: "",
  departmentId: "",
  department: "",
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

export default function DesignationsPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [headOffices, setHeadOffices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    headOfficeId: "",
    branchId: "",
    departmentId: "",
    status: "",
    q: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filterBranches, setFilterBranches] = useState([]);
  const [filterDepartments, setFilterDepartments] = useState([]);
  const [modalHeadOfficeId, setModalHeadOfficeId] = useState("");
  const [modalBranchId, setModalBranchId] = useState("");
  const [modalBranches, setModalBranches] = useState([]);
  const [modalDepartments, setModalDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
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
      const data = filters.departmentId ? await getDesignations(filters.departmentId) : await getDesignations();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      showError(extractApiErrorMessage(e, "Failed to load designations"));
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      const [hos, deps] = await Promise.all([getHeadOffices(), getDepartmentsMaster()]);
      setHeadOffices(Array.isArray(hos) ? hos : []);
      setAllDepartments(Array.isArray(deps) ? deps : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load masters"));
    } finally {
      setMetaLoading(false);
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
    loadMeta();
    loadEmployees();
  }, []);

  useEffect(() => {
    load();
  }, [filters.departmentId]);

  useEffect(() => {
    (async () => {
      if (!filters.headOfficeId) {
        setBranches([]);
        setDepartments([]);
        return;
      }
      try {
        const data = await getBranches(filters.headOfficeId);
        setBranches(Array.isArray(data) ? data : []);
      } catch {
        setBranches([]);
      }
      setDepartments([]);
    })();
  }, [filters.headOfficeId]);

  useEffect(() => {
    (async () => {
      if (!filters.branchId) {
        setDepartments([]);
        return;
      }
      try {
        const deps = await getDepartmentsMasterByBranch(filters.branchId);
        setDepartments(Array.isArray(deps) ? deps : []);
      } catch {
        setDepartments([]);
      }
    })();
  }, [filters.branchId]);

  useEffect(() => {
    (async () => {
      if (!modalHeadOfficeId) {
        setModalBranches([]);
        setModalBranchId("");
        setModalDepartments([]);
        setForm((prev) => ({ ...prev, departmentId: "" }));
        return;
      }
      try {
        const data = await getBranches(modalHeadOfficeId);
        setModalBranches(Array.isArray(data) ? data : []);
      } catch {
        setModalBranches([]);
      }
      setModalBranchId("");
      setModalDepartments([]);
      setForm((prev) => ({ ...prev, departmentId: "" }));
    })();
  }, [modalHeadOfficeId]);

  useEffect(() => {
    (async () => {
      if (!modalBranchId) {
        setModalDepartments([]);
        setForm((prev) => ({ ...prev, departmentId: "" }));
        return;
      }
      try {
        const deps = await getDepartmentsMasterByBranch(modalBranchId);
        setModalDepartments(Array.isArray(deps) ? deps : []);
      } catch {
        setModalDepartments([]);
      }
      setForm((prev) => ({ ...prev, departmentId: "" }));
    })();
  }, [modalBranchId]);

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
      const branchId = draftFilters.branchId;
      if (!filterOpen || !branchId) {
        setFilterDepartments([]);
        return;
      }
      try {
        const deps = await getDepartmentsMasterByBranch(branchId);
        setFilterDepartments(Array.isArray(deps) ? deps : []);
      } catch {
        setFilterDepartments([]);
      }
    })();
  }, [filterOpen, draftFilters.branchId]);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = String(filters.q || "").trim().toLowerCase();
    const deptIdSet = new Set((departments || []).map((d) => String(d.id)));
    return orderedRows.filter((row) => {
      const status = String(row?.status || "ACTIVE").toUpperCase();
      const statusOk = !filters.status || status === String(filters.status).toUpperCase();
      const qOk = !q || String(row?.name || "").toLowerCase().includes(q);
      const deptOk =
        !filters.departmentId ||
        String(row?.departmentMasterId || "") === String(filters.departmentId);
      const branchOk =
        !filters.branchId ||
        !!filters.departmentId ||
        deptIdSet.has(String(row?.departmentMasterId || ""));
      return statusOk && qOk && deptOk && branchOk;
    });
  }, [orderedRows, filters.q, filters.status, filters.departmentId, filters.branchId, departments]);

  const orderedDepartments = useMemo(
    () => [...(departments || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [departments],
  );

  const orderedAllDepartments = useMemo(
    () => [...(allDepartments || [])].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [allDepartments],
  );

  const designationCounts = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      const d = String(e?.designation || "").trim();
      if (!d) return;
      map.set(d.toLowerCase(), (map.get(d.toLowerCase()) || 0) + 1);
    });
    return map;
  }, [employees]);

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Designation name is required");
      return;
    }
    if (!form.departmentId) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      const deptSource = (modalDepartments && modalDepartments.length > 0) ? modalDepartments : orderedDepartments;
      const dept = deptSource.find((d) => String(d.id) === String(form.departmentId));
      await createDesignation({
        name: form.name.trim(),
        departmentMasterId: Number(form.departmentId),
        department: dept?.name || form.department || "",
        status: form.status,
      });
      setForm(initialForm);
      showSuccess("Designation added");
      setShowAddModal(false);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to add designation"));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setModalHeadOfficeId("");
    setModalBranchId("");
    setModalBranches([]);
    setModalDepartments([]);
    setEditForm({
      name: row?.name || "",
      departmentId: String(row?.departmentMasterId || ""),
      department: row?.department || "",
      status: String(row?.status || "ACTIVE").toUpperCase(),
    });
    setSelectedId(row?.id || null);
    setShowEditModal(true);
  };

  const handleEditDesignation = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!editForm.name.trim()) {
      showError("Designation name is required");
      return;
    }
    if (!editForm.departmentId) {
      showError("Department is required");
      return;
    }
    setSaving(true);
    try {
      const deptSource = (modalDepartments && modalDepartments.length > 0) ? modalDepartments : orderedDepartments;
      const dept = deptSource.find((d) => String(d.id) === String(editForm.departmentId));
      await updateDesignation(selectedId, {
        name: editForm.name.trim(),
        departmentMasterId: Number(editForm.departmentId),
        department: dept?.name || editForm.department || "",
        status: editForm.status,
      });
      showSuccess("Designation updated");
      setShowEditModal(false);
      setSelectedId(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to update designation"));
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
      await deleteDesignation(selectedId);
      showSuccess("Designation deleted");
      setShowDeleteModal(false);
      setSelectedId(null);
      setDeleteTarget(null);
      await load();
    } catch (e2) {
      showError(extractApiErrorMessage(e2, "Failed to delete designation"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Designations</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active">Designations</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setModalHeadOfficeId("");
                setModalBranchId("");
                setModalBranches([]);
                setModalDepartments([]);
                setForm(initialForm);
                setShowAddModal(true);
              }}
            >
              <i className="ti ti-circle-plus me-2"></i>Add Designation
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
                          departmentId: "",
                        }));
                      }}
                      disabled={metaLoading}
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
                      onChange={(e) => {
                        const branchId = e.target.value;
                        setDraftFilters((prev) => ({
                          ...prev,
                          branchId,
                          departmentId: "",
                        }));
                      }}
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
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={draftFilters.departmentId}
                      onChange={(e) =>
                        setDraftFilters((prev) => ({ ...prev, departmentId: e.target.value }))
                      }
                      disabled={!draftFilters.branchId}
                    >
                      <option value="">{draftFilters.branchId ? "All" : "Select branch first"}</option>
                      {[...filterDepartments]
                        .filter(isActiveMaster)
                        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
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
                      placeholder="Designation name"
                    />
                  </div>
                </div>

                <div className="p-3 border-top d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-light w-50"
                    onClick={() =>
                      setDraftFilters({ headOfficeId: "", branchId: "", departmentId: "", status: "", q: "" })
                    }
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
            <h5>Designation List</h5>
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
                    <th>Designation</th>
                    <th>Department</th>
                    <th>No of Employees</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        No designations found
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const active = String(row?.status || "ACTIVE").toUpperCase() !== "INACTIVE";
                      return (
                        <tr key={row.id || `${row.name}-${row.department}`}>
                          <td>{row.name || "-"}</td>
                          <td>{row.department || "-"}</td>
                          <td>
                            {designationCounts.get(String(row.name || "").trim().toLowerCase()) ??
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
                                aria-label="Edit designation"
                              >
                                <i className="ti ti-edit"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-link p-0 text-danger"
                                onClick={() => confirmDelete(row)}
                                aria-label="Delete designation"
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
                  <h4 className="modal-title">Add Designation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAddDesignation}>
                  <div className="modal-body pb-0">
                 <div className="row">

  {/* Head Office */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Head Office</label>
      <select
        className="form-select"
        value={modalHeadOfficeId}
        onChange={(e) => setModalHeadOfficeId(e.target.value)}
        disabled={metaLoading}
      >
        <option value="">Select</option>
        {[...withInactiveSelected(headOffices, modalHeadOfficeId)]
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
          .map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
      </select>
    </div>
  </div>

  {/* Branch */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Branch</label>
      <select
        className="form-select"
        value={modalBranchId}
        onChange={(e) => setModalBranchId(e.target.value)}
        disabled={!modalHeadOfficeId}
      >
        <option value="">
          {modalHeadOfficeId ? "Select" : "Select Head Office first"}
        </option>
        {[...withInactiveSelected(modalBranches, modalBranchId)]
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
          .map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
      </select>
    </div>
  </div>
  {/* Department Name */}
<div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Department</label>
      <select
        className="form-select"
        value={form.departmentId}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, departmentId: e.target.value }))
        }
        disabled={!modalBranchId}
      >
        <option value="">Select</option>
        {[...modalDepartments]
          .filter(isActiveMaster)
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
      </select>
    </div>
  </div>
  {/* Designation Name */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Designation Name</label>
      <input
        type="text"
        className="form-control"
        value={form.name}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, name: e.target.value }))
        }
      />
    </div>
  </div>

  
  

  {/* Status */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Status</label>
      <select
        className="form-select"
        value={form.status}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, status: e.target.value }))
        }
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
                      {saving ? "Adding..." : "Add Designation"}
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
                  <h4 className="modal-title">Edit Designation</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowEditModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEditDesignation}>
                  <div className="modal-body pb-0">
                    <div className="row">

  {/* Head Office */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Head Office</label>
      <select
        className="form-select"
        value={modalHeadOfficeId}
        onChange={(e) => setModalHeadOfficeId(e.target.value)}
        disabled={metaLoading}
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

  {/* Branch */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Branch</label>
      <select
        className="form-select"
        value={modalBranchId}
        onChange={(e) => setModalBranchId(e.target.value)}
        disabled={!modalHeadOfficeId}
      >
        <option value="">
          {modalHeadOfficeId ? "Select" : "Select Head Office first"}
        </option>
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

  {/* Designation Name */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Designation Name</label>
      <input
        type="text"
        className="form-control"
        value={form.name}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, name: e.target.value }))
        }
      />
    </div>
  </div>

  {/* Department */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Department</label>
      <select
        className="form-select"
        value={editForm.departmentId}
        onChange={(e) =>
          setEditForm((prev) => ({ ...prev, departmentId: e.target.value }))
        }
      >
        <option value="">Select</option>
        {[...withInactiveSelected((modalDepartments && modalDepartments.length > 0) ? modalDepartments : orderedAllDepartments, editForm.departmentId)]
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
      </select>
    </div>
  </div>

  {/* Status */}
  <div className="col-md-12">
    <div className="mb-3">
      <label className="form-label">Status</label>
      <select
        className="form-select"
        value={editForm.status}
        onChange={(e) =>
          setEditForm((prev) => ({ ...prev, status: e.target.value }))
        }
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
                    {deleteTarget?.name ? ` "${deleteTarget.name}"` : " this designation"}
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
