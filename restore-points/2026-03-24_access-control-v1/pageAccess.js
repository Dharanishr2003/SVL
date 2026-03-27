export const PAGE_ACCESS_OPTIONS = [
  { key: "leads", label: "Leads", category: "CRM" },
  { key: "rejected-leads", label: "Rejected Leads", category: "CRM" },
  { key: "deals", label: "Deals", category: "CRM" },
  { key: "design", label: "Design", category: "CRM" },
  { key: "production", label: "Production", category: "CRM" },
  { key: "contacts", label: "Contacts", category: "CRM" },
  { key: "companies", label: "Companies", category: "CRM" },
  { key: "pipeline", label: "Pipeline", category: "CRM" },
  { key: "analytics", label: "Analytics", category: "CRM" },
  { key: "activity", label: "Activity", category: "CRM" },
  { key: "quotation", label: "Quotation", category: "CRM" },
  { key: "channel-partners", label: "Channel Partners", category: "CRM" },
  { key: "lead-source", label: "Lead Source", category: "CRM" },
  { key: "stocks", label: "Stocks", category: "Operations" },
  { key: "rrq", label: "RRQ", category: "Operations" },
  { key: "projects", label: "Projects", category: "Operations" },
  { key: "recruitment", label: "Recruitment", category: "Recruitment" },
  { key: "employees", label: "Employees", category: "HRM" },
  { key: "tickets", label: "Tickets", category: "HRM" },
  { key: "holidays", label: "Holidays", category: "HRM" },
  { key: "attendance", label: "Attendance", category: "HRM" },
  { key: "performance", label: "Performance", category: "HRM" },
  { key: "training", label: "Training", category: "HRM" },
  { key: "promotion", label: "Promotion", category: "HRM" },
  { key: "resignation", label: "Resignation", category: "HRM" },
  { key: "termination", label: "Termination", category: "HRM" },
  { key: "sales", label: "Sales", category: "Finance" },
  { key: "accounting", label: "Accounting", category: "Finance" },
  { key: "payroll", label: "Payroll", category: "Finance" },
  { key: "accounts", label: "Accounts", category: "Finance" },
  { key: "vendor-management", label: "Vendor Management", category: "Finance" },
  { key: "budget-verifications", label: "Budget Verifications", category: "Finance" },
  { key: "payment-verifications", label: "Payment Verifications", category: "Finance" },
  { key: "invoices", label: "Invoices", category: "Finance" },
  { key: "reports", label: "Reports", category: "Reports" },
];

const ROUTE_ACCESS_RULES = [
  { pageKeys: ["vendor-management"], prefixes: ["/stocks/vendors", "/stocks/brands", "/stocks/vendor-types"] },
  { pageKeys: ["lead-source"], prefixes: ["/lead-status", "/lead-type", "/primary-source", "/secondary-source", "/tertiary-source"] },
  { pageKeys: ["rrq"], prefixes: ["/rrq", "/rrq-type"] },
  { pageKeys: ["projects"], prefixes: ["/projects", "/projects-grid", "/project-status", "/project-type", "/tasks", "/task-board"] },
  { pageKeys: ["budget-verifications", "accounts"], prefixes: ["/budget-verifications"] },
  { pageKeys: ["payment-verifications", "accounts"], prefixes: ["/payment-verifications"] },
  { pageKeys: ["invoices", "sales"], prefixes: ["/invoices", "/invoice-page", "/invoice-details", "/invoice-list", "/invoice-report"] },
  { pageKeys: ["sales"], prefixes: ["/estimates", "/payments", "/expenses", "/provident-fund", "/taxes"] },
  { pageKeys: ["accounting"], prefixes: ["/categories", "/budgets", "/budget-expenses", "/budget-revenues"] },
  { pageKeys: ["payroll"], prefixes: ["/employee-salary", "/payslip", "/payroll", "/payslip-report"] },
  { pageKeys: ["accounts", "production"], prefixes: ["/stock-requests"] },
  { pageKeys: ["stocks"], prefixes: ["/stocks"] },
  { pageKeys: ["channel-partners"], prefixes: ["/channel-partners"] },
  { pageKeys: ["quotation"], prefixes: ["/quotation"] },
  { pageKeys: ["activity"], prefixes: ["/activity"] },
  { pageKeys: ["analytics"], prefixes: ["/analytics"] },
  { pageKeys: ["pipeline"], prefixes: ["/pipeline"] },
  { pageKeys: ["companies"], prefixes: ["/companies", "/companies-grid"] },
  { pageKeys: ["contacts"], prefixes: ["/contacts", "/contacts-grid"] },
  { pageKeys: ["production"], prefixes: ["/production", "/production-detail"] },
  { pageKeys: ["design"], prefixes: ["/design", "/design-detail", "/design-work"] },
  { pageKeys: ["deals"], prefixes: ["/deals", "/deals-dashboard"] },
  { pageKeys: ["rejected-leads"], prefixes: ["/rejected-leads"] },
  { pageKeys: ["leads"], prefixes: ["/leads", "/leads-dashboard"] },
  { pageKeys: ["employees"], prefixes: ["/employees", "/departments", "/designations", "/policy"] },
  { pageKeys: ["tickets"], prefixes: ["/tickets"] },
  { pageKeys: ["holidays"], prefixes: ["/holidays"] },
  { pageKeys: ["attendance"], prefixes: ["/attendance-admin", "/attendance-employee", "/leaves", "/leaves-employee", "/leave-settings", "/timesheets", "/schedule-timing", "/overtime"] },
  { pageKeys: ["performance"], prefixes: ["/performance-indicator", "/performance-appraisal", "/goal-tracking", "/goal-type"] },
  { pageKeys: ["training"], prefixes: ["/training", "/trainers", "/training-type"] },
  { pageKeys: ["promotion"], prefixes: ["/promotion"] },
  { pageKeys: ["resignation"], prefixes: ["/resignation"] },
  { pageKeys: ["termination"], prefixes: ["/termination"] },
  { pageKeys: ["recruitment"], prefixes: ["/job-grid", "/job-list", "/candidates", "/candidates-grid", "/referrals"] },
  { pageKeys: ["reports"], prefixes: ["/expenses-report", "/payment-report", "/employee-report", "/task-report", "/user-report", "/daily-report", "/leave-report", "/project-report"] },
];

const ALWAYS_ALLOWED_PREFIXES = [
  "/admin-dashboard",
  "/employee-dashboard",
  "/dashboard",
  "/login",
  "/unauthorized",
  "/customer",
  "/registration",
  "/logs",
];

const ADMIN_ONLY_PREFIXES = [
  "/useradmin",
  "/user-edit",
  "/usergroups",
  "/security",
  "/security-settings",
  "/session-settings",
  "/user-settings",
  "/flow",
];

function normalizePath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function isAlwaysAllowedPath(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return true;
  return ALWAYS_ALLOWED_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

export function isAdminOnlyPath(path) {
  const normalized = normalizePath(path);
  return ADMIN_ONLY_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

export function getRequiredPageKeysForPath(path) {
  const normalized = normalizePath(path);
  const match = ROUTE_ACCESS_RULES.find((rule) =>
    rule.prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
  );
  return match ? match.pageKeys : [];
}
