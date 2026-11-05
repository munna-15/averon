import type { ReactNode } from "react";

/** Keep the shared store announcement and navigation visible on every route. */
export function StoreHeaderVisibility({ children }: { children: ReactNode }) {
  return children;
}
