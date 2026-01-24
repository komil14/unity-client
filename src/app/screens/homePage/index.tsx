import { useState } from "react";

import HeroSection from "./hero";
import WhyJoinSection from "./whyJoin";
import type { WhyTab } from "../../../libs/types";
import PopularEventsSection from "./popularEvents";
import TrendingEventsSection from "./trendingEvents";
import TopOrganizersSection from "./topOrganizers";
import AdvertisementSection from "./advertisement";
import FinalCtaSection from "./finalCta";

export default function HomePage() {
  const [whyTab, setWhyTab] = useState<WhyTab>("volunteers");

  return (
    <div>
      <HeroSection />

      <div id="why" />
      <WhyJoinSection whyTab={whyTab} setWhyTab={setWhyTab} />

      <PopularEventsSection />
      <TrendingEventsSection />
      <AdvertisementSection />
      <TopOrganizersSection />

      <FinalCtaSection />
    </div>
  );
}
