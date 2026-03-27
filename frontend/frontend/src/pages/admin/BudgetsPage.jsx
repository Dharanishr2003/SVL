import React from "react";
import { Link } from "react-router-dom";

const BudgetsPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Budgets</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Budgets</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
						<div className="mb-2">
							<Link to="#" data-bs-toggle="modal" data-bs-target="#add_budgets" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add Budget</Link>
						</div>
						<div className="ms-2 head-icons">
							<Link to="#" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</Link>
						</div>
					</div>
				</div>
				{/* /Breadcrumb */}

				{/* Budgets list */}
				<div className="card">
					<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
						<h5>Budget List</h5>
						<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">

							<div className="dropdown">
								<Link to="#" className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
										<th>Budget Title</th>
										<th>Budget Type</th>
										<th>Start Date</th>
										<th>End Date</th>
										<th>Total Revenue</th>
										<th>Total Expense</th>
										<th>Tax Amount</th>
										<th>Budget Amount</th>
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
										<td>
											<h6 className="fw-medium"><Link to="#">Office Supplies</Link></h6>
										</td>
										<td>
											Category
										</td>
										<td>
											14 Jan 2024
										</td>
										<td>
											13 Nov 2024
										</td>
										<td>
											250000
										</td>
										<td>
											150000
										</td>
										<td>
											10000
										</td>
										<td>
											90000
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_budgets"><i className="ti ti-edit"></i></Link>
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
										<td>
											<h6 className="fw-medium"><Link to="#">Recruitment</Link></h6>
										</td>
										<td>
											Category
										</td>
										<td>
											21 Jan 2024
										</td>
										<td>
											20 Nov 2024
										</td>
										<td>
											300000
										</td>
										<td>
											200000
										</td>
										<td>
											15000
										</td>
										<td>
											85000
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_budgets"><i className="ti ti-edit"></i></Link>
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
										<td>
											<h6 className="fw-medium"><Link to="#">Tender</Link></h6>
										</td>
										<td>
											Project
										</td>
										<td>
											10 Feb 2024
										</td>
										<td>
											08 Dec 2024
										</td>
										<td>
											200000
										</td>
										<td>
											170000
										</td>
										<td>
											5000
										</td>
										<td>
											25000
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_budgets"><i className="ti ti-edit"></i></Link>
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
										<td>
											<h6 className="fw-medium"><Link to="#">Salary 2024</Link></h6>
										</td>
										<td>
											Category
										</td>
										<td>
											18 Feb 2024
										</td>
										<td>
											16 Dec 2024
										</td>
										<td>
											300000
										</td>
										<td>
											200000
										</td>
										<td>
											15000
										</td>
										<td>
											85000
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_budgets"><i className="ti ti-edit"></i></Link>
												<Link to="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></Link>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				{/* /Budgets list */}
      </div>

      {/* Add Budgets */}
		<div className="modal fade" id="add_budgets">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add Budget</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="budgets.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Budget Title</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Choose Budget respect type</label>
										<div className="d-flex align-items-center">
											<div className="form-check me-2">
												<input className="form-check-input" type="radio" name="flexRadio" id="budget" />
												<label className="form-label" htmlFor="budget">
													Project
												</label>
											</div>
											<div className="form-check">
												<input className="form-check-input" type="radio" name="flexRadio" id="budget1" />
												<label className="form-label" htmlFor="budget1">
													Category
												</label>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Start Date </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">End Date </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">Expected Revenues</label>
								</div>
								<div className="revenues-content">
									<div className="row align-items-end">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Revenue Title</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="d-flex align-items-center mb-3">
												<div>
													<label className="form-label">Revenue Amount</label>
													<div className="d-flex align-items-center">
														<input type="text" className="form-control" />
														<div className="ms-2">
															<Link to="#" className="btn btn-icon add-revenue btn-sm btn-primary rounded-circle"><i className="ti ti-plus"></i></Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Overall Revenue (A)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">Expected Expenses</label>
								</div>
								<div className="expenses-content">
									<div className="row align-items-end">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Expenses Title</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="d-flex align-items-center mb-3">
												<div>
													<label className="form-label">Expenses Amount</label>
													<div className="d-flex align-items-center">
														<input type="text" className="form-control" />
														<div className="ms-2">
															<Link to="#" className="btn btn-icon add-expenses btn-sm btn-primary rounded-circle"><i className="ti ti-plus"></i></Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Overall Expense (B)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expected Profit (C=A-B) </label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Tax (D) </label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Budget Amount (E=C-D)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Budget</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Budgets */}

		{/* Edit Budgets */}
		<div className="modal fade" id="edit_budgets">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Budget</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="budgets.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Budget Title</label>
										<input type="text" className="form-control" defaultValue="Office Supplies" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Choose Budget respect type</label>
										<div className="d-flex align-items-center">
											<div className="form-check me-2">
												<input className="form-check-input" type="radio" name="flexRadio" id="budget3" />
												<label className="form-label" htmlFor="budget3">
													Project
												</label>
											</div>
											<div className="form-check">
												<input className="form-check-input" type="radio" name="flexRadio" id="budget2" defaultChecked />
												<label className="form-label" htmlFor="budget2">
													Category
												</label>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Start Date </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" defaultValue="14 Jan 2024" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">End Date </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" defaultValue="13 Nov 2024" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">Expected Revenues</label>
								</div>
								<div className="revenues-content">
									<div className="row align-items-end">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Revenue Title</label>
												<input type="text" className="form-control" defaultValue="Office Supplies" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="d-flex align-items-center mb-3">
												<div>
													<label className="form-label">Revenue Amount</label>
													<div className="d-flex align-items-center">
														<input type="text" className="form-control" defaultValue="250000" />
														<div className="ms-2">
															<Link to="#" className="btn btn-icon add-revenue btn-sm btn-primary rounded-circle"><i className="ti ti-plus"></i></Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Overall Revenue (A)</label>
										<input type="text" className="form-control" defaultValue="250000" />
									</div>
								</div>
								<div className="mb-0">
									<label className="form-label">Expected Expenses</label>
								</div>
								<div className="expenses-content">
									<div className="row align-items-end">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Expenses Title</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="d-flex align-items-center mb-3">
												<div>
													<label className="form-label">Expenses Amount</label>
													<div className="d-flex align-items-center">
														<input type="text" className="form-control" />
														<div className="ms-2">
															<Link to="#" className="btn btn-icon add-expenses btn-sm btn-primary rounded-circle"><i className="ti ti-plus"></i></Link>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Overall Expense (B)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expected Profit (C=A-B) </label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Tax (D) </label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Budget Amount (E=C-D)</label>
										<input type="text" className="form-control" />
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Save Changes</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Budgets */}

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
							<Link to="/budgets" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default BudgetsPage;
