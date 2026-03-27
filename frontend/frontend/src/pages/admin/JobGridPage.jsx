import React from "react";
import { Link } from "react-router-dom";

const JobGridPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Jobs</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Administration</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Jobs
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="me-2 mb-2">
              <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                <Link to="/job-list" className="btn btn-icon btn-sm me-1">
                  <i className="ti ti-list-tree"></i>
                </Link>
                <Link
                  to="/job-grid"
                  className="btn btn-icon btn-sm active bg-primary text-white"
                >
                  <i className="ti ti-layout-grid"></i>
                </Link>
              </div>
            </div>
            <div className="me-2 mb-2">
              <div className="dropdown">
                <a
                  href="javascript:void(0);"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-file-export me-1"></i>Export
                </a>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      <i className="ti ti-file-type-pdf me-1"></i>Export as PDF
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      <i className="ti ti-file-type-xls me-1"></i>Export as
                      Excel{" "}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mb-2">
              <a
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#add_post"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2"></i>Post Job
              </a>
            </div>
            <div className="head-icons ms-2">
              <a
                href="javascript:void(0);"
                className=""
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-original-title="Collapse"
                id="collapse-header"
              >
                <i className="ti ti-chevrons-up"></i>
              </a>
            </div>
          </div>
        </div>
        {/* /Breadcrumb */}

        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between">
              <h5>Job Grid</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                <div className="dropdown me-3">
                  <a
                    href="javascript:void(0);"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Role
                  </a>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Senior IOS Developer
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Junior PHP Developer
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Network Engineer
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="dropdown me-3">
                  <a
                    href="javascript:void(0);"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Status
                  </a>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Active
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Inactive
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="dropdown">
                  <a
                    href="javascript:void(0);"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By : Last 7 Days
                  </a>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Recently Added
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Ascending
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Desending
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Last Month
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0);"
                        className="dropdown-item rounded-1"
                      >
                        Last 7 Days
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="card bg-light">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <Link to="#" className="me-2">
                        <span className="avatar avatar-lg bg-gray">
                          <img
                            src="/assets/img/icons/apple.svg"
                            className="w-auto h-auto"
                            alt="icon"
                          />
                        </span>
                      </Link>
                      <div>
                        <h6 className="fw-medium mb-1 text-truncate">
                          <Link to="#">Senior IOS Developer</Link>
                        </h6>
                        <p className="fs-12 text-gray fw-normal">
                          25 Applicants
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-column mb-3">
                  <p className="text-dark d-inline-flex align-items-center mb-2">
                    <i className="ti ti-map-pin-check text-gray-5 me-2"></i>
                    New York, USA
                  </p>
                  <p className="text-dark d-inline-flex align-items-center mb-2">
                    <i className="ti ti-currency-dollar text-gray-5 me-2"></i>
                    30, 000 - 35, 000 / month
                  </p>
                  <p className="text-dark d-inline-flex align-items-center">
                    <i className="ti ti-briefcase text-gray-5 me-2"></i>2 years
                    of experience
                  </p>
                </div>
                <div className="mb-3">
                  <span className="badge badge-pink-transparent me-2">
                    Full Time
                  </span>
                  <span className="badge bg-secondary-transparent">Expert</span>
                </div>
                <div className="progress progress-xs mb-2">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <div>
                  <p className="fs-12 text-gray fw-normal">10 of 25 filled</p>
                </div>
              </div>
            </div>
          </div>
          {/* Repeat similar cards for other jobs */}
        </div>
      </div>

      {/* Post Job Modal */}
      <div className="modal fade" id="add_post">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Post Job</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="contact-grids-tab pt-0">
                    <ul className="nav nav-underline" id="myTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link active"
                          id="info-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#basic-info"
                          type="button"
                          role="tab"
                          aria-selected="true"
                        >
                          Basic Information
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className="nav-link"
                          id="address-tab"
                          data-bs-toggle="tab"
                          data-bs-target="#address"
                          type="button"
                          role="tab"
                          aria-selected="false"
                        >
                          Location
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="basic-info"
                      role="tabpanel"
                      aria-labelledby="info-tab"
                      tabIndex="0"
                    >
                      <div className="row">
                        {/* Basic Info Fields */}
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <img
                                src="/assets/img/profiles/avatar-30.jpg"
                                alt="img"
                                className="rounded-circle"
                              />
                            </div>
                            <div className="profile-upload">
                              <div className="mb-2">
                                <h6 className="mb-1">Upload Profile Image</h6>
                                <p className="fs-12">
                                  Image should be below 4 mb
                                </p>
                              </div>
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn btn btn-sm btn-primary me-2">
                                  Upload
                                  <input
                                    type="file"
                                    className="form-control image-sign"
                                    multiple=""
                                  />
                                </div>
                                <a
                                  href="javascript:void(0);"
                                  className="btn btn-light btn-sm"
                                >
                                  Cancel
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Job Title <span className="text-danger"> *</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-light me-2"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#success_modal"
                        >
                          Save & Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobGridPage;
