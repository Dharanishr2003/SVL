import React from "react";

const PipelinePage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Pipeline</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="admin-dashboard.php">
                    <i className="ti ti-smart-home"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">CRM</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Pipeline List
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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
                data-bs-target="#add_pipeline"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2"></i>Add Pipeline
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

        {/* Pipeline List */}
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Pipeline List</h5>
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
                  Stage
                </a>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Won
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      In Pipeline
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Conversation
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      Follow Up
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
                  $0.00 - $0.00
                </a>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      $10 - $20
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      $20 - $30
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      $40 - $50
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
                      Active
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0);"
                      className="dropdown-item rounded-1"
                    >
                      InActive
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
                    <th>Pipeline Name</th>
                    <th>Total Deal Value</th>
                    <th>No of Deals</th>
                    <th>Stages</th>
                    <th>Created Date</th>
                    <th>Status</th>
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
                    <td>
                      <h6 className="fs-14 fw-medium">Sales</h6>
                    </td>
                    <td>$4,50,000</td>
                    <td>315</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Won</span>
                      </div>
                    </td>
                    <td>14 Jan 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Marketing</h6>
                    </td>
                    <td>$3,15,000</td>
                    <td>447</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-purple"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">In Pipeline</span>
                      </div>
                    </td>
                    <td>21 Jan 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Calls</h6>
                    </td>
                    <td>$8,40,000</td>
                    <td>654</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Won</span>
                      </div>
                    </td>
                    <td>20 Feb 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Email</h6>
                    </td>
                    <td>$6,10,000</td>
                    <td>545</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-skyblue"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Conversation</span>
                      </div>
                    </td>
                    <td>15 Mar 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Chats</h6>
                    </td>
                    <td>$4,70,000</td>
                    <td>787</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-skyblue"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Won</span>
                      </div>
                    </td>
                    <td>12 Apr 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Operational</h6>
                    </td>
                    <td>$5,50,000</td>
                    <td>787</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Follow Up</span>
                      </div>
                    </td>
                    <td>20 Apr 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Collabrative</h6>
                    </td>
                    <td>$5,00,000</td>
                    <td>315</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Won</span>
                      </div>
                    </td>
                    <td>06 Jul 2024</td>
                    <td>
                      <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Inactive{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Differentiate</h6>
                    </td>
                    <td>$4,50,000</td>
                    <td>478</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-pink"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">
                          Schedule servise
                        </span>
                      </div>
                    </td>
                    <td>02 Sep 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Interact</h6>
                    </td>
                    <td>$6,20,000</td>
                    <td>664</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-success"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Won</span>
                      </div>
                    </td>
                    <td>15 Nov 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                  <tr>
                    <td>
                      <div className="form-check form-check-md">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <h6 className="fs-14 fw-medium">Identify</h6>
                    </td>
                    <td>$7,40,000</td>
                    <td>128</td>
                    <td>
                      <div className=" d-flex align-items-center">
                        <div
                          className="progress me-2"
                          role="progressbar"
                          aria-label="Basic example"
                          aria-valuenow="0"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ height: "5px", minWidth: "80px" }}
                        >
                          <div
                            className="progress-bar bg-danger"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                        <span className="fs-14 fw-normal">Lost</span>
                      </div>
                    </td>
                    <td>10 Dec 2024</td>
                    <td>
                      <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                        {" "}
                        <i className="ti ti-point-filled me-1"></i>Active{" "}
                      </span>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <a
                          href="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_pipeline"
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* /Pipeline List */}
      </div>

      {/* Add Pipeline */}
      <div className="modal fade" id="add_pipeline">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add New Pipeline</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="#">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Pipeline Name <span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label">
                          Pipeline Stages{" "}
                          <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_stage"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <div className="p-3 border border-gray br-5 mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">Inpipline</h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a
                              href="#"
                              className="text-default"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_stage"
                            >
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a
                              href="#"
                              className="text-default"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <span>
                                <i className="ti ti-trash"></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border border-gray br-5 mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">Follow Up</h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a
                              href="#"
                              className="text-default"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_stage"
                            >
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a
                              href="#"
                              className="text-default"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <span>
                                <i className="ti ti-trash"></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border border-gray br-5">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">
                              Schedule Service
                            </h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a
                              href="#"
                              className="text-default"
                              data-bs-toggle="modal"
                              data-bs-target="#edit_stage"
                            >
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a href="#" className="text-default">
                              <span>
                                <i
                                  className="ti ti-trash"
                                  data-bs-toggle="modal"
                                  data-bs-target="#delete_modal"
                                ></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Access</label>
                      <div className="d-flex  access-item nav">
                        <div className="d-flex align-items-center">
                          <div
                            className="radio-btn d-flex align-items-center "
                            data-bs-toggle="tab"
                            data-bs-target="#all"
                          >
                            <input
                              type="radio"
                              className="status-radio me-2"
                              id="all"
                              name="status"
                              defaultChecked
                            />
                            <label htmlFor="all">All</label>
                          </div>
                          <div
                            className="radio-btn d-flex align-items-center "
                            data-bs-toggle="tab"
                            data-bs-target="#select-person"
                          >
                            <input
                              type="radio"
                              className="status-radio me-2"
                              id="select"
                              name="status"
                            />
                            <label htmlFor="select">Select Person</label>
                          </div>
                        </div>
                      </div>
                      <div className="tab-content">
                        <div className="tab-pane fade" id="select-person">
                          <div className="access-wrapper">
                            <div className="p-3 border border-gray br-5 mb-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center file-name-icon">
                                  <a
                                    href="#"
                                    className="avatar avatar-md border avatar-rounded"
                                  >
                                    <img
                                      src="assets/img/profiles/avatar-20.jpg"
                                      className="img-fluid"
                                      alt="img"
                                    />
                                  </a>
                                  <div className="ms-2">
                                    <h6 className="fw-medium">
                                      <a href="#">Sharon Roy</a>
                                    </h6>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <a href="#" className="text-danger">
                                    Remove
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 border border-gray br-5 mb-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center file-name-icon">
                                  <a
                                    href="#"
                                    className="avatar avatar-md border avatar-rounded"
                                  >
                                    <img
                                      src="assets/img/profiles/avatar-21.jpg"
                                      className="img-fluid"
                                      alt="img"
                                    />
                                  </a>
                                  <div className="ms-2">
                                    <h6 className="fw-medium">
                                      <a href="#">Sharon Roy</a>
                                    </h6>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <a href="#" className="text-danger">
                                    Remove
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                <button type="submit" className="btn btn-primary">
                  Add Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Pipeline */}

      {/* Edit Pipeline */}
      <div className="modal fade" id="edit_pipeline">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Pipeline</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="#">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Pipeline Name <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Marketing"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-block mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="form-label">
                          Pipeline Stages{" "}
                          <span className="text-danger"> *</span>
                        </label>
                        <a
                          href="#"
                          className="add-new text-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#add_stage"
                        >
                          <i className="ti ti-plus text-primary me-1"></i>Add
                          New
                        </a>
                      </div>
                      <div className="p-3 border border-gray br-5 mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">Inpipline</h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a href="#" className="text-default">
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a href="#" className="text-default">
                              <span>
                                <i className="ti ti-trash"></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border border-gray br-5 mb-2">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">Follow Up</h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a href="#" className="text-default">
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a href="#" className="text-default">
                              <span>
                                <i className="ti ti-trash"></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border border-gray br-5">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className="me-2">
                              <i className="ti ti-grip-vertical"></i>
                            </span>
                            <h6 className="fs-14 fw-normal">
                              Schedule Service
                            </h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <a href="#" className="text-default">
                              <span className="me-2">
                                <i className="ti ti-edit"></i>
                              </span>
                            </a>
                            <a href="#" className="text-default">
                              <span>
                                <i className="ti ti-trash"></i>
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Access</label>
                      <div className="d-flex  access-item nav">
                        <div className="d-flex align-items-center">
                          <div
                            className="radio-btn d-flex align-items-center "
                            data-bs-toggle="tab"
                            data-bs-target="#all2"
                          >
                            <input
                              type="radio"
                              className="status-radio me-2"
                              id="all2"
                              name="status2"
                              defaultChecked
                            />
                            <label htmlFor="all2">All</label>
                          </div>
                          <div
                            className="radio-btn d-flex align-items-center "
                            data-bs-toggle="tab"
                            data-bs-target="#select-person2"
                          >
                            <input
                              type="radio"
                              className="status-radio me-2"
                              id="select2"
                              name="status2"
                            />
                            <label htmlFor="select2">Select Person</label>
                          </div>
                        </div>
                      </div>
                      <div className="tab-content">
                        <div className="tab-pane fade" id="select-person2">
                          <div className="access-wrapper">
                            <div className="p-3 border border-gray br-5 mb-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center file-name-icon">
                                  <a
                                    href="#"
                                    className="avatar avatar-md border avatar-rounded"
                                  >
                                    <img
                                      src="assets/img/profiles/avatar-20.jpg"
                                      className="img-fluid"
                                      alt="img"
                                    />
                                  </a>
                                  <div className="ms-2">
                                    <h6 className="fw-medium">
                                      <a href="#">Sharon Roy</a>
                                    </h6>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <a href="#" className="text-danger">
                                    Remove
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 border border-gray br-5 mb-2">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center file-name-icon">
                                  <a
                                    href="#"
                                    className="avatar avatar-md border avatar-rounded"
                                  >
                                    <img
                                      src="assets/img/profiles/avatar-21.jpg"
                                      className="img-fluid"
                                      alt="img"
                                    />
                                  </a>
                                  <div className="ms-2">
                                    <h6 className="fw-medium">
                                      <a href="#">Sharon Roy</a>
                                    </h6>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <a href="#" className="text-danger">
                                    Remove
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  data-bs-target="#pipeline-access"
                >
                  Add Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Pipeline */}

      {/* Pipeline Access */}
      <div className="modal fade" id="pipeline-access">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Pipeline Access</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="#">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <div className="input-icon-end position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                        />
                        <span className="input-icon-addon">
                          <i className="ti ti-search text-gray-7"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <div className="p-2 border br-5">
                        <div className="pipeline-access-items">
                          <div className="d-flex  align-items-center p-2">
                            <div className="form-check  form-check-md me-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                            <div className="d-flex align-items-center file-name-icon">
                              <a
                                href="#"
                                className="avatar avatar-md border avatar-rounded"
                              >
                                <img
                                  src="assets/img/profiles/avatar-19.jpg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium fs-12">
                                  <a href="#">Darlee Robertson</a>
                                </h6>
                                <span className="fs-10 fw-normal">
                                  Darlee Robertson
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center p-2">
                            <div className="form-check form-check-md me-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                            <div className="d-flex align-items-center file-name-icon">
                              <a
                                href="#"
                                className="avatar avatar-md border avatar-rounded"
                              >
                                <img
                                  src="assets/img/profiles/avatar-20.jpg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium fs-12">
                                  <a href="#">Sharon Roy</a>
                                </h6>
                                <span className="fs-10 fw-normal">
                                  Installer
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center p-2">
                            <div className="form-check form-check-md me-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                            <div className="d-flex align-items-center file-name-icon">
                              <a
                                href="#"
                                className="avatar avatar-md border avatar-rounded"
                              >
                                <img
                                  src="assets/img/profiles/avatar-21.jpg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium fs-12">
                                  <a href="#">Vaughan Lewis</a>
                                </h6>
                                <span className="fs-10 fw-normal">
                                  Senior Manager
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center p-2">
                            <div className="form-check form-check-md me-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                            <div className="d-flex align-items-center file-name-icon">
                              <a
                                href="#"
                                className="avatar avatar-md border avatar-rounded"
                              >
                                <img
                                  src="assets/img/users/user-33.jpg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium fs-12">
                                  <a href="#">Jessica Louise</a>
                                </h6>
                                <span className="fs-10 fw-normal">
                                  Test Engineer
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex align-items-center p-2">
                            <div className="form-check form-check-md me-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                            <div className="d-flex align-items-center file-name-icon">
                              <a
                                href="#"
                                className="avatar avatar-md border avatar-rounded"
                              >
                                <img
                                  src="assets/img/users/user-34.jpg"
                                  className="img-fluid"
                                  alt="img"
                                />
                              </a>
                              <div className="ms-2">
                                <h6 className="fw-medium fs-12">
                                  <a href="#">Test Engineer</a>
                                </h6>
                                <span className="fs-10 fw-normal">
                                  UI /UX Designer
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                <button type="submit" className="btn btn-primary">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Pipeline Access */}

      {/* Add New Stage */}
      <div className="modal fade" id="add_stage">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add New Stage</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="#">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Stage Name <span className="text-danger"> *</span>
                      </label>
                      <input type="text" className="form-control" />
                    </div>
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
                <button type="submit" className="btn btn-primary">
                  Add Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add New Stage */}

      {/* Edit Stage */}
      <div className="modal fade" id="edit_stage">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Stage</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="#">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Edit Name <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Inpipeline"
                      />
                    </div>
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
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Edit Stage */}

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
                <a href="#" className="btn btn-danger">
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

export default PipelinePage;
