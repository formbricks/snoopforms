"use client";

import { forgotPasswordAction } from "@/modules/auth/forgot-password/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { ZUserEmail } from "@formbricks/types/user";
import { Button } from "@formbricks/ui/components/Button";
import { FormControl, FormError, FormField, FormItem } from "@formbricks/ui/components/Form";

const ZForgotPasswordForm = z.object({
  email: ZUserEmail,
});

type TForgotPasswordForm = z.infer<typeof ZForgotPasswordForm>;

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations();
  const form = useForm<TForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(ZForgotPasswordForm),
  });

  const handleSubmit: SubmitHandler<TForgotPasswordForm> = async (data) => {
    const forgotPasswordResponse = await forgotPasswordAction({ email: data.email });
    if (forgotPasswordResponse?.serverError) {
      toast.error(forgotPasswordResponse.serverError);
    } else {
      router.push("/auth/forgot-password/email-sent");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-800">
            {t("common.email")}
          </label>
          <div className="mt-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={field.value}
                      onChange={(e) => field.onChange(e)}
                      autoComplete="email"
                      required
                      className="focus:border-brand-dark focus:ring-brand-dark block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                    />
                  </FormControl>
                  {error?.message && <FormError className="text-left">{error.message}</FormError>}
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full justify-center" loading={form.formState.isSubmitting}>
            {t("auth.forgot-password.reset_password")}
          </Button>
          <div className="mt-3 text-center">
            <Button variant="minimal" href="/auth/login" className="w-full justify-center">
              {t("auth.forgot-password.back_to_login")}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
