export const candidatesGridData = {
  header: {
    title: "Candidates",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "Administration" },
      { label: "Candidates Grid" },
    ],
  },
  candidates: [
    { id: 1, avatar: "assets/img/users/user-39.jpg", name: "Harold Gaynor", code: "Cand-001", email: "harold@example.com", role: "Accountant", appliedDate: "12 Sep 2024", status: "New", statusClass: "fs-10 fw-medium badge bg-purple" },
    { id: 2, avatar: "assets/img/users/user-40.jpg", name: "Sandra Ornellas", code: "Cand-002", email: "sandra@example.com", role: "Accountant", appliedDate: "12 Sep 2024", status: "Scheduled", statusClass: "fs-10 fw-medium badge bg-pink" },
    { id: 3, avatar: "assets/img/users/user-41.jpg", name: "John Harris", code: "Cand-003", email: "john@example.com", role: "Technician", appliedDate: "12 Sep 2024", status: "Interviewed", statusClass: "fs-10 fw-medium badge bg-info" },
    { id: 4, avatar: "assets/img/users/user-42.jpg", name: "Carole Langan", code: "Cand-004", email: "carole@example.com", role: "Web Developer", appliedDate: "12 Sep 2024", status: "Offered", statusClass: "fs-10 fw-medium badge bg-warning" },
  ],
};
