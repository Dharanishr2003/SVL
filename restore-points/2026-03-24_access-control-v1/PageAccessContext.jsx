import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMyPageVisibility } from "../api/userGroupApi";
import {
  getRequiredPageKeysForPath,
  isAdminOnlyPath,
  isAlwaysAllowedPath,
} from "../constants/pageAccess";

const PageAccessContext = createContext({});

export function PageAccessProvider({ children }) {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const [visiblePageKeys, setVisiblePageKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setVisiblePageKeys([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      setVisiblePageKeys(["*"]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    getMyPageVisibility()
      .then((keys) => {
        if (!active) return;
        setVisiblePageKeys(Array.isArray(keys) ? keys : []);
      })
      .catch(() => {
        if (!active) return;
        setVisiblePageKeys([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, role]);

  const canAccess = useMemo(() => {
    return (pageKey) => {
      if (!user) return false;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      const normalized = String(pageKey || "").trim().toLowerCase();
      if (!normalized) return false;
      return visiblePageKeys.includes(normalized);
    };
  }, [user, role, visiblePageKeys]);

  const canAccessRoute = useMemo(() => {
    return (path) => {
      if (!user) return false;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return true;
      if (isAdminOnlyPath(path)) return false;
      if (isAlwaysAllowedPath(path)) return true;
      const requiredKeys = getRequiredPageKeysForPath(path);
      if (!requiredKeys.length) return true;
      return requiredKeys.some((key) => canAccess(key));
    };
  }, [user, role, canAccess]);

  const allowedPages = useMemo(() => {
    if (!user) return [];
    return role === "SUPER_ADMIN" || role === "ADMIN" ? ["*"] : visiblePageKeys;
  }, [user, role, visiblePageKeys]);

  return (
    <PageAccessContext.Provider value={{ canAccess, canAccessRoute, allowedPages, role, loading }}>
      {children}
    </PageAccessContext.Provider>
  );
}

export function usePageAccess() {
  return useContext(PageAccessContext);
}
