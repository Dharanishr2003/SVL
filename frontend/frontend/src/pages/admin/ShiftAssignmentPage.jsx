import React, { useState, useEffect, useCallback } from "react";
import { getEmployees } from "../../api/employeesApi";
import {
  listShifts,
  listLocations,
  assignShift,
  getEmployeeShift,
} from "../../api/attendanceApi";
import { useToast } from "../../components/system/ToastProvider";
import { extractApiErrorMessage } from "../../utils/errorMessage";

const EMPTY_FORM = {
  shiftId: "",
  locationId: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: "",
};

function fmtTime(t) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

export default function ShiftAssignmentPage() {
  const { showSuccess, showError } = useToast();

  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* per-employee active assignment cache: { [employeeId]: EmployeeShiftResponse[] } */
  const [assignmentsCache, setAssignmentsCache] = useState({});

  /* modal state */
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  /* search / filter */
  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, shiftList, locList] = await Promise.all([
        getEmployees().catch(() => []),
        listShifts().catch(() => []),
        listLocations().catch(() => []),
      ]);
      setEmployees(Array.isArray(emps) ? emps : []);
      setShifts(Array.isArray(shiftList) ? shiftList : []);
      setLocations(Array.isArray(locList) ? locList : []);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const loadAssignmentForEmp = useCallback(async (empId) => {
    try {
      const data = await getEmployeeShift(empId);
      setAssignmentsCache((prev) => ({ ...prev, [empId]: Array.isArray(data) ? data : [] }));
    } catch {
      /* ignore silently */
    }
  }, []);

  /* Pre-fetch assignments for visible employees */
  useEffect(() => {
    employees.forEach((emp) => {
      if (emp?.id != null) loadAssignmentForEmp(emp.id);
    });
  }, [employees, loadAssignmentForEmp]);

  const openAssign = (emp) => {
    setSelectedEmp(emp);
    /* pre-fill with most recent active assignment if any */
    const existing = (assignmentsCache[emp.id] || []).find((a) => !a.effectiveTo);
    setForm({
      shiftId: existing?.shiftId ? String(existing.shiftId) : "",
      locationId: existing?.locationId ? String(existing.locationId) : "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shiftId) {
      showError("Please select a shift.");
      return;
    }
    setSaving(true);
    try {
      await assignShift({
        employeeId: selectedEmp.id,
        shiftId: Number(form.shiftId),
        locationId: form.locationId ? Number(form.locationId) : null,
        effectiveFrom: form.effectiveFrom || null,
        effectiveTo: form.effectiveTo || null,
      });
      showSuccess(`Shift assigned to ${selectedEmp.name || "employee"}`);
      setShowModal(false);
      await loadAssignmentForEmp(selectedEmp.id);
    } catch (err) {
      showError(extractApiErrorMessage(err, "Failed to assign shift"));
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter((emp) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (emp.name || "").toLowerCase().includes(q) ||
      (emp.email || "").toLowerCase().includes(q) ||
      (emp.employeeCode || emp.employeeId || "").toLowerCase().includes(q) ||
      (emp.dept || emp.department || "").toLowerCase().includes(q) ||
      (emp.designation || "").toLowerCase().includes(q)
    );
  });

  const getActiveAssignment = (empId) => {
    const list = assignmentsCache[empId] || [];
    const today = new Date().toISOString().slice(0, 10);
    return (
      list.find((a) => {
        const from = a.effectiveFrom || "0000-01-01";
        const to = a.effectiveTo || "9999-12-31";
        return today >= from && today <= to;
      }) || list.find((a) => !a.effectiveTo) || null
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Shift Assignment</h4>
        <span className="text-muted small">Assign work shifts to employees</span>
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center gap-3">
          <h5 className="mb-0 me-auto">Employees</h5>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Current Shift</th>
                  <th>Location</th>
                  <th>Effective From</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const active = getActiveAssignment(emp.id);
                    return (
                      <tr key={emp.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={emp.img || "assets/img/users/user-32.jpg"}
                              alt={emp.name}
                              className="rounded-circle"
                              width="34"
                              height="34"
                            />
                            <div>
                              <div className="fw-semibold">{emp.name || "-"}</div>
                              <small className="text-muted">{emp.employeeCode || emp.employeeId || ""}</small>
                            </div>
                          </div>
                        </td>
                        <td>{emp.email || "-"}</td>
                        <td>{emp.dept || emp.department || "-"}</td>
                        <td>{emp.designation || "-"}</td>
                        <td>
                          {active ? (
                            <span className="badge bg-success-subtle text-success">
                              {active.shiftName || `Shift #${active.shiftId}`}
                              {active.shiftStartTime && active.shiftEndTime && (
                                <span className="ms-1 fw-normal text-muted">
                                  ({fmtTime(active.shiftStartTime)}–{fmtTime(active.shiftEndTime)})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">Unassigned</span>
                          )}
                        </td>
                        <td>{active?.locationName || <span className="text-muted">-</span>}</td>
                        <td>{active?.effectiveFrom || <span className="text-muted">-</span>}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openAssign(emp)}
                            title="Assign / Change Shift"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="ms-1">Assign</span>
                          </button>
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

      {/* ── Assign Shift Modal ── */}
      {showModal && selectedEmp && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content" onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Assign Shift — {selectedEmp.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Shift <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={form.shiftId}
                        onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
                        required
                      >
                        <option value="">Select shift</option>
                        {shifts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                            {s.startTime && s.endTime
                              ? ` (${fmtTime(s.startTime)} – ${fmtTime(s.endTime)})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Location (optional)</label>
                      <select
                        className="form-select"
                        value={form.locationId}
                        onChange={(e) =>
                          setForm({ ...form, locationId: e.target.value })
                        }
                      >
                        <option value="">No specific location</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Effective From</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.effectiveFrom}
                        onChange={(e) =>
                          setForm({ ...form, effectiveFrom: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Effective To{" "}
                        <small className="text-muted">(leave blank = indefinite)</small>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.effectiveTo}
                        min={form.effectiveFrom}
                        onChange={(e) =>
                          setForm({ ...form, effectiveTo: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* existing assignments for this employee */}
                  {(assignmentsCache[selectedEmp.id] || []).length > 0 && (
                    <div className="mt-3">
                      <p className="text-muted small mb-1 fw-semibold">Existing assignments:</p>
                      <div className="list-group list-group-flush">
                        {(assignmentsCache[selectedEmp.id] || []).map((a) => (
                          <div
                            key={a.id}
                            className="list-group-item list-group-item-action py-1 px-2 small"
                          >
                            <span className="fw-semibold">{a.shiftName || `Shift #${a.shiftId}`}</span>
                            {a.shiftStartTime && (
                              <span className="text-muted ms-1">
                                ({fmtTime(a.shiftStartTime)}–{fmtTime(a.shiftEndTime)})
                              </span>
                            )}
                            <span className="text-muted ms-2">
                              {a.effectiveFrom} → {a.effectiveTo || "ongoing"}
                            </span>
                            {a.locationName && (
                              <span className="ms-2 text-info">{a.locationName}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Assign Shift"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}
