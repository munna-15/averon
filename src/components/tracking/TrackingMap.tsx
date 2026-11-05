"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import {
  applyAveronMapTheme,
  getMapStyleUrl,
  MAP_PALETTE,
} from "@/features/tracking/map-style";
import { locateOnRoute, routeBounds, toLine } from "@/features/tracking/route";
import type { TrackingShipment } from "@/features/tracking/types";
import { FallbackMap } from "./FallbackMap";
import styles from "./tracking.module.css";

// Each name is a literal so Next.js can inline it at build time.
const MAPTILER_KEY =
  process.env.NEXT_PUBLIC_MAPTILER_KEY ??
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY ??
  process.env.NEXT_PUBLIC_MAP_TILER_KEY;

const NO_KEY_REASON =
  "No MapTiler key found. Add NEXT_PUBLIC_MAPTILER_KEY to .env.local and restart `npm run dev`.";

const SHOW_REASON = process.env.NODE_ENV !== "production";

interface TrackingMapProps {
  shipment: TrackingShipment | null;
  /** Pixels at the bottom covered by the mobile sheet. 0 on desktop. */
  bottomInset: number;
}

type MapLibreModule = typeof import("maplibre-gl");

type MapStatus =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "unavailable"; reason: string };

function makeEl(className: string, html = "") {
  const el = document.createElement("div");
  el.className = className;
  el.innerHTML = html;
  return el;
}

function addRouteLayers(map: MapLibreMap) {
  const layers: Array<[string, string]> = [
    ["route-remaining", MAP_PALETTE.routeRemaining],
    ["route-done", MAP_PALETTE.routeDone],
  ];
  for (const [id, color] of layers) {
    if (map.getSource(id)) continue;
    map.addSource(id, { type: "geojson", data: toLine([]) });
    map.addLayer({
      id: `${id}-line`,
      type: "line",
      source: id,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": 4.5 },
    });
  }
}

export function TrackingMap({ shipment, bottomInset }: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Marker[]>([]);
  const mlRef = useRef<MapLibreModule | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [status, setStatus] = useState<MapStatus>(() =>
    MAPTILER_KEY
      ? { state: "loading" }
      : { state: "unavailable", reason: NO_KEY_REASON },
  );

  // Create the map once.
  useEffect(() => {
    const key = MAPTILER_KEY;
    const container = containerRef.current;
    if (!key || !container) return;

    let cancelled = false;
    let instance: MapLibreMap | null = null;
    let sizeObserver: ResizeObserver | undefined;
    let styleLoaded = false;
    let lastError = "";

    const hasSize = () =>
      container.clientWidth > 0 && container.clientHeight > 0;

    const fail = (reason: string) => {
      if (cancelled || styleLoaded) return;
      console.warn(`[tracking-map] ${reason}`);
      sizeObserver?.disconnect();
      instance?.remove();
      instance = null;
      markersRef.current = [];
      setMap(null);
      setStatus({ state: "unavailable", reason });
    };

    const waitForSize = () =>
      new Promise<void>((resolve) => {
        if (hasSize()) {
          resolve();
          return;
        }
        sizeObserver = new ResizeObserver(() => {
          if (hasSize()) {
            sizeObserver?.disconnect();
            resolve();
          }
        });
        sizeObserver.observe(container);
      });

    const timeout = setTimeout(() => {
      if (styleLoaded) return;
      fail(
        hasSize()
          ? `Map style did not load within 12s. ${lastError}`.trim()
          : "Map container has zero width/height (CSS layout problem).",
      );
    }, 12000);

    (async () => {
      try {
        // Handle both ESM (named exports) and CJS (default export) module shapes.
        const raw =
          (await import("maplibre-gl")) as unknown as MapLibreModule & {
            default?: MapLibreModule;
          };
        const ml: MapLibreModule =
          typeof raw.Map === "function" ? raw : (raw.default as MapLibreModule);
          ml.setWorkerUrl("/maplibre-gl-worker.mjs");
        if (cancelled) return;
        mlRef.current = ml;

        // Never construct the map into a 0×0 element.
        await waitForSize();
        if (cancelled) return;

        const created = new ml.Map({
          container,
          style: getMapStyleUrl(key),
          center: [90.39, 23.77],
          zoom: 12,
          attributionControl: false,
          cooperativeGestures: true,
          dragRotate: false,
        });
        instance = created;
        created.addControl(
          new ml.AttributionControl({ compact: true }),
          "top-left",
        );
        created.touchZoomRotate.disableRotation();

        created.on("style.load", () => {
          if (cancelled) return;
          try {
            applyAveronMapTheme(created);
            addRouteLayers(created);
          } catch (error) {
            console.warn("[tracking-map] theme/route setup failed", error);
          }
          styleLoaded = true;
          clearTimeout(timeout);
          setMap(created);
          setStatus({ state: "ready" });
          requestAnimationFrame(() => {
            if (!hasSize()) {
              console.warn(
                "[tracking-map] style loaded but container has zero size",
              );
            }
          });
        });

        // Attaching a listener stops MapLibre logging errors itself, so log here.
        created.on("error", (event) => {
          const err = event.error as (Error & { status?: number }) | undefined;
          lastError = err?.message ?? String(event);
          console.error("[tracking-map]", lastError, err);
          if (!styleLoaded && (err?.status === 401 || err?.status === 403)) {
            fail(
              `MapTiler rejected the request (HTTP ${err.status}). Check the key and its allowed domains.`,
            );
          } else if (!styleLoaded && err?.status === 404) {
            fail(
              "Map style not found (HTTP 404). Check NEXT_PUBLIC_MAPTILER_STYLE.",
            );
          }
        });
      } catch (error) {
        fail(
          error instanceof Error ? error.message : "Map failed to initialise.",
        );
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      sizeObserver?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      instance?.remove();
      setMap(null);
    };
  }, []);

  // Keep the canvas in sync with its container (breakpoints, sheet height).
  useEffect(() => {
    const el = containerRef.current;
    if (!map || !el || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.resize());
    });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);

  // Draw route + markers whenever the shipment changes.
  useEffect(() => {
    const ml = mlRef.current;
    if (!map || !ml || !shipment) return;
    if (!map.getSource("route-done")) return;

    const pos = locateOnRoute(shipment.route, shipment.progress);
    (map.getSource("route-done") as GeoJSONSource).setData(toLine(pos.done));
    (map.getSource("route-remaining") as GeoJSONSource).setData(
      toLine(pos.remaining),
    );

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const add = (el: HTMLElement, lngLat: [number, number]) => {
      markersRef.current.push(
        new ml.Marker({ element: el, anchor: "center" })
          .setLngLat(lngLat)
          .addTo(map),
      );
    };

    const origin = makeEl(styles.originMarker);
    origin.setAttribute("aria-label", "Origin: AVÉRON atelier");
    add(origin, shipment.route[0]);

    const destination = makeEl(styles.destMarker);
    destination.setAttribute("aria-label", "Destination");
    add(destination, shipment.route[shipment.route.length - 1]);

    if (shipment.progress < 1) {
      const current = makeEl(
        styles.currentMarker,
        `<span class="${styles.currentArrow}" style="transform:rotate(${pos.bearing.toFixed(0)}deg)"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3 L19.5 20 L12 15.8 L4.5 20 Z" fill="#fff"/></svg></span>`,
      );
      current.setAttribute("aria-label", "Sample parcel position");
      add(current, pos.coordinates);
    }
  }, [map, shipment]);

  const fit = useCallback(
    (animate: boolean) => {
      if (!map || !shipment) return;
      const height = map.getContainer().clientHeight;
      const bottom = Math.max(40, Math.min(bottomInset, height - 220));
      map.fitBounds(routeBounds(shipment.route), {
        padding: { top: 100, bottom, left: 56, right: 56 },
        maxZoom: 15.5,
        duration: animate ? 700 : 0,
      });
    },
    [map, shipment, bottomInset],
  );

  useEffect(() => {
    const t = setTimeout(() => fit(true), 120);
    return () => clearTimeout(t);
  }, [fit]);

  const reason = status.state === "unavailable" ? status.reason : null;

  return (
    <div className={styles.mapShell} data-map-state={status.state}>
      {reason !== null ? (
        <>
          <FallbackMap shipment={shipment} />
          <span className={styles.mapNote} role="status">
            {SHOW_REASON ? `Illustrative map — ${reason}` : "Illustrative map"}
          </span>
        </>
      ) : (
        <>
          {/* Inline position beats maplibre-gl.css (.maplibregl-map { position: relative }). */}
          <div
            ref={containerRef}
            className={styles.mapCanvas}
            style={{ position: "absolute", inset: 0 }}
            role="region"
            aria-label="Sample route map"
          />
          {status.state === "loading" ? (
            <span className={styles.mapLoading}>Loading map…</span>
          ) : null}
          <div className={styles.mapControls}>
            <button
              type="button"
              className={styles.roundBtn}
              onClick={() => map?.zoomIn()}
              aria-label="Zoom in"
              disabled={!map}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.roundBtn}
              onClick={() => map?.zoomOut()}
              aria-label="Zoom out"
              disabled={!map}
            >
              <Minus size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.roundBtn}
              onClick={() => fit(true)}
              aria-label="Fit route"
              disabled={!map}
            >
              <LocateFixed size={18} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
