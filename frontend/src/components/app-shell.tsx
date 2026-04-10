import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale } from "@/lib/config";
import { translate } from "@/lib/i18n";

type AppShellProps = {
  locale: Locale;
  pathname: string;
  children: ReactNode;
};

function navLinkClass(active: boolean): string {
  return active ? "nav-link nav-link-active" : "nav-link";
}

export function AppShell({ locale, pathname, children }: AppShellProps) {
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  return (
    <div className="shell">
      <header className="header">
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="brand-mark">OL</span>
            <span className="brand-copy">
              <span className="brand-title">Open Logic</span>
              <span className="brand-subtitle">{t("nav.brand_subtitle")}</span>
            </span>
          </Link>

          <div className="nav-links">
            <Link href="/" className={navLinkClass(pathname === "/")}>
              {t("nav.home")}
            </Link>
            <Link
              href="/guidelines"
              className={navLinkClass(pathname === "/guidelines")}
            >
              {t("nav.guidelines")}
            </Link>
            <Link
              href="/about"
              className={navLinkClass(pathname === "/about")}
            >
              {t("nav.about")}
            </Link>
          </div>

          <div className="nav-actions">
            <div className="locale-switcher">
              <Link href={`/set-ui-locale/en?next=${encodeURIComponent(pathname)}`}>
                EN
              </Link>
              <Link href={`/set-ui-locale/zh?next=${encodeURIComponent(pathname)}`}>
                中文
              </Link>
            </div>
            <div className="nav-auth">
              <Link href="/login" className="btn btn-ghost">
                {t("nav.login")}
              </Link>
              <Link href="/register" className="btn btn-primary">
                {t("nav.register")}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <span className="footer-title">{t("footer.title1")}</span>
            <p>{t("footer.copy1")}</p>
          </div>
          <div>
            <span className="footer-title">{t("footer.title2")}</span>
            <p>{t("footer.copy2")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
