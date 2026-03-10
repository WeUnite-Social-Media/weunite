import { BottomSideBar } from "@/components/shared/BottomSideBar";
import { LeftSidebar } from "@/components/shared/LeftSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { Navigate, Outlet } from "react-router-dom";
import { HeaderMobile } from "../components/shared/HeaderMobile";

export function PrivateRoutes() {
  const { isAuthenticated } = useAuthStore();
  const { maxLeftSideBar } = useBreakpoints();
  const isConversationOpen = useChatStore((state) => state.isConversationOpen);

  if (!isAuthenticated) {
    return <Navigate to={"/auth/login"} replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        {!maxLeftSideBar && <LeftSidebar />}
        {maxLeftSideBar && <HeaderMobile />}

        <main
          className={`flex-1 ${
            maxLeftSideBar
              ? isConversationOpen
                ? "h-[calc(100vh-60px)]" // Apenas HeaderMobile (60px)
                : "h-[calc(100vh-116px)]" // HeaderMobile + BottomSideBar
              : ""
          }`}
        >
          <Outlet />
        </main>

        {/* Esconde a BottomSideBar quando uma conversa estiver aberta no mobile */}
        {maxLeftSideBar && !isConversationOpen && <BottomSideBar />}
      </div>
    </SidebarProvider>
  );
}
