import { Fragment, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { attachAdminNavigationHandlers } from "../../utils/adminNavigation";
import { useAuth } from "../../context/AuthContext";
import { usePageAccess } from "../../context/PageAccessContext";
import { adminSidebarSections } from "./adminSidebarConfig";

function hasMatchingRole(role, allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }
  return allowedRoles.includes(role);
}

function hasExcludedRole(role, excludedRoles) {
  if (!Array.isArray(excludedRoles) || excludedRoles.length === 0) {
    return false;
  }
  return excludedRoles.includes(role);
}

export default function Sidebar() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { canAccess } = usePageAccess();
  const role = String(user?.role || "").toUpperCase();

  const canAccessAny = (...keys) =>
    keys.flat().some((key) => key && canAccess(key));

  const isVisibleItem = (item) => {
    if (!item) return false;
    if (!hasMatchingRole(role, item.rolesAny)) return false;
    if (hasExcludedRole(role, item.excludeRoles)) return false;
    const children = Array.isArray(item.children)
      ? item.children.filter(isVisibleItem)
      : [];
    if (children.length > 0) return true;
    if (Array.isArray(item.accessAny) && item.accessAny.length > 0) {
      return canAccessAny(item.accessAny);
    }
    return Boolean(item.href);
  };

  const visibleSections = useMemo(
    () =>
      adminSidebarSections
        .filter((section) => hasMatchingRole(role, section.rolesAny))
        .map((section) => ({
          ...section,
          items: (section.items || []).filter(isVisibleItem),
        }))
        .filter((section) => section.items.length > 0),
    [role, canAccess],
  );

  useEffect(() => {
    return attachAdminNavigationHandlers(containerRef.current, navigate);
  }, [navigate, location.pathname]);

  const renderItems = (items) =>
    items.map((item) => {
      const visibleChildren = Array.isArray(item.children)
        ? item.children.filter(isVisibleItem)
        : [];

      if (visibleChildren.length > 0) {
        return (
          <li key={item.label} className="submenu">
            <a href="javascript:void(0);">
              {item.icon ? <i className={item.icon}></i> : null}
              <span>{item.label}</span>
              <span className="menu-arrow"></span>
            </a>
            <ul>{renderItems(visibleChildren)}</ul>
          </li>
        );
      }

      return (
        <li key={item.label}>
          <a href={item.href}>
            {item.icon ? <i className={item.icon}></i> : null}
            <span>{item.label}</span>
          </a>
        </li>
      );
    });

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
              placeholder="Search in ERP"
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
              {visibleSections.map((section) => (
                <Fragment key={section.key}>
                  <li key={`${section.key}-title`} className="menu-title">
                    <span>{section.title}</span>
                  </li>
                  <li key={`${section.key}-items`}>
                    <ul>{renderItems(section.items)}</ul>
                  </li>
                </Fragment>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
