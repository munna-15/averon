"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Star, Upload, X } from "lucide-react";

import type { Product } from "@/types/product";

import {
  formatProductPrice,
  getDefaultColorVariant,
} from "@/features/products/lib/new-arrival-utils";

import { useWishlist } from "@/features/wishlist/WishlistProvider";
import { useCart } from "@/features/cart/CartProvider";

import ProductGallery from "./components/ProductGallery";
import ProductInformation from "./components/ProductInformation";
import ProductDetailsAccordion from "./components/ProductDetailsAccordion";
import SizeGuideDialog from "./components/SizeGuideDialog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const RECENT_STORAGE_KEY = "averon:recent";
const RECENT_UPDATE_EVENT = "averon:recent-updated";

const SIZE_GUIDE = [
  { size: "M", chest: "42", length: "27", shoulder: "10" },
  { size: "L", chest: "44", length: "28", shoulder: "10.5" },
  { size: "XL", chest: "46", length: "29", shoulder: "11" },
];

const REVIEW_RATINGS = [
  "Perfect",
  "Good",
  "Average",
  "Not that bad",
  "Very poor",
];

type ProductSection = "description" | "size-guide" | "reviews";

type ReviewImage = {
  id: string;
  file: File;
  preview: string;
};

function getRecentSnapshot(): string {
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);

    if (!stored) return "[]";

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return "[]";

    const slugs = parsed.filter(
      (slug): slug is string => typeof slug === "string",
    );

    return JSON.stringify(slugs.slice(0, 8));
  } catch {
    return "[]";
  }
}

function getServerRecentSnapshot(): string {
  return "[]";
}

function subscribeToRecent(callback: () => void) {
  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(RECENT_UPDATE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(RECENT_UPDATE_EVENT, handleChange);
  };
}

type ProductDetailsPageProps = {
  product: Product;
  catalogueProducts: Product[];
};

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#252A32] sm:text-[25px]">
        {children}
      </h2>

      <div className="mt-2.5 h-[4px] w-[72px] bg-[#171717]" />
    </div>
  );
}

const sectionCardClass =
  "scroll-mt-28 mx-4 mb-6 rounded-xl border border-[#F0EEE9] bg-white px-5 py-8 shadow-[0_2px_6px_rgba(35,32,25,0.07)] sm:mx-6 sm:px-7 sm:py-9 lg:mx-10 lg:px-7 lg:py-10";

export default function ProductDetailsPage({
  product,
  catalogueProducts,
}: ProductDetailsPageProps) {
  const root = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionRefs = useRef<Record<ProductSection, HTMLElement | null>>({
    description: null,
    "size-guide": null,
    reviews: null,
  });

  const reviewImagesRef = useRef<ReviewImage[]>([]);

  const defaultColor = getDefaultColorVariant(product);

  const [colorId, setColorId] = useState(
    defaultColor?.id ?? product.defaultColorId,
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [activeSection, setActiveSection] =
    useState<ProductSection>("description");

  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewOpinion, setReviewOpinion] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const color =
    product.colorVariants.find((variant) => variant.id === colorId) ??
    defaultColor ??
    product.colorVariants[0];

  const wished = isWishlisted(product.id);

  // Products are supplied by the catalogue that owns the current product.
  const publishedProducts = useMemo(
    () => catalogueProducts.filter((item) => item.status === "published"),
    [catalogueProducts],
  );

  const recentSlugsJson = useSyncExternalStore(
    subscribeToRecent,
    getRecentSnapshot,
    getServerRecentSnapshot,
  );

  const recentSlugs = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(recentSlugsJson);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter((slug): slug is string => typeof slug === "string");
    } catch {
      return [];
    }
  }, [recentSlugsJson]);

  const relatedProducts = useMemo(
    () =>
      publishedProducts
        .filter(
          (item) =>
            item.id !== product.id && item.category === product.category,
        )
        .slice(0, 4),
    [publishedProducts, product.id, product.category],
  );

  const recentlyViewed = useMemo(
    () =>
      recentSlugs
        .map((slug) => publishedProducts.find((item) => item.slug === slug))
        .filter((item): item is Product => Boolean(item))
        .filter((item) => item.id !== product.id)
        .slice(0, 4),
    [recentSlugs, publishedProducts, product.id],
  );

  const hasProductDetails = Boolean(
    product.details?.material ||
    product.details?.fabric ||
    product.details?.fit ||
    product.details?.features?.length ||
    product.details?.careInstructions?.length,
  );

  useEffect(() => {
    try {
      const previous: unknown = JSON.parse(
        localStorage.getItem(RECENT_STORAGE_KEY) ?? "[]",
      );

      const previousSlugs = Array.isArray(previous)
        ? previous.filter((slug): slug is string => typeof slug === "string")
        : [];

      const next = [
        product.slug,
        ...previousSlugs.filter((slug) => slug !== product.slug),
      ].slice(0, 8);

      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));

      window.dispatchEvent(new Event(RECENT_UPDATE_EVENT));
    } catch {
      // Local storage may be unavailable.
    }
  }, [product.slug]);

  useEffect(() => {
    if (!sizeGuideOpen) return;

    const previousOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [sizeGuideOpen]);

  useEffect(() => {
    reviewImagesRef.current = reviewImages;
  }, [reviewImages]);

  useEffect(() => {
    return () => {
      reviewImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  useEffect(() => {
    const sections = Object.entries(sectionRefs.current)
      .map(([id, element]) => ({
        id: id as ProductSection,
        element,
      }))
      .filter(
        (
          item,
        ): item is {
          id: ProductSection;
          element: HTMLElement;
        } => Boolean(item.element),
      );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const section = sections.find(
            (item) => item.element === visible.target,
          );

          if (section) {
            setActiveSection(section.id);
          }
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    sections.forEach(({ element }) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero]", {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: "power3.out",
          delay: 0.1,
        });

        gsap.utils.toArray<HTMLElement>("[data-img]").forEach((element) => {
          gsap.fromTo(
            element,
            {
              clipPath: "inset(0 0 100% 0)",
            },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.3,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 85%",
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-text]").forEach((element) => {
          gsap.from(element, {
            opacity: 0,
            y: 18,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
            },
          });
        });
      });

      return () => media.revert();
    },
    {
      scope: root,
    },
  );

  const handleColorChange = useCallback((nextColorId: string) => {
    setColorId(nextColorId);
    setSelectedSize(null);
    setHint("");
  }, []);

  const handleSizeChange = useCallback((size: string) => {
    setSelectedSize(size);
    setHint("");
  }, []);

  const handleAddToBag = useCallback(
    (quantity: number) => {
      if (!color || !selectedSize) {
        setHint("Please select a size.");
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        setHint("Please select a valid quantity.");
        return;
      }

      const sizeVariant = color.sizes.find(
        (variant) => variant.size === selectedSize,
      );

      const available =
        sizeVariant?.stock !== undefined
          ? sizeVariant.stock > 0
          : sizeVariant?.available === true;

      if (!sizeVariant || !available) {
        setHint("This size is currently unavailable.");
        return;
      }

      if (sizeVariant.stock !== undefined && quantity > sizeVariant.stock) {
        setHint(`Only ${sizeVariant.stock} item(s) are currently available.`);
        return;
      }

      const image = color.images[0];

      if (!image) {
        setHint("Product image is currently unavailable.");
        return;
      }

      const key = `${product.slug}-${color.id}-${selectedSize}`;

      addToCart(
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: image.src,
          color: color.name,
          size: selectedSize,
          price: product.price.amount,
        },
        quantity,
      );

      setHint("");
    },
    [addToCart, color, product, selectedSize],
  );

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product.id);
  }, [product.id, toggleWishlist]);

  const scrollToSection = (section: ProductSection) => {
    setActiveSection(section);

    sectionRefs.current[section]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  const addReviewFiles = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (selectedFiles.length === 0) {
      setReviewNotice("Please select valid image files.");
      return;
    }

    setReviewImages((current) => {
      const remaining = Math.max(0, 3 - current.length);

      const additions = selectedFiles.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      if (selectedFiles.length > remaining) {
        setReviewNotice("You can upload a maximum of 3 images.");
      } else {
        setReviewNotice("");
      }

      return [...current, ...additions];
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addReviewFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);

    if (event.dataTransfer.files) {
      addReviewFiles(event.dataTransfer.files);
    }
  };

  const removeReviewImage = (id: string) => {
    const imageToRemove = reviewImages.find((item) => item.id === id);

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setReviewImages((current) => current.filter((item) => item.id !== id));
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reviewEmail.trim() || !reviewOpinion.trim() || !reviewRating) {
      setReviewNotice("Please complete all required fields.");
      return;
    }

    setReviewNotice(
      "Your review has not been submitted. Review submission will be available once the review service is connected.",
    );
  };

  if (!color) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F0E8] px-6 text-center text-[#292823]">
        <p className="text-base text-[#5F5B53]">
          Product information is currently unavailable.
        </p>
      </div>
    );
  }

  const navigationItems: {
    id: ProductSection;
    label: string;
  }[] = [
    { id: "description", label: "Description" },
    { id: "size-guide", label: "Size Guide" },
    { id: "reviews", label: "Customer Reviews (0)" },
  ];

  return (
    <div ref={root} className="min-h-screen bg-[#F4F0E8] text-[#292823]">
      {/* Product hero */}
      <section className="mx-auto max-w-[1600px] px-4 pb-12 pt-8 sm:px-6 lg:px-10 lg:pb-16 lg:pt-12">
        <div className="overflow-hidden rounded-xl border border-[#F0EEE9] bg-white p-3 shadow-[0_2px_6px_rgba(35,32,25,0.07)] sm:p-5 lg:p-7">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            {/* Product Gallery */}
            <div data-img className="min-w-0">
              <ProductGallery key={color.id} product={product} color={color} />
            </div>

            {/* Product Information */}
            <div data-text className="min-w-0">
              <ProductInformation
                product={product}
                color={color}
                selectedSize={selectedSize}
                wished={wished}
                hint={hint}
                onColorChange={handleColorChange}
                onSizeChange={handleSizeChange}
                onAddToBag={handleAddToBag}
                onToggleWishlist={handleToggleWishlist}
                onOpenSizeGuide={() => setSizeGuideOpen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section navigation */}
      <nav
        aria-label="Product information sections"
        className="sticky top-0 z-30 px-4 py-6 pt-3 sm:px-6 lg:px-10"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-start gap-2 overflow-x-auto rounded-xl border border-[#F0EEE9] bg-white p-2 shadow-[0_2px_6px_rgba(35,32,25,0.07)]">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              aria-current={activeSection === item.id ? "location" : undefined}
              className={`flex-none rounded-md px-5 py-3 text-sm font-semibold transition-colors duration-300 sm:px-7 sm:text-base ${
                activeSection === item.id
                  ? "bg-[#151515] text-white"
                  : "bg-[#F3F3F3] text-[#666666] hover:bg-[#EAEAEA] hover:text-[#222222]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Description */}
      <section
        id="description"
        ref={(element) => {
          sectionRefs.current.description = element;
        }}
        className={sectionCardClass}
      >
        <div className="mx-auto max-w-[1600px]">
          <SectionHeading>Product Details</SectionHeading>

          <div className="mt-7 max-w-[1100px]">
            <p className="text-base leading-8 text-[#555555]">
              {product.description}
            </p>
          </div>

          {hasProductDetails && (
            <div className="mt-10 border-t border-[#EAEAEA] pt-7">
              <ProductDetailsAccordion product={product} />
            </div>
          )}
        </div>
      </section>

      {/* Size Guide */}
      <section
        id="size-guide"
        ref={(element) => {
          sectionRefs.current["size-guide"] = element;
        }}
        className={sectionCardClass}
      >
        <div className="mx-auto max-w-[1600px]">
          <SectionHeading>Size Guide</SectionHeading>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-center">
              <thead>
                <tr className="bg-[#F1F1F1]">
                  {["SIZE", "CHEST", "LENGTH", "SHOULDER"].map((heading) => (
                    <th
                      key={heading}
                      className="border-r border-[#D5D5D5] px-4 py-4 text-sm font-medium text-[#555555] last:border-r-0 sm:text-base"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SIZE_GUIDE.map((row, index) => (
                  <tr
                    key={row.size}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#F1F1F1]"}
                  >
                    <td className="border-r border-t border-[#DDDDDD] px-4 py-5 text-base font-semibold text-[#222222]">
                      {row.size}
                    </td>

                    <td className="border-r border-t border-[#DDDDDD] px-4 py-5 text-base text-[#222222]">
                      {row.chest}
                    </td>

                    <td className="border-r border-t border-[#DDDDDD] px-4 py-5 text-base text-[#222222]">
                      {row.length}
                    </td>

                    <td className="border-t border-[#DDDDDD] px-4 py-5 text-base text-[#222222]">
                      {row.shoulder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section
        id="reviews"
        ref={(element) => {
          sectionRefs.current.reviews = element;
        }}
        className={sectionCardClass}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)] lg:gap-12">
          {/* Rating summary */}
          <div className="min-w-0 lg:pr-5">
            <div className="flex items-center gap-5">
              <span className="font-[family-name:var(--pdp-serif)] text-[64px] font-bold leading-none tracking-[-0.055em] text-[#062A25] sm:text-[72px]">
                0.0
              </span>

              <div>
                <p className="text-base text-[#343943]">Average Rating</p>

                <div className="mt-2 flex items-center gap-0.5 text-[#A5A5A5]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={17}
                      strokeWidth={1.7}
                      className="fill-transparent"
                    />
                  ))}
                </div>

                <p className="mt-1 text-sm text-[#999999]">
                  (<strong className="font-bold text-[#333333]">0</strong>{" "}
                  Reviews)
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-baseline gap-5">
              <span className="text-[27px] font-bold leading-none tracking-[-0.04em] text-[#252A32]">
                0.00%
              </span>

              <p className="text-base text-[#343943]">
                Recommended{" "}
                <span className="text-sm text-[#A0A0A0]">
                  (<strong className="font-bold text-[#444444]">1 of 3</strong>)
                </span>
              </p>
            </div>

            <div className="mt-7 space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex w-[100px] flex-none items-center gap-[1px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={16}
                        strokeWidth={1.5}
                        className={
                          index < rating
                            ? "fill-[#F59A38] text-[#F59A38]"
                            : "fill-[#D0D0D0] text-[#D0D0D0]"
                        }
                      />
                    ))}
                  </div>

                  <div className="h-[9px] flex-1 overflow-hidden rounded-full bg-[#EEEEEE]">
                    <div className="h-full w-0 rounded-full bg-[#F59A38]" />
                  </div>

                  <span className="w-8 flex-none text-right text-sm font-bold text-[#555555]">
                    0%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review form */}
          <div className="min-w-0">
            <div>
              <SectionHeading>Submit Your Review</SectionHeading>

              <p className="mt-8 text-base leading-7 text-[#777777]">
                Your email address will not be published. Required fields are
                marked *
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-7 space-y-6">
              <div>
                <label
                  htmlFor="review-email"
                  className="mb-3 block text-base text-[#777777]"
                >
                  Email Address <span className="text-[#9A6D5D]">*</span>
                </label>

                <input
                  id="review-email"
                  type="email"
                  required
                  value={reviewEmail}
                  onChange={(event) => setReviewEmail(event.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 w-full border border-[#E6E6E6] bg-white px-4 text-base text-[#292823] outline-none transition-colors placeholder:text-[#999999] focus:border-[#999999]"
                />
              </div>

              <div>
                <label
                  htmlFor="review-opinion"
                  className="mb-3 block text-base text-[#777777]"
                >
                  Write your opinion about the product
                  <span className="text-[#9A6D5D]"> *</span>
                </label>

                <textarea
                  id="review-opinion"
                  required
                  rows={5}
                  value={reviewOpinion}
                  onChange={(event) => setReviewOpinion(event.target.value)}
                  placeholder="Write Your Review Here..."
                  className="min-h-[160px] w-full resize-y border border-[#E6E6E6] bg-white px-5 py-4 text-base leading-7 text-[#292823] outline-none transition-colors placeholder:text-[#888888] focus:border-[#999999]"
                />
              </div>

              {/* Image upload */}
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <label className="text-base text-[#777777]">
                    Upload Images (Optional)
                  </label>

                  <span className="text-sm text-[#999999]">
                    {reviewImages.length}/3 images
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDraggingFiles(true);
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(event.relatedTarget as Node)
                    ) {
                      setIsDraggingFiles(false);
                    }
                  }}
                  onDrop={handleFileDrop}
                  className={`flex min-h-[165px] flex-col items-center justify-center rounded-lg border border-dashed px-5 py-7 text-center transition-colors duration-300 ${
                    isDraggingFiles
                      ? "border-[#777777] bg-[#F5F5F5]"
                      : "border-[#D2D2D2] bg-[#FAFAFA]"
                  }`}
                >
                  <div className="mb-3 text-[#1877F2]">
                    <Upload size={34} strokeWidth={2.8} />
                  </div>

                  <p className="text-base font-semibold text-[#30343B]">
                    Drag &amp; Drop Images Here
                  </p>

                  <p className="mt-2 text-base text-[#777777]">
                    or click to browse files (3 max)
                  </p>

                  <button
                    type="button"
                    disabled={reviewImages.length >= 3}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-base font-medium text-[#555555] underline underline-offset-4 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Browse files
                  </button>
                </div>

                {reviewImages.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {reviewImages.map((image) => (
                      <div
                        key={image.id}
                        className="group relative size-20 overflow-hidden rounded-md border border-[#E2E2E2]"
                      >
                        <Image
                          src={image.preview}
                          alt={image.file.name}
                          fill
                          unoptimized
                          sizes="80px"
                          className="object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeReviewImage(image.id)}
                          aria-label="Remove uploaded image"
                          className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-[#292823]/80 text-white transition-colors hover:bg-[#292823]"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div>
                  <label
                    htmlFor="review-rating"
                    className="mb-3 block text-base text-[#777777]"
                  >
                    Your Rating <span className="text-[#9A6D5D]">*</span>
                  </label>

                  <div className="relative">
                    <select
                      id="review-rating"
                      required
                      value={reviewRating}
                      onChange={(event) => setReviewRating(event.target.value)}
                      className="h-12 w-full appearance-none border border-[#E6E6E6] bg-white px-4 pr-10 text-base text-[#555555] outline-none transition-colors focus:border-[#999999]"
                    >
                      <option value="" disabled>
                        Select One
                      </option>

                      {REVIEW_RATINGS.map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-[#777777]">
                      ⌄
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center bg-[#444444] px-9 text-sm font-bold uppercase text-white transition-colors duration-300 hover:bg-[#222222] sm:w-auto"
                >
                  Submit Review
                </button>
              </div>

              {reviewNotice && (
                <p
                  role="status"
                  className="rounded-md border border-[#E5E1D9] bg-[#F8F7F4] px-4 py-3 text-sm leading-6 text-[#6D675D]"
                >
                  {reviewNotice}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="bg-transparent px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 text-center">
              <SectionHeading>Related Pieces</SectionHeading>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
              {relatedProducts.map((item) => {
                const itemColor = getDefaultColorVariant(item);
                const itemImage = itemColor?.images[0];

                if (!itemImage) return null;

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="group min-w-0"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E2D8]">
                      <Image
                        src={itemImage.src}
                        alt={itemImage.alt || item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-medium text-[#292823]">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-base text-[#5F5B53]">
                        {formatProductPrice(item)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="bg-transparent px-4 pb-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 text-center">
              <SectionHeading>Recently Viewed</SectionHeading>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
              {recentlyViewed.map((item) => {
                const itemColor = getDefaultColorVariant(item);
                const itemImage = itemColor?.images[0];

                if (!itemImage) return null;

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="group min-w-0"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E2D8]">
                      <Image
                        src={itemImage.src}
                        alt={itemImage.alt || item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-medium text-[#292823]">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-base text-[#5F5B53]">
                        {formatProductPrice(item)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Size guide dialog */}
      <SizeGuideDialog
        open={sizeGuideOpen}
        sizes={color.sizes.map((variant) => variant.size)}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}
