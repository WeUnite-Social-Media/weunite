"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CardFollowing;
var getInitials_1 = require("@/shared/utils/getInitials");
var avatar_1 = require("@/shared/components/ui/avatar");
var button_1 = require("@/shared/components/ui/button");
var card_1 = require("@/shared/components/ui/card");
var react_router_dom_1 = require("react-router-dom");
function CardFollowing(_a) {
    var user = _a.user, onUserClick = _a.onUserClick;
    var initials = (0, getInitials_1.getInitials)(user === null || user === void 0 ? void 0 : user.name);
    return (<card_1.CardContent className="flex mt-5">
      <react_router_dom_1.Link to={"/profile/".concat(user === null || user === void 0 ? void 0 : user.username)} className="flex gap-2 items-center flex-1 hover:opacity-80 transition-opacity" onClick={onUserClick}>
        <avatar_1.Avatar className="w-13 h-13 rounded-full">
          <avatar_1.AvatarImage src={user === null || user === void 0 ? void 0 : user.profileImg} alt="Foto de perfil" className="w-full h-full rounded-full object-cover hover:cursor-pointer"/>
          <avatar_1.AvatarFallback className="w-full h-full flex items-center border-1 border-primary rounded-full justify-center text-primary text-2xl ">
            {initials}
          </avatar_1.AvatarFallback>
        </avatar_1.Avatar>
        <div className="flex flex-col  items-start justify-center">
          <p className="text-primary font-medium">{user === null || user === void 0 ? void 0 : user.username}</p>
          <p className="text-[#a1a1a1] text-xs">{user === null || user === void 0 ? void 0 : user.name}</p>
        </div>
      </react_router_dom_1.Link>
      <div className="ml-auto flex items-center">
        <button_1.Button variant="outline" className="text-xs font-normal">
          Deixar de seguir
        </button_1.Button>
      </div>
    </card_1.CardContent>);
}
