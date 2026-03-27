import React from 'react';

const TodoPage = () => {
  return (
    <>
<div className="content">
				
				<div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
					<div className="my-auto mb-2">
						<h2 className="mb-1">Todo</h2>
						<nav>
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<a href="admin-dashboard.php"><i className="ti ti-smart-home"></i></a>
								</li>
								<li className="breadcrumb-item">
									Application
								</li>
								<li className="breadcrumb-item active" aria-current="page">Todo</li>
							</ol>
						</nav>
					</div>
					<div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
						<div className="d-flex align-items-center border rounded p-1 me-2">
							<a href="todo-list.php" className="btn btn-icon btn-sm"><i className="ti ti-list-tree"></i></a>
							<a href="todo.php" className="btn btn-icon btn-sm active bg-primary text-white"><i className="ti ti-table"></i></a>
						</div>
						<div className="">
							<div className="input-icon-start position-relative">
								<span className="input-icon-addon">
									<i className="ti ti-search"></i>
								</span>
								<input type="text" className="form-control" placeholder="Search Todo List" />
							</div>
						</div>
						<div className="ms-2 mb-0 head-icons">
							<a href="javascript:void(0);" className="" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="Collapse" id="collapse-header">
								<i className="ti ti-chevrons-up"></i>
							</a>
						</div>
					</div>

				</div>
				<div className="card">
					<div className="card-body">
						<div className="row gy-3 mb-3">
							<div className="col-sm-4">
								<div className="d-flex align-items-center">
									<h4>Total Todo</h4>
									<span className="badge badge-dark rounded-pill badge-xs ms-2">+1</span>
								</div>
							</div>
							<div className="col-sm-8">
								<div className="d-flex align-items-center justify-content-end">
									<p className="mb-0 me-3 pe-3 border-end fs-14">Total Task : <span className="text-dark"> 55 </span></p>
									<p className="mb-0 me-3 pe-3 border-end fs-14">Pending : <span className="text-dark"> 15 </span></p>
									<p className="mb-0 fs-14">Completed : <span className="text-dark"> 40 </span></p>
								</div>
							</div>
						</div>
						<div className="mb-3">
							<button className="btn bg-primary-transparent border-dashed border-primary w-100 text-start" data-bs-toggle="modal" data-bs-target="#add_todo">
								<i className="ti ti-plus me-2"></i>New task
							</button>
						</div>
						<div className="row border-bottom mb-3">
							<div className="col-lg-6">
								<div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
									<h6 className="me-2">Priority</h6>
									<ul className="nav nav-pills border d-inline-flex p-1 rounded bg-light todo-tabs" id="pills-tab" role="tablist">
										<li className="nav-item" role="presentation">
											<button className="nav-link btn btn-sm btn-icon py-3 d-flex align-items-center justify-content-center w-auto active" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-selected="true">All</button>
										</li>
										<li className="nav-item" role="presentation">
											<button className="nav-link btn btn-sm btn-icon py-3 d-flex align-items-center justify-content-center w-auto" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-selected="false">High</button>
										</li>
										<li className="nav-item" role="presentation">
											<button className="nav-link btn btn-sm btn-icon py-3 d-flex align-items-center justify-content-center w-auto" data-bs-toggle="pill" data-bs-target="#pills-medium" type="button" role="tab" aria-selected="false">Medium</button>
										</li>
										<li className="nav-item" role="presentation">
											<button className="nav-link btn btn-sm btn-icon py-3 d-flex align-items-center justify-content-center w-auto" data-bs-toggle="pill" data-bs-target="#pills-low" type="button" role="tab" aria-selected="false">Low</button>
										</li>
									</ul>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="d-flex align-items-center justify-content-lg-end flex-wrap row-gap-3 mb-3">
									<div className="input-icon w-120 position-relative me-2">
										<span className="input-icon-addon">
											<i className="ti ti-calendar text-gray-9"></i>
										</span>
										<input type="text" className="form-control datetimepicker" placeholder="Due Date" />
									</div>
									<div className="dropdown me-2">
										<a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
											All Tags
										</a>
										<ul className="dropdown-menu  dropdown-menu-end p-3">
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">All Tags</a>
											</li>
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">Internal</a>
											</li>
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">Projects</a>
											</li>
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">Meetings</a>
											</li>
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">Reminder</a>
											</li>
											<li>
												<a href="javascript:void(0);" className="dropdown-item rounded-1">Research</a>
											</li>
										</ul>
									</div>
									<div className="d-flex align-items-center">
										<span className="d-inline-flex me-2">Sort By : </span>
										<div className="dropdown">
											<a href="javascript:void(0);" className="dropdown-toggle btn btn-white d-inline-flex align-items-center border-0 bg-transparent p-0 text-dark" data-bs-toggle="dropdown">
												Created Date
											</a>
											<ul className="dropdown-menu  dropdown-menu-end p-3">
												<li>
													<a href="javascript:void(0);" className="dropdown-item rounded-1">Created Date</a>
												</li>
												<li>
													<a href="javascript:void(0);" className="dropdown-item rounded-1">Priority</a>
												</li>
												<li>
													<a href="javascript:void(0);" className="dropdown-item rounded-1">Due Date</a>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="tab-content" id="pills-tabContent">
							<div className="tab-pane fade show active" id="pills-home" role="tabpanel">
								<div className="accordion todo-accordion" id="accordionExample">
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingTwo">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-controls="collapseTwo">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-purple me-2"></i></span>
																<h5 className="fw-semibold">High</h5>
																<span className="badge bg-light rounded-pill ms-2">15</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
											<div className="accordion-body">
												<div className="list-group list-group-flush border-bottom pb-2">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 d-flex align-items-center rating-select"><i className="ti ti-star-filled filled"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Finalize project proposal</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>15 Jan 2025</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-success me-3">Projects</span>
																	<span className="badge bg-soft-pink d-inline-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Onhold</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-13.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-15.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Submit to supervisor by EOD</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>25 May 2024</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-danger me-3">Internal</span>
																	<span className="badge bg-transparent-purple d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Inprogress</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-20.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-21.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-22.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3 todo-strike-content">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" defaultChecked />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Prepare presentation slides</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>15 Jan 2025</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-secondary me-3">Reminder</span>
																	<span className="badge badge-secondary-transparent d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Pending</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-23.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-25.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingThree">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-controls="collapseThree">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-warning me-2"></i></span>
																<h5 className="fw-semibold">Medium</h5>
																<span className="badge bg-light rounded-pill ms-2">05</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseThree" className="accordion-collapse collapse show" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
											<div className="accordion-body">
												<div className="list-group list-group-flush border-bottom pb-2">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Check and respond to emails</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>Tomorrow</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-secondary me-3">Reminder</span>
																	<span className="badge badge-soft-success align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Completed</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Coordinate with department head on progress</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>25 May 2024</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-danger me-3">Internal</span>
																	<span className="badge bg-transparent-purple d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Inprogress</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-06.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-09.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingFour">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-controls="collapseFour">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-success me-2"></i></span>
																<h5 className="fw-semibold">Low</h5>
																<span className="badge bg-light rounded-pill ms-2">24</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseFour" className="accordion-collapse collapse show" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
											<div className="accordion-body">
												<div className="list-group list-group-flush">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Plan tasks for the next day</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>Today</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-info me-3">Social</span>
																	<span className="badge badge-soft-secondary d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Pending</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
								</div>
							</div>
							<div className="tab-pane fade" id="pills-contact" role="tabpanel">
								<div className="accordion todo-accordion">
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingSix">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-controls="collapseSix">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-purple me-2"></i></span>
																<h5 className="fw-semibold">High</h5>
																<span className="badge bg-light rounded-pill ms-2">15</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseSix" className="accordion-collapse collapse show" aria-labelledby="headingSix">
											<div className="accordion-body">
												<div className="list-group list-group-flush">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star-filled filled"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Finalize project proposal</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>15 Jan 2025</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-success me-3">Projects</span>
																	<span className="badge bg-soft-pink d-inline-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Onhold</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-13.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-15.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Submit to supervisor by EOD</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>25 May 2024</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-danger me-3">Internal</span>
																	<span className="badge bg-transparent-purple d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Inprogress</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-20.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-21.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-22.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3 todo-strike-content">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" defaultChecked />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Prepare presentation slides</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>15 Jan 2025</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-secondary me-3">Reminder</span>
																	<span className="badge badge-secondary-transparent d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Pending</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-23.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-25.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
								</div>
							</div>
							<div className="tab-pane fade" id="pills-medium" role="tabpanel">
								<div className="accordion todo-accordion">
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingSeven">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseSeven" aria-controls="collapseSeven">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-warning me-2"></i></span>
																<h5 className="fw-semibold">Medium</h5>
																<span className="badge bg-light rounded-pill ms-2">05</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseSeven" className="accordion-collapse collapse show" aria-labelledby="headingSeven">
											<div className="accordion-body">
												<div className="list-group list-group-flush">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Check and respond to emails</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>Tomorrow</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-secondary me-3">Reminder</span>
																	<span className="badge badge-soft-success align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Completed</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Coordinate with department head on progress</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>25 May 2024</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-danger me-3">Internal</span>
																	<span className="badge bg-transparent-purple d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Inprogress</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-06.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-09.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-14.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
								</div>
							</div>
							<div className="tab-pane fade" id="pills-low" role="tabpanel">
								<div className="accordion todo-accordion">
									<div className="accordion-item mb-3">
										<div className="row align-items-center mb-3 row-gap-3">
											<div className="col-lg-4 col-sm-6">
												<div className="accordion-header" id="headingEight">
													<div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseEight" aria-controls="collapseEight">
														<div className="d-flex align-items-center w-100">
															<div className="me-2">
																<a href="javascript:void(0);">
																	<span><i className="fas fa-chevron-down"></i></span>
																</a>
															</div>
															<div className="d-flex align-items-center">
																<span><i className="ti ti-square-rounded text-success me-2"></i></span>
																<h5 className="fw-semibold">Low</h5>
																<span className="badge bg-light rounded-pill ms-2">24</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-lg-8 col-sm-6">
												<div className="d-flex align-items-center justify-content-sm-end">
													<a href="#" className="btn btn-light me-2" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-circle-plus me-2"></i>Add New</a>
													<a href="#" className="btn btn-outline-light border">See All <i className="ti ti-arrow-right ms-2"></i></a>
												</div>
											</div>
										</div>
										<div id="collapseEight" className="accordion-collapse collapse show" aria-labelledby="headingEight">
											<div className="accordion-body">
												<div className="list-group list-group-flush">
													<div className="list-group-item list-item-hover shadow-sm rounded mb-2 p-3">
														<div className="row align-items-center row-gap-3">
															<div className="col-lg-6 col-md-7">
																<div className="todo-inbox-check d-flex align-items-center flex-wrap row-gap-3">
																	<span className="me-2 d-flex align-items-center"><i className="ti ti-grid-dots text-dark"></i></span>
																	<div className="form-check form-check-md me-2">
																		<input className="form-check-input" type="checkbox" />
																	</div>
																	<span className="me-2 rating-select d-flex align-items-center"><i className="ti ti-star"></i></span>
																	<div className="strike-info">
																		<h4 className="fs-14">Plan tasks for the next day</h4>
																	</div>
																	<span className="badge bg-transparent-dark text-dark rounded-pill ms-2"><i className="ti ti-calendar me-1"></i>Today</span>
																</div>
															</div>
															<div className="col-lg-6 col-md-5">
																<div className="d-flex align-items-center justify-content-md-end flex-wrap row-gap-3">
																	<span className="badge badge-info me-3">Social</span>
																	<span className="badge badge-soft-secondary d-flex align-items-center me-3"><i className="fas fa-circle fs-6 me-1"></i>Pending</span>
																	<div className="d-flex align-items-center">
																		<div className="avatar-list-stacked avatar-group-sm">
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-28.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-29.jpg" alt="img" />
																			</span>
																			<span className="avatar avatar-rounded">
																				<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
																			</span>
																		</div>
																		<div className="dropdown ms-2">
																			<a href="javascript:void(0);" className="d-inline-flex align-items-center" data-bs-toggle="dropdown">
																				<i className="ti ti-dots-vertical"></i>
																			</a>
																			<ul className="dropdown-menu dropdown-menu-end p-3">
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#add_todo"><i className="ti ti-edit me-2"></i>Edit</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="ti ti-trash me-2"></i>Delete</a>
																				</li>
																				<li>
																					<a href="javascript:void(0);" className="dropdown-item rounded-1" data-bs-toggle="modal" data-bs-target="#view_todo"><i className="ti ti-eye me-2"></i>View</a>
																				</li>
																			</ul>
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
								</div>
							</div>
						</div>
						<div className="text-center">
							<a href="#" className="btn btn-primary"><i className="ti ti-loader me-2"></i>Load More</a>
						</div>
					</div>
				</div>
			</div>
		<div className="modal fade" id="add_todo">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Add New Todo</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="todo.php">
						<div className="modal-body">
							<div className="row">
								<div className="col-12">
									<div className="mb-3">
										<label className="form-label">Todo Title</label>
										<input type="text" className="form-control" />
									</div>
								</div>
								<div className="col-6">
									<div className="mb-3">
										<label className="form-label">Tag</label>
										<select className="select">
											<option>Select</option>
											<option>Internal</option>
											<option>Projects</option>
											<option>Meetings</option>
											<option>Reminder</option>
										</select>
									</div>
								</div>
								<div className="col-6">
									<div className="mb-3">
										<label className="form-label">Priority</label>
										<select className="select">
											<option>Select</option>
											<option>Medium</option>
											<option>High</option>
											<option>Low</option>
										</select>
									</div>
								</div>
								<div className="col-lg-12">
									<div className="mb-3">
										<label className="form-label">Descriptions</label>
										<div className="summernote"></div>
									</div>
								</div>
								<div className="col-12">
									<div className="mb-3">
										<label className="form-label">Add Assignee</label>
										<select className="select">
											<option>Select</option>
											<option>Sophie</option>
											<option>Cameron</option>
											<option>Doris</option>
											<option>Rufana</option>
										</select>
									</div>
								</div>
								<div className="col-12">
									<div className="mb-0">
										<label className="form-label">Status</label>
										<select className="select">
											<option>Select</option>
											<option>Completed</option>
											<option>Pending</option>
											<option>Onhold</option>
											<option>Inprogress</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Add New Todo</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		

		
		<div className="modal fade" id="edit_todo">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h4 className="modal-title">Edit Todo</h4>
						<button type="button" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<form action="todo.php">
						<div className="modal-body">
							<div className="row">
								<div className="col-12">
									<div className="mb-3">
										<label className="form-label">Todo Title</label>
										<input type="text" className="form-control" defaultValue="Update calendar and schedule" />
									</div>
								</div>
								<div className="col-6">
									<div className="mb-3">
										<label className="form-label">Tag</label>
										<select className="select" defaultValue="Internal">
											<option>Select</option>
											<option>Internal</option>
											<option>Projects</option>
											<option>Meetings</option>
											<option>Reminder</option>
										</select>
									</div>
								</div>
								<div className="col-6">
									<div className="mb-3">
										<label className="form-label">Priority</label>
										<select className="select" defaultValue="Medium">
											<option>Select</option>
											<option>High</option>
											<option>Medium</option>
											<option>Low</option>
										</select>
									</div>
								</div>
								<div className="col-lg-12">
									<div className="mb-3">
										<label className="form-label">Descriptions</label>
										<div className="summernote"></div>
									</div>
								</div>
								<div className="col-12">
									<div className="mb-3">
										<label className="form-label">Add Assignee</label>
										<select className="select" defaultValue="Sophie">
											<option>Select</option>
											<option>Sophie</option>
											<option>Cameron</option>
											<option>Doris</option>
											<option>Rufana</option>
										</select>
									</div>
								</div>
								<div className="col-12">
									<div className="mb-0">
										<label className="form-label">Status</label>
										<select className="select" defaultValue="Completed">
											<option>Select</option>
											<option>Completed</option>
											<option>Pending</option>
											<option>Onhold</option>
											<option>Inprogress</option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
							<button type="submit" className="btn btn-primary">Submit</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		

		
		<div className="modal fade" id="view_todo">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header bg-dark">
						<h4 className="modal-title text-white">Respond to any pending messages</h4>
						<span className="badge badge-danger d-inline-flex align-items-center"><i className="ti ti-square me-1"></i>Urgent</span>
						<span><i className="ti ti-star-filled text-warning"></i></span>
						<a href="#"><i className="ti ti-trash text-white"></i></a>
						<button type="button" className="btn-close custom-btn-close bg-transparent fs-16 text-white position-static" data-bs-dismiss="modal" aria-label="Close">
							<i className="ti ti-x"></i>
						</button>
					</div>
					<div className="modal-body">
						<h5 className="mb-2">Task Details</h5>
						<div className="border rounded mb-3 p-2">
							<div className="row row-gap-3">
								<div className="col-md-4">
									<div className="text-center">
										<span className="d-block mb-1">Created On</span>
										<p className="text-dark">22 July 2025</p>
									</div>
								</div>
								<div className="col-md-4">
									<div className="text-center">
										<span className="d-block mb-1">Due Date</span>
										<p className="text-dark">22 July 2025</p>
									</div>
								</div>
								<div className="col-md-4">
									<div className="text-center">
										<span className="d-block mb-1">Status</span>
										<span className="badge badge-soft-success d-inline-flex align-items-center">
											<i className="fas fa-circle fs-6 me-1"></i>Completed
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mb-3">
							<h5 className="mb-2">Description</h5>
							<p>Hiking is a long, vigorous walk, usually on trails or footpaths in
								the countryside. Walking for pleasure developed in Europe during the eighteenth century.
								Religious pilgrimages have existed much longer but they involve walking long distances for a
								spiritual purpose associated with specific
								religions and also we achieve inner peace while we hike at a local park.
							</p>
						</div>
						<div className="mb-3">
							<h5 className="mb-2">Tags</h5>
							<div className="d-flex align-items-center">
								<span className="badge badge-danger me-2">Internal</span>
								<span className="badge badge-success me-2">Projects</span>
								<span className="badge badge-secondary">Reminder</span>
							</div>
						</div>
						<div>
							<h5 className="mb-2">Assignee</h5>
							<div className="avatar-list-stacked avatar-group-sm">
								<span className="avatar avatar-rounded">
									<img className="border border-white" src="assets/img/profiles/avatar-23.jpg" alt="img" />
								</span>
								<span className="avatar avatar-rounded">
									<img className="border border-white" src="assets/img/profiles/avatar-24.jpg" alt="img" />
								</span>
								<span className="avatar avatar-rounded">
									<img className="border border-white" src="assets/img/profiles/avatar-25.jpg" alt="img" />
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		

		
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
							<a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</a>
							<a href="todo.php" className="btn btn-danger">Yes, Delete</a>
						</div>
					</div>
				</div>
			</div>
			</div>
		</>
  );
};
export default TodoPage;
