import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, translate } from "@/lib/i18n";

export default async function HomePage() {
  const locale = await getLocale();
  const currentUser = await getCurrentUser();
  const t = (key: string) => translate(locale, key);

  return (
    <AppShell currentUser={currentUser} locale={locale} pathname="/">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("home.eyebrow")}</span>
          <h1>
            {t("home.line1")} <span>{t("home.line2")}</span>
          </h1>
          <p>{t("home.copy")}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/create">
              {t("home.ask")}
            </a>
            <a className="btn btn-secondary" href="#posts">
              {t("home.browse")}
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <span className="eyebrow">{t("home.hero_card_eyebrow")}</span>
          <h3>{t("home.hero_card_title")}</h3>
          <p>{t("home.hero_card_copy")}</p>
        </div>
      </section>

      <section className="content-grid" id="posts">
        <article className="panel">
          <span className="eyebrow">{t("home.community_eyebrow")}</span>
          <h2>{t("home.community_title")}</h2>
          <p>{t("home.community_copy")}</p>
          <a className="btn btn-primary" href="/create">
            {t("home.community_cta")}
          </a>
        </article>

        <article className="panel">
          <span className="eyebrow">Split Migration</span>
          <h2>Vercel Frontend + BFF</h2>
          <p>
            This Next.js frontend is the new public entrypoint. It will proxy API
            requests to the Flask backend while preserving the existing Open Logic
            product experience.
          </p>
          <div className="chip-row">
            <span className="chip">Cloud Sandbox</span>
            <span className="chip">AI Tutor</span>
            <span className="chip">Community</span>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
