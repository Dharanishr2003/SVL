import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPayslips, createPayslip, deletePayslip } from "../../api/payslipApi";
import { getEmployeeSalaries } from "../../api/employeeSalaryApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

const PayslipPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    employeeId: "",
    employeeSalaryId: "",
    month: "January 2026"
  });

  const monthsList = [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [psList, salList] = await Promise.all([
        getPayslips(),
        getEmployeeSalaries()
      ]);
      setPayslips(psList);
      setSalaries(salList);
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to load payslips"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      showError("Please select an employee");
      return;
    }
    setSaving(true);
    try {
      const selectedSalary = salaries.find(s => String(s.employeeId) === String(form.employeeId));
      const payload = {
        employeeId: parseInt(form.employeeId),
        employeeSalaryId: selectedSalary ? selectedSalary.id : null,
        month: form.month
      };
      await createPayslip(payload);
      showSuccess("Payslip generated successfully");
      setShowAddModal(false);
      loadData();
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to generate payslip"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await deletePayslip(deleteTarget.id);
        showSuccess("Payslip deleted successfully");
        setDeleteTarget(null);
        loadData();
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to delete payslip"));
      }
    }
  };

  // If viewing a detailed payslip
  if (selectedPayslip) {
    const totalEarnings = (selectedPayslip.basic || 0) + (selectedPayslip.da || 0) + (selectedPayslip.hra || 0) + (selectedPayslip.conveyance || 0);
    const totalDeductions = (selectedPayslip.tds || 0) + (selectedPayslip.esi || 0) + (selectedPayslip.pf || 0) + (selectedPayslip.leaveDeduction || 0);

    return (
      <div className="content">
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Payslip Details</h2>
              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setSelectedPayslip(null)}>
                <i className="ti ti-arrow-left me-1"></i> Back to List
              </button>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => window.print()}
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-printer" style={{ fontSize: "1.1rem" }}></i>
                Print Payslip
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <div className="row justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <div className="mb-2">
                    <img src="/assets/img/logo.svg" className="img-fluid" alt="logo" />
                  </div>
                  <p className="text-muted mb-0">SVL Packaging Industries</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-md-end mb-3">
                  <h5 className="text-gray mb-1">
                    Payslip No <span className="text-primary fw-bold"> #PS-{selectedPayslip.id}</span>
                  </h5>
                  <p className="fw-medium text-muted">
                    Salary Month : <span className="text-dark fw-semibold">{selectedPayslip.month}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="row border-bottom pb-3 mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <p className="text-dark mb-2 fw-semibold">Employer</p>
                  <div>
                    <h4 className="mb-1 fw-bold text-dark">SVL Packaging</h4>
                    <p className="mb-1 text-muted">Head Office / Plant Location</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <p className="text-dark mb-2 fw-semibold">Employee Details</p>
                  <div>
                    <h4 className="mb-1 fw-bold text-dark">{selectedPayslip.name}</h4>
                    <p className="mb-1 text-muted">Code: {selectedPayslip.employeeCode}</p>
                    <p className="mb-1 text-muted">Designation: {selectedPayslip.designation}</p>
                    <p className="mb-1 text-muted">Email: {selectedPayslip.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-center mb-4 fw-bold text-dark">
                Payslip for the month of {selectedPayslip.month}
              </h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="list-group mb-3 shadow-sm" style={{ borderRadius: 8, overflow: "hidden" }}>
                    <div className="list-group-item bg-light p-3 border-0">
                      <h6 className="mb-0 fw-bold text-dark">Earnings</h6>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">Basic Salary</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.basic}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">House Rent Allowance (H.R.A.)</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.hra}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">DA</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.da}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">Conveyance</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.conveyance}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0 bg-light-blue" style={{ backgroundColor: "#f0f7ff" }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 fw-bold text-primary">Total Earnings</p>
                        <h6 className="fw-bold text-primary mb-0">${totalEarnings}</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="list-group mb-3 shadow-sm" style={{ borderRadius: 8, overflow: "hidden" }}>
                    <div className="list-group-item bg-light p-3 border-0">
                      <h6 className="mb-0 fw-bold text-dark">Deductions</h6>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">Tax Deducted at Source (T.D.S.)</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.tds}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">Provident Fund</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.pf}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">ESI</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.esi}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 text-muted">Leave Deduction</p>
                        <h6 className="fw-semibold text-dark mb-0">${selectedPayslip.leaveDeduction}</h6>
                      </div>
                    </div>
                    <div className="list-group-item border-start-0 border-end-0 bg-light-red" style={{ backgroundColor: "#fff5f5" }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0 fw-bold text-danger">Total Deductions</p>
                        <h6 className="fw-bold text-danger mb-0">${totalDeductions}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-light rounded-3 d-inline-block">
                <p className="mb-0 text-dark">
                  Net Salary : <span className="fw-bold text-success" style={{ fontSize: "1.1rem" }}>${selectedPayslip.netSalary}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="content">
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Payslips</h2>
              <nav className="mb-0">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                  <li className="breadcrumb-item">
                    <Link to="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>
                      <i className="ti ti-smart-home"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item" style={{ color: "#64748b" }}>HR</li>
                  <li className="breadcrumb-item active" style={{ color: "#0f172a", fontWeight: "500" }}>Payslips</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-plus" style={{ fontSize: "1.1rem" }}></i>
                Generate Payslip
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Month</th>
                      <th>Net Salary</th>
                      <th>Generated At</th>
                      <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">No payslips found</td>
                      </tr>
                    ) : (
                      payslips.map((ps, idx) => (
                        <tr key={ps.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="fw-semibold text-dark">{ps.name}</div>
                            <div className="text-muted small">{ps.employeeCode}</div>
                          </td>
                          <td>{ps.month}</td>
                          <td className="text-success fw-bold">${ps.netSalary}</td>
                          <td>{new Date(ps.generatedAt).toLocaleString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => setSelectedPayslip(ps)}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setDeleteTarget(ps)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Payslip Modal */}
      {showAddModal && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Generate Payslip</h4>
                  <button type="button" className="btn-close custom-btn-close" onClick={() => setShowAddModal(false)}>
                    <i className="ti ti-x"></i>
                  </button>
                </div>
                <form onSubmit={handleGenerate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Employee Salary Profile</label>
                      <select
                        className="form-select"
                        value={form.employeeId}
                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                        required
                      >
                        <option value="">Select Employee</option>
                        {salaries.map((s) => (
                          <option key={s.id} value={s.employeeId}>
                            {s.name} (Salary: ${s.netSalary})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Month</label>
                      <select
                        className="form-select"
                        value={form.month}
                        onChange={(e) => setForm({ ...form, month: e.target.value })}
                        required
                      >
                        {monthsList.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-white border me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6" }} disabled={saving}>
                      {saving ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                    <i className="ti ti-trash-x fs-36"></i>
                  </span>
                  <h4 className="mb-1">Confirm Delete</h4>
                  <p className="mb-3">Are you sure you want to delete this payslip? This action cannot be undone.</p>
                  <div className="d-flex justify-content-center">
                    <button type="button" className="btn btn-light me-3" onClick={() => setDeleteTarget(null)}>Cancel</button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
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
};

export default PayslipPage;
