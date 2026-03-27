export const budgetsData = {
  header: {
    title: "Budgets",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "HR" },
      { label: "Budgets" },
    ],
  },
  table: {
    columns: [
      { key: "select", label: "" },
      { key: "budgetTitle", label: "Budget Title" },
      { key: "budgetType", label: "Budget Type" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "totalRevenue", label: "Total Revenue" },
      { key: "totalExpense", label: "Total Expense" },
      { key: "taxAmount", label: "Tax Amount" },
      { key: "budgetAmount", label: "Budget Amount" },
      { key: "actions", label: "" },
    ],
    rows: [
      { id: 1, budgetTitle: "Office Supplies", budgetType: "Category", startDate: "14 Jan 2024", endDate: "13 Nov 2024", totalRevenue: "250000", totalExpense: "150000", taxAmount: "10000", budgetAmount: "90000" },
      { id: 2, budgetTitle: "Recruitment", budgetType: "Category", startDate: "21 Jan 2024", endDate: "20 Nov 2024", totalRevenue: "300000", totalExpense: "200000", taxAmount: "15000", budgetAmount: "85000" },
      { id: 3, budgetTitle: "Tender", budgetType: "Project", startDate: "10 Feb 2024", endDate: "08 Dec 2024", totalRevenue: "200000", totalExpense: "170000", taxAmount: "5000", budgetAmount: "25000" },
      { id: 4, budgetTitle: "Salary 2024", budgetType: "Category", startDate: "18 Feb 2024", endDate: "16 Dec 2024", totalRevenue: "300000", totalExpense: "200000", taxAmount: "15000", budgetAmount: "85000" },
    ],
  },
};
