"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { useSearch } from "@/features/search/SearchProvider";
import { searchProducts } from "@/features/search/lib/search-utils";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function GlobalSearch() {
  const router = useRouter();
  const { isSearchOpen, closeSearch } = useSearch();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim();

  const results = useMemo(
    () => searchProducts(normalizedQuery),
    [normalizedQuery],
  );

  useLayoutEffect(() => {
    if (!isSearchOpen) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const currentPadding =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen, closeSearch]);

  function handleClose() {
    closeSearch();
  }

  function handleProductClick(slug: string) {
    closeSearch();
    setQuery("");
    router.push(`/products/${slug}`);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-[visibility] duration-500 ${
        isSearchOpen
          ? "visible pointer-events-auto"
          : "invisible pointer-events-none delay-500"
      }`}
    >
      <div
        className={`absolute inset-0 bg-[#fff] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isSearchOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex h-dvh flex-col overflow-hidden">
          {/* Top navigation */}
          <header className="flex flex-none items-center justify-between border-b border-[#E8E3DA] px-5 py-5 sm:px-10 lg:px-16">
            <div>
              <p className="font-display text-[17px] font-medium tracking-[0.27em] text-[#292823]">
                AVÉRON
              </p>

              <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-[#9A9184]">
                Search & Discover
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              tabIndex={isSearchOpen ? 0 : -1}
              aria-label="Close search"
              className="group flex size-11 items-center justify-center rounded-full border border-[#DDD7CC] text-[#292823] transition-colors duration-300 hover:bg-[#292823] hover:text-white"
            >
              <X
                size={19}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </header>

          {/* Search introduction */}
          <div className="flex-none px-5 pb-7 pt-10 sm:px-10 sm:pb-10 sm:pt-14 lg:px-16 lg:pt-16">
            <div className="mx-auto max-w-[1100px]">
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#988D7D] sm:text-[10px]">
                Find something considered
              </p>

              <h1 className="font-[family-name:var(--font-cormorant)] text-[42px] font-medium leading-[0.98] tracking-[-0.045em] text-[#292823] sm:text-[64px] lg:text-[76px]">
                Search the
                <span className="text-[#9A8F80]"> collection.</span>
              </h1>

              <div className="mt-8 flex items-center gap-4 border-b border-[#AFA596] pb-4 sm:mt-10 sm:pb-5">
                <Search
                  size={22}
                  strokeWidth={1.35}
                  className="flex-none text-[#8F8577]"
                />

                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, styles..."
                  aria-label="Search products"
                  tabIndex={isSearchOpen ? 0 : -1}
                  className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-manrope)] text-[15px] font-medium text-[#292823] outline-none placeholder:font-normal placeholder:text-[#AAA294] sm:text-lg"
                />

                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    tabIndex={isSearchOpen ? 0 : -1}
                    className="flex-none text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8F8577] transition-colors hover:text-[#292823]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <main
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-12 sm:px-10 lg:px-16"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="mx-auto max-w-[1100px]">
              {!normalizedQuery ? (
                <div className="flex min-h-[200px] flex-col justify-center py-10 sm:min-h-[240px]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9A9184]">
                    A considered wardrobe
                  </p>

                  <p className="mt-3 max-w-[440px] font-[family-name:var(--font-cormorant)] text-[27px] leading-[1.15] text-[#514B42] sm:text-[34px]">
                    Discover pieces designed to become part of your everyday.
                  </p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between border-b border-[#E5DED4] pb-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#8F8577]">
                      Search Results
                    </p>

                    <p className="text-[10px] tabular-nums text-[#8F8577]">
                      {results.length}{" "}
                      {results.length === 1 ? "product" : "products"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
                    {results.map(({ product, image, imageAlt }) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductClick(product.slug)}
                        tabIndex={isSearchOpen ? 0 : -1}
                        className="group min-w-0 text-left"
                      >
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECE8E0]">
                          {image ? (
                            <Image
                              src={image}
                              alt={imageAlt}
                              fill
                              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 340px"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Search
                                size={24}
                                strokeWidth={1.2}
                                className="text-[#B0A696]"
                              />
                            </div>
                          )}

                          <span className="absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-[#F8F6F1] text-[#292823] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <Search size={15} strokeWidth={1.5} />
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2 pt-3">
                          <div className="min-w-0">
                            <h2 className="line-clamp-2 text-[12px] font-semibold leading-[1.5] text-[#292823] transition-colors group-hover:text-[#847968] sm:text-[13px]">
                              {product.name}
                            </h2>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#978D7F]">
                              {product.category}
                            </p>
                          </div>

                          <p className="flex-none pt-0.5 text-[10px] font-semibold tabular-nums text-[#292823] sm:text-xs">
                            {formatPrice(
                              product.price.amount,
                              product.price.currency,
                            )}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {results.length > 12 && (
                    <p className="mt-10 text-center text-[10px] uppercase tracking-[0.15em] text-[#958A7C]">
                      Showing the first 12 matching products
                    </p>
                  )}
                </>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center py-12 text-center">
                  <span className="h-px w-10 bg-[#B9AD9C]" />

                  <h2 className="mt-6 font-[family-name:var(--font-cormorant)] text-4xl font-medium tracking-[-0.03em] text-[#292823]">
                    Nothing found.
                  </h2>

                  <p className="mt-3 max-w-[320px] text-xs leading-6 text-[#938878]">
                    We could not find a match for your search. Try another
                    product name or style.
                  </p>

                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mt-6 border-b border-[#8F8577] pb-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#655D51] transition-colors hover:text-[#292823]"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* Bottom signature */}
          <footer className="flex flex-none items-center justify-between border-t border-[#E8E3DA] px-5 py-4 sm:px-10 lg:px-16">
            <p className="text-[8px] font-medium uppercase tracking-[0.19em] text-[#A1988B] sm:text-[9px]">
              AVÉRON — Considered Essentials
            </p>

            <p className="hidden text-[9px] tracking-[0.08em] text-[#A1988B] sm:block">
              Press ESC to close
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
