import { DEMO_SHIPMENTS } from "./data";
import { TRACKING_STAGES, type TrackingShipment } from "./types";

export const formatPrice = (amount: number) =>
  `৳${amount.toLocaleString("en-US")}`;

export const normaliseReference = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "").toUpperCase();

export function findShipment(raw: string) {
  const key = normaliseReference(raw);
  if (!key) return undefined;
  return DEMO_SHIPMENTS.find((s) => normaliseReference(s.reference) === key);
}

export function getStageIndex(shipment: TrackingShipment) {
  return TRACKING_STAGES.findIndex((s) => s.id === shipment.stage);
}

export function getStage(shipment: TrackingShipment) {
  return TRACKING_STAGES[getStageIndex(shipment)];
}

export function getOrderTotal(shipment: TrackingShipment) {
  return (
    shipment.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) +
    shipment.deliveryFee
  );
}

export function getPieceCount(shipment: TrackingShipment) {
  return shipment.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function getDateLabel(shipment: TrackingShipment) {
  return shipment.stage === "delivered" ? "Delivered" : "Estimated";
}
