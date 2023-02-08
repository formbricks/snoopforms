import { capturePosthogEvent } from "@/lib/posthog";
import { FormbricksEngine } from "@formbricks/engine-react";
import { useSession } from "next-auth/react";
import LoadingSpinner from "../LoadingSpinner";
import ForwardToApp from "./ForwardToApp";
import IconRadio from "./IconRadio";

const OnboardingSurvey = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;

  const formbricksUrl =
    process.env.NODE_ENV === "production" ? "https://app.formbricks.com" : "http://localhost:3000";
  const formId =
    process.env.NODE_ENV === "production" ? "cldu60z5d0000mm0hq7k0ducf" : "cldufl8uh000019mzr7fdotyu";

  return (
    <FormbricksEngine
      offline={true}
      onFinished={async ({ submission }) => {
        // send submission to formbricks
        const res = await fetch(`${formbricksUrl}/api/capture/forms/${formId}/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: { email: session.user.email, name: session.user.name },
            data: submission,
          }),
        });
        if (!res.ok) {
          // send event to posthog
          capturePosthogEvent("system", "onboarding form error occured", { error: await res.text() });
        }
        // update user in database
        await fetch("/api/users/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finishedOnboarding: true }),
        });
        // redirect to app
        window.location.replace("/");
      }}
      schema={{
        config: {
          progressBar: false,
        },
        pages: [
          {
            id: "rolePage",
            config: {
              autoSubmit: true,
            },
            elements: [
              {
                id: "role",
                type: "radio",
                label: "The hardest part about user research is...",
                /*  help: "Helps us focus on what you need most.", */
                name: "role",
                options: [
                  { label: "Not sure where to start", value: "notSureWhereToStart" },
                  {
                    label: "Unresponsive users",
                    value: "unresponsiveUsers",
                  },
                  { label: "Small user base", value: "smallUserBase" },
                  { label: "Doing it consistently", value: "consistency" },
                  { label: "Implementing methods", value: "Implementation" },
                ],
                component: IconRadio,
              },
            ],
          },
          {
            id: "targetGroupPage",
            config: {
              autoSubmit: true,
            },
            elements: [
              {
                id: "targetGroup",
                type: "radio",
                label: "When was the last time you talked to one of your users?",
                /* help: "(honest answers only)", */
                name: "targetGroup",
                options: [
                  { label: "Today", value: "today" },
                  {
                    label: "Yesterday",
                    value: "yesterday",
                  },
                  { label: "This week", value: "thisWeek" },
                  { label: "This month", value: "thisMonth" },
                  { label: "I should do that more often", value: "iShouldDoThatMoreOften" },
                ],
                component: IconRadio,
              },
            ],
          },
          {
            id: "onboardingDone",
            endScreen: true,
            elements: [
              {
                id: "forward",
                type: "html",
                component: ForwardToApp,
              },
            ],
          },
        ],
      }}
    />
  );
};

export default OnboardingSurvey;
