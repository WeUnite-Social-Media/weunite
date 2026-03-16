"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicRoutes = PublicRoutes;
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_router_dom_1 = require("react-router-dom");
function PublicRoutes() {
    var isAuthenticated = (0, useAuthStore_1.useAuthStore)().isAuthenticated;
    if (isAuthenticated) {
        return <react_router_dom_1.Navigate to="/home" replace/>;
    }
    return <react_router_dom_1.Outlet />;
}
