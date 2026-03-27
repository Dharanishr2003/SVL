import React from "react";
import { Link } from "react-router-dom";

const PaymentsPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Payments</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">HR</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Payments
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
            <h5>Payment List</h5>
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
                    <th>Invoice ID</th>
                    <th>Client Name</th>
                    <th>Company Name</th>
                    <th>Payment Type</th>
                    <th>Paid Date</th>

                    <th>Paid Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        {" "}
                        Inv-001
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-39.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Michael Walker</Link>
                          </h6>
                          <span className="d-block mt-1">CEO</span>
                        </div>
                      </div>
                    </td>
                    <td>BrightWave Innovations</td>
                    <td>Paypal</td>
                    <td>15 Jan 2024</td>
                    <td>$3000</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-002
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-40.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Sophie Headrick Manager</Link>
                          </h6>
                          <span className="d-block mt-1">Manager</span>
                        </div>
                      </div>
                    </td>
                    <td>Stellar Dynamics</td>
                    <td>Paypal</td>
                    <td>25 Jan 2024</td>
                    <td>$2500</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-003
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-41.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Cameron Drake Director</Link>
                          </h6>
                          <span className="d-block mt-1">Director</span>
                        </div>
                      </div>
                    </td>
                    <td>Quantum Nexus</td>
                    <td>Paypal</td>
                    <td>22 Feb 2024</td>
                    <td>$2800</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-004
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-42.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Doris Crowley Consultant</Link>
                          </h6>
                          <span className="d-block mt-1">Consultant</span>
                        </div>
                      </div>
                    </td>
                    <td>EcoVision Enterprises</td>
                    <td>Paypal</td>
                    <td>17 Mar 2024</td>
                    <td>$3300</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-005
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-43.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Thomas Bordelon</Link>
                          </h6>
                          <span className="d-block mt-1">Manager</span>
                        </div>
                      </div>
                    </td>
                    <td>Aurora Technologies</td>
                    <td>Paypal</td>
                    <td>16 Apr 2024</td>
                    <td>$3600</td>
                  </tr>

                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-006
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-44.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Kathleen Gutierrez</Link>
                          </h6>
                          <span className="d-block mt-1">Director</span>
                        </div>
                      </div>
                    </td>
                    <td>BlueSky Ventures</td>
                    <td>Paypal</td>
                    <td>21 Apr 2024</td>
                    <td>$2000</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-007
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-45.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Bruce Wright</Link>
                          </h6>
                          <span className="d-block mt-1">CEO</span>
                        </div>
                      </div>
                    </td>
                    <td>TerraFusion Energy</td>
                    <td>Paypal</td>
                    <td>06 Jul 2024</td>
                    <td>$3400</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-008
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-46.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Estelle Morgan</Link>
                          </h6>
                          <span className="d-block mt-1">Manager</span>
                        </div>
                      </div>
                    </td>
                    <td>UrbanPulse Design</td>
                    <td>Paypal</td>
                    <td>04 Sep 2024</td>
                    <td>$4000</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-009
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-47.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Stephen Dias</Link>
                          </h6>
                          <span className="d-block mt-1">CEO</span>
                        </div>
                      </div>
                    </td>
                    <td>Nimbus Networks</td>
                    <td>Paypal</td>
                    <td>15 Nov 2024</td>
                    <td>$4500</td>
                  </tr>
                  <tr>
                    <td>
                      <Link to="/invoice-details" className="link-info">
                        Inv-010
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center file-name-icon">
                        <Link
                          to="#"
                          className="avatar avatar-md avatar-rounded"
                        >
                          <img
                            src="/assets/img/users/user-48.jpg"
                            className="img-fluid"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2">
                          <h6 className="fw-medium">
                            <Link to="#">Angela Thomas</Link>
                          </h6>
                          <span className="d-block mt-1">Consultant</span>
                        </div>
                      </div>
                    </td>
                    <td>Epicurean Delights</td>
                    <td>Paypal</td>
                    <td>11 Dec 2024</td>
                    <td>$3800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;
