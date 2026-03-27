export const budgetRevenuesData = {
  header: {
    title: "Budget Revenue",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "HR" },
      { label: "Budget Revenue" },
    ],
  },
  table: {
    columns: [
      { key: "select", label: "" },
      { key: "revenueName", label: "Revenue Name" },
      { key: "categoryName", label: "Category Name" },
      { key: "subCategoryName", label: "Sub Category Name" },
      { key: "amount", label: "Amount" },
      { key: "expenseDate", label: "Expense Date" },
      { key: "actions", label: "" },
    ],
    rows: [
      { id: 1, revenueName: "Training Programs", categoryName: "Training", subCategoryName: "Employee Training", amount: "20000", expenseDate: "14 Jan 2024" },
      { id: 2, revenueName: "Premium Support Packages", categoryName: "Support & Maintenance", subCategoryName: "Premium Support", amount: "40000", expenseDate: "21 Jan 2024" },
      { id: 3, revenueName: "Consulting Services", categoryName: "Services", subCategoryName: "Consulting", amount: "10000", expenseDate: "10 Feb 2024" },
      { id: 4, revenueName: "Subscription Fees", categoryName: "Platform Fees", subCategoryName: "Subscription Plans", amount: "20000", expenseDate: "18 Feb 2024" },
    ],
  },
};
