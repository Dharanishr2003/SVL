import React from "react";
import { Link } from "react-router-dom";

const TaxesPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Taxes</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">HR</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Taxes
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
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
            <div className="mb-2">
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#add_tax"
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="ti ti-circle-plus me-2"></i>Add Tax
              </Link>
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

        {/* Policy list */}
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Tax List</h5>
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
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  Taxes List
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      VAT
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      GST
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  Sort By : Last 7 Days
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Recently Added
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Ascending
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Desending
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Last Month
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Last 7 Days
                    </Link>
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
                    <th>Tax Name</th>
                    <th>Tax Percentage(%)</th>
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
                      <div className="d-flex align-items-center">
                        <h6 className="fs-14 fw-medium text-gray-9 me-2">
                          VAT
                        </h6>
                        <Link
                          to="#"
                          className="text-info"
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Comprehensive tax on the supply of goods and services."
                        >
                          <i className="ti ti-info-circle"></i>
                        </Link>
                      </div>
                    </td>
                    <td>20%</td>
                    <td>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                        >
                          <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                            <i className="ti ti-point-filled text-success"></i>
                          </span>{" "}
                          Active
                        </Link>
                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-success"></i>
                              </span>
                              Active
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-danger"></i>
                              </span>
                              Inactive
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_tax"
                        >
                          <i className="ti ti-edit"></i>
                        </Link>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash"></i>
                        </Link>
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
                      <div className="d-flex align-items-center">
                        <h6 className="fs-14 fw-medium text-gray-9 me-2">
                          GST
                        </h6>
                        <Link
                          to="#"
                          className="text-info"
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Comprehensive tax on the supply of goods and services."
                        >
                          <i className="ti ti-info-circle"></i>
                        </Link>
                      </div>
                    </td>
                    <td>18%</td>
                    <td>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                        >
                          <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                            <i className="ti ti-point-filled text-success"></i>
                          </span>{" "}
                          Active
                        </Link>
                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-success"></i>
                              </span>
                              Active
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-danger"></i>
                              </span>
                              Inactive
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_tax"
                        >
                          <i className="ti ti-edit"></i>
                        </Link>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash"></i>
                        </Link>
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
                      <div className="d-flex align-items-center">
                        <h6 className="fs-14 fw-medium text-gray-9 me-2">
                          Income Tax
                        </h6>
                        <Link
                          to="#"
                          className="text-info"
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Comprehensive tax on the supply of goods and services."
                        >
                          <i className="ti ti-info-circle"></i>
                        </Link>
                      </div>
                    </td>
                    <td>30%</td>
                    <td>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                        >
                          <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                            <i className="ti ti-point-filled text-danger"></i>
                          </span>{" "}
                          Inactive
                        </Link>
                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-success"></i>
                              </span>
                              Active
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-danger"></i>
                              </span>
                              Inactive
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_tax"
                        >
                          <i className="ti ti-edit"></i>
                        </Link>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash"></i>
                        </Link>
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
                      <div className="d-flex align-items-center">
                        <h6 className="fs-14 fw-medium text-gray-9 me-2">
                          Corporate Tax
                        </h6>
                        <Link
                          to="#"
                          className="text-info"
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Comprehensive tax on the supply of goods and services."
                        >
                          <i className="ti ti-info-circle"></i>
                        </Link>
                      </div>
                    </td>
                    <td>25%</td>
                    <td>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                          data-bs-toggle="dropdown"
                        >
                          <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                            <i className="ti ti-point-filled text-danger"></i>
                          </span>{" "}
                          Inactive
                        </Link>
                        <ul className="dropdown-menu  dropdown-menu-end p-3">
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-success d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-success"></i>
                              </span>
                              Active
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              className="dropdown-item rounded-1 d-flex justify-content-start align-items-center"
                            >
                              <span className="rounded-circle bg-transparent-danger d-flex justify-content-center align-items-center me-2">
                                <i className="ti ti-point-filled text-danger"></i>
                              </span>
                              Inactive
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_tax"
                        >
                          <i className="ti ti-edit"></i>
                        </Link>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* /Policylist list */}

        {/* Add Policy */}
        <div className="modal fade" id="add_tax">
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Tax</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>
              <form action="taxes.php">
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Tax Name</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Tax Percentage(%)</label>
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-white border me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Tax
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Policy */}

        {/* Edit  Policy */}
        <div className="modal fade" id="edit_tax">
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Tax</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>
              <form action="taxes.php">
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Tax Name</label>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="VAT"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Tax Percentage(%)</label>
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="20%"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea className="form-control">
                          Comprehensive tax on the supply of goods and services.
                        </textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-white border me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Tax
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Edit  Policy */}

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
                  <Link
                    to="#"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link to="/taxes" className="btn btn-danger">
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
      </div>
    </>
  );
};

export default TaxesPage;
