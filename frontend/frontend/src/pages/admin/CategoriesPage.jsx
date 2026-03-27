import React from "react";
import { Link } from "react-router-dom";

const CategoriesPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Categories</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">HR</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Categories
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="mb-2">
              <Link
                to="#"
                className="btn btn-primary d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#add_category"
              >
                <i className="ti ti-circle-plus me-2"></i>Add Categories
              </Link>
            </div>
            <div className="ms-2 head-icons">
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

        {/* Categories Table */}
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Category List</h5>
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
                    <th>Category Name</th>
                    <th>Sub Category Name</th>
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
                      <h6 className="fw-medium">Technology</h6>
                    </td>
                    <td>Hardware Cost</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Taxes</h6>
                    </td>
                    <td>Payroll Taxes</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Recruitment</h6>
                    </td>
                    <td>Advertisement</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Compensation</h6>
                    </td>
                    <td>Incentive</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Travel</h6>
                    </td>
                    <td>Business Travel</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Internship</h6>
                    </td>
                    <td>Stipends</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Employee Engagement</h6>
                    </td>
                    <td>Engagement Activities</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Employee Benefits</h6>
                    </td>
                    <td>Healthcare Benefits</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium"> Corporate Events</h6>
                    </td>
                    <td>Decorations</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
                      <h6 className="fw-medium">Compliance</h6>
                    </td>
                    <td>Performance Appraisal</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link
                          to="#"
                          className="me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_category"
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
        {/* /Categories Table */}
      </div>

      {/* Add Category */}
      <div className="modal fade" id="add_category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Category</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="categories.php">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Sub Category Name</label>
                      <input type="text" className="form-control" />
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
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Category */}

      {/* Edit Category */}
      <div className="modal fade" id="edit_category">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Category</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form action="categories.php">
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Technology"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Sub Category Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue="Hardware Cost"
                      />
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
      {/* /Edit Category */}

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
                <Link to="/categories" className="btn btn-danger">
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

export default CategoriesPage;
