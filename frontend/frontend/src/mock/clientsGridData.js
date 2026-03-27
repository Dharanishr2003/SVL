export const clientsGridData = {
  header: {
    title: "Clients",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "Employee" },
      { label: "Client Grid" },
    ],
  },
  stats: [
    { id: 1, iconWrapClass: "p-2 br-10 bg-pink-transparent border border-pink d-flex align-items-center justify-content-center", iconClass: "ti ti-users-group text-pink fs-18", label: "Total Clients", value: "300", badgeClass: "badge bg-transparent-purple d-inline-flex align-items-center fw-normal", change: "+19.01%" },
    { id: 2, iconWrapClass: "p-2 br-10 bg-success-transparent border border-success d-flex align-items-center justify-content-center", iconClass: "ti ti-user-share fs-18", label: "Active Clients", value: "270", badgeClass: "badge bg-transparent-primary text-primary d-inline-flex align-items-center fw-normal", change: "+19.01%" },
    { id: 3, iconWrapClass: "p-2 br-10 bg-danger-transparent border border-danger d-flex align-items-center justify-content-center", iconClass: "ti ti-user-pause fs-18", label: "Inactive Clients", value: "30", badgeClass: "badge bg-transparent-dark text-dark d-inline-flex align-items-center fw-normal", change: "+19.01%" },
    { id: 4, iconWrapClass: "p-2 br-10 bg-info-transparent border border-info d-flex align-items-center justify-content-center", iconClass: "ti ti-user-plus fs-18", label: "New Clients", value: "300", badgeClass: "badge bg-transparent-secondary text-dark d-inline-flex align-items-center fw-normal", change: "+19.01%" },
  ],
  clients: [
    { id: 1, avatar: "assets/img/users/user-39.jpg", name: "Michael Walker", role: "CEO", roleClass: "badge bg-pink-transparent fs-10 fw-medium", project: "Office Management App", progress: "60", company: "BrightWave Innovations" },
    { id: 2, avatar: "assets/img/users/user-40.jpg", name: "Sarah Collins", role: "CTO", roleClass: "badge bg-info-transparent fs-10 fw-medium", project: "CRM Revamp", progress: "45", company: "NorthGrid Labs" },
    { id: 3, avatar: "assets/img/users/user-41.jpg", name: "Daniel Cooper", role: "Manager", roleClass: "badge bg-warning-transparent fs-10 fw-medium", project: "Ecommerce Suite", progress: "75", company: "MetroEdge Pvt Ltd" },
    { id: 4, avatar: "assets/img/users/user-42.jpg", name: "Monica Ray", role: "Founder", roleClass: "badge bg-success-transparent fs-10 fw-medium", project: "Analytics Portal", progress: "52", company: "DataSpring Systems" },
  ],
};
