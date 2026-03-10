import { useBreakpoints } from "@/hooks/useBreakpoints";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { useSidebar } from "@/components/ui/sidebar";

export function Chat() {
  const { maxLeftSideBar } = useBreakpoints();
  const { state } = useSidebar();

  // Para desktop: calcula largura e posição baseado no estado da sidebar
  const getDesktopLayout = () => {
    if (state === "collapsed") {
      // Sidebar fechada: mais perto dela com espaçamento (sidebar tem ~4rem quando fechada)
      return "w-[calc(100vw-6.5rem)] h-screen p-4 ml-[6.5rem]";
    } else {
      // Sidebar aberta: ajusta para não sobrepor com espaçamento (sidebar tem ~16rem quando aberta)
      return "w-[calc(100vw-18.5rem)] h-screen p-4 ml-[18.5rem]";
    }
  };

  return (
    <div
      className={`${
        maxLeftSideBar
          ? "w-full h-full" // Mobile/Tablet: altura completa
          : getDesktopLayout() // Desktop: layout dinâmico baseado na sidebar
      } ${!maxLeftSideBar ? "transition-all duration-300 ease-in-out" : ""}`}
    >
      <ChatLayout />
    </div>
  );
}
