import { StoreShell } from "@/components/layout/StoreShell";
import { NotFoundView } from "@/components/not-found/NotFoundView";

/**
 * Global 404.
 *
 * Unmatched URLs are rendered by the ROOT not-found file, inside the root
 * layout only. The route-group layout (the one that renders <StoreShell>) is
 * not applied there, so we wrap the view in the same StoreShell. That gives
 * the existing Header and Footer exactly once, without copying either.
 */
export default function NotFound() {
  return (
    <StoreShell>
      <NotFoundView />
    </StoreShell>
  );
}
