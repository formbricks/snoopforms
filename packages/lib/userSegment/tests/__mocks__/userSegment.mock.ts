import {
  TActionMetric,
  TBaseFilters,
  TBaseOperator,
  TEvaluateSegmentUserAttributeData,
  TEvaluateSegmentUserData,
  TUserSegment,
  TUserSegmentCreateInput,
  TUserSegmentUpdateInput,
} from "@formbricks/types/userSegment";

export const mockUserSegmentId = "rh2eual2apby2bx0r027ru70";
export const mockEnvironmentId = "t7fszh4tsotoe87ppa6lqhie";
export const mockSurveyId = "phz5mjwvatwc0dqwuip90qpv";
export const mockFilterGroupId = "wi6zz4ekmcwi08bhv1hmgqcr";

export const mockFilerGroupResourceId1 = "j10rst27no5v68pjkop3p3f6";
export const mockFilterGroupResourceId11 = "qz97nzcz0phipgkkdgjlc2op";
export const mockFilterGroupResourceId2 = "wjy1rcs43knp0ef7b4jdsjri";
export const mockFilterGroupResourceId21 = "rjhll9q83qxc6fngl9byp0gn";

export const mockFilter2Id = "hp5ieqw889kt6k6z6wkuot8q";
export const mockFilter2Resource1Id = "iad253ddx4p7eshrbamsj4zk";

export const mockFilter3Id = "iix2savwqr4rv2y81ponep62";
export const mockFilter3Resource1Id = "evvoaniy0hn7srea7x0yn4vv";

// filter data:
export const mockActionClassId = "zg7lojfwnk9ipajgeumfz96t";
export const mockEmailValue = "example@example.com";
export const mockUserId = "random user id";
export const mockDeviceTypeValue = "phone";

// mock data for service input:
export const mockPersonId = "sb776r0uvt8m8puffe1hlhjn";
export const mockEvaluateSegmentUserAttributes: TEvaluateSegmentUserAttributeData = {
  email: mockEmailValue,
  userId: mockUserId,
};
export const mockEvaluateSegmentUserData: TEvaluateSegmentUserData = {
  personId: mockPersonId,
  environmentId: mockEnvironmentId,
  attributes: mockEvaluateSegmentUserAttributes,
  actionIds: [mockActionClassId],
  deviceType: "phone",
  userId: mockUserId,
};

export const mockUserSegmentTitle = "Engaged Users with Specific Interests";
export const mockUserSegmentDescription =
  "Segment targeting engaged users interested in specific topics and using mobile";

export const getMockUserSegmentFilters = (
  actionMetric: TActionMetric,
  actionValue: string | number,
  actionOperator: TBaseOperator
): TBaseFilters => [
  {
    id: mockFilterGroupId,
    connector: null,
    resource: [
      {
        id: mockFilerGroupResourceId1,
        connector: null,
        resource: {
          id: mockFilterGroupResourceId11,
          root: {
            type: "attribute",
            attributeClassName: "email",
          },
          value: mockEmailValue,
          qualifier: {
            operator: "equals",
          },
        },
      },
      {
        id: mockFilterGroupResourceId2,
        connector: "and",
        resource: {
          id: mockFilterGroupResourceId21,
          root: {
            type: "attribute",
            attributeClassName: "userId",
          },
          value: mockUserId,
          qualifier: {
            operator: "equals",
          },
        },
      },
    ],
  },
  {
    id: mockFilter2Id,
    connector: "and",
    resource: {
      id: mockFilter2Resource1Id,
      root: {
        type: "device",
        deviceType: "phone",
      },
      value: mockDeviceTypeValue,
      qualifier: {
        operator: "equals",
      },
    },
  },
  {
    id: mockFilter3Id,
    connector: "and",
    resource: {
      id: mockFilter3Resource1Id,
      root: {
        type: "action",
        actionClassId: mockActionClassId,
      },
      value: actionValue,
      qualifier: {
        metric: actionMetric,
        operator: actionOperator,
      },
    },
  },
];

export const mockUserSegment: TUserSegment = {
  id: mockUserSegmentId,
  title: mockUserSegmentTitle,
  description: mockUserSegmentDescription,
  isPrivate: false,
  filters: getMockUserSegmentFilters("lastMonthCount", 5, "equals"),
  environmentId: mockEnvironmentId,
  createdAt: new Date(),
  updatedAt: new Date(),
  surveys: [mockSurveyId],
};

export const mockUserSegmentCreateInput: TUserSegmentCreateInput = {
  title: mockUserSegmentTitle,
  description: mockUserSegmentDescription,
  isPrivate: false,
  filters: getMockUserSegmentFilters("lastMonthCount", 5, "equals"),
  environmentId: mockEnvironmentId,
  surveyId: mockSurveyId,
};

export const mockUserSegmentUpdateInput: TUserSegmentUpdateInput = {
  title: mockUserSegmentTitle,
  description: mockUserSegmentDescription,
  isPrivate: false,
  filters: getMockUserSegmentFilters("lastMonthCount", 5, "greaterEqual"),
};

export const mockUserSegmentPrisma = {
  id: mockUserSegmentId,
  title: mockUserSegmentTitle,
  description: mockUserSegmentDescription,
  isPrivate: false,
  filters: getMockUserSegmentFilters("lastMonthCount", 5, "equals"),
  environmentId: mockEnvironmentId,
  createdAt: new Date(),
  updatedAt: new Date(),
  surveys: [{ id: mockSurveyId }],
};

export const mockUserSegmentActiveInactiveSurves = {
  activeSurveys: ["Churn Survey"],
  inactiveSurveys: ["NPS Survey"],
};
