"use client";

import clsx from "clsx";
import { MessageCircle, Phone } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  formatPrice,
  getDateLabel,
  getOrderTotal,
  getPieceCount,
  getStage,
  getStageIndex,
} from "@/features/tracking/format";
import type { TrackingShipment } from "@/features/tracking/types";
import { ProductThumb } from "./ProductThumb";
import { ProgressTrack } from "./ProgressTrack";
import { StatusPill } from "./StatusPill";
import styles from "./tracking.module.css";

interface ShipmentPanelProps {
  shipment: TrackingShipment;
  /** Mobile sheet state. Ignored on desktop, where the panel is a fixed bar. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DRAG_THRESHOLD = 36;

export function ShipmentPanel({
  shipment,
  open,
  onOpenChange,
}: ShipmentPanelProps) {
  const detailsId = useId();
  const [notice, setNotice] = useState<string | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragged = useRef(false);

  const stageIndex = getStageIndex(shipment);
  const first = shipment.items[0];
  const extra = shipment.items.length - 1;
  const pieces = getPieceCount(shipment);
  const productLabel = `${first.name}${extra > 0 ? ` +${extra} more` : ""}`;
  const { courier } = shipment;

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY;
    dragged.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStartY.current === null) return;
    if (Math.abs(event.clientY - dragStartY.current) > 8)
      dragged.current = true;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStartY.current;
    dragStartY.current = null;
    if (start === null) return;
    const delta = event.clientY - start;
    if (delta > DRAG_THRESHOLD) onOpenChange(false);
    else if (delta < -DRAG_THRESHOLD) onOpenChange(true);
  };
  const onPointerCancel = () => {
    dragStartY.current = null;
  };
  const onHandleClick = () => {
    // A completed drag already changed the state; ignore the click that follows it.
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    onOpenChange(!open);
  };

  return (
    <section
      className={clsx(styles.panel, open && styles.panelOpen)}
      aria-label="Shipment details"
    >
      <button
        type="button"
        className={styles.sheetHandle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onHandleClick}
        aria-expanded={open}
        aria-controls={detailsId}
      >
        <span className={styles.handleBar} />
        <span className="sr-only">
          {open ? "Collapse" : "Expand"} shipment details
        </span>
      </button>

      <div className={styles.summary}>
        <div className={styles.panelTop}>
          <div className={styles.panelIdent}>
            <ProductThumb
              key={first.image}
              src={first.image}
              alt=""
              className={styles.panelThumb}
              sizes="56px"
            />
            <div>
              <p className={styles.label}>Tracking ID</p>
              <p className={styles.panelId}>{shipment.reference}</p>
            </div>
          </div>
          <div className={styles.alignEnd}>
            <p className={styles.label}>Status</p>
            <StatusPill stage={shipment.stage} onDark />
          </div>
        </div>

        <ProgressTrack
          stageIndex={stageIndex}
          variant="dark"
          chip={shipment.etaChip}
        />
        <p className={styles.stageLine}>
          <strong>{getStage(shipment).label}</strong> · {shipment.statusNote}
        </p>

        <div className={styles.datesRow}>
          <div>
            <p className={styles.label}>Created, {shipment.createdOn}</p>
            <p className={styles.value}>
              {shipment.origin.area}, {shipment.origin.city}
            </p>
          </div>
          <div className={styles.alignEnd}>
            <p className={styles.label}>
              {getDateLabel(shipment)}, {shipment.estimatedOn}
            </p>
            <p className={styles.value}>
              {shipment.destination.area}, {shipment.destination.city}
            </p>
          </div>
        </div>
      </div>

      <div id={detailsId} className={styles.panelDetails}>
        <div className={styles.detailsInner}>
          {/* Desktop details bar */}
          <div className={styles.factsDesktop}>
            <dl className={styles.factsGrid}>
              <Fact label="Customer" value={shipment.customerName} />
              <Fact
                label="Order total"
                value={formatPrice(getOrderTotal(shipment))}
              />
              <Fact label="Product" value={productLabel} clamp />
              <Fact
                label="Parcel"
                value={`${shipment.parcels} parcel · ${pieces} pc · ${shipment.weightKg} kg`}
              />
              <Fact label="Payment" value={shipment.paymentMethod} />
              <Fact
                label="Delivery fee"
                value={
                  shipment.deliveryFee === 0
                    ? "Free"
                    : formatPrice(shipment.deliveryFee)
                }
              />
            </dl>
          </div>

          {/* Mobile sheet: grid + product photo, as in the reference */}
          <div className={styles.factsMobile}>
            <dl className={styles.factList}>
              <Fact
                label="From"
                value={`${shipment.origin.area}, ${shipment.origin.city}`}
              />
              <Fact
                label="To"
                value={`${shipment.destination.area}, ${shipment.destination.city}`}
              />
              <Fact label="Customer" value={shipment.customerName} />
              <Fact
                label="Order total"
                value={formatPrice(getOrderTotal(shipment))}
              />
              <Fact
                label="Quantity"
                value={`${pieces} ${pieces === 1 ? "piece" : "pieces"}`}
              />
              <Fact label="Weight" value={`${shipment.weightKg} kg`} />
            </dl>
            <figure className={styles.parcelImg}>
              <ProductThumb
                key={first.image}
                src={first.image}
                alt={first.name}
                className={styles.fill}
                sizes="140px"
              />
              <figcaption className={styles.parcelCaption}>
                {productLabel}
              </figcaption>
            </figure>
          </div>

          <div className={styles.courierWrap}>
            <div className={styles.courier}>
              <span className={styles.avatar} aria-hidden="true">
                {courier ? courier.initials : "AV"}
              </span>
              <div className={styles.courierText}>
                <p className={styles.courierName}>
                  {courier ? courier.name : "Courier not assigned yet"}
                </p>
                <p className={styles.courierRole}>
                  {courier ? courier.role : "Assigned once your parcel ships"}
                </p>
              </div>
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.callBtn)}
                disabled={!courier}
                aria-label="Call courier (demo)"
                onClick={() =>
                  setNotice("Demo only — no courier line is connected.")
                }
              >
                <Phone size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={clsx(styles.actionBtn, styles.chatBtn)}
                disabled={!courier}
                aria-label="Message courier (demo)"
                onClick={() =>
                  setNotice("Demo only — messaging is not connected.")
                }
              >
                <MessageCircle size={18} aria-hidden="true" />
              </button>
            </div>
            {notice ? (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({
  label,
  value,
  clamp = false,
}: {
  label: string;
  value: string;
  clamp?: boolean;
}) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd className={clamp ? styles.clamp : undefined}>{value}</dd>
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <section
      className={styles.panel}
      aria-label="Loading shipment details"
      aria-busy="true"
    >
      <span className={styles.handleBar} />
      <div className={styles.summary}>
        <div
          className={clsx(styles.skel, styles.skelDark)}
          style={{ height: 44, width: "60%" }}
        />
        <div
          className={clsx(styles.skel, styles.skelDark)}
          style={{ height: 22, marginTop: 22 }}
        />
        <div
          className={clsx(styles.skel, styles.skelDark)}
          style={{ height: 16, width: "70%", marginTop: 16 }}
        />
        <div
          className={clsx(styles.skel, styles.skelDark)}
          style={{ height: 48, marginTop: 20 }}
        />
      </div>
    </section>
  );
}
