"use client";

import clsx from "clsx";
import { ArrowLeft, EllipsisVertical, PackageSearch } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SHIPMENTS } from "@/features/tracking/data";
import { findShipment } from "@/features/tracking/format";
import { ProductThumb } from "./ProductThumb";
import { PanelSkeleton, ShipmentPanel } from "./ShipmentPanel";
import { ShipmentCard } from "./ShipmentCard";
import { StatusPill } from "./StatusPill";
import { TrackingMap } from "./TrackingMap";
import { TrackingSearch } from "./TrackingSearch";
import styles from "./tracking.module.css";

type Phase = "ready" | "loading" | "empty";

const SAMPLE_REFERENCES = DEMO_SHIPMENTS.map((s) => s.reference);

export function TrackingExperience() {
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [activeId, setActiveId] = useState(DEMO_SHIPMENTS[0].id);
  const [phase, setPhase] = useState<Phase>("ready");
  // Mobile sheet: expanded by default, like the reference. Desktop ignores it.
  const [sheetOpen, setSheetOpen] = useState(true);
  const [panelHeight, setPanelHeight] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  const active =
    DEMO_SHIPMENTS.find((s) => s.id === activeId) ?? DEMO_SHIPMENTS[0];

  const run = useCallback((raw: string, directId?: string) => {
    if (timer.current) clearTimeout(timer.current);
    const match = directId
      ? DEMO_SHIPMENTS.find((s) => s.id === directId)
      : findShipment(raw);

    setLastQuery(raw.trim());
    if (!directId && !raw.trim()) {
      setPhase("empty");
      return;
    }
    setPhase("loading");
    timer.current = setTimeout(
      () => {
        if (match) {
          setActiveId(match.id);
          setSheetOpen(true);
          setPhase("ready");
        } else {
          setPhase("empty");
        }
      },
      directId ? 350 : 800,
    );
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // The panel only covers the map while it is an absolute bottom sheet (mobile).
  // On desktop it is a separate bar, so the map inset is 0.
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () =>
      setPanelHeight(
        getComputedStyle(el).position === "absolute" ? el.offsetHeight : 0,
      );
    measure();
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const pick = (reference: string, id?: string) => {
    setQuery(reference);
    run(reference, id);
  };

  return (
    <div className={styles.root}>
      <div className={styles.page}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Order tracking</p>
          <h1 className={styles.title}>
            Where is your <em>parcel</em>?
          </h1>
          <p className={styles.lede}>
            Follow your AVÉRON order from our atelier to your door. This page
            shows sample orders.
          </p>
          <TrackingSearch
            value={query}
            onChange={setQuery}
            onSubmit={() => run(query)}
            busy={phase === "loading"}
            samples={SAMPLE_REFERENCES}
            onPickSample={(reference) => pick(reference)}
          />
          <p className="sr-only" role="status">
            {phase === "loading"
              ? "Looking up parcel"
              : phase === "empty"
                ? "No matching parcel"
                : `Showing ${active.reference}`}
          </p>
        </header>

        <section className={styles.current} aria-labelledby="current-heading">
          <div className={styles.sectionHead}>
            <h2 id="current-heading">Current shipment</h2>
            <span className={styles.demoChip}>Sample data</span>
          </div>
          {phase === "loading" ? (
            <div className={styles.card} aria-busy="true">
              <div
                className={clsx(styles.skel)}
                style={{ height: 56, width: "70%" }}
              />
              <div
                className={clsx(styles.skel)}
                style={{ height: 22, marginTop: 28 }}
              />
              <div
                className={clsx(styles.skel)}
                style={{ height: 44, marginTop: 26, width: "65%" }}
              />
            </div>
          ) : phase === "empty" ? (
            <div className={clsx(styles.card, styles.empty)}>
              <PackageSearch size={28} aria-hidden="true" />
              <p className={styles.emptyTitle}>
                {lastQuery
                  ? `No sample parcel for “${lastQuery}”`
                  : "Enter an order reference"}
              </p>
              <p className={styles.emptyText}>
                Try one of the sample references:
              </p>
              <div className={styles.hints}>
                {SAMPLE_REFERENCES.map((reference) => (
                  <button
                    key={reference}
                    type="button"
                    className={styles.hintChip}
                    onClick={() => pick(reference)}
                  >
                    {reference}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ShipmentCard shipment={active} />
          )}
        </section>

        <section className={styles.mapBlock} aria-label="Location tracking">
          <TrackingMap
            shipment={active}
            bottomInset={panelHeight > 0 ? panelHeight + 24 : 0}
          />

          <div className={styles.mapTop}>
            <button
              type="button"
              className={clsx(styles.roundBtn, styles.mobileOnly)}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to search"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className={styles.mapTitleWrap}>
              <h2 className={styles.mapTitle}>Location Tracking</h2>
              <span className={styles.demoTag}>
                Sample route · not live GPS
              </span>
            </div>
            <button
              type="button"
              className={clsx(styles.roundBtn, styles.mobileOnly)}
              onClick={() => setSheetOpen((v) => !v)}
              aria-label="Toggle shipment details"
            >
              <EllipsisVertical size={18} aria-hidden="true" />
            </button>
          </div>

          {phase === "empty" ? (
            <div className={styles.mapEmpty}>
              <p>No parcel selected</p>
              <span>Search a sample reference to see its route.</span>
            </div>
          ) : null}

          <div ref={slotRef} className={styles.panelSlot}>
            {phase === "loading" ? (
              <PanelSkeleton />
            ) : phase === "empty" ? null : (
              <ShipmentPanel
                key={active.id}
                shipment={active}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
              />
            )}
          </div>
        </section>

        <section className={styles.recent} aria-labelledby="recent-heading">
          <div className={styles.sectionHead}>
            <h2 id="recent-heading">Recent shipments</h2>
            <span className={styles.demoChip}>Sample data</span>
          </div>
          <ul className={styles.recentList}>
            {DEMO_SHIPMENTS.map((shipment) => {
              const selected = shipment.id === active.id && phase !== "empty";
              return (
                <li key={shipment.id}>
                  <button
                    type="button"
                    className={clsx(
                      styles.recentItem,
                      selected && styles.recentActive,
                    )}
                    aria-pressed={selected}
                    onClick={() => pick(shipment.reference, shipment.id)}
                  >
                    <ProductThumb
                      key={shipment.items[0].image}
                      src={shipment.items[0].image}
                      alt=""
                      className={styles.recentThumb}
                      sizes="48px"
                    />
                    <span className={styles.recentText}>
                      <span className={styles.recentId}>
                        {shipment.reference}
                      </span>
                      <span className={styles.recentName}>
                        {shipment.items[0].name}
                      </span>
                    </span>
                    <StatusPill stage={shipment.stage} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
