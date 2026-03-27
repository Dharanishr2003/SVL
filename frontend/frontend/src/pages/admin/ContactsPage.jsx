import React from 'react';

const ContactsPage = () => {
    return (
        <>
            <div className="content">

				{/* Breadcrumb */}
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Contacts</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<a href="admin-dashboard.php"><i className="ti ti-smart-home"></i></a>
								</li>
								<li className="breadcrumb-item">
									CRM
								</li>
								<li className="breadcrumb-item active" aria-current="page">Contacts List</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
						<div className="me-2 mb-2">
							<div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
								<a href="contacts.hmtl" className="btn btn-icon btn-sm active bg-primary text-white me-1"><i className="ti ti-list-tree"></i></a>
								<a href="contacts-grid.php" className="btn btn-icon btn-sm"><i className="ti ti-layout-grid"></i></a>
							</div>
						</div>
						<div className="me-2 mb-2">
							<div className="dropdown">
								<a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									<i className="ti ti-file-export me-1"></i>Export
								</a>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<a href="javascript:void(0);" className="dropdown-item rounded-1"><i className="ti ti-file-type-pdf me-1"></i>Export as PDF</a>
									</li>
									<li>
										<a href="javascript:void(0);" className="dropdown-item rounded-1"><i className="ti ti-file-type-xls me-1"></i>Export as Excel </a>
									</li>
								</ul>
							</div>
						</div>
						<div className="mb-2">
							<a href="#" data-bs-toggle="modal" data-bs-target="#add_contact" className="btn btn-primary d-flex align-items-center"><i className="ti ti-circle-plus me-2"></i>Add Contact</a>
						</div>
						<div className="head-icons ms-2">
							<a href="javascript:void(0);" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</a>
						</div>
					</div>
				</div>
				{/* /Breadcrumb */}

				{/* Contact List */}
				<div className="card">
						<div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
							<h5>Contact List</h5>
							<div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
								<div className="me-3">
									<div className="d-flex align-items-center border bg-white rounded p-1 icon-list">
										<a href="/contacts" className="btn btn-icon btn-sm active bg-primary text-white me-1">
											<i className="ti ti-list-tree"></i>
										</a>
										<a href="/contacts-grid" className="btn btn-icon btn-sm">
											<i className="ti ti-layout-grid"></i>
										</a>
									</div>
								</div>
								<div className="me-3">
									<div className="input-icon-end position-relative">
										<input type="text" className="form-control date-range bookingrange" placeholder="dd/mm/yyyy - dd/mm/yyyy" />
										<span className="input-icon-addon">
											<i className="ti ti-chevron-down"></i>
									</span>
								</div>
							</div>
							<div className="dropdown me-3">
								<a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
									Select Status
								</a>
								<ul className="dropdown-menu  dropdown-menu-end p-3">
									<li>
										<a href="javascript:void(0);" className="dropdown-item rounded-1">Active</a>
									</li>
									<li>
										<a href="javascript:void(0);" className="dropdown-item rounded-1">Inactive</a>
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
										<th>Name</th>
										<th>Email</th>
										<th>Phone</th>
										<th>Location</th>
										<th>Rating</th>
										<th>Owner</th>
										<th>Contact</th>
										<th>Status</th>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-49.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Darlee Robertson</a></h6>
													<span className="fs-12 fw-normal ">Facility Manager</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="2d494c5f4148486d48554c405d4148034e4240">[email&#160;protected]</a></td>
										<td>(163) 2459 315</td>
										<td>
											Germany
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>4.2</span></td>
										<td>Hendry Milner</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-50.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Sharon Roy</a></h6>
													<span className="fs-12 fw-normal ">Installer</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="097a61687b6667496c71686479656c276a6664">[email&#160;protected]</a></td>
										<td>(146) 1249 296</td>
										<td>
											USA
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>5.0</span></td>
										<td>Guilory Berggren</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-51.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Vaughan Lewis</a></h6>
													<span className="fs-12 fw-normal ">Senior Manager</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="c6b0a7b3a1aea7a886a3bea7abb6aaa3e8a5a9ab">[email&#160;protected]</a></td>
										<td>(135) 3489 516</td>
										<td>
											Canada
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>3.5</span></td>
										<td>Jami Carlile</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-02.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Jessica Louise</a></h6>
													<span className="fs-12 fw-normal ">Test Engineer</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b0dad5c3c3d9d3d1f0d5c8d1ddc0dcd59ed3dfdd">[email&#160;protected]</a></td>
										<td>(158) 3459 596</td>
										<td>
											India
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>4.5</span></td>
										<td>Theresa Nelson</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-52.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Carol Thomas</a></h6>
													<span className="fs-12 fw-normal ">UI /UX Designer</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="6e0d0f1c01022e0b160f031e020b400d0103">[email&#160;protected]</a></td>
										<td>(196) 4862 196</td>
										<td>
											China
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>4.7</span></td>
										<td>Smith Cooper</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-57.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Dawn Mercha</a></h6>
													<span className="fs-12 fw-normal ">Technician</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="1a7e7b6d745a7f627b776a767f34797577">[email&#160;protected]</a></td>
										<td>(163) 6498 256</td>
										<td>
											Japan
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>5.0</span></td>
										<td>Martin Lewis</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-54.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Rachel Hampton</a></h6>
													<span className="fs-12 fw-normal ">Software Developer</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b1c3d0d2d9d4ddf1d4c9d0dcc1ddd49fd2dedc">[email&#160;protected]</a></td>
										<td>(154) 6481 075</td>
										<td>
											Indonesia
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>3.1</span></td>
										<td>Newell Egan</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-56.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Jonelle Curtiss</a></h6>
													<span className="fs-12 fw-normal ">Supervisor</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="bfd5d0d1dad3d3deffdac7ded2cfd3da91dcd0d2">[email&#160;protected]</a></td>
										<td>(184) 6348 195</td>
										<td>
											Cuba
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>5.0</span></td>
										<td>Janet Carlson</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-26.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Jonathan Smith</a></h6>
													<span className="fs-12 fw-normal ">Team Lead Dev</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="147e7b7a75607c757a54716c75796478713a777b79">[email&#160;protected]</a></td>
										<td>(175) 2496 125</td>
										<td>
											Israel
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>2.7</span></td>
										<td>Craig Brown</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
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
											<div className="d-flex align-items-center file-name-icon">
												<a href="contact-details.php" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/users/user-36.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-medium"><a href="contact-details.php">Patricia Carter</a></h6>
													<span className="fs-12 fw-normal ">Team Lead Dev</span>
												</div>
											</div>
										</td>
										<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="25554451574c464c4465405d44485549400b464a48">[email&#160;protected]</a></td>
										<td>(132) 3145 977</td>
										<td>
											Colombia
										</td>
										<td><span className="d-flex align-items-center"><i className="ti ti-star-filled text-warning me-2"></i>3.0</span></td>
										<td>Daniel Byrne</td>
										<td>
											<ul className="contact-icon d-flex align-items-center ">
												<li><a href="#" className="p-1 rounded-circle contact-icon-mail d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-mail text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-call d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-phone-call text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-msg d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-message-2 text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-skype d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-skype text-gray-5"></i></span></a></li>
												<li><a href="#" className="p-1 rounded-circle contact-icon-facebook d-flex align-items-center justify-content-center"><span className="d-flex align-items-center justify-content-center"><i className="ti ti-brand-facebook text-gray-5"></i></span></a></li>
											</ul>
										</td>
										<td>
											<span className="badge badge-success d-inline-flex align-items-center badge-xs">
												<i className="ti ti-point-filled me-1"></i>Active
											</span>
										</td>
										<td>
											<div className="action-icon d-inline-flex">
												<a href="#" className="me-2" data-bs-toggle="modal" data-bs-target="#edit_contact"><i className="ti ti-edit"></i></a>
												<a href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash"></i></a>
											</div>
										</td>
									</tr>

								</tbody>
							</table>
						</div>
					</div>
				</div>
				{/* /Contact List */}

			</div>

			<div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
				<p className="mb-0">2014 - 2025 &copy; SmartHR.</p>
				<p>Designed &amp; Developed By <a href="javascript:void(0);" className="text-primary">Dreams</a></p>
			</div>


		{/* /Page Wrapper */}

		{/* Add Contact */}
		<div className="modal fade" id="add_contact">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Contact</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="contacts.php">
						<div className="contact-grids-tab">
							<ul className="nav nav-underline" id="myTab" role="tablist">
								<li className="nav-item" role="presentation">
									<button className="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#basic-info" type="button" role="tab" aria-selected="true">Basic Information</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="address-tab" data-bs-toggle="tab" data-bs-target="#address" type="button" role="tab" aria-selected="false">Address</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="social-profile-tab" data-bs-toggle="tab" data-bs-target="#social-profile" type="button" role="tab" aria-selected="false">Social Profiles</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="access-tab" data-bs-toggle="tab" data-bs-target="#access" type="button" role="tab" aria-selected="false">Access</button>
								</li>

							</ul>
						</div>
						<div className="tab-content" id="myTabContent">
							<div className="tab-pane fade show active" id="basic-info" role="tabpanel" aria-labelledby="info-tab" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
												<div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
													<i className="ti ti-photo text-gray-2 fs-16"></i>
												</div>
												<div className="profile-upload">
													<div className="mb-2">
														<h6 className="mb-1">Upload Profile Image</h6>
														<p className="fs-12">Image should be below 4 mb</p>
													</div>
													<div className="profile-uploader d-flex align-items-center">
														<div className="drag-upload-btn btn btn-sm btn-primary me-2">
															Upload
															<input type="file" className="form-control image-sign" multiple="" />
														</div>
														<a href="javascript:void(0);" className="btn btn-light btn-sm">Cancel</a>
													</div>

												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">First Name <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Last Name</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Job Title <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Company Name <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>BrightWave Innovations</option>
													<option>Stellar Dynamics</option>
													<option>Quantum Nexus</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Email</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Phone Number <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Phone Number 2<span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Fax</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="input-block mb-3">
												<div className="d-flex justify-content-between align-items-center mb-2">
													<label className="col-form-label p-0">Deals <span className="text-danger"> *</span></label>
													<a href="#" className="add-new text-primary" data-bs-target="#add_deals" data-bs-toggle="modal"><i className="ti ti-plus text-primary me-1"></i>Add New</a>
												</div>
												<select className="select">
													<option>Select</option>
													<option>Collins</option>
													<option>Konopelski</option>
													<option>Adams</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Date of Birth <span className="text-danger"> *</span> </label>
												<div className="input-icon-end position-relative">
													<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
													<span className="input-icon-addon">
														<i className="ti ti-calendar text-gray-7"></i>
													</span>
												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Ratings <span className="text-danger"> *</span></label>
												<div className="input-icon-end position-relative">
													<input type="text" className="form-control" />
													<span className="input-icon-addon">
														<i className="ti ti-star text-gray-6"></i>
													</span>
												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Owner <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>Hendry Milner</option>
													<option>Guilory Berggren</option>
													<option>Jami Carlile</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Industry <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>Retail Industry</option>
													<option>Banking</option>
													<option>Hotels</option>
													<option>Financial Services</option>
													<option>Insurance</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Currency <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>USD</option>
													<option>Euro</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Language <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>English</option>
													<option>Arabic</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Tags <span className="text-danger"> *</span> </label>
												<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Collab" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Source <span className="text-danger"> *</span> </label>
												<select className="select">
													<option>Select</option>
													<option>Phone Calls</option>
													<option>Social Media</option>
													<option>Refferal Sites</option>
													<option>Web Analytics</option>
													<option>Previous Purchase</option>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="address" role="tabpanel" aria-labelledby="address-tab" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div className="mb-3">
												<label className="form-label">Address <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Country <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>USA</option>
													<option>Canada</option>
													<option>Germany</option>
													<option>France</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">State <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>California</option>
													<option>New York</option>
													<option>Texas</option>
													<option>Florida</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">City <span className="text-danger"> *</span></label>
												<select className="select">
													<option>Select</option>
													<option>Los Angeles</option>
													<option>San Diego</option>
													<option>Fresno</option>
													<option>San Francisco</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Zipcode <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" />
											</div>
										</div>

									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="social-profile" role="tabpanel" aria-labelledby="social-profile-tab" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Facebook</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Twitter</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">LinkedIn</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Skype</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Whatsapp</label>
												<input type="email" className="form-control" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Instagram</label>
												<input type="email" className="form-control" />
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="access" role="tabpanel" aria-labelledby="access-tab" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="mb-4">
										<h6 className="fs-14 fw-medium mb-1">Visibility</h6>
										<div className="d-flex align-items-center">
											<div className="form-check me-3">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault1">
													Public
												</label>
											</div>
											<div className="form-check me-3">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" defaultChecked />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault2">
													Private
												</label>
											</div>
											<div className="form-check ">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" defaultChecked />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault3">
													Select People
												</label>
											</div>
										</div>
									</div>
									<div className="p-3 bg-gray br-5 mb-4">
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-6" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-01.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Michael Walker</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-7" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-02.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Sophie Headrick</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-8" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-03.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Cameron Drake</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-9" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-04.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Doris Crowley</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-10" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/profiles/avatar-12.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Thomas Bordelon</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-primary">Confirm</a>
										</div>
									</div>
									<div className="mb-3 ">
										<label className="form-label">Status</label>
										<select className="select">
											<option>Select</option>
											<option>Active</option>
											<option>Inactive</option>
										</select>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#success_compay">Save </button>
								</div>
							</div>

						</div>


					</form>
				</div>
			</div>
		</div>
		{/* /Add Contact */}

		{/* Edit Contact */}
		<div className="modal fade" id="edit_contact">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Contact</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="contacts.php">
						<div className="contact-grids-tab">
							<ul className="nav nav-underline" id="myTab2" role="tablist">
								<li className="nav-item" role="presentation">
									<button className="nav-link active" id="info-tab2" data-bs-toggle="tab" data-bs-target="#basic-info2" type="button" role="tab" aria-selected="true">Basic Information</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="address-tab2" data-bs-toggle="tab" data-bs-target="#address2" type="button" role="tab" aria-selected="false">Address</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="social-profile-tab2" data-bs-toggle="tab" data-bs-target="#social-profile2" type="button" role="tab" aria-selected="false">Social Profiles</button>
								</li>
								<li className="nav-item" role="presentation">
									<button className="nav-link" id="access-tab2" data-bs-toggle="tab" data-bs-target="#access2" type="button" role="tab" aria-selected="false">Access</button>
								</li>
							</ul>
						</div>
						<div className="tab-content" id="myTabContent2">
							<div className="tab-pane fade show active" id="basic-info2" role="tabpanel" aria-labelledby="info-tab2" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div className="d-flex align-items-center flex-wrap row-gap-3 bg-light w-100 rounded p-3 mb-4">
												<div className="d-flex align-items-center justify-content-center avatar avatar-xxl rounded-circle border border-dashed me-2 flex-shrink-0 text-dark frames">
													<img src="assets/img/profiles/avatar-30.jpg" alt="img" className="rounded-circle" />
												</div>
												<div className="profile-upload">
													<div className="mb-2">
														<h6 className="mb-1">Upload Profile Image</h6>
														<p className="fs-12">Image should be below 4 mb</p>
													</div>
													<div className="profile-uploader d-flex align-items-center">
														<div className="drag-upload-btn btn btn-sm btn-primary me-2">
															Upload
															<input type="file" className="form-control image-sign" multiple="" />
														</div>
														<a href="javascript:void(0);" className="btn btn-light btn-sm">Cancel</a>
													</div>

												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Name <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="Darlee" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Last Name</label>
												<input type="text" className="form-control" defaultValue="Robertson" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Job Title <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="Facility Manager" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Company Name <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="BrightWave Innovations">
													<option>Select</option>
													<option>BrightWave Innovations</option>
													<option>Stellar Dynamics</option>
													<option>Quantum Nexus</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Email</label>
												<input type="text" className="form-control" defaultValue="darlee@example.com" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Phone Number <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="(163) 2459 315" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Phone Number 2<span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="(146) 1249 296" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Fax</label>
												<input type="text" className="form-control" />
											</div>
										</div>
										<div className="col-md-4">
											<div className="input-block mb-3">
												<div className="d-flex justify-content-between align-items-center mb-2">
													<label className="col-form-label p-0">Deals <span className="text-danger"> *</span></label>
													<a href="#" className="add-new text-primary" data-bs-target="#add_deals" data-bs-toggle="modal"><i className="ti ti-plus text-primary me-1"></i>Add New</a>
												</div>
												<select className="select" defaultValue="Collins">
													<option>Select</option>
													<option>Collins</option>
													<option>Konopelski</option>
													<option>Adams</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">Date of Birth <span className="text-danger"> *</span> </label>
												<div className="input-icon-end position-relative">
													<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" defaultValue="02-05-2024" />
													<span className="input-icon-addon">
														<i className="ti ti-calendar text-gray-7"></i>
													</span>
												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Ratings <span className="text-danger"> *</span></label>
												<div className="input-icon-end position-relative">
													<input type="text" className="form-control" />
													<span className="input-icon-addon">
														<i className="ti ti-star text-gray-6"></i>
													</span>
												</div>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Owner <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="Hendry Milner">
													<option>Select</option>
													<option>Hendry Milner</option>
													<option>Guilory Berggren</option>
													<option>Jami Carlile</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Industry <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="Retail Industry">
													<option>Select</option>
													<option>Retail Industry</option>
													<option>Banking</option>
													<option>Hotels</option>
													<option>Financial Services</option>
													<option>Insurance</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Currency <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="Dollar">
													<option>Select</option>
													<option>Dollar</option>
													<option>Euro</option>
												</select>
											</div>
										</div>
										<div className="col-md-4">
											<div className="mb-3 ">
												<label className="form-label">Language <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="English">
													<option>Select</option>
													<option>English</option>
													<option>Arabic</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Tags <span className="text-danger"> *</span> </label>
												<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Collab" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3 ">
												<label className="form-label">Source <span className="text-danger"> *</span> </label>
												<select className="select" defaultValue="Social Media">
													<option>Select</option>
													<option>Phone Calls</option>
													<option>Social Media</option>
													<option>Refferal Sites</option>
													<option>Web Analytics</option>
													<option>Previous Purchase</option>
												</select>
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="address2" role="tabpanel" aria-labelledby="address-tab2" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-12">
											<div className="mb-3">
												<label className="form-label">Address <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="Germany" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Country <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="USA">
													<option>Select</option>
													<option>USA</option>
													<option>Canada</option>
													<option>Germany</option>
													<option>France</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">State <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="California">
													<option>Select</option>
													<option>California</option>
													<option>New York</option>
													<option>Texas</option>
													<option>Florida</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">City <span className="text-danger"> *</span></label>
												<select className="select" defaultValue="Los Angeles">
													<option>Select</option>
													<option>Los Angeles</option>
													<option>San Diego</option>
													<option>Fresno</option>
													<option>San Francisco</option>
												</select>
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Zipcode <span className="text-danger"> *</span></label>
												<input type="text" className="form-control" defaultValue="65" />
											</div>
										</div>

									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="social-profile2" role="tabpanel" aria-labelledby="social-profile-tab2" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="row">
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Facebook</label>
												<input type="text" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Twitter</label>
												<input type="email" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">LinkedIn</label>
												<input type="email" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Skype</label>
												<input type="email" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Whatsapp</label>
												<input type="email" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
										<div className="col-md-6">
											<div className="mb-3">
												<label className="form-label">Instagram</label>
												<input type="email" className="form-control" defaultValue="Darlee Robertson" />
											</div>
										</div>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="submit" className="btn btn-primary">Save </button>
								</div>
							</div>
							<div className="tab-pane fade" id="access2" role="tabpanel" aria-labelledby="access-tab2" tabIndex="0">
								<div className="modal-body pb-0 ">
									<div className="mb-4">
										<h6 className="fs-14 fw-medium mb-1">Visibility</h6>
										<div className="d-flex align-items-center">
											<div className="form-check me-3">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault4">
													Public
												</label>
											</div>
											<div className="form-check me-3">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault5" defaultChecked />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault5">
													Private
												</label>
											</div>
											<div className="form-check ">
												<input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault6" />
												<label className="form-check-label text-dark" htmlFor="flexRadioDefault6">
													Select People
												</label>
											</div>
										</div>
									</div>
									<div className="p-3 bg-gray br-5 mb-4">
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-1" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-01.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Michael Walker</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-2" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-02.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Sophie Headrick</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-3" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-03.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Cameron Drake</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-4" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/reports/user-04.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Doris Crowley</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center mb-3">
											<input className="form-check-input me-1" type="checkbox" value="" id="user-5" />
											<div className="d-flex align-items-center file-name-icon">
												<a href="#" className="avatar avatar-md border avatar-rounded">
													<img src="assets/img/profiles/avatar-12.jpg" className="img-fluid" alt="img" />
												</a>
												<div className="ms-2">
													<h6 className="fw-normal"><a href="#">Thomas Bordelon</a></h6>
												</div>
											</div>
										</div>
										<div className="d-flex align-items-center justify-content-center">
											<a href="#" className="btn btn-primary">Confirm</a>
										</div>
									</div>
									<div className="mb-3 ">
										<label className="form-label">Status</label>
										<select className="select">
											<option>Select</option>
											<option>Active</option>
											<option>Inactive</option>
										</select>
									</div>
								</div>
								<div className="modal-footer">
									<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
									<button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#success_compay">Save </button>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Contact */}



		{/* Success Contact */}
		<div className="modal fade" id="success_compay">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-body pb-0">
						<div className="p-4">
							<div className="row">
								<div className="col-md-12">
									<div className="d-flex flex-column align-items-center justify-content-center mb-3">
										<img src="assets/img/reports-img/check-icon.svg" alt="icon" className="mb-3" />
										<h5>Contact Added Successfully</h5>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<a href="contacts.php" className="btn btn-dark d-flex justify-content-center ">Back to List</a>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<a href="contact-details.php" className="btn btn-primary bg-primary-gradient d-flex justify-content-center ">Detail Page</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Success Contact */}

		{/* Delete Modal */}
		<div className="modal fade" id="delete_modal">
			<div className="modal-dialog modal-dialog-centered modal-sm">
				<div className="modal-content">
					<div className="modal-body text-center">
						<span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
							<i className="ti ti-trash-x fs-36"></i>
						</span>
						<h4 className="mb-1">Confirm Delete</h4>
						<p className="mb-3">You want to delete all the marked items, this cant be undone once you delete.</p>
						<div className="d-flex justify-content-center">
							<a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</a>
							<a href="contacts-grid.php" className="btn btn-danger">Yes, Delete</a>
						</div>
					</div>
				</div>
			</div>
		</div>
		{/* /Delete Modal */}

		{/* Add Deals */}
		<div className="modal fade" id="add_deals">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Deals</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="deals-grid.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Deal Name <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Collins</option>
											<option>Konopelski</option>
											<option>Adams</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="input-block mb-3">
										<div className="d-flex justify-content-between align-items-center">
											<label className="form-label">Pipeline <span className="text-danger"> *</span></label>
											<a href="#" className="add-new text-primary" data-bs-toggle="modal" data-bs-target="#add_pipeline"><i className="ti ti-plus text-primary me-1"></i>Add New</a>
										</div>
										<select className="select">
											<option>Select</option>
											<option>Sales</option>
											<option>Marketing</option>
											<option>Calls</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Status <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Open</option>
											<option>Won</option>
											<option>Lost</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Deal Value <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Currency<span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Dollar</option>
											<option>Euro</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Period <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Days</option>
											<option>Months</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Period Value <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Contact <span className="text-danger"> *</span></label>
										<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Vaughan Lewis" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Project<span className="text-danger"> *</span></label>
										<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Office Management App,Clinic Management,Educational Platform" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3">
										<label className="form-label">Due Date <span className="text-danger"> *</span> </label>
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
										<label className="form-label">Expected Closing Date <span className="text-danger"> *</span> </label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3 ">
										<label className="form-label">Assignee <span className="text-danger"> *</span></label>
										<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Vaughan Lewis" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3 ">
										<label className="form-label">Tags <span className="text-danger"> *</span></label>
										<input className="input-tags form-control" placeholder="Add new" type="text" data-role="tagsinput" name="Label" defaultValue="Collab" />
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3 ">
										<label className="form-label">Followup Date <span className="text-danger"> *</span></label>
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control datetimepicker" placeholder="dd/mm/yyyy" />
											<span className="input-icon-addon">
												<i className="ti ti-calendar text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3 ">
										<label className="form-label">Source <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>Phone Calls</option>
											<option>Social Media</option>
											<option>Refferal Sites</option>
											<option>Web Analytics</option>
											<option>Previous Purchase</option>
										</select>
									</div>
								</div>
								<div className="col-md-6">
									<div className="mb-3 ">
										<label className="form-label">Priority <span className="text-danger"> *</span></label>
										<select className="select">
											<option>Select</option>
											<option>High</option>
											<option>Low</option>
											<option>Medium</option>
										</select>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3 ">
										<label className="form-label">Description <span className="text-danger"> *</span></label>
										<textarea className="form-control"></textarea>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Deal</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Deals */}

		{/* Add Pipeline */}
		<div className="modal fade" id="add_pipeline">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Pipeline</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="pipeline.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Pipeline Name <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="input-block mb-3">
										<div className="d-flex justify-content-between align-items-center">
											<label className="form-label">Pipeline Stages <span className="text-danger"> *</span></label>
											<a href="#" className="add-new text-primary" data-bs-toggle="modal" data-bs-target="#add_stage"><i className="ti ti-plus text-primary me-1"></i>Add New</a>
										</div>
										<div className="p-3 border border-gray br-5 mb-2">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Inpipline</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default" data-bs-toggle="modal" data-bs-target="#edit_stage"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default" data-bs-toggle="modal" data-bs-target="#delete_modal"><span><i className="ti ti-trash"></i></span></a>
												</div>
											</div>
										</div>
										<div className="p-3 border border-gray br-5 mb-2">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Follow Up</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default" data-bs-toggle="modal" data-bs-target="#edit_stage"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default" data-bs-toggle="modal" data-bs-target="#delete_modal"><span><i className="ti ti-trash"></i></span></a>
												</div>
											</div>
										</div>
										<div className="p-3 border border-gray br-5">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Schedule Service</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default" data-bs-toggle="modal" data-bs-target="#edit_stage"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default"><span><i className="ti ti-trash" data-bs-toggle="modal" data-bs-target="#delete_modal"></i></span></a>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Access</label>
										<div className="d-flex  access-item nav">
											<div className="d-flex align-items-center">
												<div className="radio-btn d-flex align-items-center " data-bs-toggle="tab" data-bs-target="#all">
													<input type="radio" className="status-radio me-2" id="all" name="status" defaultChecked />
													<label htmlFor="all">All</label>
												</div>
												<div className="radio-btn d-flex align-items-center " data-bs-toggle="tab" data-bs-target="#select-person">
													<input type="radio" className="status-radio me-2" id="select" name="status" />
													<label htmlFor="select">Select Person</label>
												</div>
											</div>
										</div>
										<div className="tab-content">
											<div className="tab-pane fade" id="select-person">
												<div className="access-wrapper">
													<div className="p-3 border border-gray br-5 mb-2">
														<div className="d-flex align-items-center justify-content-between">
															<div className="d-flex align-items-center file-name-icon">
																<a href="#" className="avatar avatar-md border avatar-rounded">
																	<img src="assets/img/profiles/avatar-20.jpg" className="img-fluid" alt="img" />
																</a>
																<div className="ms-2">
																	<h6 className="fw-medium"><a href="#">Sharon Roy</a></h6>
																</div>
															</div>
															<div className="d-flex align-items-center">
																<a href="#" className="text-danger">Remove</a>
															</div>
														</div>
													</div>
													<div className="p-3 border border-gray br-5 mb-2">
														<div className="d-flex align-items-center justify-content-between">
															<div className="d-flex align-items-center file-name-icon">
																<a href="#" className="avatar avatar-md border avatar-rounded">
																	<img src="assets/img/profiles/avatar-21.jpg" className="img-fluid" alt="img" />
																</a>
																<div className="ms-2">
																	<h6 className="fw-medium"><a href="#">Sharon Roy</a></h6>
																</div>
															</div>
															<div className="d-flex align-items-center">
																<a href="#" className="text-danger">Remove</a>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Pipeline</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add Pipeline */}

		{/* Edit Pipeline */}
		<div className="modal fade" id="edit_pipeline">
			<div className="modal-dialog modal-dialog-centered modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Pipeline</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="pipeline.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Pipeline Name <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" defaultValue="Marketing" />
									</div>
								</div>
								<div className="col-md-12">
									<div className="input-block mb-3">
										<div className="d-flex justify-content-between align-items-center">
											<label className="form-label">Pipeline Stages <span className="text-danger"> *</span></label>
											<a href="#" className="add-new text-primary" data-bs-toggle="modal" data-bs-target="#add_stage"><i className="ti ti-plus text-primary me-1"></i>Add New</a>
										</div>
										<div className="p-3 border border-gray br-5 mb-2">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Inpipline</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default"><span><i className="ti ti-trash"></i></span></a>
												</div>
											</div>
										</div>
										<div className="p-3 border border-gray br-5 mb-2">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Follow Up</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default"><span><i className="ti ti-trash"></i></span></a>
												</div>
											</div>
										</div>
										<div className="p-3 border border-gray br-5">
											<div className="d-flex align-items-center justify-content-between">
												<div className="d-flex align-items-center">
													<span className="me-2"><i className="ti ti-grip-vertical"></i></span>
													<h6 className="fs-14 fw-normal">Schedule Service</h6>
												</div>
												<div className="d-flex align-items-center">
													<a href="#" className="text-default"><span className="me-2"><i className="ti ti-edit"></i></span></a>
													<a href="#" className="text-default"><span><i className="ti ti-trash"></i></span></a>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Access</label>
										<div className="d-flex  access-item nav">
											<div className="d-flex align-items-center">
												<div className="radio-btn d-flex align-items-center " data-bs-toggle="tab" data-bs-target="#all2">
													<input type="radio" className="status-radio me-2" id="all2" name="status" defaultChecked />
													<label htmlFor="all2">All</label>
												</div>
												<div className="radio-btn d-flex align-items-center " data-bs-toggle="tab" data-bs-target="#select-person2">
													<input type="radio" className="status-radio me-2" id="select2" name="status" />
													<label htmlFor="select2">Select Person</label>
												</div>
											</div>
										</div>
										<div className="tab-content">
											<div className="tab-pane fade" id="select-person2">
												<div className="access-wrapper">
													<div className="p-3 border border-gray br-5 mb-2">
														<div className="d-flex align-items-center justify-content-between">
															<div className="d-flex align-items-center file-name-icon">
																<a href="#" className="avatar avatar-md border avatar-rounded">
																	<img src="assets/img/profiles/avatar-20.jpg" className="img-fluid" alt="img" />
																</a>
																<div className="ms-2">
																	<h6 className="fw-medium"><a href="#">Sharon Roy</a></h6>
																</div>
															</div>
															<div className="d-flex align-items-center">
																<a href="#" className="text-danger">Remove</a>
															</div>
														</div>
													</div>
													<div className="p-3 border border-gray br-5 mb-2">
														<div className="d-flex align-items-center justify-content-between">
															<div className="d-flex align-items-center file-name-icon">
																<a href="#" className="avatar avatar-md border avatar-rounded">
																	<img src="assets/img/profiles/avatar-21.jpg" className="img-fluid" alt="img" />
																</a>
																<div className="ms-2">
																	<h6 className="fw-medium"><a href="#">Sharon Roy</a></h6>
																</div>
															</div>
															<div className="d-flex align-items-center">
																<a href="#" className="text-danger">Remove</a>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Pipeline</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Edit Pipeline */}

		{/* Pipeline Access */}
		<div className="modal fade" id="pipeline-access">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Pipeline Access</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="pipeline.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<div className="input-icon-end position-relative">
											<input type="text" className="form-control" placeholder="Search" />
											<span className="input-icon-addon">
												<i className="ti ti-search text-gray-7"></i>
											</span>
										</div>
									</div>
								</div>
								<div className="col-md-12">
									<div className="mb-3">
										<div className="p-2 border br-5">
											<div className="pipeline-access-items">
												<div className="d-flex  align-items-center p-2">
													<div className="form-check  form-check-md me-2">
														<input className="form-check-input" type="checkbox" />
													</div>
													<div className="d-flex align-items-center file-name-icon">
														<a href="#" className="avatar avatar-md border avatar-rounded">
															<img src="assets/img/profiles/avatar-19.jpg" className="img-fluid" alt="img" />
														</a>
														<div className="ms-2">
															<h6 className="fw-medium fs-12"><a href="#">Darlee Robertson</a></h6>
															<span className="fs-10 fw-normal">Darlee Robertson</span>
														</div>
													</div>
												</div>
												<div className="d-flex align-items-center p-2">
													<div className="form-check form-check-md me-2">
														<input className="form-check-input" type="checkbox" />
													</div>
													<div className="d-flex align-items-center file-name-icon">
														<a href="#" className="avatar avatar-md border avatar-rounded">
															<img src="assets/img/profiles/avatar-20.jpg" className="img-fluid" alt="img" />
														</a>
														<div className="ms-2">
															<h6 className="fw-medium fs-12"><a href="#">Sharon Roy</a></h6>
															<span className="fs-10 fw-normal">Installer</span>
														</div>
													</div>
												</div>
												<div className="d-flex align-items-center p-2">
													<div className="form-check form-check-md me-2">
														<input className="form-check-input" type="checkbox" />
													</div>
													<div className="d-flex align-items-center file-name-icon">
														<a href="#" className="avatar avatar-md border avatar-rounded">
															<img src="assets/img/profiles/avatar-21.jpg" className="img-fluid" alt="img" />
														</a>
														<div className="ms-2">
															<h6 className="fw-medium fs-12"><a href="#">Vaughan Lewis</a></h6>
															<span className="fs-10 fw-normal">Senior Manager</span>
														</div>
													</div>
												</div>
												<div className="d-flex align-items-center p-2">
													<div className="form-check form-check-md me-2">
														<input className="form-check-input" type="checkbox" />
													</div>
													<div className="d-flex align-items-center file-name-icon">
														<a href="#" className="avatar avatar-md border avatar-rounded">
															<img src="assets/img/users/user-33.jpg" className="img-fluid" alt="img" />
														</a>
														<div className="ms-2">
															<h6 className="fw-medium fs-12"><a href="#">Jessica Louise</a></h6>
															<span className="fs-10 fw-normal">Test Engineer</span>
														</div>
													</div>
												</div>
												<div className="d-flex align-items-center p-2">
													<div className="form-check form-check-md me-2">
														<input className="form-check-input" type="checkbox" />
													</div>
													<div className="d-flex align-items-center file-name-icon">
														<a href="#" className="avatar avatar-md border avatar-rounded">
															<img src="assets/img/users/user-34.jpg" className="img-fluid" alt="img" />
														</a>
														<div className="ms-2">
															<h6 className="fw-medium fs-12"><a href="#">Test Engineer</a></h6>
															<span className="fs-10 fw-normal">UI /UX Designer</span>
														</div>
													</div>
												</div>
											</div>

										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Confirm</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Pipeline Access */}

		{/* Add New Stage */}
		<div className="modal fade" id="add_stage">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Stage</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="pipeline.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Stage Name <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" />
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add Stage</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		{/* /Add New Stage */}

		{/* Edit Stage */}
		<div className="modal fade" id="edit_stage">
			<div className="modal-dialog modal-dialog-centered modal-md">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Stage</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="pipeline.php">
						<div className="modal-body pb-0">
							<div className="row">
								<div className="col-md-12">
									<div className="mb-3">
										<label className="form-label">Edit Name <span className="text-danger"> *</span></label>
										<input type="text" className="form-control" defaultValue="Inpipeline" />
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
		{/* /Edit Stage */}

	
	
        </>
    );
};

export default ContactsPage;
