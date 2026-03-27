import React from "react";
import { Link } from "react-router-dom";

const CandidatesGridPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Candidates</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Administration</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Candidates Grid
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="me-2 mb-2">
              <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                <Link to="/candidates" className="btn btn-icon btn-sm me-1">
                  <i className="ti ti-list-tree"></i>
                </Link>
                <Link
                  to="/candidates-grid"
                  className="btn btn-icon btn-sm active bg-primary text-white"
                >
                  <i className="ti ti-layout-grid"></i>
                </Link>
              </div>
            </div>
            <div className="me-2 mb-2">
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-file-export me-1"></i>Export
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      <i className="ti ti-file-type-pdf me-1"></i>Export as PDF
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      <i className="ti ti-file-type-xls me-1"></i>Export as
                      Excel{" "}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="head-icons ms-2">
              <Link
                to="#"
                className=""
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-original-title="Collapse"
                id="collapse-header"
              >
                <i className="ti ti-chevrons-up"></i>
              </Link>
            </div>
          </div>
        </div>
        {/* /Breadcrumb */}

        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Candidates Grid</h5>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon-end position-relative">
                    <input
                      type="text"
                      className="form-control date-range bookingrange"
                      placeholder="dd/mm/yyyy - dd/mm/yyyy"
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-chevron-down"></i>
                    </span>
                  </div>
                </div>
                {/* Role and Status Dropdowns */}
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="row">
          <div className="col-xxl-3 col-xl-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center flex-shrink-0">
                    <Link
                      to="#"
                      className="avatar avatar-lg avatar rounded-circle me-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#candidate_details"
                    >
                      <img
                        src="/assets/img/users/user-39.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </Link>
                    <div className="d-flex flex-column">
                      <div className="d-flex flex-wrap mb-1">
                        <h6 className="fs-16 fw-semibold me-1">
                          <Link
                            to="#"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#candidate_details"
                          >
                            Harold Gaynor
                          </Link>
                        </h6>
                        <span className="badge bg-primary-transparent">
                          Cand-001
                        </span>
                      </div>
                      <p className="text-gray fs-13 fw-normal">
                        harold@example.com
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-light rounder p-2">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="text-gray fs-14 fw-normal">Applied Role</h6>
                    <span className="text-dark fs-14 fw-medium">
                      Accountant
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="text-gray fs-14 fw-normal">Applied Date</h6>
                    <span className="text-dark fs-14 fw-medium">
                      12 Sep 2024
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="text-gray fs-14 fw-normal">Status</h6>
                    <span className="fs-10 fw-medium badge bg-purple">
                      {" "}
                      <i className="ti ti-point-filled"></i> New
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Load More Button */}
          <div className="col-md-12">
            <div className="text-center mb-4">
              <Link to="#" className="btn btn-primary">
                <i className="ti ti-loader-3 me-1"></i>Load More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Details Offcanvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex="-1"
        id="candidate_details"
      >
        <div className="offcanvas-header border-bottom">
          <h4 className="d-flex align-items-center">
            Candidate Details
            <span className="badge bg-primary-transparent fw-medium ms-2">
              Cand-001
            </span>
          </h4>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="offcanvas-body">{/* Profile details */}</div>
      </div>
    </>
  );
};

export default CandidatesGridPage;
