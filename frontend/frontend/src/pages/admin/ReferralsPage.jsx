import React from "react";
import { Link } from "react-router-dom";

const ReferralsPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Referrals</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">Administration</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Referrals
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
        {/* /Breadcrumb */}

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Referrals List</h5>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
              <div className="dropdown me-3">
                <Link
                  to="#"
                  className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  Role
                </Link>
                <ul className="dropdown-menu  dropdown-menu-end p-3">
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Senior IOS Developer
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Junior PHP Developer
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item rounded-1">
                      Network Engineer
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
                    <th>Referrals ID</th>
                    <th> Referrer Name</th>
                    <th>Job Reffered</th>
                    <th>Referee Name</th>
                    <th>Referrals Bonus</th>
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
                    <td>Reff-001</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-32.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Anthony Lewis</Link>
                          </h6>
                          <span className="d-block mt-1">Finance</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
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
                            <Link to="#">Senior IOS Developer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-11.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Harold Gaynor</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="9ff7feedf0f3fbdffae7fef2eff3fab1fcf0f2"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$200</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-002</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-09.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Brian Villalobos</Link>
                          </h6>
                          <span className="d-block mt-1">Developer</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/php.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Junior PHP Developer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-29.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Sandra Ornellas</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="3447555a50465574514c55594458511a575b59"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$100</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-003</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-01.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Harvey Smith</Link>
                          </h6>
                          <span className="d-block mt-1">Developer</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/black.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Network Engineer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-16.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">John Harris</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="503a3f383e103528313d203c357e333f3d"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$300</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-004</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-33.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Stephan Peralt</Link>
                          </h6>
                          <span className="d-block mt-1">
                            Executive Officer
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/react.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Junior React Developer </Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-57.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Whitney Barnette</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="b8cfd0d1ccd6ddc1f8ddc0d9d5c8d4dd96dbd7d5"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$150</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-005</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-56.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Doglas Martini</Link>
                          </h6>
                          <span className="d-block mt-1">Manager</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/laravel.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Senior Laravel Developer </Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-55.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Richard Thompson</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="a5d7ccc6cdc4d7c1e5c0ddc4c8d5c9c08bc6cac8"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$250</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-006</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-34.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Linda Ray</Link>
                          </h6>
                          <span className="d-block mt-1">Finance</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/devops.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">DevOps Engineer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-45.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Kerry Drake</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="610a04131318210419000c110d044f020e0c"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$400</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-007</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-42.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Elliot Murray</Link>
                          </h6>
                          <span className="d-block mt-1">Developer</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/android.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Junior Android Developer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-30.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">David Carmona</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="b7d3d6c1ded3f7d2cfd6dac7dbd299d4d8da"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$450</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-008</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-38.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Rebecca Smtih</Link>
                          </h6>
                          <span className="d-block mt-1">Executive</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/html.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Senior HTML Developer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-26.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Margaret Soto</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="4d202c3f2a2c3f28390d28352c203d2128632e2220"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$220</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-009</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-52.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Connie Waters</Link>
                          </h6>
                          <span className="d-block mt-1">Developer</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/ui.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Junior UI/UX Designer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-44.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Jeffrey Thaler</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="741e11121206110d34110c15190418115a171b19"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$180</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                    <td>Reff-010</td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-06.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Lori Broaddus</Link>
                          </h6>
                          <span className="d-block mt-1">Finance</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md bg-light rounded"
                        >
                          <img
                            src="/assets/img/icons/grafic.svg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Senior Graphic Designer</Link>
                          </h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link to="#" className="avatar avatar-md ">
                          <img
                            src="/assets/img/users/user-10.jpg"
                            className="img-fluid rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Joyce Golston</Link>
                          </h6>
                          <span className="d-block mt-1">
                            <Link
                              href="cdn-cgi/l/email-protection"
                              className="__cf_email__"
                              data-cfemail="a9c3c6d0cacce9ccd1c8c4d9c5cc87cac6c4"
                            >
                              [email&#160;protected]
                            </Link>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>$250</td>
                    <td>
                      <div className="action-icon d-inline-flex">
                        <Link to="#" className="me-2">
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
                <Link
                  to="#"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <Link to="/referrals" className="btn btn-danger">
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

export default ReferralsPage;
