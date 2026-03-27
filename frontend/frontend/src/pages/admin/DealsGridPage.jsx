import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "../../components/system/ToastProvider";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/admin/PageHeader";
import { getDeals } from "../../api/dealsApi";
import { dealsGridData } from "../../mock/dealsGridData";

export default function DealsGridPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["deals-grid"],
    queryFn: async () => {
      try {
        const result = await getDeals();
        console.log("Deals Grid Data:", result);
        return result;
      } catch (err) {
        console.error("Error fetching deals:", err);
        throw err;
      }
    },
    placeholderData: [],
    keepPreviousData: true,
  });

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (error) showError(error.message || "Failed to load deals");
  }, [error]);

  const pageData = {
    ...dealsGridData,
    header: {
      ...dealsGridData.header,
    },
  };

  const pageTitle = dealsGridData.header.title;
  const breadcrumbs = dealsGridData.header.breadcrumbs;
  const deals = Array.isArray(data) ? data : [];

  console.log("Current deals state:", { data, isLoading, error, dealsCount: deals.length });

  const getStageClass = (status) => {
    const statusLower = String(status || "").trim().toLowerCase();
    const statusClassMap = {
      "new lead": "badge-warning-transparent",
      interested: "badge-info-transparent",
      design: "badge-primary-transparent",
      production: "badge-success-transparent",
      payment: "badge-danger-transparent",
    };
    return statusClassMap[statusLower] || "badge-info-transparent";
  };

  if (isLoading && !data) return <PageLoader />;

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <div className="me-2 mb-2">
              <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                <Link to="/deals" className="btn btn-icon btn-sm me-1">
                  <i className="ti ti-list-tree" />
                </Link>
                <Link
                  to="/deals?view=grid"
                  className="btn btn-icon btn-sm active bg-primary text-white"
                >
                  <i className="ti ti-layout-grid" />
                </Link>
              </div>
            </div>
            <div className="head-icons ms-2">
              <a href="javascript:void(0);" id="collapse-header">
                <i className="ti ti-chevrons-up" />
              </a>
            </div>
          </>
        }
      />

      <div className="card">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between">
            <h5>Deals Grid</h5>
            <div className="dropdown">
              <a
                href="javascript:void(0);"
                className="dropdown-toggle btn btn-sm btn-white d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                Sort By : Last 7 Days
              </a>
              <ul className="dropdown-menu dropdown-menu-end p-3">
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Recently Added
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Ascending
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Descending
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Last Month
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0);"
                    className="dropdown-item rounded-1"
                  >
                    Last 7 Days
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {deals.map((deal) => (
          <div key={deal.id} className="col-xl-3 col-lg-4 col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                  <div>
                    <Link
                      to={`/deal/${deal.id}`}
                      className="avatar avatar-xl avatar-rounded border rounded-circle d-flex align-items-center justify-content-center bg-gray"
                    >
                      <span className="avatar-title text-dark fw-bold">
                        {(deal.name || "").charAt(0).toUpperCase()}
                      </span>
                    </Link>
                  </div>
                  <div className="dropdown">
                    <button
                      className="btn btn-icon btn-sm rounded-circle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti ti-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link
                          className="dropdown-item rounded-1"
                          to={`/deal/${deal.id}`}
                        >
                          <i className="ti ti-edit me-1"></i>Edit
                        </Link>
                      </li>
                      <li>
                        <a
                          className="dropdown-item rounded-1"
                          href="javascript:void(0);"
                          data-bs-toggle="modal"
                          data-bs-target="#delete_modal"
                        >
                          <i className="ti ti-trash me-1"></i>Delete
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <h6 className="mb-1">
                    <Link to={`/deal/${deal.id}`}>{deal.name}</Link>
                  </h6>
                  <span
                    className={`badge badge-sm ${getStageClass(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </div>

                <div className="d-flex flex-column">
                  <p className="text-dark d-inline-flex align-items-center mb-2">
                    <i className="ti ti-currency-dollar text-gray-5 me-2"></i>
                    {deal.totalAmount || "-"}
                  </p>
                  <p className="text-dark d-inline-flex align-items-center mb-2">
                    <i className="ti ti-mail text-gray-5 me-2"></i>
                    {deal.email || "-"}
                  </p>
                  <p className="text-dark d-inline-flex align-items-center mb-2">
                    <i className="ti ti-phone text-gray-5 me-2"></i>
                    {deal.mobile || "-"}
                  </p>
                  <p className="text-dark d-inline-flex align-items-center">
                    <i className="ti ti-briefcase text-gray-5 me-2"></i>
                    {deal.projectName || "-"}
                  </p>
                </div>

                <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-3">
                  <div className="d-flex align-items-center">
                    <span className="text-dark fw-medium">
                      {deal.owner || "-"}
                    </span>
                  </div>
                  <Link
                    to={`/deal/${deal.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {deals.length === 0 && (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center p-5">
                <p className="text-muted">No deals found</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
