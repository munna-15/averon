"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import s from "./footer.module.css";

export interface FooterLink {
  label: string;
  href?: string;
  external?: boolean;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  brand?: string;
  statement?: string[];
  groups?: FooterGroup[];
  social?: FooterLink[];
  socialTitle?: string;
  contact?: { title: string; lines: ReactNode[] };
  newsletter?: FooterLink;
  legal?: string;
  className?: string;
}

const DEFAULT_STATEMENT = ["BE YOUR", "OWN MUSE"];

const DEFAULT_GROUPS: FooterGroup[] = [
  {
    title: "Navigate",
    links: [
      { label: "Editorial" },
      { label: "Categories" },
      { label: "Prêt-à-porter" },
      { label: "Brands" },
    ],
  },
];

const DEFAULT_SOCIAL: FooterLink[] = [
  { label: "TW" },
  { label: "FB" },
  { label: "INS" },
];

const DEFAULT_LEGAL = "© 2020 AVERON production. All rights reserved.";

function FooterLinkItem({ link }: { link: FooterLink }) {
  const { label, href } = link;

  if (!href) {
    return <span className={`${s.link} ${s.inert}`}>{label}</span>;
  }

  const external = link.external ?? /^https?:\/\//i.test(href);

  if (external) {
    return (
      <a
        className={s.link}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link className={s.link} href={href}>
        {label}
      </Link>
    );
  }

  return (
    <a className={s.link} href={href}>
      {label}
    </a>
  );
}

export default function Footer({
  brand = "AVERON",
  statement = DEFAULT_STATEMENT,
  groups = DEFAULT_GROUPS,
  social = DEFAULT_SOCIAL,
  socialTitle = "Follow us",
  contact,
  newsletter,
  legal = DEFAULT_LEGAL,
  className,
}: FooterProps) {
  const toTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <footer
      className={[s.footer, className].filter(Boolean).join(" ")}
      aria-label={`${brand} footer`}
    >
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.lead}>
            <span className={s.eyebrow}>THE AVERON EDIT</span>

            <p className={s.statement}>
              {statement.map((line, index) => (
                <span key={`${line}-${index}`}>{line}</span>
              ))}
            </p>

            {newsletter && (
              <div className={s.cta}>
                <FooterLinkItem link={newsletter} />
                <span className={s.ctaArrow} aria-hidden="true">
                  ↗
                </span>
              </div>
            )}
          </div>

          <nav className={s.cols} aria-label="Footer navigation">
            {groups.map((group) => (
              <section key={group.title} className={s.col}>
                <h2 className={s.colTitle}>{group.title}</h2>

                <ul className={s.list}>
                  {group.links.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {social.length > 0 && (
              <section className={s.col}>
                <h2 className={s.colTitle}>{socialTitle}</h2>

                <ul className={`${s.list} ${s.socialList}`}>
                  {social.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {contact && contact.lines.length > 0 && (
              <section className={s.col}>
                <h2 className={s.colTitle}>{contact.title}</h2>

                <ul className={s.list}>
                  {contact.lines.map((line, index) => (
                    <li className={s.contactLine} key={index}>
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </nav>
        </div>

        <div className={s.brandArea}>
          <span className={s.brandAccent} aria-hidden="true" />
          <p className={s.wordmark} aria-hidden="true">
            {brand}
          </p>
        </div>

        <div className={s.bottom}>
          <p className={s.legal}>{legal}</p>

          <button
            type="button"
            className={s.toTop}
            onClick={toTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <span className={s.upArrow} aria-hidden="true">
              ↑
            </span>
          </button>
        </div>
      </div>

      <div className={s.bar} aria-hidden="true" />
    </footer>
  );
}
