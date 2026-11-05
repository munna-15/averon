import { elbowRoute } from "./route";
import type { TrackingPlace, TrackingShipment } from "./types";

/**
 * DEMO DATA ONLY. Customers, addresses and routes are fictional.
 * Change the image paths below to match your real files in /public.
 */
const IMAGES = {
  shirt: "/images/new-arrivals/product-01.jpg",
  tee: "/images/new-arrivals/product-02.jpg",
  jacket: "/images/new-arrivals/product-03.jpg",
};

const ATELIER: TrackingPlace = {
  label: "AVÉRON Atelier",
  area: "Tejgaon",
  city: "Dhaka",
  coordinates: [90.3996, 23.7639],
};

const DHANMONDI: TrackingPlace = {
  label: "Delivery address",
  area: "Dhanmondi",
  city: "Dhaka",
  coordinates: [90.3742, 23.7461],
};

const GULSHAN: TrackingPlace = {
  label: "Delivery address",
  area: "Gulshan",
  city: "Dhaka",
  coordinates: [90.4152, 23.7925],
};

const UTTARA: TrackingPlace = {
  label: "Delivery address",
  area: "Uttara",
  city: "Dhaka",
  coordinates: [90.3987, 23.8759],
};

export const DEMO_SHIPMENTS: TrackingShipment[] = [
  {
    id: "demo-oversized-shirt",
    reference: "AV-240318",
    stage: "out_for_delivery",
    statusNote: "With our delivery courier, expected today",
    etaChip: "Arriving today",
    createdOn: "02 Nov 2026",
    estimatedOn: "06 Nov 2026",
    origin: ATELIER,
    destination: DHANMONDI,
    route: elbowRoute(ATELIER.coordinates, DHANMONDI.coordinates),
    progress: 0.62,
    customerName: "Rahim Chowdhury",
    paymentMethod: "Paid online",
    deliveryFee: 120,
    weightKg: 1.2,
    parcels: 1,
    items: [
      {
        id: "i1",
        name: "AVÉRON Premium Oversized Shirt",
        color: "Ivory",
        size: "M",
        quantity: 1,
        unitPrice: 4800,
        image: IMAGES.shirt,
      },
      {
        id: "i2",
        name: "AVÉRON Essential T-Shirt",
        color: "Stone",
        size: "M",
        quantity: 1,
        unitPrice: 1900,
        image: IMAGES.tee,
      },
    ],
    courier: {
      name: "Karim Hossain",
      role: "Delivery courier",
      initials: "KH",
    },
  },
  {
    id: "demo-signature-jacket",
    reference: "AV-240322",
    stage: "processing",
    statusNote: "Being inspected and packed at the atelier",
    etaChip: null,
    createdOn: "05 Nov 2026",
    estimatedOn: "09 Nov 2026",
    origin: ATELIER,
    destination: GULSHAN,
    route: elbowRoute(ATELIER.coordinates, GULSHAN.coordinates),
    progress: 0,
    customerName: "Nusrat Jahan",
    paymentMethod: "Cash on delivery",
    deliveryFee: 150,
    weightKg: 1.6,
    parcels: 1,
    items: [
      {
        id: "i1",
        name: "AVÉRON Signature Jacket",
        color: "Washed Black",
        size: "L",
        quantity: 1,
        unitPrice: 12900,
        image: IMAGES.jacket,
      },
    ],
    courier: null,
  },
  {
    id: "demo-essential-tee",
    reference: "AV-240297",
    stage: "delivered",
    statusNote: "Delivered and signed for",
    etaChip: null,
    createdOn: "28 Oct 2026",
    estimatedOn: "01 Nov 2026",
    origin: ATELIER,
    destination: UTTARA,
    route: elbowRoute(ATELIER.coordinates, UTTARA.coordinates),
    progress: 1,
    customerName: "Tanvir Ahmed",
    paymentMethod: "Paid online",
    deliveryFee: 0,
    weightKg: 0.7,
    parcels: 1,
    items: [
      {
        id: "i1",
        name: "AVÉRON Essential T-Shirt",
        color: "Stone",
        size: "L",
        quantity: 2,
        unitPrice: 1900,
        image: IMAGES.tee,
      },
    ],
    courier: { name: "Jamal Uddin", role: "Delivery courier", initials: "JU" },
  },
];
