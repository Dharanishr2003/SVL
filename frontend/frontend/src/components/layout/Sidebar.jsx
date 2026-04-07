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
  const isAdminEquivalent =
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER" || role === "TEAM_LEAD" || role === "EMPLOYEE";
  const canAccessAny = (...keys) =>
    keys.flat().some((key) => key && canAccess(key));

  // Section heading visibility — hide heading when no items underneath are accessible
  const hasHrmItems =
    canAccessAny("employees", "employees-list", "departments", "designations", "policy") ||
    canAccess("tickets") ||
    canAccess("holidays") ||
    canAccessAny(
      "attendance",
      "leaves",
      "leaves-employee",
      "leave-settings",
      "attendance-admin",
      "attendance-employee",
      "timesheets",
      "schedule-timing",
      "shift-assignments",
      "overtime",
    ) ||
    canAccessAny(
      "performance",
      "performance-indicator",
      "performance-appraisal",
      "goal-tracking",
      "goal-type",
    ) ||
    canAccessAny("training", "training-list", "trainers", "training-type") ||
    canAccess("promotion") ||
    canAccess("resignation") ||
    canAccess("termination");

  const hasFinanceItems =
    canAccessAny(
      "sales",
      "estimates",
      "sales-invoices",
      "payments",
      "expenses",
      "provident-fund",
      "taxes",
      "invoices",
    ) ||
    canAccessAny("accounting", "categories", "budgets", "budget-expenses", "budget-revenues") ||
    canAccessAny("payroll", "employee-salary", "payslip", "payroll-items") ||
    canAccessAny(
      "accounts",
      "payment-verifications",
      "payment-verifications-page",
      "budget-verifications",
      "budget-verifications-page",
      "stock-requests",
    ) ||
    canAccessAny("vendor-management", "vendors", "brands", "vendor-types");

  const hasReportsItems = canAccessAny(
    "reports",
    "expenses-report",
    "invoice-report",
    "payment-report",
    "employee-report",
    "task-report",
    "user-report",
    "daily-report",
    "leave-report",
    "project-report",
  );

  const hasServicesItems = canAccessAny("services", "service-categories", "service-types");

  const hasProjectItems = canAccess("clients");
  const canOpenEmployeeDashboard = canAccess("employee-dashboard");
  const canOpenAdminDashboard = canAccess("admin-dashboard");
  const canOpenSalesDashboard = canAccess("sales-dashboard");
  const hasDashboardItems = isEmployee
    ? canOpenEmployeeDashboard
    : canOpenAdminDashboard || canOpenEmployeeDashboard || canOpenSalesDashboard;

  const hasRecruitmentItems =
    canAccess("recruitment") && !isEmployee;

  const hasSettingsItems =
    isAdminEquivalent &&
    canAccessAny(
      "settings-useradmin",
      "settings-group-access",
      "settings-usergroups",
      "settings-registration",
      "settings-session",
      "settings-user",
      "settings-security",
      "settings-security-settings",
      "settings-flow",
      "settings-logs",
    );

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
                    hasDashboardItems ? (
                    <li className="">
                      <a href="/employee-dashboard" className="">
                        <i className="ti ti-smart-home"></i>
                        <span>Dashboard</span>
                      </a>
                    </li>
                    ) : null
                  ) : (
                  hasDashboardItems ? (
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
                      {canOpenAdminDashboard && (
                      <li>
                        <a href="/admin-dashboard" className="">
                          Admin Dashboard
                        </a>
                      </li>
                      )}
                      {canOpenEmployeeDashboard && (
                      <li>
                        <a href="/employee-dashboard" className="">
                          Employee Dashboard
                        </a>
                      </li>
                      )}
                      {canOpenSalesDashboard && (
                      <li>
                        <a href="/dashboard" className="">
                          Sales Dashboard
                        </a>
                      </li>
                      )}
                    </ul>
                  </li>
                  ) : null
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

              {hasProjectItems && (
              <>
              <li className="menu-title">
                <span>PROJECTS</span>
              </li>
              <li>
                <ul>
                  {canAccess("clients") && (
                  <li className="">
                    <a href="/clients" className="">
                      <i className="ti ti-users-group"></i>
                      <span>Clients</span>
                    </a>
                  </li>
                  )}
                </ul>
              </li>
              </>
              )}
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
                  {canAccess("customer") && (
                    <li className="">
                      <a href="/customer">
                        <i className="ti ti-users-group"></i>
                        <span>Customers</span>
                      </a>
                    </li>
                  )}
                  {canAccess("quotation") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-file-invoice"></i>
                      <span>Quotation</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/quotation">Create Quotation</Link>
                      </li>
                      <li>
                        <Link to="/quotation-list">Quotation List</Link>
                      </li>
                    </ul>
                  </li>
                  )}
                  {/* Stocks section */}
                  {canAccessAny("stocks", "stocks-dashboard", "stocks-item", "stocks-categories") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-stack"></i>
                      <span>Stocks</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("stocks", "stocks-dashboard") && (
                      <li>
                        <a href="/stocks">Dashboard</a>
                      </li>
                      )}
                      {canAccessAny("stocks", "stocks-item") && (
                      <li>
                        <a href="/stocks/item">Add Item</a>
                      </li>
                      )}
                      {canAccessAny("stocks", "stocks-categories") && (
                      <li>
                        <a href="/stocks/categories">Categories</a>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("rrq", "rrq-overview", "rrq-type") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-box"></i>
                      <span>RRQ</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("rrq", "rrq-overview") && (
                      <li>
                        <Link to="/rrq">RRQ</Link>
                      </li>
                      )}
                      {canAccessAny("rrq", "rrq-type") && (
                      <li>
                        <Link to="/rrq-type">RRQ Type</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("projects", "projects-list", "project-status", "project-type", "tasks", "task-board") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-box"></i>
                      <span>Projects</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("projects", "projects-list") && (
                      <li>
                        <a href="/projects-grid" className="">
                          Projects
                        </a>
                      </li>
                      )}
                      {canAccessAny("projects", "project-status") && (
                      <li>
                        <Link to="/project-status">Project Status</Link>
                      </li>
                      )}
                      {canAccessAny("projects", "project-type") && (
                      <li>
                        <Link to="/project-type">Project Type</Link>
                      </li>
                      )}
                      {canAccessAny("projects", "tasks") && (
                      <li>
                        <a href="/tasks" className="">
                          Tasks
                        </a>
                      </li>
                      )}
                      {canAccessAny("projects", "task-board") && (
                      <li>
                        <a href="/task-board" className="">
                          Task Board
                        </a>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("lead-source", "lead-status", "primary-source", "secondary-source", "tertiary-source", "lead-type") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-user-check"></i>
                      <span>Lead Source</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("lead-source", "lead-status") && (
                      <li>
                        <Link to="/lead-status">Lead Status</Link>
                      </li>
                      )}
                      {canAccessAny("lead-source", "primary-source") && (
                      <li>
                        <Link to="/primary-source">Primary Source</Link>
                      </li>
                      )}
                      {canAccessAny("lead-source", "secondary-source") && (
                      <li>
                        <Link to="/secondary-source">Secondary Source</Link>
                      </li>
                      )}
                      {canAccessAny("lead-source", "tertiary-source") && (
                      <li>
                        <Link to="/tertiary-source">Tertiary Source</Link>
                      </li>
                      )}
                      {canAccessAny("lead-source", "lead-type") && (
                      <li>
                        <Link to="/lead-type">Lead Type</Link>
                      </li>
                      )}
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
                  {canAccessAny("employees", "employees-list", "departments", "designations", "policy") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-users"></i>
                      <span>Employees</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("employees", "employees-list") && (
                      <li>
                        <a href="/employees" className="">
                          Employees
                        </a>
                      </li>
                      )}
                      {canAccessAny("employees", "departments") && (
                      <li>
                        <a href="/departments" className="">
                          Departments
                        </a>
                      </li>
                      )}
                      {canAccessAny("employees", "designations") && (
                      <li>
                        <a href="/designations" className="">
                          Designations
                        </a>
                      </li>
                      )}
                      {canAccessAny("employees", "policy") && (
                      <li>
                        <a href="/policy" className="">
                          Policies
                        </a>
                      </li>
                      )}
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
                  {canAccessAny(
                    "attendance",
                    "leaves",
                    "leaves-employee",
                    "leave-settings",
                    "attendance-admin",
                    "attendance-employee",
                    "timesheets",
                    "schedule-timing",
                    "shift-assignments",
                    "overtime",
                  ) && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-file-time"></i>
                      <span>Attendance</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("attendance", "leaves", "leaves-employee", "leave-settings") && (
                      <li className="submenu submenu-two">
                        <a href="javascript:void(0);" className=" ">
                          Leaves
                          <span className="menu-arrow inside-submenu"></span>
                        </a>
                        <ul>
                          {canAccessAny("attendance", "leaves") && (
                          <li>
                            <a href="/leaves" className="">
                              Leaves (Admin)
                            </a>
                          </li>
                          )}
                          {canAccessAny("attendance", "leaves-employee") && (
                          <li>
                            <a href="/leaves-employee" className="">
                              Leave (Employee)
                            </a>
                          </li>
                          )}
                          {canAccessAny("attendance", "leave-settings") && (
                          <li>
                            <a href="/leave-settings" className="">
                              Leave Policy
                            </a>
                          </li>
                          )}
                        </ul>
                      </li>
                      )}
                      {canAccessAny("attendance", "attendance-admin") && (
                      <li>
                        <a href="/attendance-admin" className="">
                          Attendance (Admin)
                        </a>
                      </li>
                      )}
                      {canAccessAny("attendance", "attendance-employee") && (
                      <li>
                        <a href="/attendance-employee" className="">
                          Attendance (Employee)
                        </a>
                      </li>
                      )}
                      {canAccessAny("attendance", "timesheets") && (
                      <li>
                        <a href="/timesheets" className="">
                          Timesheets
                        </a>
                      </li>
                      )}
                      {canAccessAny("attendance", "schedule-timing") && (
                      <li>
                        <a href="/schedule-timing" className="">
                          Shift & Schedule
                        </a>
                      </li>
                      )}
                      {canAccessAny("attendance", "shift-assignments") && (
                      <li>
                        <a href="/shift-assignments" className="">
                          Shift Assignment
                        </a>
                      </li>
                      )}
                      {canAccessAny("attendance", "overtime") && (
                      <li>
                        <a href="/overtime" className="">
                          Overtime
                        </a>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("performance", "performance-indicator", "performance-appraisal", "goal-tracking", "goal-type") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-school"></i>
                      <span>Performance</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("performance", "performance-indicator") && (
                      <li>
                        <a href="/performance-indicator" className="">
                          Performance Indicator
                        </a>
                      </li>
                      )}
                      {canAccessAny("performance", "performance-appraisal") && (
                      <li>
                        <a href="/performance-appraisal" className="">
                          Performance Appraisal
                        </a>
                      </li>
                      )}
                      {canAccessAny("performance", "goal-tracking") && (
                      <li>
                        <a href="/goal-tracking" className="">
                          Goal List
                        </a>
                      </li>
                      )}
                      {canAccessAny("performance", "goal-type") && (
                      <li>
                        <a href="/goal-type" className="">
                          Goal Type
                        </a>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("training", "training-list", "trainers", "training-type") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-edit"></i>
                      <span>Training</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("training", "training-list") && (
                      <li>
                        <a href="/training" className="">
                          Training List
                        </a>
                      </li>
                      )}
                      {canAccessAny("training", "trainers") && (
                      <li>
                        <a href="/trainers" className="">
                          Trainers
                        </a>
                      </li>
                      )}
                      {canAccessAny("training", "training-type") && (
                      <li>
                        <a href="/training-type" className="">
                          Training Type
                        </a>
                      </li>
                      )}
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
              {hasServicesItems && (
              <li className="menu-title">
                <span>SERVICES</span>
              </li>
              )}
              {hasServicesItems && (
              <li>
                <ul>
                  {canAccessAny("services", "service-categories", "service-types") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className="">
                      <i className="ti ti-shopping-bag"></i>
                      <span>Services</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("services", "service-categories") && (
                      <li>
                        <a href="/services/service-categories">Service Categories</a>
                      </li>
                      )}
                      {canAccessAny("services", "service-types") && (
                      <li>
                        <a href="/services/service-types">Service Types</a>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                </ul>
              </li>
              )}
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
                  {canAccessAny("sales", "estimates", "sales-invoices", "payments", "expenses", "provident-fund", "taxes", "invoices") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-shopping-cart-dollar"></i>
                      <span>Sales</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("sales", "estimates") && (
                      <li>
                        <Link to="/estimates">Estimates</Link>
                      </li>
                      )}
                      {canAccessAny("sales", "sales-invoices", "invoices") && (
                      <li>
                        <Link to="/invoices">Invoices</Link>
                      </li>
                      )}
                      {canAccessAny("sales", "payments") && (
                      <li>
                        <Link to="/payments">Payments</Link>
                      </li>
                      )}
                      {canAccessAny("sales", "expenses") && (
                      <li>
                        <Link to="/expenses">Expenses</Link>
                      </li>
                      )}
                      {canAccessAny("sales", "provident-fund") && (
                      <li>
                        <Link to="/provident-fund">Provident Fund</Link>
                      </li>
                      )}
                      {canAccessAny("sales", "taxes") && (
                      <li>
                        <Link to="/taxes">Taxes</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("accounting", "categories", "budgets", "budget-expenses", "budget-revenues") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-file-dollar"></i>
                      <span>Accounting</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("accounting", "categories") && (
                      <li>
                        <Link to="/categories">Categories</Link>
                      </li>
                      )}
                      {canAccessAny("accounting", "budgets") && (
                      <li>
                        <Link to="/budgets">Budgets</Link>
                      </li>
                      )}
                      {canAccessAny("accounting", "budget-expenses") && (
                      <li>
                        <Link to="/budget-expenses">Budget Expenses</Link>
                      </li>
                      )}
                      {canAccessAny("accounting", "budget-revenues") && (
                      <li>
                        <Link to="/budget-revenues">Budget Revenues</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("payroll", "employee-salary", "payslip", "payroll-items") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className="">
                      <i className="ti ti-cash"></i>
                      <span>Payroll</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("payroll", "employee-salary") && (
                      <li>
                        <Link to="/employee-salary">Employee Salary</Link>
                      </li>
                      )}
                      {canAccessAny("payroll", "payslip") && (
                      <li>
                        <Link to="/payslip">Payslip</Link>
                      </li>
                      )}
                      {canAccessAny("payroll", "payroll-items") && (
                      <li>
                        <Link to="/payroll">Payroll Items</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny(
                    "accounts",
                    "payment-verifications",
                    "payment-verifications-page",
                    "budget-verifications",
                    "budget-verifications-page",
                    "stock-requests",
                  ) && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className="">
                      <i className="ti ti-wallet"></i>
                      <span>Accounts</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("accounts", "payment-verifications", "payment-verifications-page") && (
                      <li>
                        <Link to="/payment-verifications">Payment Verifications</Link>
                      </li>
                      )}
                      {canAccessAny("budget-verifications", "budget-verifications-page") && (
                      <li>
                        <Link to="/budget-verifications">Budget Verifications</Link>
                      </li>
                      )}
                      {canAccessAny("accounts", "stock-requests") && (
                      <li>
                        <Link to="/stock-requests">Stock Requests</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                  {canAccessAny("vendor-management", "vendors", "brands", "vendor-types") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-building"></i>
                      <span>Vendor Management</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("vendor-management", "vendors") && (
                      <li>
                        <a href="/stocks/vendors">Vendors</a>
                      </li>
                      )}
                      {canAccessAny("vendor-management", "brands") && (
                      <li>
                        <a href="/stocks/brands">Brands</a>
                      </li>
                      )}
                      {canAccessAny("vendor-management", "vendor-types") && (
                      <li>
                        <a href="/stocks/vendor-types">Vendor Types</a>
                      </li>
                      )}
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
                  {canAccessAny("reports", "expenses-report", "invoice-report") && (
                  <li className="submenu">
                    <a href="javascript:void(0);" className=" ">
                      <i className="ti ti-chart-bar"></i>
                      <span>Reports</span>
                      <span className="menu-arrow"></span>
                    </a>
                    <ul>
                      {canAccessAny("reports", "expenses-report") && (
                      <li>
                        <Link to="/expenses-report">Expense Report</Link>
                      </li>
                      )}
                      {canAccessAny("reports", "invoice-report") && (
                      <li>
                        <Link to="/invoice-report">Invoice Report</Link>
                      </li>
                      )}
                    </ul>
                  </li>
                  )}
                </ul>
              </li>

              {hasSettingsItems && (
              <li className="menu-title">
                <span>Settings</span>
              </li>
              )}
              {hasSettingsItems && (
              <li>
                <ul>
                  {isAdminEquivalent && (
                    <>
                      {canAccess("settings-useradmin") && (
                      <li>
                        <a href="/useradmin">
                          <i className="ti ti-users"></i>
                          <span>User Admin</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-group-access") && (
                      <li>
                        <a href="/group-access">
                          <i className="ti ti-layout-grid"></i>
                          <span>Group Access</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-usergroups") && (
                      <li>
                        <a href="/usergroups">
                          <i className="ti ti-users-group"></i>
                          <span>User Groups</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-registration") && (
                      <li>
                        <a href="/registration">
                          <i className="ti ti-user-plus"></i>
                          <span>Registration</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-session") && (
                      <li>
                        <a href="/session-settings">
                          <i className="ti ti-clock"></i>
                          <span>Session</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-user") && (
                      <li>
                        <a href="/user-settings">
                          <i className="ti ti-settings"></i>
                          <span>User Settings</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-security") && (
                      <li>
                        <a href="/security">
                          <i className="ti ti-shield-lock"></i>
                          <span>Security</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-security-settings") && (
                      <li>
                        <a href="/security-settings">
                          <i className="ti ti-shield-check"></i>
                          <span>Security Settings</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-flow") && (
                      <li>
                        <a href="/flow">
                          <i className="ti ti-share"></i>
                          <span>Flow</span>
                        </a>
                      </li>
                      )}

                      {canAccess("settings-logs") && (
                      <li>
                        <a href="/logs">
                          <i className="ti ti-file-text"></i>
                          <span>Logs</span>
                        </a>
                      </li>
                      )}
                    </>
                  )}
                </ul>
              </li>
              )}
            </ul>
          </div>    
        </div>
      </div>
    </div>
  );
}
