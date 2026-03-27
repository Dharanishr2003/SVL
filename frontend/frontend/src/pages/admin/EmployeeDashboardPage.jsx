import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import dashboardService from "../../services/dashboardService";
import { employeeDashboardData } from "../../mock/employeeDashboardData";

export default function EmployeeDashboardPage() {
  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ["employee-dashboard"],
    queryFn: dashboardService.getEmployeeDashboard,
    placeholderData: employeeDashboardData,
    keepPreviousData: true,
  });

  const hasValidData = typeof queryData?.html === "string" && queryData.html.length > 0;
  const data = hasValidData ? queryData : employeeDashboardData;

  if (isLoading && !hasValidData) {
    return <PageLoader />;
  }

  if (error && !hasValidData) {
    return <ErrorState onRetry={refetch} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: data.html }} />;
}
