"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Check,
  Ruler,
  Minus,
  Plus,
  Phone,
  ShoppingBag,
  Share2,
  CheckCheck,
} from "lucide-react";

import type { MouseEvent } from "react";

import type {
  Product,
  ProductColorVariant,
  ProductSizeVariant,
} from "@/types/product";

import { formatProductPrice } from "@/features/products/lib/new-arrival-utils";

interface ProductInformationProps {
  product: Product;
  color: ProductColorVariant;
  selectedSize: string | null;
  wished: boolean;
  hint: string;
  onColorChange: (colorId: string) => void;
  onSizeChange: (size: string) => void;
  onAddToBag: (quantity: number) => void;
  onToggleWishlist: () => void;
  onOpenSizeGuide: () => void;
}

const CONTACT_NUMBER = "8801792960610";

const CTA_BASE =
  "flex h-[55px] items-center justify-center gap-2.5 rounded-[4px] px-3 text-center text-[14px] font-bold leading-tight text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[16px]";

export default function ProductInformation({
  product,
  color,
  selectedSize,
  wished,
  hint,
  onColorChange,
  onSizeChange,
  onAddToBag,
  onToggleWishlist,
  onOpenSizeGuide,
}: ProductInformationProps) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "copied" | "shared" | "error"
  >("idle");

  const selectedVariant: ProductSizeVariant | undefined = color.sizes.find(
    (variant) => variant.size === selectedSize,
  );

  const stock = selectedVariant?.stock;

  const available =
    selectedVariant?.stock !== undefined
      ? selectedVariant.stock > 0
      : selectedVariant?.available === true;

  const maxQuantity = stock !== undefined ? Math.max(1, stock) : 99;

  const safeQuantity = Math.min(quantity, maxQuantity);

  const canPurchase = Boolean(selectedSize && available);

  const availabilityMessage = !selectedSize
    ? "Select a size to check availability."
    : !available
      ? "This size is currently unavailable."
      : stock !== undefined && stock <= 5
        ? `Only ${stock} ${stock === 1 ? "piece" : "pieces"} available in this size.`
        : "Available in your selected size.";

  // Stock figure shown in the "Available Stock" line: the selected size when
  // one is chosen, otherwise the total across sizes (only if every size has a
  // numeric stock value).
  const totalStock =
    color.sizes.length > 0 && color.sizes.every((v) => v.stock !== undefined)
      ? color.sizes.reduce((sum, v) => sum + (v.stock ?? 0), 0)
      : undefined;

  const shownStock = selectedVariant ? stock : totalStock;

  // Keep this URL identical during server and client rendering.
  const productPath = `/products/${product.slug}`;

  const handleQuantityChange = (nextQuantity: number) => {
    setQuantity(Math.min(maxQuantity, Math.max(1, nextQuantity)));
  };

  const handleAddToCart = () => {
    if (!canPurchase) return;

    onAddToBag(safeQuantity);
  };

  const handleBuyNow = () => {
    if (!canPurchase || !selectedSize) return;

    const params = new URLSearchParams({
      product: product.slug,
      color: color.id,
      size: selectedSize,
      quantity: String(safeQuantity),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const handleShare = async () => {
    try {
      // Resolve the absolute URL only after a real user interaction.
      const absoluteProductUrl = new URL(
        productPath,
        window.location.origin,
      ).toString();

      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Discover ${product.name} at AVÉRON.`,
          url: absoluteProductUrl,
        });

        setShareStatus("shared");
        return;
      }

      await navigator.clipboard.writeText(absoluteProductUrl);
      setShareStatus("copied");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setShareStatus("error");
    }
  };

  const handleWhatsAppOrder = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const absoluteProductUrl = new URL(
      productPath,
      window.location.origin,
    ).toString();

    const whatsappMessage = [
      "Hello AVÉRON, I'm interested in this product.",
      "",
      `Product: ${product.name}`,
      `Price: ${formatProductPrice(product)}`,
      `Color: ${color.name}`,
      `Size: ${selectedSize ?? "Not selected"}`,
      `Quantity: ${safeQuantity}`,
      `Product URL: ${absoluteProductUrl}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(
      whatsappMessage,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="md:sticky md:top-28 md:self-start">
      {/* Product identity */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B8172]">
              {product.category}
            </p>

            <h1 className="mt-2 text-[24px] font-normal leading-[1.3] text-[#292823] sm:text-[28px]">
              {product.name}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="inline-flex size-10 flex-none items-center justify-center rounded-[4px] border border-[#C9C9C9] text-[#292823] transition-colors duration-300 hover:border-[#111111]"
          >
            {shareStatus === "copied" ? (
              <CheckCheck size={17} />
            ) : (
              <Share2 size={17} strokeWidth={1.6} />
            )}
          </button>
        </div>

        {shareStatus !== "idle" && (
          <p
            role="status"
            className={`mt-2 text-[12px] ${
              shareStatus === "error" ? "text-[#B4443A]" : "text-[#1E9A47]"
            }`}
          >
            {shareStatus === "copied"
              ? "Product link copied."
              : shareStatus === "shared"
                ? "Share window opened."
                : "Unable to share this product."}
          </p>
        )}

        <p className="mt-5 text-[28px] font-semibold leading-none tracking-[-0.01em] text-[#111111] sm:text-[32px]">
          {formatProductPrice(product)}
        </p>

        <p
          aria-live="polite"
          className="mt-4 text-[15px] text-[#6B6B6B] sm:text-[16px]"
        >
          {shownStock !== undefined ? (
            shownStock > 0 ? (
              <>
                Available Stock:{" "}
                <span
                  className={`font-bold ${
                    shownStock <= 5 ? "text-[#B4443A]" : "text-[#1E9A47]"
                  }`}
                >
                  {shownStock}
                </span>
              </>
            ) : (
              <span className="font-medium text-[#B4443A]">
                {selectedVariant
                  ? "This size is currently unavailable."
                  : "Out of stock"}
              </span>
            )
          ) : (
            <span
              className={
                selectedSize && !available ? "text-[#B4443A]" : undefined
              }
            >
              {availabilityMessage}
            </span>
          )}
        </p>

        <p className="mt-4 max-w-[52ch] text-[14px] leading-[1.7] text-[#6B6B6B]">
          {product.description}
        </p>
      </div>

      <div className="mt-6 border-t border-[#E3E3E3] pt-7">
        <div className="grid gap-6">
          {/* Colour */}
          <div
            role="group"
            aria-labelledby="pi-color"
            className="flex items-start"
          >
            <span
              id="pi-color"
              className="flex h-9 w-[88px] flex-none items-center text-[16px] text-[#292823] sm:w-[70px]"
            >
              Color:
            </span>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
              {product.colorVariants.map((variant) => {
                const isSelected = variant.id === color.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Select ${variant.name} colour`}
                    title={variant.name}
                    onClick={() => onColorChange(variant.id)}
                    className={`group relative grid size-8 place-items-center rounded-full transition-all duration-300 ${
                      isSelected
                        ? "ring-1 ring-[#292823] ring-offset-[4px] ring-offset-[#F4F0E8]"
                        : "hover:ring-1 hover:ring-[#A59B8C] hover:ring-offset-[3px] hover:ring-offset-[#F4F0E8]"
                    }`}
                  >
                    <span
                      className="size-7 rounded-full border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                      style={{
                        backgroundColor: variant.hex || "#D9D2C6",
                      }}
                    />

                    {isSelected && (
                      <span className="absolute inset-0 grid place-items-center">
                        <Check
                          size={13}
                          strokeWidth={2.5}
                          className={
                            variant.hex?.toLowerCase() === "#ffffff" ||
                            variant.hex?.toLowerCase() === "#fff"
                              ? "text-[#292823]"
                              : "text-white"
                          }
                        />
                      </span>
                    )}
                  </button>
                );
              })}

              <span className="text-[14px] text-[#6B6B6B]">{color.name}</span>
            </div>
          </div>

          {/* Size */}
          <div
            role="group"
            aria-labelledby="pi-size"
            className="flex items-start"
          >
            <span
              id="pi-size"
              className="flex h-9 w-[88px] flex-none items-center text-[16px] text-[#292823] sm:w-[70px]"
            >
              Size:
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
                {color.sizes.map((variant) => {
                  const isAvailable =
                    variant.stock !== undefined
                      ? variant.stock > 0
                      : variant.available === true;

                  const isSelected = selectedSize === variant.size;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isAvailable}
                      aria-pressed={isSelected}
                      onClick={() => onSizeChange(variant.size)}
                      className={`flex h-9 min-w-[58px] items-center justify-center rounded-[3px] border px-3 text-[15px] transition-colors duration-200 ${
                        isSelected
                          ? "border-[#111111] bg-[#111111] text-white"
                          : isAvailable
                            ? "border-[#C9C9C9] text-[#292823] hover:border-[#111111]"
                            : "cursor-not-allowed border-[#E3E3E3] bg-[#F0ECE5]/60 text-[#B6B6B6] line-through"
                      }`}
                    >
                      {variant.size}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="inline-flex min-h-9 items-center gap-2 text-[15px] text-[#111111]"
                >
                  <Ruler size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span className="underline underline-offset-4">
                    Size Guide
                  </span>
                </button>
              </div>

              <div role="status" aria-live="polite">
                {hint && (
                  <p className="mt-2.5 text-[13px] text-[#B4443A]">{hint}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-wrap items-center gap-y-3">
            <span className="w-[88px] flex-none text-[16px] text-[#292823] sm:w-[128px]">
              Quantity:
            </span>

            <div className="flex h-[54px] w-[175px] items-center justify-between rounded-[4px] border border-[#D0D0D0] px-[10px]">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => handleQuantityChange(quantity - 1)}
                className="grid size-[26px] place-items-center rounded-full bg-[#F0F0F0] text-[#444444] transition-colors hover:bg-[#E4E4E4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={13} strokeWidth={1.8} />
              </button>

              <span
                aria-live="polite"
                className="min-w-8 text-center text-[18px] tabular-nums text-[#292823]"
              >
                {safeQuantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= maxQuantity}
                onClick={() => handleQuantityChange(quantity + 1)}
                className="grid size-[26px] place-items-center rounded-full bg-[#F0F0F0] text-[#7A4A2A] transition-colors hover:bg-[#E4E4E4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={13} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Purchase CTAs */}
        <div className="mt-6 grid grid-cols-1 gap-[15px] min-[440px]:grid-cols-2">
          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canPurchase}
            className={`${CTA_BASE} bg-[#111111] uppercase hover:bg-[#2A2A2A]`}
          >
            <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Add to Cart</span>
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canPurchase}
            className={`${CTA_BASE} buy-now-pulse bg-[#061F1D] uppercase hover:bg-[#0B3430]`}
          >
            <span>Buy Now</span>
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACT_NUMBER}`}
            onClick={handleWhatsAppOrder}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order this product on WhatsApp"
            className={`${CTA_BASE} bg-[#1FA95E] hover:bg-[#188A4C]`}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.48 0 .13 5.35.13 11.93c0 2.1.55 4.15 1.59 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.78 1.47h.01c6.58 0 11.93-5.35 11.94-11.93a11.87 11.87 0 0 0-3.48-8.42ZM12.06 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.88 9.88 0 0 1-1.52-5.25c0-5.47 4.45-9.92 9.92-9.92a9.86 9.86 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.45-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>

            <span>Order On WhatsApp</span>
          </a>

          {/* Call */}
          <a
            href={`tel:+${CONTACT_NUMBER}`}
            className={`${CTA_BASE} bg-[#1E3A8A] hover:bg-[#182E6E]`}
          >
            <Phone size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Call For Order</span>
          </a>
        </div>

        {/* Wishlist */}
        <button
          type="button"
          aria-pressed={wished}
          onClick={onToggleWishlist}
          className={`group mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-medium transition-colors duration-300 ${
            wished ? "text-[#292823]" : "text-[#6B6B6B] hover:text-[#292823]"
          }`}
        >
          <Heart
            size={17}
            strokeWidth={1.5}
            aria-hidden
            className={`transition-all duration-300 ${
              wished
                ? "fill-[#292823] text-[#292823]"
                : "fill-transparent group-hover:scale-110"
            }`}
          />

          {wished ? "Saved to Wishlist" : "Add to Wishlist"}
        </button>
      </div>

      <style jsx>{`
        .buy-now-pulse {
          animation: buyNowShake 0.65s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes buyNowShake {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }

          15% {
            transform: translateX(-1.5px) rotate(-0.8deg);
          }

          30% {
            transform: translateX(1.5px) rotate(0.8deg);
          }

          45% {
            transform: translateX(-1px) rotate(-0.5deg);
          }

          60% {
            transform: translateX(1px) rotate(0.5deg);
          }

          75% {
            transform: translateX(0) rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .buy-now-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
