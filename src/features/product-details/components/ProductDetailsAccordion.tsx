"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { Product } from "@/types/product";

interface ProductDetailsAccordionProps {
  product: Product;
}

export default function ProductDetailsAccordion({
  product,
}: ProductDetailsAccordionProps) {
  const sections = [
    {
      title: "Material & Fabric",
      content: product.details?.material || product.details?.fabric,
    },
    {
      title: "Fit & Sizing",
      content: product.details?.fit,
    },
    {
      title: "Product Features",
      content: product.details?.features?.length
        ? product.details.features.join("\n")
        : undefined,
    },
    {
      title: "Care Instructions",
      content: product.details?.careInstructions?.length
        ? product.details.careInstructions.join("\n")
        : undefined,
    },
  ].filter((section) => section.content);

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!sections.length) return null;

  return (
    <div className="border-t border-[#D9D0C2]">
      {sections.map((section, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={section.title} className="border-b border-[#D9D0C2]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex min-h-[68px] w-full items-center justify-between gap-5 text-left"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                {section.title}
              </span>

              {isOpen ? (
                <Minus size={16} strokeWidth={1.25} aria-hidden />
              ) : (
                <Plus size={16} strokeWidth={1.25} aria-hidden />
              )}
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[52ch] whitespace-pre-line pb-6 text-[14px] leading-[1.9] text-[#5F5B53]">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
