"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLayout = AdminLayout;
var AdminSidebar_1 = require("./AdminSidebar");
var AdminHeader_1 = require("./AdminHeader");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
function AdminLayout(_a) {
    var children = _a.children;
    var maxLeftSideBar = (0, useBreakpoints_1.useBreakpoints)().maxLeftSideBar;
    return (<div className="min-h-screen bg-background">
      {!maxLeftSideBar && <AdminSidebar_1.AdminSidebar />}

      <div className={maxLeftSideBar ? "" : "ml-64"}>
        <AdminHeader_1.AdminHeader />

        <main className="p-6">{children}</main>
      </div>
    </div>);
}
