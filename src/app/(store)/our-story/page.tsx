import type { Metadata } from "next";
import OurStory from "../../../components/our-story/OurStory";

export const metadata: Metadata = {
  title: "Our Story — AVERON",
  description:
    "The world of AVERON: where it began, what it stands for, and the details behind every piece.",
};

export default function OurStoryPage() {
  return <OurStory />;
}
