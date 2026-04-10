import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const currentUser = await getCurrentUser();
  const t = (key: string) => translate(locale, key);

  return (
    <AppShell currentUser={currentUser} locale={locale} pathname="/about">
      <article className="page-card">
        <span className="eyebrow">{t("about.eyebrow")}</span>
        <h1>{t("about.title")}</h1>
        <p className="lead">{t("about.lead")}</p>

        <section className="stack">
          <div>
            <h3>{t("about.mission_title")}</h3>
            <p>{t("about.mission_body")}</p>
          </div>
          <div>
            <h3>{t("about.ai_title")}</h3>
            <ul>
              <li>{t("about.ai_item1")}</li>
              <li>{t("about.ai_item2")}</li>
            </ul>
          </div>
          <div>
            <h3>{t("about.tg_title")}</h3>
            <p>{t("about.tg_body")}</p>
          </div>
        </section>
      </article>
    </AppShell>
  );
}
