"use client";

import { X } from "lucide-react";

interface SizeGuideDialogProps {
  open: boolean;
  sizes: string[];
  onClose: () => void;
}

export default function SizeGuideDialog({
  open,
  sizes,
  onClose,
}: SizeGuideDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close size guide"
        onClick={onClose}
        className="absolute inset-0 bg-[#292823]/40"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="relative z-10 w-full max-w-[520px] bg-[#F4F0E8] px-6 py-8 md:px-10 md:py-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close size guide"
          className="absolute right-5 top-5 grid size-9 place-items-center"
        >
          <X size={19} strokeWidth={1.25} />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5F5B53]">
          AVÉRON / FIT GUIDE
        </p>

        <h2
          id="size-guide-title"
          className="mt-4 font-[family-name:var(--pdp-serif)] text-3xl"
        >
          Find your size
        </h2>

        <p className="mt-4 max-w-[38ch] text-sm leading-[1.8] text-[#5F5B53]">
          Select from the available sizes below. Detailed garment measurements
          will be provided once the product s size chart is added.
        </p>

        <div className="mt-8 border-y border-[#D9D0C2]">
          <div className="grid grid-cols-4">
            {sizes.map((size) => (
              <div key={size} className="py-5 text-center text-sm font-medium">
                {size}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs leading-[1.8] text-[#5F5B53]">
          Need help choosing a size? Contact our team for assistance.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-12 w-full bg-[#292823] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAF8F4]"
        >
          Continue shopping
        </button>
      </section>
    </div>
  );
}
