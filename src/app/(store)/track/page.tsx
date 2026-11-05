import type { Metadata } from "next";
import { TrackingExperience } from "@/components/tracking/TrackingExperience";

export const metadata: Metadata = {
  title: "Track your parcel — AVÉRON",
  description:
    "Follow your AVÉRON order from our atelier to your door. Demo tracking experience.",
};

export default function TrackPage() {
  return <TrackingExperience />;
}
