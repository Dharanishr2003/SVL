import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import crmService from "../../services/crmService";
import { companiesData } from "../../mock/companiesData";

export default function CompaniesListView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["companies-list"],
    queryFn: crmService.getCompanies,
    placeholderData: companiesData,
    keepPreviousData: true,
  });

  if (isLoading && !data) return <PageLoader />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Companies</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="admin-dashboard.php">
                    <i className="ti ti-smart-home"></i>
                  </a>
                </li>
                <li className="breadcrumb-item">CRM</li>
                <li className="breadcrumb-item active" aria-current="page">
                  Companies List
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
            <div className="me-2 mb-2">
              <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                <Link
                  to="/companies"
                  className="btn btn-icon btn-sm active bg-primary text-white me-1"
                >
                  <i className="ti ti-list-tree"></i>
                </Link>
                <Link to="/companies?view=grid" className="btn btn-icon btn-sm">
                  <i className="ti ti-layout-grid"></i>
                </Link>
              </div>
            </div>
            <div className="mb-2">
              <a href="#" className="btn btn-primary d-flex align-items-center">
                <i className="ti ti-circle-plus me-2"></i>Add Company
              </a>
            </div>
          </div>
        </div>

        <div className="row">
          {data.stats?.map((stat) => (
            <div className="col-xl-3 col-md-6 d-flex" key={stat.id}>
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center overflow-hidden">
                      <span className={`${stat.iconWrap} me-2`}>
                        <i className={stat.iconClass}></i>
                      </span>
                      <div>
                        <p className="fs-12 fw-medium text-truncate mb-0">
                          {stat.label}
                        </p>
                        <h5>{stat.value}</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
            <h5>Companies List</h5>
            <div></div>
          </div>
          <div className="card-body p-0">
            <div className="custom-datatable-filter table-responsive">
              <table className="table datatable">
                <thead className="thead-light">
                  <tr>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Account URL</th>
                    <th>Plan</th>
                    <th>Created Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows?.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-md border rounded-circle me-2">
                            <img src={row.logo} alt="company" />
                          </span>
                          <span className="fw-medium">{row.companyName}</span>
                        </div>
                      </td>
                      <td>{row.email}</td>
                      <td>{row.accountUrl}</td>
                      <td>{row.plan}</td>
                      <td>{row.createdDate}</td>
                      <td>
                        <span className={row.statusClass}>
                          <i className="ti ti-point-filled me-1"></i>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
