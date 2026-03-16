"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRoutes = ProfileRoutes;
var Profile_1 = require("@/features/profile/pages/Profile");
var react_router_dom_1 = require("react-router-dom");
var PrivateRoutes_1 = require("@/app/routes/PrivateRoutes");
function ProfileRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route element={<PrivateRoutes_1.PrivateRoutes />}>
        <react_router_dom_1.Route path="/" element={<Profile_1.Profile />}/>
        <react_router_dom_1.Route path="/:username" element={<Profile_1.Profile />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
