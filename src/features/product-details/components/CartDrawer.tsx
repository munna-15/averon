"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartLine[];
  subtotal: number;
  onClose: () => void;
  onQuantityChange: (key: string, quantity: number) => void;
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount / 100);

export default function CartDrawer({
  open,
  items,
  subtotal,
  onClose,
  onQuantityChange,
}: CartDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-[#292823]/35"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-[#F4F0E8] shadow-2xl"
      >
        <div className="flex min-h-[76px] items-center justify-between border-b border-[#D9D0C2] px-6 md:px-8">
          <h2 className="font-[family-name:var(--pdp-serif)] text-2xl">
            Your Bag
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="grid size-10 place-items-center"
          >
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-[family-name:var(--pdp-serif)] text-2xl">
                Your bag is empty
              </p>
              <p className="mt-3 text-sm text-[#5F5B53]">
                Discover pieces made to be worn.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-7 border-b border-[#292823] pb-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-7">
              {items.map((item) => (
                <article key={item.key} className="flex gap-5">
                  <div className="relative aspect-[3/4] w-[104px] flex-none bg-[#D9D0C2]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="104px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="mt-2 text-xs text-[#5F5B53]">
                          {item.color} / {item.size}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center gap-4 pt-5">
                      <div className="flex h-9 items-center border border-[#D9D0C2]">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            onQuantityChange(item.key, item.qty - 1)
                          }
                          className="grid size-9 place-items-center"
                        >
                          <Minus size={13} strokeWidth={1.25} />
                        </button>

                        <span className="w-6 text-center text-xs tabular-nums">
                          {item.qty}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            onQuantityChange(item.key, item.qty + 1)
                          }
                          className="grid size-9 place-items-center"
                        >
                          <Plus size={13} strokeWidth={1.25} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onQuantityChange(item.key, 0)}
                        className="text-[11px] text-[#5F5B53] underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#D9D0C2] px-6 py-6 md:px-8">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Subtotal
              </span>
              <span className="text-base">{formatPrice(subtotal)}</span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#5F5B53]">
              Shipping and taxes are calculated at checkout.
            </p>

            <button
              type="button"
              disabled
              className="mt-6 h-14 w-full cursor-not-allowed bg-[#292823] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FAF8F4] opacity-70"
            >
              Checkout coming soon
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
