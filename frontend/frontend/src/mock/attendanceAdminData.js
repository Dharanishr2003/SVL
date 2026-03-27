export const attendanceAdminData = {
  header: {
    title: "Attendance Admin",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "Employee" },
      { label: "Attendance Admin" },
    ],
  },
  absentees: [
    "assets/img/profiles/avatar-02.jpg",
    "assets/img/profiles/avatar-03.jpg",
    "assets/img/profiles/avatar-05.jpg",
    "assets/img/profiles/avatar-06.jpg",
    "assets/img/profiles/avatar-07.jpg",
  ],
  summaryStats: [
    { id: 1, label: "Present", value: "250", badgeClass: "badge badge-success d-inline-flex align-items-center", icon: "ti ti-arrow-wave-right-down me-1", change: "+1%" },
    { id: 2, label: "Late Login", value: "45", badgeClass: "badge badge-danger d-inline-flex align-items-center", icon: "ti ti-arrow-wave-right-down me-1", change: "-1%" },
    { id: 3, label: "Uninformed", value: "15", badgeClass: "badge badge-danger d-inline-flex align-items-center", icon: "ti ti-arrow-wave-right-down me-1", change: "-12%" },
    { id: 4, label: "Permisson", value: "03", badgeClass: "badge badge-success d-inline-flex align-items-center", icon: "ti ti-arrow-wave-right-down me-1", change: "+1%" },
    { id: 5, label: "Absent", value: "12", badgeClass: "badge badge-danger d-inline-flex align-items-center", icon: "ti ti-arrow-wave-right-down me-1", change: "-19%" },
  ],
};

