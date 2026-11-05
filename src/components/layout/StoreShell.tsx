import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { FloatingAI } from "@/components/layout/FloatingAI";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { StoreHeaderVisibility } from "@/components/layout/StoreHeaderVisibility";

import { CartProvider } from "@/features/cart/CartProvider";
import { SavedItemsProvider } from "@/features/cart/SavedItemsProvider";
import { WishlistProvider } from "@/features/wishlist/WishlistProvider";
import { SearchProvider } from "@/features/search/SearchProvider";
import Footer from "./footer/Footer";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        <SavedItemsProvider>
          <SearchProvider>
            <StoreHeaderVisibility>
              <>
                <AnnouncementBar />
                <SiteHeader />
              </>
            </StoreHeaderVisibility>

            <GlobalSearch />

            <main>{children}</main>

            <Footer/>

            <FloatingCart />
            <CartDrawer />
            <FloatingAI />
            <FloatingContact />
          </SearchProvider>
        </SavedItemsProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
