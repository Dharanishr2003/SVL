import React from "react";
import { Link } from "react-router-dom";

const ExpensesPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Expenses</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Expenses</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">

						<div className="me-2 mb-2">
							<div className="dropdown">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									<i className="ti ti-file-export me-1"></i>Export
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-pdf me-1"></i>Export as PDF</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1"><i className="ti ti-file-type-xls me-1"></i>Export as Excel </Link>
									</li>
								</ul>
							</div>
						</div>

						<div className="mb-2">
							<Link to="#" data-bs-toggle="modal" data-bs-target="#add_expenses" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add New Expenses</Link>
						</div>
						<div className="head-icons ms-2">
							<Link to="#" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</Link>
						</div>
					</div>
				</div>
				{/* /Breadcrumb */}



				<div className="card">
					<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
						<h5>Expenses List</h5>
						<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
							<div className="me-3">
								<div className="input-icon-end position-relative">
									<input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
									<span className="input-icon-addon">
										<i className="ti ti-chevron-down"></i>
									</span>
								</div>
							</div>
							<div className="dropdown me-3">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									$0.00 - $00
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">$0.00 - $00</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">$3000</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">$2500</Link>
									</li>
								</ul>
							</div>
							<div className="dropdown">
								<Link to="#" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									Sort By : Last 7 Days
								</Link>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<Link to="#" className="dropdown-item rounded-1">Recently Added</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Ascending</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Desending</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Last Month</Link>
									</li>
									<li>
										<Link to="#" className="dropdown-item rounded-1">Last 7 Days</Link>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="card-body p-0">
						<div className="custom-datatable-filter table-responsive">
							<table className="table datatable">
								<thead className="thead-light">
									<tr>
										<th className="no-sort">
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" id="select-all" />
											</div>
										</th>
										<th>Expense Name</th>
										<th>Date</th>
										<th>Payment Method</th>
										<th>Amount</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Online Course</td>
										<td>14 Jan 2024</td>
										<td>Cash</td>
										<td>$3000</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Employee Benefits</td>
										<td>21 Jan 2024</td>
										<td>Cash</td>
										<td>$2500</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Travel</td>
										<td>20 Feb 2024</td>
										<td>Cheque</td>
										<td>$2800</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Office Supplies</td>
										<td>15 Mar 2024</td>
										<td>Cash</td>
										<td>$3300</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Welcome Kit</td>
										<td>12 Apr 2024</td>
										<td>Cheque</td>
										<td>$3600</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Equipment</td>
										<td>20 Apr 2024</td>
										<td>Cheque</td>
										<td>$2000</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Miscellaneous</td>
										<td>06 Jul 2024</td>
										<td>Cash</td>
										<td>$3400</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Payroll</td>
										<td>02 Sep 2024</td>
										<td>Cheque</td>
										<td>$4000</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Cafeteria</td>
										<td>15 Nov 2024</td>
										<td>Cash</td>
										<td>$4500</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="form-check form-check-md">
												<input className="form-check-input" type="checkbox" />
											</div>
										</td>

										<td>Cleaning Supplies</td>
										<td>10 Dec 2024</td>
										<td>Cheque</td>
										<td>$3800</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_expenses"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>



								</tbody>
							</table>
						</div>
					</div>
				</div>
      </div>

      
		{/* /Page Wrapper */}

		{/* Add Promotion */}
		<div className="modal fade" id="add_expenses">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add Expenses</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="expenses.php">
						<div className="modal-body pb-0">
							<div className="row">

								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Expenses</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Date</label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Amount</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Payment Method</label>
										<select className="select">
											<option>Select</option>
											<option>Sr Accountant</option>
											<option>Sr App Developer</option>
											<option>Sr SEO Analyst</option>
										</select>
									</div>
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
		{/* /Add Promotion */}

		{/* Add Promotion */}
		<div className="modal fade" id="edit_expenses">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Expenses</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="expenses.php">
						<div className="modal-body pb-0">
							<div className="row">

								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Expenses</label>
										<input type="text" defaultValue="Online Course" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Date</label>
										<div className="input-icon-end position-relative">
											<input type="text" defaultValue="14 Apr 2024" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Amount</label>
										<input type="text" defaultValue="$3000" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Payment Method</label>
										<select className="select">
											<option>Cash</option>
											<option>Sr Accountant</option>
											<option>Sr App Developer</option>
											<option>Sr SEO Analyst</option>
										</select>
									</div>
								</div>

							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-white border me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Save Chnages</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Promotion */}

		{/* Delete Modal */}
		<div className="modal fade" id="delete_modal">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-body text-center">
						<span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
							<i className="ti ti-trash-x fs-36"></i>
						</span>
						<h4 className="mb-1">Confirm Delete</h4>
						<p className="mb-3">You want to delete all the marked items, this cant be undone once you delete.</p>
						<div className="d-flex justify-content-center">
							<Link to="#" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</Link>
							<Link to="/expenses" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default ExpensesPage;
