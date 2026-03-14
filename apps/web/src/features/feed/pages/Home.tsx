import { FeedHome } from "@/features/feed/components/home/FeedHome";
import { OpportunitiesSidebar } from "@/features/feed/components/home/OpportunitiesSidebar";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";

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
