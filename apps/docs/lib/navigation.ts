import type { NavGroup } from "@/components/Navigation";

export const navigation: Array<NavGroup> = [
  {
    title: "Introduction",
    links: [
      { title: "What is Formbricks?", href: "/introduction/what-is-formbricks" },
      { title: "Why is it better?", href: "/introduction/why-is-it-better" },
      { title: "How does it work?", href: "/introduction/how-it-works" },
    ],
  },
  // {
  //   title: "App Surveys",
  //   links: [
  //     { title: "Quickstart", href: "/getting-started/quickstart-in-app-survey" },
  //     { title: "Developer Quickstart", href: "/in-app-surveys/developer-quickstart" },
  //     { title: "Framework Guides", href: "/getting-started/framework-guides" },
  //     { title: "Troubleshooting", href: "/getting-started/troubleshooting" },
  //     { title: "Identify Users", href: "/in-app-surveys/user-identification" },
  //     { title: "Actions", href: "/in-app-surveys/actions" },
  //     { title: "Attributes", href: "/in-app-surveys/attributes" },
  //     { title: "Advanced Targeting", href: "/in-app-surveys/advanced-targeting" },
  //     { title: "Recontact Options", href: "/in-app-surveys/recontact" },
  //   ],
  // },
  // {
  //   title: "Additional Features",
  //   links: [
  //     { title: "API", href: "/additional-features/api" },
  //     { title: "Multi-Language Surveys", href: "/additional-features/multi-language-surveys" },
  //     { title: "Metadata", href: "/additional-features/metadata" },
  //   ],
  // },
  // {
  //   title: "Best Practices",
  //   links: [
  //     { title: "Learn from Churn", href: "/best-practices/cancel-subscription" },
  //     { title: "Interview Prompt", href: "/best-practices/interview-prompt" },
  //     { title: "Product-Market Fit", href: "/best-practices/pmf-survey" },
  //     { title: "Trial Conversion", href: "/best-practices/improve-trial-cr" },
  //     { title: "Feature Chaser", href: "/best-practices/feature-chaser" },
  //     { title: "Feedback Box", href: "/best-practices/feedback-box" },
  //     { title: "Docs Feedback", href: "/best-practices/docs-feedback" },
  //     { title: "Improve Email Content", href: "/best-practices/improve-email-content" },
  //   ],
  // },
  // {
  //   title: "Integrations",
  //   links: [
  //     { title: "Airtable", href: "/integrations/airtable" },
  //     { title: "Google Sheets", href: "/integrations/google-sheets" },
  //     { title: "Notion", href: "/integrations/notion" },
  //     { title: "Make.com", href: "/integrations/make" },
  //     { title: "n8n", href: "/integrations/n8n" },
  //     { title: "Slack", href: "/integrations/slack" },
  //     { title: "Wordpress", href: "/integrations/wordpress" },
  //     { title: "Zapier", href: "/integrations/zapier" },
  //   ],
  // },
  // {
  //   title: "Contributing",
  //   links: [
  //     { title: "Introduction", href: "/contributing/introduction" },
  //     { title: "Demo App", href: "/contributing/demo" },
  //     { title: "Setup Dev Environment", href: "/contributing/setup" },
  //     { title: "How we code at Formbricks", href: "/contributing/how-we-code" },
  //     { title: "How to create a service", href: "/contributing/creating-a-service" },
  //     { title: "Troubleshooting", href: "/contributing/troubleshooting" },
  //     { title: "FAQ", href: "/faq" },
  //   ],
  // },
  {
    title: "App Surveys",
    links: [
      { title: "Quickstart TODO", href: "/getting-started/quickstart-in-app-survey" },
      { title: "Framework Guides", href: "/getting-started/framework-guides" },
      { title: "Identify Users", href: "/in-app-surveys/user-identification" },
      { title: "Actions", href: "/in-app-surveys/actions" },
      { title: "Attributes", href: "/in-app-surveys/attributes" },
      { title: "Advanced Targeting", href: "/in-app-surveys/advanced-targeting" },
      { title: "Recontact Options", href: "/in-app-surveys/recontact" },
      { title: "Multi Language Surveys", href: "/global/multi-language-surveys" }, // global
      { title: "User Metadata", href: "/global/metadata" }, // global
      { title: "Custom Styling", href: "/global/custom-styling" }, // global
      { title: "Conditional Logic", href: "/global/conditional-logic" }, // global
      { title: "Custom Start & End Conditions", href: "/global/custom-start-end-conditions" }, // global
      { title: "Recall Functionality", href: "/global/recall" }, // global
      { title: "Partial Submissions", href: "/global/partial-submissions" }, // global
    ],
  },
  {
    title: "Website Surveys",
    links: [
      { title: "Quickstart TODO", href: "/getting-started/quickstart-in-app-survey" },
      { title: "Framework Guides", href: "/website-surveys/framework-guides" },
      { title: "Actions & Targeting", href: "/website-surveys/actions-and-targeting" },
      { title: "Show Survey to % of users", href: "/website-surveys/show-survey-to-percent-of-users" },
      { title: "Recontact Options", href: "/in-app-surveys/recontact" },
      { title: "Multi Language Surveys", href: "/global/multi-language-surveys" }, // global
      { title: "User Metadata", href: "/global/metadata" }, // global
      { title: "Custom Styling", href: "/global/custom-styling" }, // global
      { title: "Conditional Logic", href: "/global/conditional-logic" }, // global
      { title: "Custom Start & End Conditions", href: "/global/custom-start-end-conditions" }, // global
      { title: "Recall Functionality", href: "/global/recall" }, // global
      { title: "Partial Submissions", href: "/global/partial-submissions" }, // global
    ],
  },
  {
    title: "Link Surveys",
    links: [
      { title: "Quickstart", href: "/link-surveys/quickstart" },
      { title: "Data Prefilling", href: "/link-surveys/data-prefilling" },
      { title: "Identify Users", href: "/link-surveys/user-identification" },
      { title: "Single Use Links", href: "/link-surveys/single-use-links" },
      { title: "Source Tracking", href: "/link-surveys/source-tracking" },
      { title: "Hidden Fields", href: "/link-surveys/hidden-fields" },
      { title: "Start At Question", href: "/link-surveys/start-at-question" },
      { title: "Embed Surveys Anywhere", href: "/link-surveys/embed-surveys" },
      { title: "Multi Language Surveys", href: "/global/multi-language-surveys" }, // global
      { title: "User Metadata", href: "/global/metadata" }, // global
      { title: "Custom Styling", href: "/global/custom-styling" }, // global
      { title: "Conditional Logic", href: "/global/conditional-logic" }, // global
      { title: "Custom Start & End Conditions", href: "/global/custom-start-end-conditions" }, // global
      { title: "Recall Functionality", href: "/global/recall" }, // global
      { title: "Verify Email before Survey", href: "/link-surveys/verify-email-before-survey" },
      { title: "PIN Protected Surveys", href: "/link-surveys/pin-protected-surveys" },
      { title: "Partial Submissions", href: "/global/partial-submissions" }, // global
      { title: "Integrations TODO", href: "/link-surveys/integrations" },
    ],
  },
  { title: "Best Practises TODO", links: [] },
  {
    title: "Developer Docs",
    links: [
      { title: "Overview", href: "/developer-docs/overview" },
      { title: "SDK: App Survey", href: "/developer-docs/app-survey-sdk" },
      { title: "SDK: Website Survey", href: "/developer-docs/website-survey-sdk" },
      { title: "SDK: Formbricks API", href: "/developer-docs/api-sdk" },
      { title: "REST API", href: "/developer-docs/rest-api" },
      { title: "Webhooks", href: "/developer-docs/webhooks" },
      { title: "Contributing", href: "/developer-docs/contributing" },
    ],
  },
  {
    title: "Self-Hosting",
    links: [
      { title: "Overview", href: "/self-hosting/overview" },
      { title: "One-Click Setup", href: "/self-hosting/one-click" },
      { title: "Docker Setup", href: "/self-hosting/docker" },
      { title: "Migration Guide", href: "/self-hosting/migration-guide" },
      { title: "Configuration", href: "/self-hosting/configuration" },
      { title: "Integrations", href: "/self-hosting/integrations" },
      { title: "License", href: "/self-hosting/license" },
    ],
  },
];
