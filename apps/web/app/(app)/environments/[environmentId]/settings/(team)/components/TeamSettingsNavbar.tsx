"use client";

import { BoltIcon, CreditCardIcon, UsersIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { getAccessFlags } from "@formbricks/lib/membership/utils";
import { TMembershipRole } from "@formbricks/types/memberships";
import { SecondaryNavigation } from "@formbricks/ui/SecondaryNavigation";

export const TeamSettingsNavbar = ({
  environmentId,
  isFormbricksCloud,
  membershipRole,
  activeId,
}: {
  environmentId: string;
  isFormbricksCloud: boolean;
  membershipRole?: TMembershipRole;
  activeId: string;
}) => {
  const pathname = usePathname();
  const { isAdmin, isOwner } = getAccessFlags(membershipRole);
  const isPricingDisabled = !isOwner && !isAdmin;

  console.log({
    environmentId,
    isFormbricksCloud,
    membershipRole,
    activeId,
    pathname,
    isAdmin,
    isOwner,
    isPricingDisabled,
  });

  console.log("hidden: ", !isFormbricksCloud || isPricingDisabled);

  const navigation = [
    {
      id: "members",
      label: "Members",
      href: `/environments/${environmentId}/settings/members`,
      icon: <UsersIcon className="h-5 w-5" />,
      current: pathname?.includes("/members"),
      hidden: false,
    },
    {
      id: "billing",
      label: "Billing & Plan",
      href: `/environments/${environmentId}/settings/billing`,
      icon: <CreditCardIcon className="h-5 w-5" />,
      hidden: !isFormbricksCloud || isPricingDisabled,
      current: pathname?.includes("/billing"),
    },
    {
      id: "enterprise",
      label: "Enterprise License",
      href: `/environments/${environmentId}/settings/enterprise`,
      icon: <BoltIcon className="h-5 w-5" />,
      hidden: isFormbricksCloud || isPricingDisabled,
      current: pathname?.includes("/enterprise"),
    },
  ];

  return <SecondaryNavigation navigation={navigation} activeId={activeId} />;
};
