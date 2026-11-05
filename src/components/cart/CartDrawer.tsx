"use client";

import { useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useCart } from "@/features/cart/CartProvider";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    hydrated,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  useLayoutEffect(() => {
    if (!isCartDrawerOpen) return;

    const body = document.body;

    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const computedPaddingRight =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCartDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] ${
        isCartDrawerOpen ? "pointer-events-auto" : ""
      }`}
      aria-hidden={!isCartDrawerOpen}
    >
      <button
        type="button"
        aria-label="Close shopping bag"
        tabIndex={isCartDrawerOpen ? 0 : -1}
        onClick={closeCartDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCartDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-[#F9F7F2] shadow-[-12px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-none items-center justify-between border-b border-[#E5DED2] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#938878]">
              AVÉRON / Shopping
            </p>

            <h2 className="mt-1 font-[family-name:var(--font-cormorant)] text-3xl font-semibold tracking-[-0.035em] text-[#292823]">
              Your Bag
              <span className="ml-2 font-[var(--font-manrope)] text-sm font-medium text-[#938878]">
                ({hydrated ? count : 0})
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCartDrawer}
            aria-label="Close cart drawer"
            tabIndex={isCartDrawerOpen ? 0 : -1}
            className="grid size-10 place-items-center rounded-full text-[#292823] transition-colors hover:bg-[#EDE8DF]"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        {!hydrated ? (
          <div className="flex-1 space-y-5 overflow-hidden p-5 sm:p-7">
            <div className="h-28 animate-pulse rounded-lg bg-[#EDE8DF]" />
            <div className="h-28 animate-pulse rounded-lg bg-[#EDE8DF]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-7 text-center">
            <div className="grid size-[76px] place-items-center rounded-full border border-[#DED7CA] bg-white">
              <ShoppingBag
                size={29}
                strokeWidth={1.3}
                className="text-[#292823]"
              />
            </div>

            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#938878]">
              Your selection
            </p>

            <h3 className="mt-3 font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#292823]">
              Your bag is waiting.
            </h3>

            <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#77736B]">
              Discover considered essentials and refined pieces for your
              everyday wardrobe.
            </p>

            <button
              type="button"
              onClick={closeCartDrawer}
              tabIndex={isCartDrawerOpen ? 0 : -1}
              className="mt-7 flex h-12 items-center justify-center bg-[#292823] px-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#514B40]"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#292823]">
                  Your Items
                </p>

                <span className="text-xs text-[#938878]">
                  {items.length} {items.length === 1 ? "product" : "products"}
                </span>
              </div>

              <div className="divide-y divide-[#E8E2D8]">
                {items.map((item) => (
                  <article
                    key={item.key}
                    className="flex gap-4 py-5 first:pt-0"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCartDrawer}
                      tabIndex={isCartDrawerOpen ? 0 : -1}
                      className="relative aspect-[3/4] w-[100px] flex-none overflow-hidden bg-[#EEEAE2] sm:w-[112px]"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCartDrawer}
                            tabIndex={isCartDrawerOpen ? 0 : -1}
                            className="line-clamp-2 text-sm font-semibold leading-5 text-[#292823] transition-colors hover:text-[#817765]"
                          >
                            {item.name}
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            aria-label={`Remove ${item.name}`}
                            tabIndex={isCartDrawerOpen ? 0 : -1}
                            className="flex-none text-[#938878] transition-colors hover:text-[#9D493E]"
                          >
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-[#77736B]">
                          {item.color} · Size {item.size}
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#292823]">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="inline-flex h-8 items-center border border-[#E1DBD0] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                Math.max(1, item.qty - 1),
                              )
                            }
                            disabled={item.qty <= 1}
                            aria-label={`Decrease ${item.name} quantity`}
                            tabIndex={isCartDrawerOpen ? 0 : -1}
                            className="grid size-8 place-items-center text-[#625C51] transition-colors hover:bg-[#F4F0E8] disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>

                          <span className="min-w-7 text-center text-xs font-semibold tabular-nums text-[#292823]">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.qty + 1)
                            }
                            aria-label={`Increase ${item.name} quantity`}
                            tabIndex={isCartDrawerOpen ? 0 : -1}
                            className="grid size-8 place-items-center text-[#625C51] transition-colors hover:bg-[#F4F0E8]"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="text-xs font-semibold tabular-nums text-[#292823]">
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex-none border-t border-[#E5DED2] bg-white px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#77736B]">
                  Subtotal ({count} items)
                </span>

                <span className="text-lg font-semibold tracking-[-0.03em] text-[#292823]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#938878]">
                Shipping and applicable taxes calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                tabIndex={isCartDrawerOpen ? 0 : -1}
                className="mt-5 flex h-[50px] w-full items-center justify-center bg-[#292823] px-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#514B40]"
              >
                Proceed to Checkout
              </Link>

              <button
                type="button"
                onClick={closeCartDrawer}
                tabIndex={isCartDrawerOpen ? 0 : -1}
                className="mt-4 w-full text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#77736B] transition-colors hover:text-[#292823]"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
