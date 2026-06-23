import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Mocking dynamic client-side expenses persistence for prototype since no backend API tables exist.
const INITIAL_EXPENSES = [
  { id: 1, name: "Online Course", date: "2024-01-14", method: "Cash", amount: 3000 },
  { id: 2, name: "Employee Benefits", date: "2024-01-21", method: "Cash", amount: 2500 },
  { id: 3, name: "Travel", date: "2024-02-20", method: "Cheque", amount: 2800 },
  { id: 4, name: "Office Supplies", date: "2024-03-15", method: "Cash", amount: 3300 },
  { id: 5, name: "Welcome Kit", date: "2024-04-12", method: "Cheque", amount: 3600 },
  { id: 6, name: "Equipment", date: "2024-04-20", method: "Cheque", amount: 2000 },
  { id: 7, name: "Miscellaneous", date: "2024-07-06", method: "Cash", amount: 3400 },
  { id: 8, name: "Payroll", date: "2024-09-02", method: "Cheque", amount: 4000 },
  { id: 9, name: "Cafeteria", date: "2024-11-15", method: "Cash", amount: 4500 },
  { id: 10, name: "Cleaning Supplies", date: "2024-12-10", method: "Cheque", amount: 3800 }
];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState(() => {
    const local = localStorage.getItem("crm_expenses");
    return local ? JSON.parse(local) : INITIAL_EXPENSES;
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", date: "", amount: "", method: "Cash" });
  const [editExpense, setEditExpense] = useState(null);

  useEffect(() => {
    localStorage.setItem("crm_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.amount) {
      alert("Please fill all required fields");
      return;
    }
    const newExp = {
      id: Date.now(),
      name: formData.name,
      date: formData.date,
      method: formData.method,
      amount: Number(formData.amount)
    };
    setExpenses((prev) => [newExp, ...prev]);
    setFormData({ name: "", date: "", amount: "", method: "Cash" });
    const closeBtn = document.querySelector("#add_expenses [data-bs-dismiss='modal']");
    if (closeBtn) closeBtn.click();
  };

  const handleEditClick = (exp) => {
    setEditExpense(exp);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editExpense.name || !editExpense.date || !editExpense.amount) {
      alert("Please fill all required fields");
      return;
    }
    setExpenses((prev) =>
      prev.map((item) => (item.id === editExpense.id ? { ...editExpense, amount: Number(editExpense.amount) } : item))
    );
    const closeBtn = document.querySelector("#edit_expenses [data-bs-dismiss='modal']");
    if (closeBtn) closeBtn.click();
  };

  const handleDeleteClick = (exp) => {
    setEditExpense(exp);
  };

  const confirmDelete = () => {
    if (!editExpense) return;
    setExpenses((prev) => prev.filter((item) => item.id !== editExpense.id));
    const closeBtn = document.querySelector("#delete_modal [data-bs-dismiss='modal']");
    if (closeBtn) closeBtn.click();
  };

  const formatDate = (val) => {
    if (!val) return "-";
    return new Date(val).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="content">
        {/* Breadcrumb section matching standard UI */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Expenses</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/admin-dashboard">
                    <i className="ti ti-smart-home"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <span className="text-muted">Application</span>
                </li>
                <li className="breadcrumb-item active">Expenses</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Expenses List Header Card */}
        <div className="card border-0 shadow-sm p-4 mb-4 bg-white" style={{ borderRadius: 12 }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h2 className="leads-header-title mb-1" style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>Expenses List</h2>
              <p className="leads-header-subtitle text-muted mb-0" style={{ fontSize: "0.9rem" }}>Add, view and manage all business operation expenditures.</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#add_expenses"
                className="btn btn-primary d-flex align-items-center gap-2"
                style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", fontWeight: "600", padding: "10px 20px", borderRadius: "10px" }}
              >
                <i className="ti ti-plus" />
                Add Expenses
              </Link>
            </div>
          </div>
        </div>

        {/* List UI wrapper matching Lead list page */}
        {loading ? (
          <div className="p-5 text-center bg-white shadow-sm" style={{ borderRadius: 12 }}>
            <LoadingSpinner />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-5 text-center text-muted bg-white shadow-sm" style={{ borderRadius: 12 }}>No expenses found.</div>
        ) : (
          <div
            className="table-responsive leads-table-wrap border-0 shadow-sm mb-4 bg-white"
            style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x", borderRadius: 12, minHeight: "260px" }}
          >
            <table className="table table-hover align-middle leads-table mb-0">
              <thead>
                <tr>
                  <th className="col-select" style={{ width: 36 }}>
                    <input className="form-check-input" type="checkbox" id="select-all" />
                  </th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Expense Name</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Date</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Payment Method</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Amount</th>
                  <th className="text-muted" style={{ fontWeight: "600", fontSize: "0.85rem" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="col-select">
                      <input className="form-check-input" type="checkbox" />
                    </td>
                    <td style={{ fontSize: "0.9rem", color: "#1e293b", fontWeight: "500" }}>{exp.name}</td>
                    <td style={{ fontSize: "0.9rem", color: "#475569" }}>{formatDate(exp.date)}</td>
                    <td style={{ fontSize: "0.9rem", color: "#475569" }}>
                      <span className="badge bg-light text-dark">{exp.method}</span>
                    </td>
                    <td className="fw-semibold text-danger" style={{ fontSize: "0.9rem" }}>
                      ₹{Number(exp.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="col-actions">
                      <div className="action-icon d-inline-flex gap-2">
                        <Link
                          to="#"
                          className="d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "transparent", color: "#64748b" }}
                          data-bs-toggle="modal"
                          data-bs-target="#edit_expenses"
                          onClick={() => handleEditClick(exp)}
                        >
                          <i className="ti ti-edit" style={{ fontSize: "1.1rem" }}></i>
                        </Link>
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                          className="d-flex align-items-center justify-content-center text-danger"
                          style={{ width: 32, height: 32, borderRadius: "50%", border: "none", backgroundColor: "transparent" }}
                          onClick={() => handleDeleteClick(exp)}
                        >
                          <i className="ti ti-trash" style={{ fontSize: "1.1rem" }}></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <div className="modal fade" id="add_expenses">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Expenses</h4>
              <button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-x"></i>
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body pb-0">
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Expense Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Expenses</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Expense Modal */}
      <div className="modal fade" id="edit_expenses">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Expenses</h4>
              <button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-x"></i>
              </button>
            </div>
            {editExpense && (
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body pb-0">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Expense Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editExpense.name}
                        onChange={(e) => setEditExpense({ ...editExpense, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editExpense.date}
                        onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editExpense.amount}
                        onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Payment Method</label>
                      <select
                        className="form-select"
                        value={editExpense.method}
                        onChange={(e) => setEditExpense({ ...editExpense, method: e.target.value })}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                <i className="ti ti-trash-x fs-36"></i>
              </span>
              <h4 className="mb-1">Confirm Delete</h4>
              <p className="mb-3">Are you sure you want to delete this expense record? This action cannot be undone.</p>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpensesPage;
