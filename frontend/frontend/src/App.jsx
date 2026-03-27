import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import { adminPhpRoutes } from "./adminPhpRoutes";
import PageLoader from "./components/common/PageLoader";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/common/LoginPage";
import UnauthorizedPage from "./pages/common/UnauthorizedPage";
import CustomerChatPage from "./pages/customer/CustomerChatPage";
import CustomerStatusPage from "./pages/customer/CustomerStatusPage";
import RouteProgress, {
  beginRouteProgress,
  endRouteProgress,
} from "./components/system/RouteProgress";
import BootstrapInitializer from "./components/system/BootstrapInitializer";
import { useAuth } from "./context/AuthContext";
import { usePageAccess } from "./context/PageAccessContext";
import { getDefaultLandingPath } from "./constants/pageAccess";

const adminPageModules = import.meta.glob("./pages/admin/*Page.jsx");

const ActivityPage = lazy(() => import("./pages/admin/ActivityPage"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const AttendanceAdminPage = lazy(
  () => import("./pages/admin/AttendanceAdminPage"),
);
const AttendanceEmployeePage = lazy(
  () => import("./pages/admin/AttendanceEmployeePage"),
);
const DesignWorkPage = lazy(
  () => import("./pages/admin/DesignWorkPage"),
);

const explicitLazyComponents = {
  ActivityPage,
  AdminDashboardPage,
  AnalyticsPage,
  AttendanceAdminPage,
  AttendanceEmployeePage,
  DesignWorkPage,
};

const lazyComponentCache = { ...explicitLazyComponents };

const publicRoutePaths = new Set([
  "login.php",
  "login-2.php",
  "login-3.php",
  "register.php",
  "register-2.php",
  "register-3.php",
  "forgot-password.php",
  "forgot-password-2.php",
  "forgot-password-3.php",
  "reset-password.php",
  "reset-password-2.php",
  "reset-password-3.php",
  "error-404.php",
  "error-500.php",
]);

const adminOnlyPaths = new Set([
  "group-access",
  "useradmin",
  "user-edit/:id",
  "usergroups",
  "usergroups/edit/:id",
  "registration",
  "security",
  "security-settings",
  "session-settings",
  "user-settings",
  "flow",
]);

function RouteFallback() {
  useEffect(() => {
    beginRouteProgress();
    return () => endRouteProgress();
  }, []);
  return <PageLoader />;
}

function RoleRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  const { allowedPages, loading: pageAccessLoading } = usePageAccess();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (pageAccessLoading) return <PageLoader />;
  const role = String(user?.role || "").toUpperCase();
  return <Navigate to={getDefaultLandingPath(role, allowedPages)} replace />;
}

function resolveLazyComponent(componentName) {
  if (lazyComponentCache[componentName]) {
    return lazyComponentCache[componentName];
  }
  const moduleImporter = adminPageModules[`./pages/admin/${componentName}.jsx`];
  if (!moduleImporter) return null;
  const LazyComponent = lazy(moduleImporter);
  lazyComponentCache[componentName] = LazyComponent;
  return LazyComponent;
}

function getRouteElement(routePath, componentName) {
  const LazyComponent = resolveLazyComponent(componentName);

  if (!LazyComponent) {
    return (
      <div className="card">
        <div className="card-body">
          <h4 className="mb-2">Route Component Missing</h4>
          <p className="mb-0">No component found for: {componentName}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      {publicRoutePaths.has(routePath) ? (
        <LazyComponent />
      ) : (
        <ProtectedRoute role={adminOnlyPaths.has(routePath) ? "admin" : null}>
          <PageVisibleRoute routePath={routePath}>
            <LazyComponent />
          </PageVisibleRoute>
        </ProtectedRoute>
      )}
    </Suspense>
  );
}

function PageVisibleRoute({ children, routePath }) {
  const { canAccessRoute, loading } = usePageAccess();
  const location = useLocation();
  if (loading) return <PageLoader />;
  const pathToCheck = location?.pathname || routePath;
  return canAccessRoute(pathToCheck) ? children : <Navigate to="/unauthorized" replace />;
}

export default function App() {
  return (
    <>
      <BootstrapInitializer />
      <RouteProgress />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="chat" element={<CustomerChatPage />} />
          <Route path="status" element={<CustomerStatusPage />} />
        </Route>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<RoleRedirect />} />
          {adminPhpRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={getRouteElement(route.path, route.component)}
            />
          ))}
          <Route
            path="*"
            element={<RoleRedirect />}
          />
        </Route>
      </Routes>
    </>
  );
}
