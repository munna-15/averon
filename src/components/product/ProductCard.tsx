"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

import { formatMoney } from "@/lib/format";
import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { getDefaultColorVariant } from "@/features/products/lib/new-arrival-utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist, hydrated } = useWishlist();

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [isNearViewport, setIsNearViewport] = useState(priority);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [alternateImageLoaded, setAlternateImageLoaded] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const defaultColor = getDefaultColorVariant(product);
  const primaryImage = defaultColor?.images[0];
  const alternateImage = defaultColor?.images[1];

  const productHref = `/products/${encodeURIComponent(product.slug)}`;

  useEffect(() => {
    if (priority || isNearViewport) return;

    const element = imageContainerRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [priority, isNearViewport]);

  if (!primaryImage) return null;

  return (
    <article data-product-card className="min-w-0">
      <div
        ref={imageContainerRef}
        className="group relative aspect-[4/5] overflow-hidden rounded-[8px] bg-[#E9E4DC]"
      >
        <Link
          href={productHref}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-0 block"
        >
          {!imageLoaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[2] overflow-hidden bg-[#E9E4DC]"
            >
              <div className="absolute inset-0 -translate-x-full animate-[product-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:animate-none" />
            </div>
          )}

          {isNearViewport && (
            <>
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                quality={90}
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                onLoad={() => setImageLoaded(true)}
                className={`object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] motion-reduce:transition-none ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              {alternateImage && (
                <Image
                  src={alternateImage.src}
                  alt={alternateImage.alt}
                  fill
                  quality={90}
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  onLoad={() => setAlternateImageLoaded(true)}
                  className={`object-cover transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] motion-reduce:transition-none ${
                    imageLoaded && alternateImageLoaded
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-0"
                  }`}
                />
              )}
            </>
          )}
        </Link>

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          disabled={!hydrated}
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-[#FAF8F4]/90 text-ink shadow-[0_2px_12px_rgba(41,40,35,0.08)] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white disabled:cursor-wait disabled:opacity-70 sm:right-4 sm:top-4 sm:size-10"
        >
          <Heart
            size={17}
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
            className="transition-transform duration-300"
          />
        </button>
      </div>

      <div className="flex items-start justify-between gap-2 pt-3 sm:pt-4">
        <h3 className="min-w-0 font-[var(--font-manrope)] text-[10px] font-medium leading-[1.7] text-ink sm:text-[12px]">
          <Link
            href={productHref}
            className="transition-opacity duration-300 hover:opacity-65"
          >
            {product.name}
          </Link>
        </h3>

        <p className="shrink-0 font-[var(--font-manrope)] text-[10px] font-medium leading-[1.7] text-ink sm:text-[12px]">
          {formatMoney(product.price, "en-BD")}
        </p>
      </div>
    </article>
  );
}
