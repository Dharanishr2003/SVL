import React from "react";
import { Link } from "react-router-dom";

const PayslipPage = () => {
  return (
    <>
      <div className="content">
        {/* Custom White Header Card */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Payslip</h2>
              <nav className="mb-0">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
                  <li className="breadcrumb-item">
                    <Link to="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>
                      <i className="ti ti-smart-home"></i>
                    </Link>
                  </li>
                  <li className="breadcrumb-item" style={{ color: "#64748b" }}>HR</li>
                  <li className="breadcrumb-item active" style={{ color: "#0f172a", fontWeight: "500" }}>Payslip</li>
                </ol>
              </nav>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => window.print()}
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-download" style={{ fontSize: "1.1rem" }}></i>
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div>
          <div className="row">
            <div className="col-sm-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body p-4">
                  <div className="row justify-content-between align-items-center border-bottom pb-3 mb-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="mb-2">
                          <img
                            src="/assets/img/logo.svg"
                            className="img-fluid"
                            alt="logo"
                          />
                        </div>
                        <p className="text-muted mb-0">3099 Kennedy Court Framingham, MA 01702</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-md-end mb-3">
                        <h5 className="text-gray mb-1">
                          Payslip No{" "}
                          <span className="text-primary fw-bold"> #PS4283</span>
                        </h5>
                        <p className="fw-medium text-muted">
                          Salary Month :{" "}
                          <span className="text-dark fw-semibold">October 2024</span>{" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="row border-bottom pb-3 mb-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <p className="text-dark mb-2 fw-semibold">From</p>
                        <div>
                          <h4 className="mb-1fw-bold text-dark">XYZ Technologies</h4>
                          <p className="mb-1 text-muted">
                            2077 Chicago Avenue Orosi, CA 93647
                          </p>
                          <p className="mb-1 text-muted">
                            Email :{" "}
                            <span className="text-dark fw-medium">
                              xyz@example.com
                            </span>
                          </p>
                          <p className="text-muted mb-0">
                            Phone :{" "}
                            <span className="text-dark fw-medium">+1 987 654 3210</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <p className="text-dark mb-2 fw-semibold">To</p>
                        <div>
                          <h4 className="mb-1 fw-bold text-dark">Anthony Lewis</h4>
                          <p className="mb-1 text-muted">Web Designer</p>
                          <p className="mb-1 text-muted">
                            Email :{" "}
                            <span className="text-dark fw-medium">
                              anthony@example.com
                            </span>
                          </p>
                          <p className="text-muted mb-0">
                            Phone :{" "}
                            <span className="text-dark fw-medium">+1 458 268 4738</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-center mb-4 fw-bold text-dark">
                      Payslip for the month of October 2024
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
                              <h6 className="fw-semibold text-dark mb-0">$3000</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">
                                House Rent Allowance (H.R.A.)
                              </p>
                              <h6 className="fw-semibold text-dark mb-0">$1000</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">Conveyance</p>
                              <h6 className="fw-semibold text-dark mb-0">$200</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">Other Allowance</p>
                              <h6 className="fw-semibold text-dark mb-0">$100</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0 bg-light-blue" style={{ backgroundColor: "#f0f7ff" }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 fw-bold text-primary">Total Earnings</p>
                              <h6 className="fw-bold text-primary mb-0">$4300</h6>
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
                              <p className="mb-0 text-muted">
                                Tax Deducted at Source (T.D.S.)
                              </p>
                              <h6 className="fw-semibold text-dark mb-0">$200</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">Provident Fund</p>
                              <h6 className="fw-semibold text-dark mb-0">$300</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">ESI</p>
                              <h6 className="fw-semibold text-dark mb-0">$150</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0">
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 text-muted">Loan</p>
                              <h6 className="fw-semibold text-dark mb-0">$50</h6>
                            </div>
                          </div>
                          <div className="list-group-item border-start-0 border-end-0 bg-light-red" style={{ backgroundColor: "#fff5f5" }}>
                            <div className="d-flex align-items-center justify-content-between">
                              <p className="mb-0 fw-bold text-danger">Total Deductions</p>
                              <h6 className="fw-bold text-danger mb-0">$700</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-light rounded-3 d-inline-block">
                      <p className="mb-0 text-dark">
                        Net Salary :{" "}
                        <span className="fw-bold text-success" style={{ fontSize: "1.1rem" }}>
                          {" "}
                          $3600 (Three thousand six hundred only)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayslipPage;
