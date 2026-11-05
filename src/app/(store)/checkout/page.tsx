"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/features/cart/CartProvider";
import {
  getProductBySlug,
  getColorVariant,
  getSizeVariant,
} from "@/features/products/lib/new-arrival-utils";
import {
  calculateOrderPricing,
  createInitialOrderTimeline,
  generateOrderNumber,
} from "@/features/orders/lib/order-utils";

import type { Order } from "@/types/order";

type DeliveryArea = "dhaka" | "outside";
type PaymentMethod = "cod";

interface CheckoutItem {
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

const DELIVERY_CHARGES: Record<DeliveryArea, number> = {
  dhaka: 70,
  outside: 120,
};

const ORDER_STORAGE_KEY = "averon-orders";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount / 100);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { items: cartItems, hydrated: cartHydrated, clearCart } = useCart();

  const productSlug = searchParams.get("product");
  const colorId = searchParams.get("color");
  const selectedSize = searchParams.get("size");

  const rawQuantity = Number(searchParams.get("quantity") || 1);
  const isBuyNow = Boolean(productSlug);

  const buyNowItem = useMemo<CheckoutItem | null>(() => {
    if (!productSlug || !colorId || !selectedSize) return null;

    const product = getProductBySlug(productSlug);

    if (!product || product.status !== "published") return null;

    const color = getColorVariant(product, colorId);
    if (!color) return null;

    const size = getSizeVariant(color, selectedSize);
    if (!size) return null;

    const available =
      size.stock !== undefined ? size.stock > 0 : size.available === true;

    if (!available) return null;

    const quantity = Number.isSafeInteger(rawQuantity)
      ? Math.max(1, rawQuantity)
      : 1;

    if (size.stock !== undefined && quantity > size.stock) return null;

    const image = color.images[0]?.src;
    if (!image) return null;

    return {
      key: `${product.slug}-${color.id}-${selectedSize}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      color: color.name,
      size: selectedSize,
      price: product.price.amount,
      qty: quantity,
    };
  }, [productSlug, colorId, selectedSize, rawQuantity]);

  const checkoutItems = useMemo<CheckoutItem[]>(() => {
    if (isBuyNow) return buyNowItem ? [buyNowItem] : [];

    return cartItems.map((item) => ({ ...item }));
  }, [isBuyNow, buyNowItem, cartItems]);

  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>("dhaka");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    district: "",
    area: "",
    address: "",
    orderNote: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  const deliveryCharge = DELIVERY_CHARGES[deliveryArea] * 100;
  const total = subtotal + deliveryCharge;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
      submit: "",
    }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (form.fullName.trim().length < 3) {
      nextErrors.fullName = "Please enter your full name.";
    }

    const normalizedPhone = form.phone.replace(/[\s-]/g, "");

    if (!/^(\+?88)?01[3-9]\d{8}$/.test(normalizedPhone)) {
      nextErrors.phone = "Enter a valid Bangladeshi mobile number.";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.district.trim()) {
      nextErrors.district = "Please enter your district.";
    }

    if (!form.area.trim()) {
      nextErrors.area = "Please enter your area or city.";
    }

    if (form.address.trim().length < 8) {
      nextErrors.address = "Please enter your complete delivery address.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (submitting || !validateForm()) return;

    if (checkoutItems.length === 0) {
      setErrors({
        submit: "Your checkout has no valid items. Please review your bag.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const orderNumber = generateOrderNumber();

      const pricing = calculateOrderPricing(subtotal, deliveryArea);

      const order: Order = {
        id: crypto.randomUUID(),
        orderNumber,

        customer: {
          fullName: form.fullName.trim(),
          phone: form.phone.replace(/[\s-]/g, ""),
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
        },

        address: {
          district: form.district.trim(),
          area: form.area.trim(),
          address: form.address.trim(),
          deliveryArea,
        },

        items: checkoutItems.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
          unitPrice: item.price,
          quantity: item.qty,
          lineTotal: item.price * item.qty,
        })),

        pricing,

        paymentMethod,
        paymentStatus: "pending",

        status: "placed",
        timeline: createInitialOrderTimeline(now),

        ...(form.orderNote.trim()
          ? { customerNote: form.orderNote.trim() }
          : {}),

        createdAt: now,
        updatedAt: now,
      };

      const existingOrders: Order[] = JSON.parse(
        localStorage.getItem(ORDER_STORAGE_KEY) || "[]",
      );

      if (!Array.isArray(existingOrders)) {
        throw new Error("Invalid local order storage.");
      }

      localStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify([order, ...existingOrders]),
      );

      if (!isBuyNow) {
        clearCart();
      }

      router.push(
        `/order-confirmation?order=${encodeURIComponent(orderNumber)}`,
      );
    } catch {
      setSubmitting(false);

      setErrors({
        submit:
          "We couldn't save your order in this browser. Please try again.",
      });
    }
  };

  if (!cartHydrated && !isBuyNow) {
    return (
      <main className="min-h-screen bg-[#F4F0E8] px-5 py-20">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-9 w-64 rounded bg-[#E5DED2]" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_390px]">
            <div className="h-[650px] rounded bg-[#EAE4DA]" />
            <div className="h-[460px] rounded bg-[#EAE4DA]" />
          </div>
        </div>
      </main>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F4F0E8] px-5 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-[#DED8CD] text-[#777064]">
            <ShoppingBag size={25} strokeWidth={1.3} />
          </div>

          <h1 className="mt-6 text-[30px] font-bold tracking-[-0.04em] text-[#292823]">
            Nothing to checkout
          </h1>

          <p className="mt-3 text-[14px] leading-7 text-[#777064]">
            Your checkout is currently empty. Add something from our collection
            to continue.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-13 items-center justify-center bg-[#292823] px-8 text-[14px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#454239]"
          >
            Explore Collection
          </Link>
        </div>
      </main>
    );
  }

  const inputClass =
    "mt-2 h-[53px] w-full border border-[#DED8CD] bg-white px-4 text-[15px] text-[#292823] outline-none transition-colors placeholder:text-[#B1A99C] focus:border-[#8B7153]";

  const labelClass =
    "text-[14px] font-semibold tracking-[-0.01em] text-[#555047]";

  const errorClass = "mt-1.5 text-[14px] text-[#9D493E]";

  const sectionClass = "border border-[#E2DCD1] bg-white p-5 sm:p-7 lg:p-8";

  const sectionTitleClass =
    "text-[17px] font-bold tracking-[-0.02em] text-[#292823] sm:text-[18px]";

  const sectionDescriptionClass = "mt-1 text-[14px] leading-6 text-[#898274]";

  return (
    <main className="min-h-screen bg-[#F4F0E8] px-4 pb-20 pt-9 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-[#DED8CD] pb-7 sm:pb-8">
          <Link
            href={isBuyNow ? "/shop" : "/cart"}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#777064] transition-colors hover:text-[#292823]"
          >
            <ArrowLeft size={16} />
            {isBuyNow ? "Continue Shopping" : "Back to Bag"}
          </Link>

          <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.17em] text-[#8B7153]">
                AVÉRON / SECURE CHECKOUT
              </p>

              <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.045em] text-[#292823] sm:text-[34px]">
                Complete your order.
              </h1>

              <p className="mt-2 text-[14px] leading-6 text-[#777064]">
                A considered shopping experience, from selection to delivery.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[14px] font-medium text-[#777064]">
              <LockKeyhole size={16} />
              Secure checkout
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div className="space-y-6">
            <section className={sectionClass}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 flex-none place-items-center bg-[#F4F0E8] text-[#8B7153]">
                  <PackageCheck size={19} />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>Contact information</h2>
                  <p className={sectionDescriptionClass}>
                    Where can we reach you?
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelClass}>Full name *</span>
                  <input
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                  {errors.fullName && (
                    <p className={errorClass}>{errors.fullName}</p>
                  )}
                </label>

                <label>
                  <span className={labelClass}>Mobile number *</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="01XXXXXXXXX"
                    className={inputClass}
                  />
                  {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                </label>

                <label>
                  <span className={labelClass}>Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </label>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 flex-none place-items-center bg-[#F4F0E8] text-[#8B7153]">
                  <MapPin size={19} />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>Delivery address</h2>
                  <p className={sectionDescriptionClass}>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Delivery area *</span>

                  <div className="relative">
                    <select
                      value={deliveryArea}
                      onChange={(event) =>
                        setDeliveryArea(event.target.value as DeliveryArea)
                      }
                      className={`${inputClass} appearance-none pr-10`}
                    >
                      <option value="dhaka">Inside Dhaka</option>
                      <option value="outside">Outside Dhaka</option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#898274]"
                    />
                  </div>
                </label>

                <label>
                  <span className={labelClass}>District *</span>
                  <input
                    autoComplete="address-level1"
                    value={form.district}
                    onChange={(event) =>
                      updateField("district", event.target.value)
                    }
                    placeholder="e.g. Dhaka"
                    className={inputClass}
                  />
                  {errors.district && (
                    <p className={errorClass}>{errors.district}</p>
                  )}
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Area / City *</span>
                  <input
                    autoComplete="address-level2"
                    value={form.area}
                    onChange={(event) =>
                      updateField("area", event.target.value)
                    }
                    placeholder="e.g. Dhanmondi, Uttara, Savar"
                    className={inputClass}
                  />
                  {errors.area && <p className={errorClass}>{errors.area}</p>}
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Full delivery address *</span>
                  <textarea
                    autoComplete="street-address"
                    rows={3}
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="House, road, apartment, landmark..."
                    className="mt-2 w-full resize-y border border-[#DED8CD] bg-white px-4 py-3 text-[15px] leading-7 text-[#292823] outline-none transition-colors placeholder:text-[#B1A99C] focus:border-[#8B7153]"
                  />
                  {errors.address && (
                    <p className={errorClass}>{errors.address}</p>
                  )}
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Order note (optional)</span>
                  <textarea
                    rows={2}
                    value={form.orderNote}
                    onChange={(event) =>
                      updateField("orderNote", event.target.value)
                    }
                    placeholder="Any delivery instructions?"
                    className="mt-2 w-full resize-y border border-[#DED8CD] bg-white px-4 py-3 text-[15px] leading-7 text-[#292823] outline-none transition-colors placeholder:text-[#B1A99C] focus:border-[#8B7153]"
                  />
                </label>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 flex-none place-items-center bg-[#F4F0E8] text-[#8B7153]">
                  <Truck size={19} />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>Delivery method</h2>
                  <p className={sectionDescriptionClass}>
                    Standard home delivery
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border border-[#8B7153] bg-[#F8F5EF] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-5 flex-none place-items-center rounded-full border border-[#8B7153]">
                    <span className="size-2.5 rounded-full bg-[#8B7153]" />
                  </span>

                  <div>
                    <p className="text-[15px] font-semibold text-[#292823]">
                      Standard Delivery
                    </p>
                    <p className="mt-1 text-[14px] text-[#898274]">
                      {deliveryArea === "dhaka"
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}
                    </p>
                  </div>
                </div>

                <p className="text-[16px] font-bold text-[#292823]">
                  {formatPrice(deliveryCharge)}
                </p>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center gap-3">
                <div className="grid size-11 flex-none place-items-center bg-[#F4F0E8] text-[#8B7153]">
                  <LockKeyhole size={19} />
                </div>

                <div>
                  <h2 className={sectionTitleClass}>Payment method</h2>
                  <p className={sectionDescriptionClass}>
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                aria-pressed={paymentMethod === "cod"}
                className="mt-6 flex w-full items-center justify-between gap-4 border border-[#8B7153] bg-[#F8F5EF] p-4 text-left sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-5 flex-none place-items-center rounded-full border border-[#8B7153]">
                    <span className="size-2.5 rounded-full bg-[#8B7153]" />
                  </span>

                  <div>
                    <p className="text-[15px] font-semibold text-[#292823]">
                      Cash on Delivery
                    </p>
                    <p className="mt-1 text-[14px] leading-6 text-[#898274]">
                      Pay when your order arrives.
                    </p>
                  </div>
                </div>

                <Check size={19} className="flex-none text-[#8B7153]" />
              </button>

              <p className="mt-4 text-[14px] leading-6 text-[#898274]">
                bKash, Nagad and bank payment options will be introduced after
                payment gateway integration.
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="border border-[#E2DCD1] bg-white p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-5">
                <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#292823]">
                  Order summary
                </h2>

                <span className="text-[14px] font-medium text-[#898274]">
                  {checkoutItems.length}{" "}
                  {checkoutItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="max-h-[460px] space-y-5 overflow-y-auto py-6">
                {checkoutItems.map((item) => (
                  <div key={item.key} className="flex gap-4">
                    <div className="relative size-[100px] flex-none overflow-hidden bg-[#F4F0E8] sm:size-[108px]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="108px"
                        className="object-cover"
                      />

                      <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-[#292823] text-[12px] font-semibold text-white">
                        {item.qty}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 py-1">
                      <p className="line-clamp-2 text-[14px] font-semibold leading-6 text-[#292823]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-[14px] text-[#898274]">
                        {item.color} / {item.size}
                      </p>

                      <p className="mt-3 text-[15px] font-bold text-[#292823]">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-[#E8E2D8] pt-6">
                <div className="flex items-center justify-between gap-3 text-[15px]">
                  <span className="text-[#777064]">Subtotal</span>
                  <span className="font-semibold text-[#39372F]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[15px]">
                  <span className="text-[#777064]">Delivery</span>
                  <span className="font-semibold text-[#39372F]">
                    {formatPrice(deliveryCharge)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#E8E2D8] pt-5">
                  <span className="text-[16px] font-bold text-[#292823]">
                    Total
                  </span>

                  <span className="text-[22px] font-bold tracking-[-0.035em] text-[#292823]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {errors.submit && (
                <p
                  role="alert"
                  className="mt-5 text-[14px] leading-6 text-[#9D493E]"
                >
                  {errors.submit}
                </p>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-7 flex min-h-[56px] w-full items-center justify-center gap-3 bg-[#292823] px-5 text-[14px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-[#454239] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Place Order"}
                <LockKeyhole size={16} />
              </button>

              <div className="mt-5 flex items-start justify-center gap-2 text-center">
                <LockKeyhole
                  size={14}
                  className="mt-1 flex-none text-[#898274]"
                />

                <p className="max-w-[270px] text-[14px] leading-6 text-[#898274]">
                  Your information is stored locally in this demo until backend
                  order processing is connected.
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-[14px] leading-6 text-[#898274]">
              Need assistance?{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#625747] underline underline-offset-4"
              >
                Contact AVÉRON
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function CheckoutFallback() {
  return (
    <main className="min-h-screen bg-[#F4F0E8] px-5 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-36 rounded bg-[#E5DED2]" />

        <div className="mt-9 h-10 w-72 rounded bg-[#E5DED2]" />

        <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <div className="h-64 rounded bg-[#EAE4DA]" />
            <div className="h-80 rounded bg-[#EAE4DA]" />
            <div className="h-48 rounded bg-[#EAE4DA]" />
          </div>

          <div className="h-[460px] rounded bg-[#EAE4DA]" />
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
