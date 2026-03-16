"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = Profile;
var FeedProfile_1 = require("@/features/profile/components/FeedProfile");
var HeaderProfile_1 = require("@/features/profile/components/HeaderProfile");
var react_router_dom_1 = require("react-router-dom");
function Profile() {
    var username = (0, react_router_dom_1.useParams)().username;
    return (<>
      <div className="relative">
        <HeaderProfile_1.default profileUsername={username}/>
      </div>
      <FeedProfile_1.default profileUsername={username}/>
    </>);
}
