import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Preloader from "../components/layout/Preloader";
import Topbar from "../components/layout/Topbar";
import TopbarAttendanceAction from "../components/layout/TopbarAttendanceAction";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { getLeadChatNotifications } from "../api/leadsApi";

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const [notice, setNotice] = useState("");
  const [notifyCount, setNotifyCount] = useState(0);
  const [notifyItems, setNotifyItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const lastSeenRef = useRef(new Date().toISOString());
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const role = String(user?.role || "").toUpperCase();
    if (role === "CUSTOMER") return;
    let active = true;

    const updateBellBadge = (count) => {
      const bellLink = document.querySelector(".header-actions .ti-bell")?.closest("a");
      if (!bellLink) return;
      let badge = bellLink.querySelector(".chat-notify-badge");
      if (count > 0) {
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "chat-notify-badge";
          bellLink.appendChild(badge);
        }
        badge.textContent = String(count);
      } else if (badge) {
        badge.remove();
      }
    };

    const clearBadge = () => {
      setNotifyCount(0);
      updateBellBadge(0);
    };

    const handleBellClick = (event) => {
      const bellLink = event.target?.closest(".header-actions .ti-bell")?.closest("a");
      if (!bellLink) return;
      event.stopPropagation();
      event.preventDefault();
      clearBadge();
      const rect = bellLink.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.right - 300,
      });
      setShowDropdown((prev) => !prev);
    };
    window.addEventListener("click", handleBellClick);

    const poll = async () => {
      try {
        const rows = await getLeadChatNotifications(lastSeenRef.current);
        if (!active) return;
        if (rows.length > 0) {
          const latest = rows[0];
          setNotice(latest?.message ? `New message: ${latest.message.slice(0, 80)}` : "New message received");
          setTimeout(() => setNotice(""), 3000);
          setNotifyCount((prev) => {
            const next = prev + rows.length;
            updateBellBadge(next);
            return next;
          });
          setNotifyItems((prev) => {
            const seen = new Set(prev.map((item) => item.messageId));
            const next = [...prev];
            rows.forEach((row) => {
              if (!seen.has(row.messageId)) {
                next.unshift(row);
              }
            });
            return next.slice(0, 20);
          });
          const maxCreated = rows
            .map((row) => row?.createdAt)
            .filter(Boolean)
            .map((value) => new Date(value))
            .reduce((acc, date) => (date > acc ? date : acc), new Date(lastSeenRef.current));
          lastSeenRef.current = maxCreated.toISOString();
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("click", handleBellClick);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleOutside = () => setShowDropdown(false);
    if (showDropdown) {
      window.addEventListener("click", handleOutside);
    }
    return () => window.removeEventListener("click", handleOutside);
  }, [showDropdown]);

  return (
    <>
      <Preloader />

      <div className="main-wrapper">
        {notice ? <div className="chat-notice">{notice}</div> : null}
        {showDropdown ? (
          <div
            className="chat-notify-dropdown"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-notify-dropdown__header">
              <span>Notifications</span>
              <button type="button" onClick={() => setShowDropdown(false)}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="chat-notify-dropdown__list">
              {notifyItems.length === 0 ? (
                <div className="chat-notify-dropdown__empty">No notifications</div>
              ) : (
                notifyItems.map((item) => (
                  <button
                    key={item.messageId || `${item.leadId}-${item.createdAt}`}
                    className="chat-notify-dropdown__item"
                    onClick={() => {
                      setShowDropdown(false);
                      if (item.leadId) {
                        navigate(`/leads/${item.leadId}`);
                      }
                    }}
                  >
                    <div className="chat-notify-dropdown__title">
                      Lead #{item.leadId ?? "-"}
                    </div>
                    <div className="chat-notify-dropdown__message">
                      {item.message || "New message"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
        <Topbar />
        <TopbarAttendanceAction />
        <Sidebar />

        <div className="page-wrapper">
          <div className="content">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}
