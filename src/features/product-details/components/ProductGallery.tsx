"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { MouseEvent, WheelEvent, TouchEvent } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

import type {
  Product,
  ProductColorVariant,
  ProductImage,
} from "@/types/product";

interface ProductGalleryProps {
  product: Product;
  color: ProductColorVariant;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ProductGallery({
  product,
  color,
}: ProductGalleryProps) {
  const [view, setView] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });
  const [modalZoomed, setModalZoomed] = useState(false);
  const [modalZoomPosition, setModalZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const images = color.images;
  const activeImage: ProductImage | undefined = images[view] ?? images[0];

  const resetModalZoom = useCallback(() => {
    setModalZoomed(false);
    setModalZoomPosition({ x: 50, y: 50 });
  }, []);

  const closeModal = useCallback(() => {
    if (!modalVisible || closingRef.current) return;

    closingRef.current = true;

    const backdrop = backdropRef.current;
    const modal = modalRef.current;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const finishClose = () => {
      setModalVisible(false);
      resetModalZoom();
      closingRef.current = false;
      timelineRef.current = null;
    };

    timelineRef.current?.kill();

    if (prefersReducedMotion || !backdrop || !modal) {
      finishClose();
      return;
    }

    timelineRef.current = gsap.timeline({
      onComplete: finishClose,
    });

    timelineRef.current
      .to(
        modal,
        {
          opacity: 0,
          scale: 0.985,
          duration: 0.22,
          ease: "power2.in",
        },
        0,
      )
      .to(
        backdrop,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0.04,
      );
  }, [modalVisible, resetModalZoom]);

  useEffect(() => {
    if (!modalVisible) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [modalVisible]);

  useEffect(() => {
    if (!modalVisible) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowRight" && images.length > 1) {
        setView((current) => (current + 1) % images.length);
        resetModalZoom();
      }

      if (event.key === "ArrowLeft" && images.length > 1) {
        setView((current) => (current - 1 + images.length) % images.length);
        resetModalZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const backdrop = backdropRef.current;
    const modal = modalRef.current;

    if (backdrop && modal) {
      timelineRef.current?.kill();

      if (prefersReducedMotion) {
        gsap.set([backdrop, modal], {
          clearProps: "opacity,transform",
        });
      } else {
        gsap.set(backdrop, {
          opacity: 0,
        });

        gsap.set(modal, {
          opacity: 0,
          y: 12,
          scale: 0.985,
        });

        timelineRef.current = gsap.timeline();

        timelineRef.current
          .to(backdrop, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          })
          .to(
            modal,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: "power3.out",
            },
            "-=0.16",
          );
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      timelineRef.current?.kill();
    };
  }, [modalVisible, images.length, closeModal, resetModalZoom]);

  const openModal = () => {
    if (modalVisible) return;

    closingRef.current = false;
    resetModalZoom();
    setModalVisible(true);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100),
    );

    const y = Math.max(
      0,
      Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100),
    );

    setZoomPosition({ x, y });
  };

  const handleModalMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100),
    );

    const y = Math.max(
      0,
      Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100),
    );

    setModalZoomPosition({ x, y });
  };

  const handleOverlayWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleOverlayTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const showPreviousImage = () => {
    setView((current) => (current - 1 + images.length) % images.length);
    resetModalZoom();
  };

  const showNextImage = () => {
    setView((current) => (current + 1) % images.length);
    resetModalZoom();
  };

  const selectImage = (index: number) => {
    setView(index);
    resetModalZoom();
  };

  if (!activeImage) {
    return (
      <div
        className="mx-auto aspect-[4/5] w-full max-w-[520px] bg-[#D9D0C2]"
        aria-label="Product image unavailable"
      />
    );
  }

  return (
    <>
      <div
        data-hero
        className="mx-auto flex w-full max-w-[620px] min-w-0 flex-col-reverse gap-3 sm:gap-4 md:flex-row md:items-start md:gap-3.5"
      >
        {images.length > 1 && (
          <ul
            className="flex gap-2 overflow-x-auto pb-1 md:w-[58px] md:flex-none md:flex-col md:overflow-visible md:pb-0"
            aria-label="Product views"
          >
            {images.map((image, index) => (
              <li
                key={image.id}
                className="w-[58px] flex-none sm:w-[64px] md:w-full"
              >
                <button
                  type="button"
                  onClick={() => selectImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === view}
                  className={`relative block aspect-[4/5] w-full overflow-hidden bg-[#E8E2D8] transition-opacity duration-300 ${
                    index === view
                      ? "opacity-100"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mx-auto min-w-0 w-full max-w-[620px] flex-1">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
            onClick={openModal}
            className="group relative aspect-[4/5] max-h-[680px] w-full cursor-zoom-in overflow-hidden bg-[#E8E2D8]"
          >
            <Image
              key={activeImage.id}
              src={activeImage.src}
              alt={activeImage.alt || product.name}
              fill
              priority
              sizes="(max-width: 767px) 90vw, (max-width: 1200px) 42vw, 470px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[2]"
              style={{
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={openModal}
            aria-label="View product image"
            className="absolute right-3 top-3 grid size-10 place-items-center bg-[#FAF8F4]/90 text-[#292823] backdrop-blur-sm transition-colors duration-300 hover:bg-white"
          >
            <Maximize2 size={17} strokeWidth={1.3} />
          </button>

          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-[#FAF8F4]/90 px-3 py-1.5 text-[10px] tracking-[0.12em] text-[#292823] backdrop-blur-sm">
              {String(view + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      {mounted &&
        modalVisible &&
        createPortal(
          <div
            ref={backdropRef}
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
            onClick={closeModal}
            onWheel={handleOverlayWheel}
            onTouchMove={handleOverlayTouchMove}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#171612]/65 p-3 backdrop-blur-[5px] sm:p-6"
          >
            <div
              ref={modalRef}
              onClick={(event) => event.stopPropagation()}
              className="relative flex max-h-[88vh] w-full max-w-[680px] flex-col overflow-hidden rounded-xl border border-white/40 bg-[#F7F4EE] shadow-[0_24px_90px_rgba(0,0,0,0.25)]"
            >
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#EEEAE2]">
                <div
                  onMouseMove={handleModalMouseMove}
                  onMouseLeave={() => setModalZoomPosition({ x: 50, y: 50 })}
                  onClick={() => setModalZoomed((current) => !current)}
                  className={`relative aspect-[4/5] max-h-[70vh] w-full max-w-[470px] overflow-hidden ${
                    modalZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                >
                  <Image
                    key={activeImage.id}
                    src={activeImage.src}
                    alt={activeImage.alt || product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 470px"
                    className="object-contain transition-transform duration-500 ease-out"
                    style={{
                      transform: modalZoomed ? "scale(2)" : "scale(1)",
                      transformOrigin: `${modalZoomPosition.x}% ${modalZoomPosition.y}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close image preview"
                  className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-[#D9D0C2]/70 bg-[#F7F4EE]/90 text-[#292823] shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-white sm:right-4 sm:top-4"
                >
                  <X size={17} strokeWidth={1.5} />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#D9D0C2]/70 bg-[#F7F4EE]/90 text-[#292823] shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white sm:left-4 sm:size-10"
                    >
                      <ChevronLeft size={19} strokeWidth={1.5} />
                    </button>

                    <button
                      type="button"
                      onClick={showNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#D9D0C2]/70 bg-[#F7F4EE]/90 text-[#292823] shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white sm:right-4 sm:size-10"
                    >
                      <ChevronRight size={19} strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-none items-center justify-between gap-4 border-t border-[#DDD6CA] px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium tracking-[0.04em] text-[#292823]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.19em] text-[#898274]">
                    AVÉRON · PRODUCT DETAIL
                  </p>
                </div>

                <div className="flex flex-none items-center gap-3">
                  {images.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tabular-nums tracking-[0.12em] text-[#514C43]">
                        {String(view + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-5 bg-[#BEB5A8]" />
                      <span className="text-[10px] tabular-nums tracking-[0.12em] text-[#898274]">
                        {String(images.length).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex justify-center gap-2 border-t border-[#E4DED4] bg-[#F7F4EE] px-4 py-3">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => selectImage(index)}
                      aria-label={`View image ${index + 1}`}
                      aria-current={index === view}
                      className={`relative h-12 w-9 overflow-hidden rounded-[3px] bg-[#E8E2D8] transition-all duration-200 ${
                        index === view
                          ? "opacity-100 ring-1 ring-[#777166] ring-offset-2 ring-offset-[#F7F4EE]"
                          : "opacity-45 hover:opacity-90"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
