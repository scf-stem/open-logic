import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export default async function GuidelinesPage() {
  const locale = await getLocale();
  const currentUser = await getCurrentUser();
  const t = (key: string) => translate(locale, key);

  return (
    <AppShell currentUser={currentUser} locale={locale} pathname="/guidelines">
      <article className="page-card">
        <span className="eyebrow">{t("guidelines.eyebrow")}</span>
        <h1>{t("guidelines.title")}</h1>
        <p className="lead">{t("guidelines.lead")}</p>

        <section className="stack">
          <div>
            <h3>{t("guidelines.respect_title")}</h3>
            <p>{t("guidelines.respect_body")}</p>
          </div>
          <div>
            <h3>{t("guidelines.share_title")}</h3>
            <p>{t("guidelines.share_body")}</p>
          </div>
          <div>
            <h3>{t("guidelines.privacy_title")}</h3>
            <p>{t("guidelines.privacy_body")}</p>
          </div>
          <div>
            <h3>{t("guidelines.forbidden_title")}</h3>
            <ul>
              <li>{t("guidelines.forbidden_item1")}</li>
              <li>{t("guidelines.forbidden_item2")}</li>
              <li>{t("guidelines.forbidden_item3")}</li>
              <li>{t("guidelines.forbidden_item4")}</li>
            </ul>
          </div>
        </section>
      </article>
    </AppShell>
  );
}
