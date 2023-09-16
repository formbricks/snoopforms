import { Metadata } from "next";
import SettingsNavbar from "./SettingsNavbar";
import { IS_FORMBRICKS_CLOUD } from "@formbricks/lib/constants";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsLayout({ children, params }) {
  return (
    <>
      <div className="sm:flex">
        <SettingsNavbar environmentId={params.environmentId} isFormbricksCloud={IS_FORMBRICKS_CLOUD} />
        <div className="w-full md:ml-64">
          <div className="max-w-4xl px-6 pb-6 pt-14 md:pt-6">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
