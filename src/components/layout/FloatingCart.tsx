"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/features/cart/CartProvider";

function formatCartTotal(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function FloatingCart() {
  const { count, subtotal, hydrated, isCartDrawerOpen, openCartDrawer } =
    useCart();

  if (isCartDrawerOpen) return null;

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      aria-label={`Shopping bag, ${hydrated ? count : 0} items, total BDT ${formatCartTotal(subtotal)}`}
      aria-haspopup="dialog"
      className="fixed right-0 top-1/2 z-[60] flex w-[64px] -translate-y-1/2 flex-col items-stretch gap-0 shadow-[0_3px_14px_rgba(0,0,0,0.12)] transition-transform duration-300 focus-visible:outline focus-visible:outline-2 cursor-pointer focus-visible:outline-offset-4 focus-visible:outline-ink sm:w-[68px]"
    >
      <span className="flex flex-col items-center justify-center gap-2 rounded-tl-md bg-[#171717] py-3.5 text-white">
        <ShoppingBag
          aria-hidden="true"
          className="size-[23px]"
          strokeWidth={1.5}
        />

        <span className="font-[var(--font-manrope)] text-[11px] font-semibold uppercase tracking-[0.06em] leading-none tabular-nums">
          {hydrated ? count : 0} ITEMS
        </span>
      </span>

      <span className="flex items-center justify-center rounded-bl-lg bg-white py-1.5 text-[#171717]">
        <span className="font-[var(--font-manrope)] text-[14px] font-semibold tracking-[-0.03em] leading-none tabular-nums">
          BDT {hydrated ? formatCartTotal(subtotal) : "0.00"}
        </span>
      </span>
    </button>
  );
}
