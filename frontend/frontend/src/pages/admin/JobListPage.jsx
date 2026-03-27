import React from "react";
import { Link } from "react-router-dom";

const JobListPage = () => {
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
                <Link
                  to="/job-list"
                  className="btn btn-icon btn-sm active bg-primary text-white me-1"
                >
                  <i className="ti ti-list-tree"></i>
                </Link>
                <Link to="/job-grid" className="btn btn-icon btn-sm">
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
                <i className="ti ti-circle-plus me-2"></i>Post job
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
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Job List</h5>
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
                  Select Status
                </a>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Accepted
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      sent
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Expired
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Declined
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
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table datatable">
                <thead className="thead-light">
                  <tr>
                    <th className="no-sort">
                      <div className="form-check form-check-md">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="select-all"
                        />
                      </div>
                    </th>
                    <th>Job ID</th>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Salary Range</th>
                    <th>Posted Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>Job-001</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="/job-details"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/apple.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="/job-details">Senior IOS Developer</Link>
                          </h6>
                          <span className="d-block mt-1">25 Applicants</span>
                        </div>
                      </div>
                    </td>
                    <td>Software</td>
                    <td>New York , USA</td>
                    <td>30, 000 - 35, 000 / month</td>
                    <td>12 Sep 2024 </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_post"
                        >
                          <i className="ti ti-edit"></i>
                        </a>
                        <a
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                  {/* Additional rows can be added here following the same pattern */}
                </tbody>
              </table>
            </div>
          </div>
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
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo text-gray-2 fs-16"></i>
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
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Job Description{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <textarea
                              rows="3"
                              className="form-control"
                            ></textarea>
                          </div>
                        </div>
                        {/* More fields */}
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
                    <div
                      className="tab-pane fade"
                      id="address"
                      role="tabpanel"
                      aria-labelledby="address-tab"
                      tabIndex="0"
                    >
                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Address <span className="text-danger"> *</span>
                            </label>
                            <input type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Country <span className="text-danger"> *</span>
                            </label>
                            <select className="form-select">
                              <option>Select</option>
                              <option>USA</option>
                              <option>Canada</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="map-grid mb-3">
                            <iframe
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509170.989457427!2d-123.80081967108484!3d37.192957227641294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1669181581381!5m2!1sen!2sin"
                              style={{ border: "0" }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="w-100"
                            />
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
                          Post
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

      {/* Success Modal */}
      <div className="modal fade" id="success_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-xm">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center p-3">
                <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                  <i className="ti ti-check fs-24"></i>
                </span>
                <h5 className="mb-2">Job Posted Successfully</h5>
                <div>
                  <div className="row g-2">
                    <div className="col-12">
                      <Link to="/job-list" className="btn btn-dark w-100">
                        Back to List
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                <i className="ti ti-trash-x fs-36"></i>
              </span>
              <h4 className="mb-1">Confirm Delete</h4>
              <p className="mb-3">
                You want to delete all the marked items, this cant be undone
                once you delete.
              </p>
              <div className="d-flex justify-content-center">
                <a
                  href="javascript:void(0);"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </a>
                <Link to="/job-list" className="btn btn-danger">
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobListPage;
