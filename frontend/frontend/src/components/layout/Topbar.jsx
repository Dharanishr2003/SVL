import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { attachAdminNavigationHandlers } from "../../utils/adminNavigation";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({
  isMobileSidebarOpen = false,
  onMobileSidebarToggle,
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const cleanupNavigation = attachAdminNavigationHandlers(
      containerRef.current,
      navigate,
      {
        onLogout: handleLogout,
      },
    );

    const getHorizontalRoot = () => {
      const container = containerRef.current;
      if (!container) return null;
      return (
        container.querySelector("#horizontal-menu") ||
        container.querySelector("#horizontal-single")
      );
    };

    const updateHorizontalId = () => {
      const root = getHorizontalRoot();
      if (!root) return;
      const layout = document.documentElement.getAttribute("data-layout");
      const desiredId =
        layout === "horizontal-single"
          ? "horizontal-single"
          : "horizontal-menu";
      if (root.id !== desiredId) {
        root.id = desiredId;
      }
    };

    const syncHorizontalMenu = () => {
      const container = containerRef.current;
      if (!container) return;
      const horizontalRoot = getHorizontalRoot();
      const horizontalMenu = horizontalRoot?.querySelector(".sidebar-menu");
      const verticalMenu = document.querySelector("#sidebar-menu");
      if (!horizontalRoot || !horizontalMenu || !verticalMenu) return;
      const sourceList = verticalMenu.querySelector(":scope > ul");
      if (!sourceList) return;

      const navMenu = document.createElement("ul");
      navMenu.className = "nav-menu";

      const appendSanitizedItem = (item) => {
        if (!(item instanceof HTMLElement)) return;
        const anchor = item.querySelector(":scope > a");
        if (anchor && anchor.getAttribute("href")?.startsWith("javascript:")) {
          anchor.setAttribute("href", "#");
        }
        navMenu.appendChild(item);
      };

      let currentSection = null;
      let currentItems = [];

      const flushSection = () => {
        if (!currentSection || currentItems.length === 0) {
          currentSection = null;
          currentItems = [];
          return;
        }

        const sectionTitle = currentSection;
        const itemsToAppend = currentItems;
        currentSection = null;
        currentItems = [];

        const sectionLi = document.createElement("li");
        sectionLi.className = "submenu";
        sectionLi.innerHTML = `<a href="#"><i class="ti ti-layout-grid"></i><span>${sectionTitle}</span><span class="menu-arrow"></span></a>`;
        const sectionUl = document.createElement("ul");
        itemsToAppend.forEach((item) => sectionUl.appendChild(item));
        sectionLi.appendChild(sectionUl);
        navMenu.appendChild(sectionLi);
      };

      Array.from(sourceList.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return;
        if (child.classList.contains("menu-title")) {
          flushSection();
          const label = child.textContent?.trim();
          if (label) {
            currentSection = label;
          }
          return;
        }

        const directLink = child.querySelector(":scope > a");
        const directList = child.querySelector(":scope > ul");

        if (!directLink && directList) {
          Array.from(directList.children).forEach((inner) => {
            if (!(inner instanceof HTMLElement)) return;
            const clonedInner = inner.cloneNode(true);
            if (currentSection) {
              currentItems.push(clonedInner);
            } else {
              appendSanitizedItem(clonedInner);
            }
          });
          return;
        }

        const clonedChild = child.cloneNode(true);
        if (currentSection) {
          currentItems.push(clonedChild);
        } else {
          appendSanitizedItem(clonedChild);
        }
      });

      flushSection();

      const mainMenu = document.createElement("div");
      mainMenu.className = "main-menu";
      mainMenu.appendChild(navMenu);
      horizontalMenu.innerHTML = "";
      horizontalMenu.appendChild(mainMenu);

      navMenu.style.transform = "";
    };

    const syncWithDelay = () => {
      updateHorizontalId();
      syncHorizontalMenu();
      setTimeout(syncHorizontalMenu, 300);
    };

    syncWithDelay();

    let observer = null;
    const verticalMenu = document.querySelector("#sidebar-menu");
    if (verticalMenu && "MutationObserver" in window) {
      observer = new MutationObserver(() => {
        updateHorizontalId();
        syncHorizontalMenu();
      });
      observer.observe(verticalMenu, { childList: true, subtree: true });
    }

    let layoutObserver = null;
    if ("MutationObserver" in window) {
      layoutObserver = new MutationObserver(() => {
        updateHorizontalId();
        syncHorizontalMenu();
      });
      layoutObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-layout"],
      });
    }

    const showWelcomeToast = () => {
      const shouldShow = sessionStorage.getItem("showWelcomeToast") === "1";
      if (!shouldShow) return;
      const container = containerRef.current;
      if (!container) return;
      let toast = container.querySelector("#welcome-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "welcome-toast";
        toast.className = "welcome-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        container.appendChild(toast);
      }
      const fallbackIdentifier =
        sessionStorage.getItem("lastLoginIdentifier") || "";
      const fallbackUsername =
        fallbackIdentifier && !fallbackIdentifier.includes("@")
          ? fallbackIdentifier
          : "";
      const displayName = user?.username || fallbackUsername;
      const label = displayName
        ? `Welcome back, ${displayName}`
        : "Welcome back";
      toast.textContent = label;
      toast.classList.add("show");
      sessionStorage.removeItem("showWelcomeToast");
      window.setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    };

    showWelcomeToast();

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (layoutObserver) {
        layoutObserver.disconnect();
      }
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      cleanupNavigation();
    };
  }, [
    navigate,
    logout,
    user?.email,
    user?.username,
    user?.firstName,
    user?.lastName,
  ]);

  const notificationButton = (
    <a
      href="#"
      className="btn btn-menubar position-relative"
      title="Notifications"
    >
      <i className="ti ti-bell"></i>
      <span className="notification-status-dot"></span>
    </a>
  );

  const profileDropdown = (
    <div className="dropdown profile-dropdown ms-2">
      <a
        href="#"
        className="dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        title="Profile"
      >
        <span className="avatar avatar-sm online">
          <img
            src={user?.profilePhotoUrl || "/assets/img/profiles/avatar-12.jpg"}
            alt="User"
          />
        </span>
      </a>
      <div className="dropdown-menu dropdown-menu-end shadow-none">
        <Link className="dropdown-item" to="/profile">
          My Profile
        </Link>
        <Link className="dropdown-item" to="/profile-settings">
          Settings
        </Link>
        <button className="dropdown-item" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="header" ref={containerRef}>
      <div className="main-header">
        <div className="header-left">
          <Link to="/admin-dashboard" className="logo">
            <img src="/assets/img/logo.svg" alt="Logo" />
          </Link>
        </div>

        <a
          id="admin_mobile_btn"
          className="mobile_btn"
          href="#sidebar"
          aria-controls="sidebar"
          aria-expanded={isMobileSidebarOpen}
          onClick={(event) => {
            event.preventDefault();
            onMobileSidebarToggle?.();
          }}
        >
          <span className="bar-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </a>

        <div className="header-user">
          <div className="nav user-menu nav-list">
            <div
              className="me-auto d-flex align-items-center"
              id="header-search"
            >
              <a
                id="toggle_btn"
                href="#"
                className="btn btn-menubar me-1"
                title="Collapse Sidebar"
              >
                <i className="ti ti-arrow-bar-to-left"></i>
              </a>
              {/* Search */}
              {/* <div className="input-group input-group-flat d-inline-flex me-1">
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
              </div> */}
              {/* /Search */}

            
            </div>
            <div
              className="topbar-attendance-slot"
              id="topbar-attendance-slot"
              data-topbar-attendance-slot="desktop"
            ></div>
            <div className="d-none d-lg-flex align-items-center header-actions">
              <a
                href="#"
                className="btn btn-menubar me-1"
                title={isFullscreen ? "Minimize" : "Maximize"}
                onClick={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
              >
                <i
                  className={isFullscreen ? "ti ti-minimize" : "ti ti-maximize"}
                ></i>
              </a>
                <Link
                to="/profile-settings"
                className="btn btn-menubar"
                title="Settings"
              >
                <i className="ti ti-settings-cog"></i>
              </Link>
                <Link to="/apps" className="btn btn-menubar me-1" title="Apps">
                <i className="ti ti-layout-grid"></i>
              </Link>
                {notificationButton}
                {profileDropdown}
              </div>

            {/* Horizontal Single */}
            <div className="sidebar sidebar-horizontal" id="horizontal-menu">
              <div className="sidebar-menu"></div>
            </div>

            {/* Mobile Menu */}
              <div className="dropdown mobile-user-menu mobile-user-menu--visible">
              <a
                href="#"
                className="mobile-user-menu__trigger dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Account"
              >
                <span className="mobile-avatar-wrap">
                  <img
                    src={user?.profilePhotoUrl || "/assets/img/profiles/avatar-12.jpg"}
                    alt="User"
                    className="mobile-avatar-img"
                  />
                  <span className="mobile-avatar-online"></span>
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-end mobile-user-dropdown">
                <div className="mobile-user-dropdown__header">
                  <span className="mobile-avatar-wrap mobile-avatar-wrap--lg">
                    <img
                      src={user?.profilePhotoUrl || "/assets/img/profiles/avatar-12.jpg"}
                      alt="User"
                      className="mobile-avatar-img"
                    />
                    <span className="mobile-avatar-online"></span>
                  </span>
                  <div className="mobile-user-dropdown__info">
                    <span className="mobile-user-dropdown__name">
                      {user?.firstName
                        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                        : user?.username || "User"}
                    </span>
                    <span className="mobile-user-dropdown__role">{user?.role || "Admin"}</span>
                  </div>
                </div>
                <div className="mobile-user-dropdown__divider"></div>
                <Link className="dropdown-item mobile-user-dropdown__item" to="/profile">
                  <i className="ti ti-user"></i>
                  My Profile
                </Link>
                <Link className="dropdown-item mobile-user-dropdown__item" to="/profile-settings">
                  <i className="ti ti-settings"></i>
                  Settings
                </Link>
                <div className="mobile-user-dropdown__divider"></div>
                <button className="dropdown-item mobile-user-dropdown__item mobile-user-dropdown__item--danger" onClick={handleLogout}>
                  <i className="ti ti-logout"></i>
                  Logout
                </button>
              </div>
            </div>
            {/* /Mobile Menu */}
          </div>
        </div>

      </div>
    </div>
  );
}
