import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearVendorSession, getVendorSession } from "../utils/vendorSession";

export default function VendorLayout() {
  const navigate = useNavigate();
  const session = getVendorSession();

  const handleLogout = async () => {
    clearVendorSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="main-wrapper customer-layout">
      <div className="header customer-topbar">
        <div className="main-header customer-topbar__inner">
          <div className="header-left customer-topbar__brand">
            <a href="/vendor" className="logo customer-topbar__logo">
              <img src="/assets/img/logo.svg" alt="Logo" />
            </a>
          </div>
          <div className="header-user ms-auto d-flex align-items-center justify-content-end">
            <div className="customer-topbar__profile">
              <div className="customer-topbar__name">
              {session?.username || session?.officialEmail || "Vendor"}
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar customer-sidebar" id="sidebar">
        <div className="sidebar-logo customer-sidebar__logo">
          <a href="/vendor" className="logo logo-normal">
            <img alt="Logo" src="/assets/img/logo-white.svg" />
          </a>
        </div>
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="menu-title">
                <span>VENDOR</span>
              </li>
              <li>
                <NavLink to="/vendor" end>
                  <i className="ti ti-clipboard-list"></i>
                  <span>All Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendor/new-orders">
                  <i className="ti ti-bell"></i>
                  <span>New Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendor/pending-orders">
                  <i className="ti ti-loader-2"></i>
                  <span>Pending Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendor/delivered-orders">
                  <i className="ti ti-truck-delivery"></i>
                  <span>Delivered Orders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendor/payment-pending">
                  <i className="ti ti-cash"></i>
                  <span>Payment Pending</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-wrapper">
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
