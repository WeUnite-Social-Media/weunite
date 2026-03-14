import { useMediaQuery } from "./useMediaQuery";

export function useBreakpoints() {
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(min-width: 481px) and (max-width: 768px)");
  const isSmallDesktop = useMediaQuery(
    "(min-width: 769px) and (max-width: 1289px)",
  );
  const isDesktop = useMediaQuery("(min-width: 1290px)");

  const commentDesktop = useMediaQuery("(min-width: 1100px)");
  const maxLeftSideBar = useMediaQuery("(max-width: 891px)");

  const headerProfileDesktop = useMediaQuery("(min-width: 1100px)");

  return {
    isMobile,
    isTablet,
    isSmallDesktop,
    isDesktop,
    commentDesktop,
    maxLeftSideBar,
    headerProfileDesktop,
  };
}
