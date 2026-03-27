import { useQuery } from "@tanstack/react-query";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import crmService from "../../services/crmService";
import { chatData } from "../../mock/chatData";

export default function ChatPage() {
  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ["chat"],
    queryFn: crmService.getChat,
    placeholderData: chatData,
    keepPreviousData: true,
  });

  const hasValidData = typeof queryData?.html === "string" && queryData.html.length > 0;
  const data = hasValidData ? queryData : chatData;

  if (isLoading && !hasValidData) {
    return <PageLoader />;
  }

  if (error && !hasValidData) {
    return <ErrorState onRetry={refetch} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: data.html }} />;
}
