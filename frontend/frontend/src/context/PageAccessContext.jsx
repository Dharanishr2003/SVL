import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMyPageVisibility } from "../api/userGroupApi";
import {
  getRequiredPageKeysForPath,
  isAdminOnlyPath,
  isAlwaysAllowedPath,
} from "../constants/pageAccess";

const PageAccessContext = createContext({
  canAccess: () => false,
  canAccessRoute: () => false,
  allowedPages: [],
  role: null,
  loading: true,
});

function normalizePageKeys(keys) {
  return Array.isArray(keys)
    ? keys.map((key) => String(key || "").trim().toLowerCase()).filter(Boolean)
    : [];
}

function getEquivalentPageKeys(pageKey) {
  const normalized = String(pageKey || "").trim().toLowerCase();
  if (!normalized) return [];
  if (normalized === "shift-assignments") return ["shift-assignments", "shift-assignment"];
  if (normalized === "shift-assignment") return ["shift-assignment", "shift-assignments"];
  return [normalized];
}

export function PageAccessProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const canUsePermissionControlledAdminRoutes =
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER" || role === "TEAM_LEAD" || role === "EMPLOYEE";
  const [visiblePageKeys, setVisiblePageKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const cacheKey = useMemo(() => {
    if (!user) return null;
    const identity = user?.id ?? user?.email ?? user?.username ?? "unknown";
    return `page-visibility:${String(identity)}`;
  }, [user]);

  useEffect(() => {
    let active = true;
    if (authLoading) {
      setLoading(true);
      return () => {
        active = false;
      };
    }
    if (!user) {
      setVisiblePageKeys([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    if (role === "SUPER_ADMIN") {
      setVisiblePageKeys(["*"]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    if (cacheKey) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");
        const normalizedCached = normalizePageKeys(cached);
        if (normalizedCached.length) {
          setVisiblePageKeys(normalizedCached);
        }
      } catch {
        // ignore corrupted cache
      }
    }
    getMyPageVisibility()
      .then((keys) => {
        if (!active) return;
        const normalized = normalizePageKeys(keys);
        setVisiblePageKeys(normalized);
        if (cacheKey) {
          sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
        }
      })
      .catch(() => {
        if (!active) return;
        if (cacheKey) {
          try {
            const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "[]");
            setVisiblePageKeys(normalizePageKeys(cached));
            return;
          } catch {
            // ignore and fallback below
          }
        }
        setVisiblePageKeys([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, role, authLoading, cacheKey]);

  const canAccess = useMemo(() => {
    return (pageKey) => {
      if (!user) return false;
      if (role === "SUPER_ADMIN") return true;
      const equivalents = getEquivalentPageKeys(pageKey);
      if (!equivalents.length) return false;
      return equivalents.some((key) => visiblePageKeys.includes(key));
    };
  }, [user, role, visiblePageKeys]);

  const canAccessRoute = useMemo(() => {
    return (path) => {
      if (!user) return false;
      if (role === "SUPER_ADMIN") return true;
      const normalizedPath = String(path || "").trim();
      if (/^\/stock-requests(?:\/[^/]+(?:\/status|\/chat)?)?\/?$/.test(normalizedPath)) {
        return (
          role === "EMPLOYEE" ||
          role === "PRODUCTION" ||
          canAccess("production") ||
          canAccess("accounts") ||
          canAccess("stock-requests")
        );
      }
      if (/^\/stock-requests\/[^/]+\/status\/?$/.test(normalizedPath)) {
        return (
          canAccess("production") ||
          canAccess("accounts") ||
          canAccess("stock-requests")
        );
      }
      if (isAdminOnlyPath(path) && !canUsePermissionControlledAdminRoutes) return false;
      if (isAlwaysAllowedPath(path)) return true;
      const requiredKeys = getRequiredPageKeysForPath(path);
      if (!requiredKeys.length) return true;
      return requiredKeys.some((key) => canAccess(key));
    };
  }, [user, role, canAccess, canUsePermissionControlledAdminRoutes]);

  const allowedPages = useMemo(() => {
    if (!user) return [];
    return role === "SUPER_ADMIN" ? ["*"] : visiblePageKeys;
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
