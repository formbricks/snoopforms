import FormbricksClient from "@/app/(app)/components/FormbricksClient";
import { PHProvider, PostHogPageview } from "@formbricks/ui/PostHogClient";
import { authOptions } from "@formbricks/lib/authOptions";
import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";
import { Suspense } from "react";
import PosthogIdentify from "./components/PosthogIdentify";
import { NoMobileOverlay } from "@formbricks/ui/NoMobileOverlay";

export default async function AppLayout({ children }) {
  const session = await getServerSession(authOptions);
  // if (!session) {
  //   return redirect(`/auth/login`);
  // }

  return (
    <>
      <NoMobileOverlay />
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PHProvider>
        <>
          {session ? (
            <>
              <PosthogIdentify session={session} />
              <FormbricksClient session={session} />
            </>
          ) : null}

          {children}
        </>
      </PHProvider>
    </>
  );
}
