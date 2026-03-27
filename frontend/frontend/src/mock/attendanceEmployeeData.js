export const attendanceEmployeeData = {
  header: {
    title: "Employee Attendance",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "Employee" },
      { label: "Employee Attendance" },
    ],
  },
  profileCard: {
    greeting: "Good Morning, Adrian",
    dateTime: "08:35 AM, 11 Mar 2025",
    avatar: "assets/img/profiles/avatar-27.jpg",
    production: "Production : 3.45 hrs",
    punchIn: "Punch In at 10.00 AM",
    punchOutLabel: "Punch Out",
  },
  timeCards: [
    { id: 1, iconBg: "bg-primary", icon: "ti ti-clock-stop", value: "8.36", total: "9", label: "Total Hours Today", trendBg: "bg-success", trendIcon: "ti ti-arrow-up fs-12", trendText: "5% This Week" },
    { id: 2, iconBg: "bg-dark", icon: "ti ti-clock-up", value: "10", total: "40", label: "Total Hours Week", trendBg: "bg-success", trendIcon: "ti ti-arrow-up fs-12", trendText: "7% Last Week" },
    { id: 3, iconBg: "bg-info", icon: "ti ti-calendar-up", value: "75", total: "98", label: "Total Hours Month", trendBg: "bg-danger", trendIcon: "ti ti-arrow-down fs-12", trendText: "8% Last Month" },
    { id: 4, iconBg: "bg-pink", icon: "ti ti-calendar-star", value: "16", total: "28", label: "Overtime this Month", trendBg: "bg-danger", trendIcon: "ti ti-arrow-down fs-12", trendText: "6% Last Month" },
  ],
};

