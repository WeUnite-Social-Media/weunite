"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Opportunity = Opportunity;
var FeedOpportunity_1 = require("@/features/opportunities/components/FeedOpportunity");
function Opportunity() {
    return (<div className="relative min-h-screen">
      <div>
        <FeedOpportunity_1.default />
      </div>
    </div>);
}
