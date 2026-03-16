"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Home = Home;
var FeedHome_1 = require("@/features/feed/components/home/FeedHome");
var OpportunitiesSidebar_1 = require("@/features/feed/components/home/OpportunitiesSidebar");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
function Home() {
    var maxLeftSideBar = (0, useBreakpoints_1.useBreakpoints)().maxLeftSideBar;
    return (<div className="relative min-h-screen">
      <div>
        <FeedHome_1.FeedHome />
      </div>

      {!maxLeftSideBar && <OpportunitiesSidebar_1.OpportunitiesSidebar />}
    </div>);
}
