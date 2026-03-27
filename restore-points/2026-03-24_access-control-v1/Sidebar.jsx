import { useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { attachAdminNavigationHandlers } from "../../utils/adminNavigation";
import { useAuth } from "../../context/AuthContext";
import { usePageAccess } from "../../context/PageAccessContext";

export default function Sidebar() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const { canAccess } = usePageAccess();
  const isEmployee = role === "EMPLOYEE";

  // Section heading visibility — hide heading when no items underneath are accessible
  const hasHrmItems =
    canAccess("employees") || canAccess("tickets") || canAccess("holidays") ||
    canAccess("attendance") || canAccess("performance") || canAccess("training") ||
    canAccess("promotion") || canAccess("resignation") || canAccess("termination");

  const hasFinanceItems =
    canAccess("sales") || canAccess("accounting") || canAccess("payroll") ||
    canAccess("accounts") || canAccess("vendor-management");

  const hasReportsItems = canAccess("reports");

  const hasRecruitmentItems =
    canAccess("recruitment") && !isEmployee;

  useEffect(() => {
    return attachAdminNavigationHandlers(containerRef.current, navigate);
  }, [navigate, location.pathname]);

  return (
    <div ref={containerRef}>
      <div className="sidebar" id="sidebar">
        <div className="sidebar-logo">
          <a href="/admin-dashboard" className="logo logo-normal">
            <img src="/assets/img/logo.svg" alt="Logo" />
          </a>
          <a href="/admin-dashboard" className="logo-small">
            <img src="/assets/img/logo-small.svg" alt="Logo" />
          </a>
          <a href="/admin-dashboard" className="dark-logo">
            <img src="/assets/img/logo-white.svg" alt="Logo" />
          </a>
        </div>

        <div className="modern-profile p-3 pb-0">
          <div className="text-center rounded bg-light p-3 mb-4 user-profile">
            <div className="avatar avatar-lg online mb-3">
              <img
                src="/assets/img/profiles/avatar-02.jpg"
                alt="Img"
                className="img-fluid rounded-circle"
              />
            </div>
            <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
            <p className="fs-10">System Admin</p>
          </div>
          <div className="sidebar-nav mb-3">
            <ul
              className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified bg-transparent"
              role="tablist"
            >
              <li className="nav-item">
                <a className="nav-link active border-0" href="#">
                  Menu
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link border-0" href="/email">
                  Inbox
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="sidebar-header p-3 pb-0 pt-2">
          <div className="text-center rounded bg-light p-2 mb-4 sidebar-profile d-flex align-items-center">
            <div className="avatar avatar-md onlin">
              <img
                src="/assets/img/profiles/avatar-02.jpg"
                alt="Img"
                className="img-fluid rounded-circle"
              />
            </div>
            <div className="text-start sidebar-profile-info ms-2">
              <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
              <p className="fs-10">System Admin</p>
            </div>
          </div>
          <div className="input-group input-group-flat d-inline-flex mb-4">
            <span className="input-icon-addon">
              <i className="ti ti-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search in HRMS"
            />
            <span className="input-group-text">
              <kbd>CTRL + / </kbd>
            </span>
          </div>
          <div className="d-flex align-items-center justify-content-between menu-item mb-3">
            <div className="me-3">
              <a href="/calendar" className="btn btn-menubar">
                <i className="ti ti-layout-grid-remove"></i>
              </a>
            </div>
            <div className="me-3 notification-item">
              <a
                href="/activity"
                className="btn btn-menubar position-relative me-1"
              >
                <i className="ti ti-bell"></i>
                <span className="notification-status-dot"></span>
              </a>
            </div>
            <div className="me-0">
              <a href="/email" className="btn btn-menubar">
                <i className="ti ti-message"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="menu-title">
                <span>MAIN MENU</span>
              </li>
              <li>
                <ul>
                  {isEmployee ? (
                    <li className="">
                      <a href="/employee-dashboard" className="">
                        <i className="ti ti-smart-home"></i>
                        <span>Dashboard</span>
                      </a>
                    </li>
                  ) : (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-smart-home"></i>
                      <span>Dashboard</span>
                      <span className="badge badge-danger fs-10 fw-medium text-white p-1">
                        Hot
                      </span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/admin-dashboard" className="">
                          Admin Dashboard
                        </a>
                      </li>
                      <li>
                        <a href="/employee-dashboard" className="">
                          Employee Dashboard
                        </a>
                      </li>
                      <li>
                        <a href="/deals-dashboard" className="">
                          Deals Dashboard
                        </a>
                      </li>
                      <li>
                        <a href="/leads-dashboard" className="">
                          Leads Dashboard
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
              {role === "SUPER_ADMIN" && (
                <li className="submenu">
                  <a href="#" className=" ">
                    <i className="ti ti-user-star"></i>
                    <span>Super Admin</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="/admin-dashboard" className="">
                        Admin Dashboard
                      </a>
                    </li>
                    <li>
                      <a href="/companies" className="">
                        Companies
                      </a>
                    </li>
                    <li>
                      <a href="/subscription" className="">
                        Subscriptions
                      </a>
                    </li>
                    <li>
                      <a href="/packages" className="">
                        Packages
                      </a>
                    </li>
                    <li>
                      <a href="/domain" className="">
                        Domain
                      </a>
                    </li>
                    <li>
                      <a href="/purchase-transaction" className="">
                        Purchase Transaction
                      </a>
                    </li>
                  </ul>
                </li>
              )}
                </ul>
              </li>

              <li className="menu-title">
                <span>PROJECTS</span>
              </li>
              <li>
                <ul>
                  <li className="">
                    <a href="/clients" className="">
                      <i className="ti ti-users-group"></i>
                      <span>Clients</span>
                    </a>
                  </li>
                </ul>
              </li>
              <li className="menu-title">
                <span>CRM</span>
              </li>
              <li>
                <ul>
                  {canAccess("contacts") && (
                  <li className="">
                    <a href="/contacts" className="">
                      <i className="ti ti-user-shield"></i>
                      <span>Contacts</span>
                    </a>
                  </li>
                  )}
                  {canAccess("companies") && (
                  <li className="">
                    <a href="/companies" className="">
                      <i className="ti ti-building"></i>
                      <span>Companies</span>
                    </a>
                  </li>
                  )}
                  {canAccess("deals") && (
                  <li className="">
                    <a href="/deals" className="">
                      <i className="ti ti-heart-handshake"></i>
                      <span>Deals</span>
                    </a>
                  </li>
                  )}
                  {canAccess("design") && (
                  <li className="">
                    <a href="/design">
                      <i className="ti ti-pencil-star"></i>
                      <span>Design</span>
                    </a>
                  </li>
                  )}
                  {canAccess("production") && (
                  <li className="">
                    <a href="/production">
                      <i className="ti ti-building-factory-2"></i>
                      <span>Production</span>
                    </a>
                  </li>
                  )}
                  {canAccess("leads") && (
                  <li className="">
                    <a href="/leads">
                      <i className="ti ti-user-check"></i>
                      <span>Leads</span>
                    </a>
                  </li>
                  )}

                  {role !== "EMPLOYEE" && canAccess("rejected-leads") && (
                    <li className="">
                      <a href="/rejected-leads">
                        <i className="ti ti-circle-x"></i>
                        <span>Rejected Leads</span>
                      </a>
                    </li>
                  )}
                  {canAccess("pipeline") && (
                  <li className="">
                    <a href="/pipeline">
                      <i className="ti ti-timeline-event-text"></i>
                      <span>Pipeline</span>
                    </a>
                  </li>
                  )}
                  {canAccess("analytics") && (
                  <li className="">
                    <a href="/analytics">
                      <i className="ti ti-graph"></i>
                      <span>Analytics</span>
                    </a>
                  </li>
                  )}
                  {canAccess("activity") && (
                  <li className="">
                    <a href="/activity">
                      <i className="ti ti-activity"></i>
                      <span>Activities</span>
                    </a>
                  </li>
                  )}
                  {canAccess("quotation") && (
                  <li className="">
                    <Link to="/quotation">
                      <i className="ti ti-file-invoice"></i>
                      <span>Quotation</span>
                    </Link>
                  </li>
                  )}
                  {/* Stocks section */}
                  {canAccess("stocks") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-stack"></i>
                      <span>Stocks</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/stocks">Dashboard</a>
                      </li>
                      <li>
                        <a href="/stocks/item">Add Item</a>
                      </li>
                      <li>
                        <a href="/stocks/categories">Categories</a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("rrq") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-box"></i>
                      <span>RRQ</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/rrq">RRQ</Link>
                      </li>
                      <li>
                        <Link to="/rrq-type">RRQ Type</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("projects") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-box"></i>
                      <span>Projects</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/projects-grid" className="">
                          Projects
                        </a>
                      </li>
                      <li>
                        <Link to="/project-status">Project Status</Link>
                      </li>
                      <li>
                        <Link to="/project-type">Project Type</Link>
                      </li>
                      <li>
                        <a href="/tasks" className="">
                          Tasks
                        </a>
                      </li>
                      <li>
                        <a href="/task-board" className="">
                          Task Board
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("channel-partners") && (
                  <li className="">
                    <Link to="/channel-partners">
                      <i className="ti ti-users"></i>
                      <span>Channel Partner</span>
                    </Link>
                  </li>
                  )}
                  {canAccess("lead-source") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-user-check"></i>
                      <span>Lead Source</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/lead-status">Lead Status</Link>
                      </li>
                      <li>
                        <Link to="/primary-source">Primary Source</Link>
                      </li>
                      <li>
                        <Link to="/secondary-source">Secondary Source</Link>
                      </li>
                      <li>
                        <Link to="/tertiary-source">Tertiary Source</Link>
                      </li>
                      <li>
                        <Link to="/lead-type">Lead Type</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                </ul>
              </li>
              {hasHrmItems && (
              <li className="menu-title">
                <span>HRM</span>
              </li>
              )}
              <li>
                <ul>
                  {canAccess("employees") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-users"></i>
                      <span>Employees</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/employees" className="">
                          Employees
                        </a>
                      </li>
                      <li>
                        <a href="/departments" className="">
                          Departments
                        </a>
                      </li>
                      <li>
                        <a href="/designations" className="">
                          Designations
                        </a>
                      </li>
                      <li>
                        <a href="/policy" className="">
                          Policies
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("tickets") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-ticket"></i>
                      <span>Tickets</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/tickets" className="">
                          Tickets
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("holidays") && (
                  <li className="">
                    <a href="/holidays">
                      <i className="ti ti-calendar-event"></i>
                      <span>Holidays</span>
                    </a>
                  </li>
                  )}
                  {canAccess("attendance") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-file-time"></i>
                      <span>Attendance</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li className="submenu submenu-two">
                        <a href="javascript:void(0);" className=" ">
                          Leaves
                          <span className="menu-arrow inside-submenu"></span>
                        </a>
                        <ul>
                          <li>
                            <a href="/leaves" className="">
                              Leaves (Admin)
                            </a>
                          </li>
                          <li>
                            <a href="/leaves-employee" className="">
                              Leave (Employee)
                            </a>
                          </li>
                          <li>
                            <a href="/leave-settings" className="">
                              Leave Policy
                            </a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="/attendance-admin" className="">
                          Attendance (Admin)
                        </a>
                      </li>
                      <li>
                        <a href="/attendance-employee" className="">
                          Attendance (Employee)
                        </a>
                      </li>
                      <li>
                        <a href="/timesheets" className="">
                          Timesheets
                        </a>
                      </li>
                      <li>
                        <a href="/schedule-timing" className="">
                          Shift & Schedule
                        </a>
                      </li>
                      <li>
                        <a href="/overtime" className="">
                          Overtime
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("performance") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-school"></i>
                      <span>Performance</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/performance-indicator" className="">
                          Performance Indicator
                        </a>
                      </li>
                      <li>
                        <a href="/performance-appraisal" className="">
                          Performance Appraisal
                        </a>
                      </li>
                      <li>
                        <a href="/goal-tracking" className="">
                          Goal List
                        </a>
                      </li>
                      <li>
                        <a href="/goal-type" className="">
                          Goal Type
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("training") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-edit"></i>
                      <span>Training</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/training" className="">
                          Training List
                        </a>
                      </li>
                      <li>
                        <a href="/trainers" className="">
                          Trainers
                        </a>
                      </li>
                      <li>
                        <a href="/training-type" className="">
                          Training Type
                        </a>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("promotion") && (
                  <li className="">
                    <a href="/promotion">
                      <i className="ti ti-speakerphone"></i>
                      <span>Promotion</span>
                    </a>
                  </li>
                  )}
                  {canAccess("resignation") && (
                  <li className="">
                    <a href="/resignation">
                      <i className="ti ti-external-link"></i>
                      <span>Resignation</span>
                    </a>
                  </li>
                  )}
                  {canAccess("termination") && (
                  <li className="">
                    <a href="/termination">
                      <i className="ti ti-circle-x"></i>
                      <span>Termination</span>
                    </a>
                  </li>
                  )}
                </ul>
              </li>
              {hasRecruitmentItems && (
              <li className="menu-title">
                <span>RECRUITMENT</span>
              </li>
              )}
              {hasRecruitmentItems && (
              <li>
                <ul>
                  <li className="">
                    <a href="/job-grid">
                      <i className="ti ti-timeline"></i>
                      <span>Jobs</span>
                    </a>
                  </li>
                  <li className="">
                    <a href="/candidates-grid">
                      <i className="ti ti-user-shield"></i>
                      <span>Candidates</span>
                    </a>
                  </li>
                  <li className="">
                    <a href="/referrals">
                      <i className="ti ti-ux-circle"></i>
                      <span>Referrals</span>
                    </a>
                  </li>
                </ul>
              </li>
              )}
              {hasFinanceItems && (
              <li className="menu-title">
                <span>FINANCE & ACCOUNTS</span>
              </li>
              )}
              <li>
                <ul>
                  {canAccess("sales") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-shopping-cart-dollar"></i>
                      <span>Sales</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/estimates">Estimates</Link>
                      </li>
                      <li>
                        <Link to="/invoices">Invoices</Link>
                      </li>
                      <li>
                        <Link to="/payments">Payments</Link>
                      </li>
                      <li>
                        <Link to="/expenses">Expenses</Link>
                      </li>
                      <li>
                        <Link to="/provident-fund">Provident Fund</Link>
                      </li>
                      <li>
                        <Link to="/taxes">Taxes</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("accounting") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-file-dollar"></i>
                      <span>Accounting</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/categories">Categories</Link>
                      </li>
                      <li>
                        <Link to="/budgets">Budgets</Link>
                      </li>
                      <li>
                        <Link to="/budget-expenses">Budget Expenses</Link>
                      </li>
                      <li>
                        <Link to="/budget-revenues">Budget Revenues</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("payroll") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className="">
                      <i className="ti ti-cash"></i>
                      <span>Payroll</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/employee-salary">Employee Salary</Link>
                      </li>
                      <li>
                        <Link to="/payslip">Payslip</Link>
                      </li>
                      <li>
                        <Link to="/payroll">Payroll Items</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("accounts") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className="">
                      <i className="ti ti-wallet"></i>
                      <span>Accounts</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/payment-verifications">Payment Verifications</Link>
                      </li>
                      <li>
                        <Link to="/budget-verifications">Budget Verifications</Link>
                      </li>
                      <li>
                        <Link to="/stock-requests">Stock Requests</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {canAccess("vendor-management") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-building"></i>
                      <span>Vendor Management</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <a href="/stocks/vendors">Vendors</a>
                      </li>
                      <li>
                        <a href="/stocks/brands">Brands</a>
                      </li>
                      <li>
                        <a href="/stocks/vendor-types">Vendor Types</a>
                      </li>
                    </ul>
                  </li>
                  )}
                </ul>
              </li>
              {hasReportsItems && (
              <li className="menu-title">
                <span>REPORTS</span>
              </li>
              )}
              <li>
                <ul>
                  {canAccess("reports") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-chart-bar"></i>
                      <span>Reports</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/expenses-report">Expense Report</Link>
                      </li>
                      <li>
                        <Link to="/invoice-report">Invoice Report</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                </ul>
              </li>

              <li className="menu-title">
                <span>Settings</span>
              </li>
              <li>
                <ul>
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <>
                      <li>
                        <a href="/useradmin">
                          <i className="ti ti-users"></i>
                          <span>User Admin</span>
                        </a>
                      </li>

                      <li>
                        <a href="/usergroups">
                          <i className="ti ti-users-group"></i>
                          <span>User Groups</span>
                        </a>
                      </li>

                      <li>
                        <a href="/registration">
                          <i className="ti ti-user-plus"></i>
                          <span>Registration</span>
                        </a>
                      </li>

                      <li>
                        <a href="/session-settings">
                          <i className="ti ti-clock"></i>
                          <span>Session</span>
                        </a>
                      </li>

                      <li>
                        <a href="/user-settings">
                          <i className="ti ti-settings"></i>
                          <span>User Settings</span>
                        </a>
                      </li>

                      <li>
                        <a href="/security">
                          <i className="ti ti-shield-lock"></i>
                          <span>Security</span>
                        </a>
                      </li>

                      <li>
                        <a href="/flow">
                          <i className="ti ti-share"></i>
                          <span>Flow</span>
                        </a>
                      </li>

                      <li>
                        <a href="/logs">
                          <i className="ti ti-file-text"></i>
                          <span>Logs</span>
                        </a>
                      </li>
                    </>
                  )}

                  {(role === "EMPLOYEE" || role === "MANAGER") && (
                    <li>
                      <a href="/logs">
                        <i className="ti ti-file-text"></i>
                        <span>Logs</span>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
