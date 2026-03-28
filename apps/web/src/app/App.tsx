import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthRoutes } from "@/features/auth/routes/AuthRoutes";
import { HomeRoutes } from "@/features/feed/routes/HomeRoutes";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { ProfileRoutes } from "@/features/profile/routes/ProfileRoutes";
import { OpportunityRoutes } from "@/features/opportunities/routes/OpportunityRoutes";
import { ChatRoutes } from "@/features/chat/routes/ChatRoutes";
import { AdminRoutes } from "@/features/admin/routes/AdminRoutes";
import { WebSocketProvider } from "@/app/providers/WebSocketProvider";
import { TermsOfUsePage } from "@/features/legal/pages/TermsOfUsePage";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <WebSocketProvider>
        <Routes>
          <Route path="/auth/*" element={<AuthRoutes />} />
          <Route path="/home/*" element={<HomeRoutes />} />
          <Route path="/profile/*" element={<ProfileRoutes />} />
          <Route path="/opportunity/*" element={<OpportunityRoutes />} />
          <Route path="/chat/*" element={<ChatRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/*" element={<Navigate to="/home" replace />} />
        </Routes>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
