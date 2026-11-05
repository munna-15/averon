import { Suspense } from "react";

import { OrderConfirmation } from "@/features/order-confirmation/OrderConfirmation";

function OrderConfirmationFallback() {
  return (
    <div
      className="container-editorial min-h-[60svh] py-20"
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <div className="size-14 animate-pulse rounded-full bg-stone" />
          <div className="h-3 w-32 animate-pulse bg-stone" />
          <div className="h-12 w-72 max-w-full animate-pulse bg-stone" />
          <div className="h-4 w-80 max-w-full animate-pulse bg-stone" />
        </div>

        <div className="h-28 animate-pulse bg-stone" />
        <div className="h-64 animate-pulse bg-stone" />
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationFallback />}>
      <OrderConfirmation />
    </Suspense>
  );
}
