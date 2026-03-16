"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityRoutes = OpportunityRoutes;
var Opportunity_1 = require("@/features/opportunities/pages/Opportunity");
var react_router_dom_1 = require("react-router-dom");
var PrivateRoutes_1 = require("@/app/routes/PrivateRoutes");
function OpportunityRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route element={<PrivateRoutes_1.PrivateRoutes />}>
        <react_router_dom_1.Route path="/" element={<Opportunity_1.Opportunity />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
