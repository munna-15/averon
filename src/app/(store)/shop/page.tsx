import { Suspense } from "react";

import { ShopPageContent } from "@/features/shop/components/ShopPageContent";

function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="h-3 w-32 animate-pulse bg-[#E8E4DD]" />
        <div className="mt-6 h-12 w-64 animate-pulse bg-[#E8E4DD]" />
        <div className="mt-5 h-4 w-80 max-w-full animate-pulse bg-[#E8E4DD]" />

        <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-[3/4] animate-pulse bg-[#E8E4DD]" />
              <div className="mt-4 h-3 w-2/3 animate-pulse bg-[#E8E4DD]" />
              <div className="mt-2 h-3 w-1/3 animate-pulse bg-[#E8E4DD]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopPageContent />
    </Suspense>
  );
}
