"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_router_dom_1 = require("react-router-dom");
require("./App.css");
var AuthRoutes_1 = require("@/features/auth/routes/AuthRoutes");
var HomeRoutes_1 = require("@/features/feed/routes/HomeRoutes");
var ThemeProvider_1 = require("@/shared/providers/ThemeProvider");
var ProfileRoutes_1 = require("@/features/profile/routes/ProfileRoutes");
var OpportunityRoutes_1 = require("@/features/opportunities/routes/OpportunityRoutes");
var ChatRoutes_1 = require("@/features/chat/routes/ChatRoutes");
var AdminRoutes_1 = require("@/features/admin/routes/AdminRoutes");
var WebSocketContext_1 = require("@/features/chat/context/WebSocketContext");
function App() {
    return (<ThemeProvider_1.ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <WebSocketContext_1.WebSocketProvider>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/auth/*" element={<AuthRoutes_1.AuthRoutes />}/>
          <react_router_dom_1.Route path="/home/*" element={<HomeRoutes_1.HomeRoutes />}/>
          <react_router_dom_1.Route path="/profile/*" element={<ProfileRoutes_1.ProfileRoutes />}/>
          <react_router_dom_1.Route path="/opportunity/*" element={<OpportunityRoutes_1.OpportunityRoutes />}/>
          <react_router_dom_1.Route path="/chat/*" element={<ChatRoutes_1.ChatRoutes />}/>
          <react_router_dom_1.Route path="/admin/*" element={<AdminRoutes_1.AdminRoutes />}/>
          <react_router_dom_1.Route path="/*" element={<react_router_dom_1.Navigate to="/home" replace/>}/>
        </react_router_dom_1.Routes>
      </WebSocketContext_1.WebSocketProvider>
    </ThemeProvider_1.ThemeProvider>);
}
exports.default = App;
