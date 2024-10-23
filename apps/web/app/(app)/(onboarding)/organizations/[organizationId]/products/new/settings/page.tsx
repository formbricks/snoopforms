import { getCustomHeadline } from "@/app/(app)/(onboarding)/lib/utils";
import { ProductSettings } from "@/app/(app)/(onboarding)/organizations/[organizationId]/products/new/settings/components/ProductSettings";
import { XIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@formbricks/lib/authOptions";
import { DEFAULT_BRAND_COLOR, DEFAULT_LOCALE } from "@formbricks/lib/constants";
import { getProducts } from "@formbricks/lib/product/service";
import { getUserLanguage } from "@formbricks/lib/user/service";
import { TProductConfigChannel, TProductConfigIndustry, TProductMode } from "@formbricks/types/product";
import { Button } from "@formbricks/ui/components/Button";
import { Header } from "@formbricks/ui/components/Header";

interface ProductSettingsPageProps {
  params: {
    organizationId: string;
  };
  searchParams: {
    channel?: TProductConfigChannel;
    industry?: TProductConfigIndustry;
    mode?: TProductMode;
  };
}

const Page = async ({ params, searchParams }: ProductSettingsPageProps) => {
  const t = await getTranslations();
  const session = await getServerSession(authOptions);
  const channel = searchParams.channel || null;
  const industry = searchParams.industry || null;
  const mode = searchParams.mode || "surveys";
  const locale = session?.user.id ? await getUserLanguage(session.user.id) : undefined;
  const customHeadline = getCustomHeadline(channel);
  const products = await getProducts(params.organizationId);

  return (
    <div className="flex min-h-full min-w-full flex-col items-center justify-center space-y-12">
      {channel === "link" || mode === "cx" ? (
        <Header
          title={t("organizations.products.new.settings.channel_settings_title")}
          subtitle={t("organizations.products.new.settings.channel_settings_subtitle")}
        />
      ) : (
        <Header
          title={t(customHeadline)}
          subtitle={t("organizations.products.new.settings.channel_settings_description")}
        />
      )}
      <ProductSettings
        organizationId={params.organizationId}
        productMode={mode}
        channel={channel}
        industry={industry}
        defaultBrandColor={DEFAULT_BRAND_COLOR}
        locale={locale ?? DEFAULT_LOCALE}
      />
      {products.length >= 1 && (
        <Button
          className="absolute right-5 top-5 !mt-0 text-slate-500 hover:text-slate-700"
          variant="minimal"
          href={"/"}>
          <XIcon className="h-7 w-7" strokeWidth={1.5} />
        </Button>
      )}
    </div>
  );
};

export default Page;
