"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = ChatRoutes;
var react_router_dom_1 = require("react-router-dom");
var PrivateRoutes_1 = require("@/app/routes/PrivateRoutes");
var pages_1 = require("@/features/chat/pages");
function ChatRoutes() {
    return (<react_router_dom_1.Routes>
      <react_router_dom_1.Route path="/" element={<PrivateRoutes_1.PrivateRoutes />}>
        <react_router_dom_1.Route index element={<pages_1.Chat />}/>
      </react_router_dom_1.Route>
    </react_router_dom_1.Routes>);
}
