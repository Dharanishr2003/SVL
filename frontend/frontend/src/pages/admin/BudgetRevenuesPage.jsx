import React from "react";
import { Link } from "react-router-dom";

const BudgetRevenuesPage = () => {
  return (
    <>
      <div className="content">
        {/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Budget Revenue</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<Link to="/admin-dashboard"><i className="ti ti-smart-home"></i></Link>
								</li>
								<li className="breadcrumb-item">
									HR
								</li>
								<li className="breadcrumb-item active" aria-current="page">Budget Revenue</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">

						<div className="mb-2">
							<Link to="#" data-bs-toggle="modal" data-bs-target="#add_new_expense" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add Revenue</Link>
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
						<h5>Budget Revenue List</h5>
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
										<th>Revenue Name</th>
										<th>Category Name</th>
										<th>Sub Category Name</th>
										<th>Amount</th>
										<th>Expense Date</th>
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
											<h6 className="fw-medium"><Link to="#">Training Programs</Link></h6>
										</td>
										<td>
											Training
										</td>
										<td>
											Employee Training
										</td>
										<td>
											20000
										</td>
										<td>
											14 Jan 2024
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_new_expense"><i className="ti ti-edit"></i></Link>
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
											<h6 className="fw-medium"><Link to="#">Premium Support Packages</Link></h6>
										</td>
										<td>
											Support & Maintenance
										</td>
										<td>
											Premium Support
										</td>
										<td>
											40000
										</td>
										<td>
											21 Jan 2024
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_new_expense"><i className="ti ti-edit"></i></Link>
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
											<h6 className="fw-medium"><Link to="#">Consulting Services</Link></h6>
										</td>
										<td>
											Services
										</td>
										<td>
											Consulting
										</td>
										<td>
											10000
										</td>
										<td>
											10 Feb 2024
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_new_expense"><i className="ti ti-edit"></i></Link>
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
											<h6 className="fw-medium"><Link to="#">Subscription Fees</Link></h6>
										</td>
										<td>
											Platform Fees
										</td>
										<td>
											Subscription Plans
										</td>
										<td>
											20000
										</td>
										<td>
											18 Feb 2024
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<Link to="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_new_expense"><i className="ti ti-edit"></i></Link>
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

      {/* Add New Revenue */}
		<div className="modal fade" id="add_new_expense">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add Budget Revenue</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="budget-revenues.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Revenue Name</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Category Name</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Sub Category Name</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Amount</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expense Date </label>
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
										<div className="d-flex align-items-center justify-content-center border border-dashed rounded p-3 flex-column">
											<span className="avatar avatar-lg avatar-rounded bg-primary-transparent mb-2"><i className="ti ti-folder-open fs-24"></i></span>
											<p className="fs-14 text-center mb-2">Drag and drop your files</p>
											<div className="file-upload position-relative btn btn-sm btn-primary px-3 mb-2">
												<i className="ti ti-upload me-1"></i>Upload
												<input type="file" accept="video/image" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Budget Revenue</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add New Revenue */}

		{/* Edit New Expense */}
		<div className="modal fade" id="edit_new_expense">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Budget Revenue</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="budget-expenses.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Expense Name</label>
										<input type="text" className="form-control" defaultValue="Training Programs" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Category Name</label>
										<input type="text" className="form-control" defaultValue="Training" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Sub Category Name</label>
										<input type="text" className="form-control" defaultValue="Employee Training" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Amount</label>
										<input type="text" className="form-control" defaultValue="20000" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Expense Date </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" defaultValue="14 Jan 2024" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<div className="d-flex align-items-center justify-content-center border border-dashed rounded p-3 flex-column">
											<span className="avatar avatar-lg avatar-rounded bg-primary-transparent mb-2"><i className="ti ti-folder-open fs-24"></i></span>
											<p className="fs-14 text-center mb-2">Drag and drop your files</p>
											<div className="file-upload position-relative btn btn-sm btn-primary px-3 mb-2">
												<i className="ti ti-upload me-1"></i>Upload
												<input type="file" accept="video/image" />
											</div>
										</div>
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
		{/* /Edit New Expense */}

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
							<Link to="/budget-revenues" className="btn btn-danger">Yes, Delete</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}
    </>
  );
};

export default BudgetRevenuesPage;
