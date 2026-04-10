import { AppShell } from "@/components/app-shell";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocale();
  const currentUser = await getCurrentUser();
  const t = (key: string) => translate(locale, key);

  return (
    <AppShell currentUser={currentUser} locale={locale} pathname="/login">
      <div className="auth-layout">
        <section className="auth-panel">
          <span className="eyebrow">{t("login.panel_eyebrow")}</span>
          <h1>{t("login.panel_title")}</h1>
          <p>{t("login.panel_copy")}</p>
        </section>

        <AuthForm
          mode="login"
          copy={{
            title: t("login.card_title"),
            subtitle: t("login.card_subtitle"),
            usernameLabel: t("login.username_label"),
            usernamePlaceholder: t("login.username_placeholder"),
            passwordLabel: t("login.password_label"),
            passwordPlaceholder: t("login.password_placeholder"),
            submit: t("login.submit"),
            hint: t("login.hint"),
          }}
        />
      </div>
    </AppShell>
  );
}
