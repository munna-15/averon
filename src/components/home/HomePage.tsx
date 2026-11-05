import { AveronHero, averonFontVars } from "@/components/averon-hero";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import EditorialCampaign from "@/components/home/EditorialCampaign";
import TheEdit from "@/components/home/TheEdit";

export function HomePage() {
  return (
    <>
      <div className={averonFontVars} style={{ display: "flow-root" }}>
        <AveronHero />
      </div>
      <FeaturedCollections />
      <NewArrivals />
      <EditorialCampaign />
      <TheEdit />
    </>
  );
}
