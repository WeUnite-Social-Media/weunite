"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = AuthRoutes;
var react_router_dom_1 = require("react-router-dom");
var PublicRoutes_1 = require("@/app/routes/PublicRoutes");
var VerifyResetToken_1 = require("@/features/auth/pages/VerifyResetToken");
var SendResetPassword_1 = require("@/features/auth/pages/SendResetPassword");
var VerifyEmail_1 = require("@/features/auth/pages/VerifyEmail");
var Index_1 = require("@/features/auth/pages/Index");
var ResetPassword_1 = require("@/features/auth/pages/ResetPassword");
function AuthRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route element={<PublicRoutes_1.PublicRoutes />}>
        <react_router_dom_1.Route path={"*"} element={<Index_1.Index />}/>
        <react_router_dom_1.Route path={"verify-email/:email"} element={<VerifyEmail_1.VerifyEmail />}/>
        <react_router_dom_1.Route path={"send-reset-password"} element={<SendResetPassword_1.SendResetPassword />}/>
        <react_router_dom_1.Route path={"verify-reset-token/:email"} element={<VerifyResetToken_1.VerifyResetToken />}/>
        <react_router_dom_1.Route path={"reset-password/:verificationToken"} element={<ResetPassword_1.ResetPassword />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
