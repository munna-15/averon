"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Check, Copy, ImageOff } from "lucide-react";

import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

import { formatOrderPrice } from "@/features/orders/lib/order-utils";
import { MOTION_QUERIES } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";

const STORAGE_KEY = "averon-orders";

const METHOD: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank transfer",
};

const PAYMENT: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_MESSAGE: Record<
  OrderStatus,
  { title: string; description: string }
> = {
  placed: {
    title: "Thank you for your order!",
    description: "Your order has been successfully received.",
  },
  confirmed: {
    title: "Your order is confirmed!",
    description: "Your order has been reviewed and confirmed.",
  },
  preparing: {
    title: "Your order is being prepared.",
    description: "Your selected pieces are being prepared.",
  },
  dispatched: {
    title: "Your order is on its way!",
    description: "Your order has been handed over for delivery.",
  },
  delivered: {
    title: "Your order has arrived!",
    description: "Your order has been delivered successfully.",
  },
  cancelled: {
    title: "This order was cancelled.",
    description: "The order details below are kept for your records.",
  },
};

const PANEL = "bg-ivory-soft p-6 sm:p-8";

const subscribeToOrders = (notify: () => void) => {
  window.addEventListener("storage", notify);

  return () => {
    window.removeEventListener("storage", notify);
  };
};

const readOrdersSnapshot = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const getServerOrdersSnapshot = () => null;
const noSubscribe = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    [
      "placed",
      "confirmed",
      "preparing",
      "dispatched",
      "delivered",
      "cancelled",
    ].includes(value)
  );
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    ["cod", "bkash", "nagad", "bank"].includes(value)
  );
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    typeof value === "string" &&
    ["pending", "paid", "failed", "refunded"].includes(value)
  );
}

function isValidOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;

  const order = value as Partial<Order>;

  if (
    typeof order.id !== "string" ||
    typeof order.orderNumber !== "string" ||
    typeof order.createdAt !== "string" ||
    typeof order.updatedAt !== "string" ||
    !isOrderStatus(order.status) ||
    !isPaymentMethod(order.paymentMethod) ||
    !isPaymentStatus(order.paymentStatus)
  ) {
    return false;
  }

  if (
    !order.customer ||
    typeof order.customer.fullName !== "string" ||
    typeof order.customer.phone !== "string" ||
    (order.customer.email !== undefined &&
      typeof order.customer.email !== "string")
  ) {
    return false;
  }

  if (
    !order.address ||
    typeof order.address.district !== "string" ||
    typeof order.address.area !== "string" ||
    typeof order.address.address !== "string" ||
    !["dhaka", "outside"].includes(order.address.deliveryArea)
  ) {
    return false;
  }

  if (
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    !order.items.every(
      (item) =>
        !!item &&
        typeof item.productId === "string" &&
        typeof item.slug === "string" &&
        typeof item.name === "string" &&
        typeof item.image === "string" &&
        typeof item.color === "string" &&
        typeof item.size === "string" &&
        typeof item.quantity === "number" &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        typeof item.unitPrice === "number" &&
        Number.isFinite(item.unitPrice) &&
        typeof item.lineTotal === "number" &&
        Number.isFinite(item.lineTotal) &&
        (item.sku === undefined || typeof item.sku === "string"),
    )
  ) {
    return false;
  }

  if (
    !order.pricing ||
    order.pricing.currency !== "BDT" ||
    !Number.isFinite(order.pricing.subtotal) ||
    !Number.isFinite(order.pricing.deliveryCharge) ||
    !Number.isFinite(order.pricing.discount) ||
    !Number.isFinite(order.pricing.total) ||
    !Array.isArray(order.timeline) ||
    (order.customerNote !== undefined && typeof order.customerNote !== "string")
  ) {
    return false;
  }

  return true;
}

function findOrder(raw: string | null, reference: string | null): Order | null {
  if (!raw || !reference) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return null;

    return (
      parsed.find(
        (item): item is Order =>
          isValidOrder(item) && item.orderNumber === reference,
      ) ?? null
    );
  } catch {
    return null;
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}


function OrderImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-stone ${className}`}>
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-ink/35">
          <ImageOff size={22} strokeWidth={1.2} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}


export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("order")?.trim() ?? null;

  const hydrated = useSyncExternalStore(
    noSubscribe,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  const rawOrders = useSyncExternalStore(
    subscribeToOrders,
    readOrdersSnapshot,
    getServerOrdersSnapshot,
  );

  const order = useMemo(
    () => findOrder(rawOrders, reference),
    [rawOrders, reference],
  );

  if (!hydrated) {
    return (
      <div className="min-h-[60svh]" aria-busy="true" aria-hidden="true" />
    );
  }

  if (!order) {
    return <NotFound reference={reference} />;
  }

  return <OrderView key={order.orderNumber} order={order} />;
}

function NotFound({ reference }: { reference: string | null }) {
  return (
    <div className="bg-ivory px-5 py-20 sm:px-8 md:py-28">
      <div className={`mx-auto max-w-xl text-center ${PANEL}`}>
        <h1 className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-tight text-ink">
          {reference ? "We couldn’t find this order." : "No order reference."}
        </h1>

        <p className="mx-auto mt-4 max-w-[44ch] text-[14px] leading-relaxed text-ink/70">
          {reference
            ? "Orders are saved in the browser used at checkout, so this one may have been placed on another device or cleared from this one."
            : "Open this page from checkout, or use the link that includes your order reference."}
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center bg-ink px-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-ivory-soft transition-colors hover:bg-ink/90"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

function OrderView({ order }: { order: Order }) {
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const { pricing, address, customer } = order;
  const cancelled = order.status === "cancelled";
  const placed = formatDateTime(order.createdAt);

  const lead = order.items.find((item) => item.image.trim());
  const message = STATUS_MESSAGE[order.status];

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const copyReference = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(order.orderNumber);
      setCopied("done");
    } catch {
      setCopied("failed");
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setCopied("idle");
    }, 2200);
  };

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(MOTION_QUERIES.allowed, () => {
        gsap.from("[data-in]", {
          opacity: 0,
          y: 14,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      });

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="bg-ivory">
      <div className="mx-auto w-full max-w-[1040px] px-5 pb-20 pt-12 sm:px-8 md:pt-16 lg:pb-28 lg:pt-20">
        <header data-in className="text-center">
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-full border border-line bg-ivory-soft">
            {cancelled ? (
              <span className="text-lg leading-none text-ink">×</span>
            ) : (
              <Check
                size={21}
                strokeWidth={1.5}
                className="text-ink"
                aria-hidden="true"
              />
            )}
          </div>

          <h1 className="mx-auto max-w-[18ch] font-display text-[clamp(2rem,1.7rem+1.8vw,3rem)] font-normal leading-[1.1] text-ink">
            {message.title}
          </h1>

          <p className="mx-auto mt-4 max-w-[40ch] text-[14px] leading-relaxed text-ink/70">
            {message.description}
          </p>
        </header>

        <div
          data-in
          className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5"
        >
          <OrderImage
            src={lead?.image ?? ""}
            alt={lead ? `${lead.name}, ${lead.color}` : "Order product"}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="aspect-[4/5] md:aspect-auto md:min-h-[440px]"
          />

          <section aria-labelledby="oc-order" className={PANEL}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="oc-order"
                className="font-display text-[26px] leading-none text-ink"
              >
                Your order
              </h2>

              <button
                type="button"
                onClick={copyReference}
                aria-label={`Copy order reference ${order.orderNumber}`}
                className="inline-flex min-h-11 items-center gap-2 text-[12px] text-ink tabular-nums transition-opacity hover:opacity-60"
              >
                <span>#{order.orderNumber}</span>

                {copied === "done" ? (
                  <Check size={14} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Copy size={14} strokeWidth={1.25} aria-hidden="true" />
                )}

                <span
                  aria-live="polite"
                  className={
                    copied === "idle" ? "sr-only" : "text-[11px] text-muted"
                  }
                >
                  {copied === "done"
                    ? "Copied"
                    : copied === "failed"
                      ? "Copy unavailable"
                      : ""}
                </span>
              </button>
            </div>

            <ul className="mt-4 divide-y divide-line">
              {order.items.map((item, index) => (
                <li
                  key={`${item.productId}-${item.color}-${item.size}-${index}`}
                  className="flex gap-4 py-5"
                >
                  <OrderImage
                    src={item.image}
                    alt={item.name}
                    sizes="60px"
                    className="h-[76px] w-[60px] shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[16px] leading-snug text-ink">
                        {item.name}
                      </p>

                      <div className="shrink-0 text-right tabular-nums">
                        <p className="text-[13px] text-muted">
                          {formatOrderPrice(item.lineTotal)}
                        </p>

                        {item.quantity > 1 && (
                          <p className="mt-0.5 text-[11px] text-muted">
                            {formatOrderPrice(item.unitPrice)} each
                          </p>
                        )}
                      </div>
                    </div>

                    <dl className="mt-3 grid gap-2 text-[12px]">
                      <div className="flex items-center gap-3">
                        <dt className="w-10 text-ink/70">Color:</dt>
                        <dd className="text-ink">{item.color}</dd>
                      </div>

                      <div className="flex items-center gap-3">
                        <dt className="w-10 text-ink/70">Size:</dt>
                        <dd className="inline-grid size-6 place-items-center rounded-full border border-ink text-[11px] text-ink">
                          {item.size}
                        </dd>
                      </div>

                      <div className="flex items-center gap-3">
                        <dt className="w-10 text-ink/70">Qty:</dt>
                        <dd className="text-ink">{item.quantity}</dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="grid gap-2.5 border-t border-line pt-5 text-[12.5px] tabular-nums">
              <div className="flex justify-between">
                <dt className="text-ink/80">Subtotal</dt>
                <dd className="text-ink">
                  {formatOrderPrice(pricing.subtotal)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-ink/80">Delivery</dt>
                <dd className="text-ink">
                  {formatOrderPrice(pricing.deliveryCharge)}
                </dd>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink/80">Discount</dt>
                  <dd className="text-ink">
                    −{formatOrderPrice(pricing.discount)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-display text-[15px] uppercase tracking-[0.06em] text-ink">
                Total
              </span>

              <span className="text-[15px] font-semibold text-ink tabular-nums">
                {formatOrderPrice(pricing.total)}
              </span>
            </div>
          </section>
        </div>

        <section
          data-in
          aria-label="Order information"
          className={`mt-4 grid gap-8 md:mt-5 ${PANEL} ${
            order.customerNote ? "md:grid-cols-3" : "md:grid-cols-2"
          }`}
        >
          <div>
            <h2 className="font-display text-[20px] leading-none text-ink">
              Order details
            </h2>

            <dl className="mt-4 grid gap-3 text-[13px]">
              {placed && (
                <div>
                  <dt className="text-ink/70">Order date</dt>
                  <dd className="mt-0.5 text-ink">{placed}</dd>
                </div>
              )}

              <div>
                <dt className="text-ink/70">Payment method</dt>
                <dd className="mt-0.5 text-ink">
                  {METHOD[order.paymentMethod]}
                </dd>
              </div>

              <div>
                <dt className="text-ink/70">Payment status</dt>
                <dd className="mt-0.5 text-ink">
                  {PAYMENT[order.paymentStatus]}
                  {order.paymentMethod === "cod" &&
                  order.paymentStatus === "pending"
                    ? ", payable on delivery"
                    : ""}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-[20px] leading-none text-ink">
              Delivery
            </h2>

            <address className="mt-4 text-[13px] not-italic leading-relaxed text-ink">
              <p>{customer.fullName}</p>
              <p className="mt-1">{address.address}</p>
              <p>
                {address.area}, {address.district}
              </p>
              <p className="mt-1 text-ink/70">
                {address.deliveryArea === "dhaka"
                  ? "Inside Dhaka"
                  : "Outside Dhaka"}
              </p>
              <p className="mt-3">{customer.phone}</p>

              {customer.email && <p className="break-all">{customer.email}</p>}
            </address>
          </div>

          {order.customerNote && (
            <div>
              <h2 className="font-display text-[20px] leading-none text-ink">
                Note
              </h2>

              <p className="mt-4 text-[13px] leading-relaxed text-ink">
                {order.customerNote}
              </p>
            </div>
          )}
        </section>

        <div data-in className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center bg-ink px-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-ivory-soft transition-colors hover:bg-ink/90"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
