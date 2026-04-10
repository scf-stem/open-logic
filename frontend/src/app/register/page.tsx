import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export default async function RegisterPage() {
  const locale = await getLocale();
  const currentUser = await getCurrentUser();
  const t = (key: string) => translate(locale, key);

  return (
    <AppShell currentUser={currentUser} locale={locale} pathname="/register">
      <div className="auth-layout">
        <section className="auth-panel">
          <span className="eyebrow">{t("register.panel_eyebrow")}</span>
          <h1>{t("register.panel_title")}</h1>
          <p>{t("register.panel_copy")}</p>
        </section>

        <AuthForm
          mode="register"
          copy={{
            title: t("register.card_title"),
            subtitle: t("register.card_subtitle"),
            usernameLabel: t("register.username_label"),
            usernamePlaceholder: t("register.username_placeholder"),
            passwordLabel: t("register.password_label"),
            passwordPlaceholder: t("register.password_placeholder"),
            captchaLabel: t("register.captcha_label"),
            captchaPlaceholder: t("register.captcha_placeholder"),
            submit: t("register.submit"),
          }}
        />
      </div>
    </AppShell>
  );
}
