import { BottomSideBar } from "@/shared/components/shared/BottomSideBar";
import { LeftSidebar } from "@/shared/components/shared/LeftSidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { useBreakpoints } from "@/shared/hooks/useBreakpoints";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useChatStore } from "@/features/chat/stores/useChatStore";
import { Navigate, Outlet } from "react-router-dom";
import { HeaderMobile } from "@/shared/components/shared/HeaderMobile";

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
