import ContentWrapper from "@/components/shared/ContentWrapper";
import SurveyResultsTabs from "../SurveyResultsTabs";
import OpenTextSummary from "./OpenTextSummaryBody";

export default function SummaryPage({ params }) {
  return (
    <>
      <SurveyResultsTabs activeId="summary" environmentId={params.environmentId} surveyId={params.surveyId} />
      <ContentWrapper>
        <h1>Summary Page List</h1>
      </ContentWrapper>
    </>
  );
}
