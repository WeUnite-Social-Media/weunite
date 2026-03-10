import { FeedHome } from "@/components/home/FeedHome";
import { OpportunitiesSidebar } from "../../components/home/OpportunitiesSidebar";
import { useBreakpoints } from "@/hooks/useBreakpoints";

export function Home() {
  const { maxLeftSideBar } = useBreakpoints();

  return (
    <div className="relative min-h-screen">
      <div>
        <FeedHome />
      </div>

      {!maxLeftSideBar && <OpportunitiesSidebar />}
    </div>
  );
}
