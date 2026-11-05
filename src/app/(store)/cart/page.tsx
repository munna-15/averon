"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Bookmark,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { useCart } from "@/features/cart/CartProvider";
import { useSavedItems } from "@/features/cart/SavedItemsProvider";

import type { CartLine } from "@/types/cart";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function ProductImage({ item }: { item: CartLine }) {
  return (
    <Link
      href={`/products/${item.slug}`}
      className="relative aspect-[3/4] w-[108px] flex-none overflow-hidden bg-[#F0ECE5] sm:w-[150px]"
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="(max-width: 640px) 108px, 150px"
        className="object-cover transition-transform duration-500 hover:scale-[1.04]"
      />
    </Link>
  );
}

function CartPage() {
  const { items, count, subtotal, hydrated, updateQuantity, removeItem } =
    useCart();

  const {
    items: savedItems,
    hydrated: savedHydrated,
    moveToCart,
    removeSavedItem,
    saveItem,
  } = useSavedItems();

  const isHydrated = hydrated && savedHydrated;

  if (!isHydrated) {
    return (
      <main className="min-h-[70vh] bg-[#F4F0E8] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px] animate-pulse">
          <div className="h-9 w-48 rounded bg-[#E5DFD4]" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-64 rounded-xl bg-white" />
            <div className="h-80 rounded-xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  const hasCartItems = items.length > 0;
  const hasSavedItems = savedItems.length > 0;

  if (!hasCartItems && !hasSavedItems) {
    return (
      <main className="flex min-h-[72vh] items-center justify-center bg-[#F4F0E8] px-5 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full border border-[#DED7CA] bg-white">
            <ShoppingBag
              size={30}
              strokeWidth={1.3}
              className="text-[#292823]"
            />
          </div>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#938878]">
            Your selection
          </p>

          <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold tracking-[-0.04em] text-[#292823] sm:text-5xl">
            Your bag is waiting.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#77736B]">
            Discover considered essentials and refined pieces made to become
            part of your everyday wardrobe.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-[#292823] px-8 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-colors duration-300 hover:bg-[#514B40]"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff] px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-10 lg:pb-28">
      <div className="mx-auto max-w-[1440px]">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 border-b border-[#DED8CD] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#938878]">
              AVÉRON / Shopping
            </p>

            <h1 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl font-semibold tracking-[-0.045em] text-[#292823] sm:text-5xl">
              Shopping Bag
            </h1>

            <p className="mt-2 text-sm text-[#77736B]">
              {count} {count === 1 ? "piece" : "pieces"} selected for you
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#625C51] transition-colors hover:text-black"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>

        {/* Cart and order summary */}
        {hasCartItems ? (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
            <section className="min-w-0">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.13em] text-[#292823]">
                  Your Items
                </h2>

                <span className="text-xs text-[#938878]">
                  {items.length} {items.length === 1 ? "product" : "products"}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#EAE5DC] bg-white">
                {items.map((item, index) => (
                  <article
                    key={item.key}
                    className={`flex gap-4 p-4 sm:gap-6 sm:p-6 ${
                      index !== items.length - 1
                        ? "border-b border-[#EEEAE3]"
                        : ""
                    }`}
                  >
                    <ProductImage item={item} />

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="line-clamp-2 text-sm font-semibold leading-6 text-[#292823] transition-colors hover:text-[#817765] sm:text-base"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-2 text-sm text-[#77736B]">
                              {item.color}
                            </p>

                            <p className="mt-1 text-sm text-[#77736B]">
                              Size: {item.size}
                            </p>
                          </div>

                          <p className="flex-none text-sm font-semibold text-[#292823] sm:text-base">
                            {formatPrice(item.price * item.qty)}
                          </p>
                        </div>

                        <p className="mt-2 text-xs text-[#938878]">
                          Unit price: {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex h-9 items-center border border-[#E5E0D7]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                Math.max(1, item.qty - 1),
                              )
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={item.qty <= 1}
                            className="grid size-9 place-items-center text-[#625C51] transition-colors hover:bg-[#F4F0E8] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="min-w-8 text-center text-xs font-semibold tabular-nums text-[#292823]">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.qty + 1)
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            className="grid size-9 place-items-center text-[#625C51] transition-colors hover:bg-[#F4F0E8]"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              saveItem(item);
                              removeItem(item.key);
                            }}
                            className="inline-flex items-center gap-2 text-xs font-medium text-[#8B8173] transition-colors hover:text-[#292823]"
                          >
                            <Bookmark size={14} />
                            Save for Later
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="inline-flex items-center gap-2 text-xs font-medium text-[#8B8173] transition-colors hover:text-[#9D493E]"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#E5DED2] bg-[#F9F7F2] px-4 py-4">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.6}
                  className="mt-0.5 flex-none text-[#77705F]"
                />

                <p className="text-xs leading-6 text-[#77736B]">
                  Your shopping bag is saved on this device. Your selected
                  products and quantities will remain available when you return.
                </p>
              </div>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-28">
              <div className="rounded-xl border border-[#EAE5DC] bg-white p-5 sm:p-7">
                <h2 className="text-sm font-semibold uppercase tracking-[0.13em] text-[#292823]">
                  Order Summary
                </h2>

                <div className="mt-7 space-y-5 border-b border-[#EEEAE3] pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#77736B]">
                      Subtotal ({count} items)
                    </span>

                    <span className="text-sm font-semibold text-[#292823]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#77736B]">Shipping</span>

                    <span className="text-xs font-medium text-[#938878]">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#77736B]">Discounts</span>

                    <span className="text-xs text-[#938878]">Not applied</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 py-6">
                  <span className="text-sm font-semibold text-[#292823]">
                    Estimated Total
                  </span>

                  <span className="text-xl font-semibold tracking-[-0.03em] text-[#292823]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="flex h-13 w-full items-center justify-center bg-[#292823] px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#514B40]"
                >
                  Proceed to Checkout
                </Link>

                <p className="mt-4 text-center text-[11px] leading-5 text-[#938878]">
                  Shipping charges and applicable taxes will be confirmed during
                  checkout.
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[#E5DED2] bg-[#F9F7F2] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#625C51]">
                  Need assistance?
                </p>

                <p className="mt-2 text-xs leading-6 text-[#77736B]">
                  Our team can help with product details, sizing and order
                  enquiries.
                </p>

                <Link
                  href="/contact"
                  className="mt-3 inline-flex text-xs font-semibold text-[#292823] underline underline-offset-4 transition-colors hover:text-[#817765]"
                >
                  Contact AVÉRON
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-[#EAE5DC] bg-white px-5 py-12 text-center sm:py-16">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#F4F0E8]">
              <ShoppingBag
                size={25}
                strokeWidth={1.4}
                className="text-[#625C51]"
              />
            </div>

            <h2 className="mt-5 font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#292823]">
              Your bag is currently empty.
            </h2>

            <p className="mt-2 text-sm text-[#77736B]">
              Your saved pieces are still waiting below.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center justify-center bg-[#292823] px-7 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#514B40]"
            >
              Explore Collection
            </Link>
          </div>
        )}

        {/* Saved for later */}
        {hasSavedItems && (
          <section className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#DED8CD] pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#938878]">
                  Kept for another time
                </p>

                <h2 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl font-semibold tracking-[-0.035em] text-[#292823] sm:text-4xl">
                  Saved for Later
                </h2>
              </div>

              <span className="text-xs text-[#938878]">
                {savedItems.length}{" "}
                {savedItems.length === 1 ? "saved piece" : "saved pieces"}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#EAE5DC] bg-white">
              {savedItems.map((item, index) => (
                <article
                  key={item.key}
                  className={`flex gap-4 p-4 sm:gap-6 sm:p-6 ${
                    index !== savedItems.length - 1
                      ? "border-b border-[#EEEAE3]"
                      : ""
                  }`}
                >
                  <ProductImage item={item} />

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="line-clamp-2 text-sm font-semibold leading-6 text-[#292823] transition-colors hover:text-[#817765] sm:text-base"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-sm text-[#77736B]">
                          {item.color}
                        </p>

                        <p className="mt-1 text-sm text-[#77736B]">
                          Size: {item.size}
                        </p>

                        <p className="mt-2 text-xs text-[#938878]">
                          Quantity: {item.qty}
                        </p>
                      </div>

                      <p className="flex-none text-sm font-semibold text-[#292823] sm:text-base">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => moveToCart(item.key)}
                        className="inline-flex h-9 items-center justify-center gap-2 bg-[#292823] px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#514B40] sm:text-xs"
                      >
                        <ShoppingBag size={14} />
                        Move to Bag
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSavedItem(item.key)}
                        className="inline-flex items-center gap-2 text-xs font-medium text-[#8B8173] transition-colors hover:text-[#9D493E]"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default CartPage;
