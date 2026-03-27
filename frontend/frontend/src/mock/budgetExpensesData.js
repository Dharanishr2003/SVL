export const budgetExpensesData = {
  header: {
    title: "Budget Expenses",
    breadcrumbs: [
      { href: "admin-dashboard.php", iconClass: "ti ti-smart-home", label: "Home" },
      { label: "HR" },
      { label: "Budget Expenses" },
    ],
  },
  table: {
    columns: [
      { key: "select", label: "" },
      { key: "expenseName", label: "Expense Name" },
      { key: "categoryName", label: "Category Name" },
      { key: "subCategoryName", label: "Sub Category Name" },
      { key: "amount", label: "Amount" },
      { key: "expenseDate", label: "Expense Date" },
      { key: "actions", label: "" },
    ],
    rows: [
      { id: 1, expenseName: "Servers", categoryName: "Technology", subCategoryName: "Hardware Cost", amount: "20000", expenseDate: "14 Jan 2024" },
      { id: 2, expenseName: "Payroll Tax", categoryName: "Taxes", subCategoryName: "Payroll Taxes", amount: "40000", expenseDate: "21 Jan 2024" },
      { id: 3, expenseName: "Job Fair 2024", categoryName: "Recruitment", subCategoryName: "Advertisement", amount: "10000", expenseDate: "10 Feb 2024" },
      { id: 4, expenseName: "Annual Meet", categoryName: "Corporate Events", subCategoryName: "Decorations", amount: "20000", expenseDate: "18 Feb 2024" },
    ],
  },
};
