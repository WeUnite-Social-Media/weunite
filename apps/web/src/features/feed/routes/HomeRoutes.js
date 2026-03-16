"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeRoutes = HomeRoutes;
var react_router_dom_1 = require("react-router-dom");
var PrivateRoutes_1 = require("@/app/routes/PrivateRoutes");
var Home_1 = require("@/features/feed/pages/Home");
function HomeRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route element={<PrivateRoutes_1.PrivateRoutes />}>
        <react_router_dom_1.Route path="/home" element={<Home_1.Home />}/>
        <react_router_dom_1.Route path="" element={<Home_1.Home />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
