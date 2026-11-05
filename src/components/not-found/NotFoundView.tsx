import Link from "next/link";
import { ShatterBackdrop } from "./ShatterBackdrop";
import styles from "./not-found.module.css";

/**
 * Route targets. Adjust here if your store uses different paths.
 * HOME is "/"; SHOP should point at your main product listing.
 */
const HOME_HREF = "/";
const SHOP_HREF = "/shop";

/**
 * Renders only the page body. The global AVERON Header/Footer come from the
 * existing StoreShell, so this component never renders its own navigation.
 */
export function NotFoundView() {
  return (
    <section className={styles.stage} aria-labelledby="not-found-title">
      <ShatterBackdrop />

      <div className={styles.content}>
        <p className={styles.eyebrow}>This page has gone missing</p>

        <h1 id="not-found-title" className={styles.number}>
          <span aria-hidden="true">404</span>
          <span className={styles.srOnly}>Error 404: page not found</span>
        </h1>

        <p className={styles.copy}>
          Sorry, the page you&rsquo;re looking for doesn&rsquo;t exist or may
          have been moved.
        </p>

        <div className={styles.actions}>
          <Link href={HOME_HREF} className={`${styles.button} ${styles.primary}`}>
            Return Home
          </Link>
          <Link href={SHOP_HREF} className={`${styles.button} ${styles.secondary}`}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
