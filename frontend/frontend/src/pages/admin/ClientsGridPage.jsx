import React from "react";
import { Link } from "react-router-dom";

const ClientsGridPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Clients</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="admin-dashboard.php">
                    <i className="ti ti-smart-home"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">Employee</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Client Grid
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="me-2 mb-2">
              <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                <Link to="/clients" className="btn btn-icon btn-sm me-1">
                  <i className="ti ti-list-tree"></i>
                </Link>
                <Link
                  to="/clients?view=grid"
                  className="btn btn-icon btn-sm active bg-primary text-white"
                >
                  <i className="ti ti-layout-grid"></i>
                </Link>
              </div>
            </div>
            <div className="mb-2">
              <a
                href="#"
                data-bs-toggle="modal"
                data-bs-target="#add_client"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2"></i>Add Client
              </a>
            </div>
            <div className="ms-2 head-icons">
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

        {/* Clients Info */}
        <div className="row">
          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-2">
                      <span className="p-2 br-10 bg-pink-transparent border border-pink d-flex align-items-center justify-content-center">
                        <i className="ti ti-users-group text-pink fs-18"></i>
                      </span>
                    </div>
                    <div>
                      <p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">
                        Total Clients
                      </p>
                      <h4>300</h4>
                    </div>
                  </div>
                  <span className="badge bg-transparent-purple d-inline-flex align-items-center fw-normal">
                    <i className="ti ti-arrow-wave-right-down me-1"></i>
                    +19.01%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-2">
                      <span className="p-2 br-10 bg-success-transparent border border-success d-flex align-items-center justify-content-center">
                        <i className="ti ti-user-share fs-18"></i>
                      </span>
                    </div>
                    <div>
                      <p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">
                        Active Clients
                      </p>
                      <h4>270</h4>
                    </div>
                  </div>
                  <span className="badge bg-transparent-primary text-primary d-inline-flex align-items-center fw-normal">
                    <i className="ti ti-arrow-wave-right-down me-1"></i>
                    +19.01%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-2">
                      <span className="p-2 br-10 bg-danger-transparent border border-danger d-flex align-items-center justify-content-center">
                        <i className="ti ti-user-pause fs-18"></i>
                      </span>
                    </div>
                    <div>
                      <p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">
                        Inactive Clients
                      </p>
                      <h4>30</h4>
                    </div>
                  </div>
                  <span className="badge bg-transparent-dark text-dark d-inline-flex align-items-center fw-normal">
                    <i className="ti ti-arrow-wave-right-down me-1"></i>
                    +19.01%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-2">
                      <span className="p-2 br-10 bg-info-transparent border border-info d-flex align-items-center justify-content-center">
                        <i className="ti ti-user-plus fs-18"></i>
                      </span>
                    </div>
                    <div>
                      <p className="fs-12 fw-medium mb-0 text-gray-5 mb-1">
                        New Clients
                      </p>
                      <h4>300</h4>
                    </div>
                  </div>
                  <span className="badge bg-transparent-secondary text-dark d-inline-flex align-items-center fw-normal">
                    <i className="ti ti-arrow-wave-right-down me-1"></i>
                    +19.01%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Clients Info */}

        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Client Grid</h5>
              <div className="d-flex align-items-center flex-wrap row-gap-3"></div>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="row">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-39.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Michael Walker</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    CEO
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Office Management App
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-purple"
                      role="progressbar"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-01.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-02.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-03.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +1
                      </a>
                    </div>
                    <span className="text-purple">60%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      BrightWave Innovations
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-40.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Sophie Headrick</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Manager
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Clinic Management{" "}
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-04.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-05.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-06.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-warning">40%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      Stellar Dynamics
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-41.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Cameron Drake</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Director
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project :Educational Platform
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: "15%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-07.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-08.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-09.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-danger">15%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">Quantum Nexus</h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-42.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Doris Crowley</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Consultant
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Navigation and Safety App
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-pink"
                      role="progressbar"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-10.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-11.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-12.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-pink">85%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      EcoVision Enterprises
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-43.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Thomas Bordelon</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Manager
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Travel Planning Website
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-10.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-11.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-12.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-danger">20%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      Aurora Technologies
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-45.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Kathleen Gutierrez</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Director
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Service Booking Software
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-13.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-14.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-15.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +3
                      </a>
                    </div>
                    <span className="text-success">95%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      BlueSky Ventures
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-46.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Bruce Wright</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    CEO
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Hotel Booking App
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-pink"
                      role="progressbar"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-16.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-17.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-18.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +3
                      </a>
                    </div>
                    <span className="text-pink">78%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      TerraFusion Energy
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-47.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Estelle Morgan</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Manager
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project :Car & Bike Rental Software
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-19.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-20.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-21.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-warning">45%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      UrbanPulse Design
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-48.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Stephen Dias</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    CEO
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">Project : Food Order App</p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-22.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-23.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-24.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +2
                      </a>
                    </div>
                    <span className="text-warning">35%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">Nimbus Networks</h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-43.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Angela Thomas</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Consultant
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : POS Admin Software
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-purple"
                      role="progressbar"
                      style={{ width: "55%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-25.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-26.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-27.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +1
                      </a>
                    </div>
                    <span className="text-purple">55%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      Epicurean Delights
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-49.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Charles Ramos</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    CEO
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Chat & Call Mobile App
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-28.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-29.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-30.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +1
                      </a>
                    </div>
                    <span className="text-danger">25%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      AlphaTech Solutions
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <a
                      href="client-details.php"
                      className="avatar avatar-xl avatar-rounded online border p-1 border-primary rounded-circle"
                    >
                      <img
                        src="assets/img/users/user-50.jpg"
                        className="img-fluid h-auto w-auto"
                        alt="img"
                      />
                    </a>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_client"
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </a>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <a href="client-details.php">Shirley Begaye</a>
                  </h6>
                  <span className="badge bg-pink-transparent fs-10 fw-medium">
                    Manager
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-truncate">
                    Project : Invoicing & Billing Software
                  </p>
                  <div className="progress progress-xs mb-2">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-31.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-32.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <span className="avatar avatar-rounded">
                        <img
                          src="assets/img/users/user-33.jpg"
                          className="border border-white"
                          alt="img"
                        />
                      </span>
                      <a
                        className="avatar bg-primary avatar-rounded text-fixed-white fs-12"
                        href="javascript:void(0);"
                      >
                        +1
                      </a>
                    </div>
                    <span className="text-success">98%</span>
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div>
                    <p className="mb-1 fs-12">Company</p>
                    <h6 className="fw-normal text-truncate">
                      Phoenix Solutions
                    </h6>
                  </div>
                  <div className="icons-social d-flex align-items-center">
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light me-2"
                    >
                      <i className="ti ti-message"></i>
                    </a>
                    <a
                      href="#"
                      className="avatar avatar-rounded avatar-sm bg-light"
                    >
                      <i className="ti ti-phone"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <div className="text-center mb-4">
              <a href="#" className="btn btn-primary">
                <i className="ti ti-loader-3 me-1"></i>Load More
              </a>
            </div>
          </div>
        </div>
        {/* /Clients Grid */}
      </div>
      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2014 - 2025 &copy; SmartHR.</p>
        <p>
          Designed &amp; Developed By{" "}
          <a href="javascript:void(0);" className="text-primary">
            Dreams
          </a>
        </p>
      </div>

      {/* /Page Wrapper */}

      {/* Add Client */}
      <div className="modal fade" id="add_client">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add New Client</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="clients.php">
              <div className="contact-grids-tab">
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
                      Permissions
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
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                            <i className="ti ti-photo"></i>
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger"> *</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input type="email" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Username <span className="text-danger"> *</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Email<span className="text-danger"> *</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type="password"
                              className="pass-input form-control"
                            />
                            <span className="ti toggle-password ti-eye-off"></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Confirm Password{" "}
                            <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type="password"
                              className="pass-inputs form-control"
                            />
                            <span className="ti toggle-passwords ti-eye-off"></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number <span className="text-danger"> *</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Company</label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save{" "}
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
                  <div className="modal-body pb-0 ">
                    <div className="card bg-light-500 shadow-none">
                      <div className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <h6>Enable Options</h6>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="form-check form-check-md form-switch me-2">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                role="switch"
                              />
                              Enable all Module
                            </label>
                          </div>
                          <div className="form-check form-check-md d-flex align-items-center">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultChecked
                              />
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive permission-table border rounded">
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                    checked
                                  />
                                  Holidays
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Leaves
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Clients
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Projects
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Tasks
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Chats
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Assets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Timing Sheets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
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
                      Save{" "}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Client */}

      {/* Edit Client */}
      <div className="modal fade" id="edit_client">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Client</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="clients.php">
              <div className="contact-grids-tab">
                <ul className="nav nav-underline" id="myTab2" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="info-tab2"
                      data-bs-toggle="tab"
                      data-bs-target="#basic-info2"
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
                      id="address-tab2"
                      data-bs-toggle="tab"
                      data-bs-target="#address2"
                      type="button"
                      role="tab"
                      aria-selected="false"
                    >
                      Permissions
                    </button>
                  </li>
                </ul>
              </div>
              <div className="tab-content" id="myTabContent2">
                <div
                  className="tab-pane fade show active"
                  id="basic-info2"
                  role="tabpanel"
                  aria-labelledby="info-tab2"
                  tabIndex="0"
                >
                  <div className="modal-body pb-0 ">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
                            <i className="ti ti-photo"></i>
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            First Name <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Michael"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input
                            type="email"
                            className="form-control"
                            defaultValue="Walker"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Username <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="Michael Walker"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Email<span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="michael@example.com"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Password <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type="password"
                              className="pass-input form-control"
                              defaultValue="1234"
                            />
                            <span className="ti toggle-password ti-eye-off"></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3 ">
                          <label className="form-label">
                            Confirm Password{" "}
                            <span className="text-danger"> *</span>
                          </label>
                          <div className="pass-group">
                            <input
                              type="password"
                              className="pass-inputs form-control"
                              defaultValue="1234"
                            />
                            <span className="ti toggle-passwords ti-eye-off"></span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number <span className="text-danger"> *</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="(163) 2459 315"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Company</label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue="BrightWave Innovations"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save{" "}
                    </button>
                  </div>
                </div>
                <div
                  className="tab-pane fade"
                  id="address2"
                  role="tabpanel"
                  aria-labelledby="address-tab2"
                  tabIndex="0"
                >
                  <div className="modal-body pb-0 ">
                    <div className="card bg-light-500 shadow-none">
                      <div className="card-body d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                        <h6>Enable Options</h6>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="form-check form-check-md form-switch me-2">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                role="switch"
                              />
                              Enable all Module
                            </label>
                          </div>
                          <div className="form-check form-check-md d-flex align-items-center">
                            <label className="form-check-label mt-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                defaultChecked
                              />
                              Select All
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive permission-table border rounded">
                      <table className="table">
                        <tbody>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                    checked
                                  />
                                  Holidays
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultChecked
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                    checked
                                  />
                                  Leaves
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div
                                className="form-check form-check-md d-flex align-items-center"
                                checked
                              >
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Clients
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Projects
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Tasks
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Chats
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Assets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="form-check form-check-md form-switch me-2">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    role="switch"
                                  />
                                  Timing Sheets
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Read
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Write
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Create
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Delete
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Import
                                </label>
                              </div>
                            </td>
                            <td>
                              <div className="form-check form-check-md d-flex align-items-center">
                                <label className="form-check-label mt-0">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                  />
                                  Export
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-light border me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save{" "}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Client */}

      {/* Add Client Success */}
      <div className="modal fade" id="success_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-body">
              <div className="text-center p-3">
                <span className="avatar avatar-lg avatar-rounded bg-success mb-3">
                  <i className="ti ti-check fs-24"></i>
                </span>
                <h5 className="mb-2">Client Added Successfully</h5>
                <p className="mb-3">
                  Stephan Peralt has been added with Client ID :{" "}
                  <span className="text-primary">#CLT - 0024</span>
                </p>
                <div>
                  <div className="row g-2">
                    <div className="col-6">
                      <a href="clients.php" className="btn btn-dark w-100">
                        Back to List
                      </a>
                    </div>
                    <div className="col-6">
                      <a
                        href="client-details.php"
                        className="btn btn-primary w-100"
                      >
                        Detail Page
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Client Success */}

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
                <a href="clients-grid.php" className="btn btn-danger">
                  Yes, Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </>
  );
};

export default ClientsGridPage;
