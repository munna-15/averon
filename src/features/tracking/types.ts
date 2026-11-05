export type LngLat = [longitude: number, latitude: number];

export const TRACKING_STAGES = [
  { id: "confirmed", label: "Order confirmed", pill: "Confirmed" },
  { id: "processing", label: "Processing", pill: "Processing" },
  { id: "shipped", label: "Shipped", pill: "Shipped" },
  { id: "out_for_delivery", label: "Out for delivery", pill: "On the way" },
  { id: "delivered", label: "Delivered", pill: "Delivered" },
] as const;

export type TrackingStageId = (typeof TRACKING_STAGES)[number]["id"];

export interface TrackingPlace {
  label: string;
  area: string;
  city: string;
  coordinates: LngLat;
}

export interface TrackingItem {
  id: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface TrackingCourier {
  name: string;
  role: string;
  initials: string;
}

export interface TrackingShipment {
  id: string;
  reference: string;
  stage: TrackingStageId;
  statusNote: string;
  /** Short chip shown above the current progress node, e.g. "Arriving today". */
  etaChip: string | null;
  createdOn: string;
  estimatedOn: string;
  origin: TrackingPlace;
  destination: TrackingPlace;
  /** Illustrative route, not a real courier path. */
  route: LngLat[];
  /** 0 → at origin, 1 → at destination. */
  progress: number;
  customerName: string;
  paymentMethod: string;
  deliveryFee: number;
  weightKg: number;
  parcels: number;
  items: TrackingItem[];
  courier: TrackingCourier | null;
}
