"use client";

import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";

import { NavigationMenu } from "@/components/layout/NavigationMenu";
import { homeRoute, utilityNavigation } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";
import { useCart } from "@/features/cart/CartProvider";
import { useSearch } from "@/features/search/SearchProvider";

const utilityLinkClass =
  "inline-flex min-h-12 min-w-11 items-center justify-center gap-2.5 text-ink transition-opacity duration-300 hover:opacity-55 xl:min-w-0 xl:justify-start";

const utilityIconClass = "size-5 min-[360px]:size-[22px]";

const utilityLabelClass =
  "sr-only text-[0.75rem] font-medium uppercase tracking-[0.16em] xl:not-sr-only";

export function SiteHeader() {
  const { search, account, bag } = utilityNavigation;
  const { count, hydrated } = useCart();
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#fff]">
      <div className="container-editorial grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center md:h-20">
        <div className="flex justify-start">
          <NavigationMenu />
        </div>

        <Link
          href={homeRoute.href}
          aria-label={`${siteConfig.name} home`}
          className="relative z-10 whitespace-nowrap pl-[0.24em] font-display text-[length:clamp(1rem,0.5rem_+_2.5vw,1.75rem)] font-medium tracking-[0.24em] text-ink uppercase sm:pl-[0.3em] sm:tracking-[0.3em]"
        >
          {siteConfig.name}
        </Link>

        <nav
          aria-label="Shopping utilities"
          className="relative z-10 -mr-3 flex items-center justify-end min-[360px]:-mr-[11px] xl:mr-0 xl:gap-6"
        >
          <button
            type="button"
            onClick={openSearch}
            aria-label={search.label}
            aria-haspopup="dialog"
            className={utilityLinkClass}
          >
            <Search
              strokeWidth={1.35}
              aria-hidden="true"
              className={utilityIconClass}
            />
            <span className={utilityLabelClass}>{search.label}</span>
          </button>

          <Link
            href={account.href}
            aria-label={account.label}
            className={utilityLinkClass}
          >
            <UserRound
              strokeWidth={1.35}
              aria-hidden="true"
              className={utilityIconClass}
            />
            <span className={utilityLabelClass}>{account.label}</span>
          </Link>

          <Link
            href={bag.href}
            aria-label={`${bag.label}, ${hydrated ? count : 0} items`}
            className={utilityLinkClass}
          >
            <span className="relative inline-flex items-center justify-center">
              <ShoppingBag
                strokeWidth={1.35}
                aria-hidden="true"
                className={utilityIconClass}
              />

              {hydrated && count > 0 && (
                <span className="absolute -right-[9px] -top-[7px] flex size-[17px] items-center justify-center rounded-full bg-[#171717] font-[var(--font-manrope)] text-[9px] font-semibold leading-none text-white tabular-nums">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>

            <span className={utilityLabelClass}>{bag.label}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
