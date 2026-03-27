import React from "react";
import { Link } from "react-router-dom";

const PayrollPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Payroll Items</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">HR</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Payroll Items
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
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
        <div className="d-flex flex-wrap gy-2 justify-content-between my-4">
          <div className="payroll-btns">
            <Link to="/payroll" className="btn btn-white active border me-2">
              Additions
            </Link>
            <Link to="/payroll-overtime" className="btn btn-white border me-2">
              Overtime
            </Link>
            <Link to="/payroll-deduction" className="btn btn-white border">
              Deductions
            </Link>
          </div>
          <div className="mb-2">
            <Link
              to="#"
              data-bs-toggle="modal"
              data-bs-target="#add_payroll"
              className="btn btn-primary d-flex align-items-center"
            >
              <i className="ti ti-circle-plus me-2"></i>Add Addition
            </Link>
          </div>
        </div>

        {/* /Breadcrumb */}

        {/* Payroll list */}
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Additions List</h5>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
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
                    <th>Name</th>
                    <th>Category</th>
                    <th>Default / Unit Amount</th>
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
                      <h6 className="fs-14 fw-medium text-gray-9">
                        Leave Balance Amount
                      </h6>
                    </td>
                    <td>Monthly Remuneration</td>
                    <td>$5</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_payroll"
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
                      <h6 className="fs-14 fw-medium text-gray-9">
                        Arrears of Salary
                      </h6>
                    </td>
                    <td>Additional Remuneration</td>
                    <td>$8</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_payroll"
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
                      <h6 className="fs-14 fw-medium text-gray-9">Gratuity</h6>
                    </td>
                    <td>Monthly Remuneration</td>
                    <td>$20</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_payroll"
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
        {/* /Payroll list */}
      </div>

      {/* /Page Wrapper */}

      {/* Add Payroll */}
      <div className="modal fade" id="add_payroll">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Addition</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="payroll.php">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <select className="select">
                        <option>Monthly Remuneration</option>
                        <option> Additional Remuneration</option>
                        <option> Monthly Remuneration</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div>
                        <label className="form-label">Amount</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <input type="text" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label mb-0 fs-12 fw-normal">
                          Unit Calculation
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault2"
                              defaultChecked
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault2"
                            >
                              No Assignee
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault3"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault3"
                            >
                              All Employees
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault4"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault4"
                            >
                              Select Employee
                            </label>
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
                  className="btn btn-white border me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Payroll */}

      {/* Edit  Payroll */}
      <div className="modal fade" id="edit_payroll">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Addition</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="payroll.php">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Leave Balance Amount"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <select className="select">
                        <option>Monthly Remuneration</option>
                        <option defaultValue> Additional Remuneration</option>
                        <option> Monthly Remuneration</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div>
                        <label className="form-label">Amount</label>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          defaultValue="$5"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label mb-0 fs-12 fw-normal">
                          Unit Calculation
                        </label>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault9"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault6"
                              defaultChecked
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault6"
                            >
                              No Assignee
                            </label>
                          </div>
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault7"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault7"
                            >
                              All Employees
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="flexRadioDefault"
                              id="flexRadioDefault8"
                            />
                            <label
                              className="form-check-label fs-14 fw-medium text-dark "
                              htmlFor="flexRadioDefault8"
                            >
                              Select Employee
                            </label>
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
                  className="btn btn-white border me-2"
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
      {/* /Edit  Payroll */}

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
                <Link to="/payroll" className="btn btn-danger">
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Modal */}
    </>
  );
};

export default PayrollPage;
