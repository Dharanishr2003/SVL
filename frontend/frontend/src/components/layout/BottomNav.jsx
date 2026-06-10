import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getVendorSession, clearVendorSession } from "../../utils/vendorSession";
import { logoutVendor } from "../../api/vendorAuthApi";
import "./BottomNav.css";

export default function BottomNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const vendorSession = getVendorSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Determine user role and path prefix
  const isCustomer = location.pathname.startsWith("/customer");
  const isVendor = location.pathname.startsWith("/vendor") || !!vendorSession?.vendorId;
  const isAdmin = !isCustomer && !isVendor && isAuthenticated;

  // Handle click outside to close the profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  if (!isAuthenticated && !vendorSession?.vendorId) {
    return null;
  }

  const handleLogout = async () => {
    setShowProfileMenu(false);
    if (isVendor) {
      try {
        await logoutVendor();
      } finally {
        clearVendorSession();
        navigate("/login", { replace: true });
      }
    } else {
      try {
        await logout();
      } finally {
        navigate("/login", { replace: true });
      }
    }
  };

  // Define navigation items based on role
  let navItems = [];

  if (isCustomer) {
    navItems = [
      {
        to: "/customer/chat",
        label: "Chat",
        icon: "ti ti-message",
      },
      {
        to: "/customer/status",
        label: "Status",
        icon: "ti ti-checklist",
      },
    ];
  } else if (isVendor) {
    navItems = [
      {
        to: "/vendor",
        label: "All Orders",
        icon: "ti ti-clipboard-list",
        exact: true,
      },
      {
        to: "/vendor/new-orders",
        label: "New",
        icon: "ti ti-bell",
      },
      {
        to: "/vendor/pending-orders",
        label: "Pending",
        icon: "ti ti-loader-2",
      },
      {
        to: "/vendor/delivered-orders",
        label: "Delivered",
        icon: "ti ti-truck-delivery",
      },
    ];
  } else if (isAdmin) {
    navItems = [
      {
        to: "/admin-dashboard",
        label: "Dashboard",
        icon: "ti ti-layout-dashboard",
      },
      {
        to: "/leads",
        label: "Leads",
        icon: "ti ti-users",
        exact: true,
      },
      {
        to: "/leads?create=true",
        label: "Create",
        icon: "ti ti-plus",
        isSpecial: true,
      },
      {
        to: "/attendance-employee",
        label: "Attendance",
        icon: "ti ti-calendar-user",
      },
      {
        to: "/profile",
        label: "Profile",
        icon: "ti ti-user",
        isProfile: true,
      },
    ];
  }

  if (navItems.length === 0) {
    return null;
  }

  return (
    <div className="bottom-nav-bar d-lg-none">
      <div className="bottom-nav-bar__container">
        {navItems.map((item) => {
          if (item.isProfile) {
            const isProfileActive = location.pathname === "/profile";
            return (
              <div key={item.to} className="bottom-nav-bar__profile-wrapper" ref={profileMenuRef}>
                <button
                  type="button"
                  className={`bottom-nav-bar__item${isProfileActive ? " is-active" : ""}`}
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  style={{ background: "none", border: "none" }}
                >
                  <div className="bottom-nav-bar__icon-wrap">
                    <i className={`${item.icon} bottom-nav-bar__icon`}></i>
                  </div>
                  <span className="bottom-nav-bar__label">{item.label}</span>
                </button>
                {showProfileMenu && (
                  <div className="bottom-nav-bar__profile-menu">
                    <NavLink
                      to="/profile"
                      className="bottom-nav-bar__profile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <i className="ti ti-user"></i>
                      <span>My Profile</span>
                    </NavLink>
                    <button
                      type="button"
                      className="bottom-nav-bar__profile-item bottom-nav-bar__profile-item--danger"
                      onClick={handleLogout}
                    >
                      <i className="ti ti-logout"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `bottom-nav-bar__item${item.isSpecial ? " bottom-nav-bar__item--special" : ""}${isActive ? " is-active" : ""}`
              }
            >
              <div className="bottom-nav-bar__icon-wrap">
                <i className={`${item.icon} bottom-nav-bar__icon`}></i>
              </div>
              <span className="bottom-nav-bar__label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
