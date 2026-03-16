"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderProfile;
var react_avatar_1 = require("@radix-ui/react-avatar");
var lucide_react_1 = require("lucide-react");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var EditProfile_1 = require("./EditProfile");
var EditBanner_1 = require("./EditBanner");
var react_1 = require("react");
var Following_1 = require("./Following");
var Followers_1 = require("./Followers");
var useBreakpoints_1 = require("@/shared/hooks/useBreakpoints");
var button_1 = require("@/shared/components/ui/button");
var lucide_react_2 = require("lucide-react");
var useUserProfile_1 = require("@/features/profile/hooks/useUserProfile");
var useFollowAction_1 = require("@/features/profile/hooks/useFollowAction");
var useFollow_1 = require("@/features/profile/state/useFollow");
var getInitials_1 = require("@/shared/utils/getInitials");
function HeaderProfile(_a) {
    var _b, _c;
    var profileUsername = _a.profileUsername;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var profileUser = (0, useUserProfile_1.useUserProfile)(profileUsername).data;
    var isOwnProfile = !profileUsername || profileUsername === (user === null || user === void 0 ? void 0 : user.username);
    var displayUser = isOwnProfile ? user : profileUser;
    var followersData = (0, useFollow_1.useGetFollowers)(Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)).data;
    var followingData = (0, useFollow_1.useGetFollowing)(Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)).data;
    var followersCount = (followersData === null || followersData === void 0 ? void 0 : followersData.success) && ((_b = followersData === null || followersData === void 0 ? void 0 : followersData.data) === null || _b === void 0 ? void 0 : _b.data)
        ? followersData.data.data.length
        : 0;
    var followingCount = (followingData === null || followingData === void 0 ? void 0 : followingData.success) && ((_c = followingData === null || followingData === void 0 ? void 0 : followingData.data) === null || _c === void 0 ? void 0 : _c.data)
        ? followingData.data.data.length
        : 0;
    var _d = (0, useFollowAction_1.useFollowAction)(profileUsername), isFollowing = _d.isFollowing, handleFollow = _d.handleFollow, isFollowLoading = _d.isLoading;
    var renderFollowButton = function () { return (<button_1.Button variant="outline" onClick={handleFollow} className="px-3 py-2 text-sm" disabled={isFollowLoading}>
      {isFollowing ? "Deixar de seguir" : "Seguir"}
    </button_1.Button>); };
    var initials = (0, getInitials_1.getInitials)(displayUser === null || displayUser === void 0 ? void 0 : displayUser.name);
    var _e = (0, react_1.useState)(false), isEditProfileOpen = _e[0], setIsEditProfileOpen = _e[1];
    var _f = (0, react_1.useState)(false), isFollowingOpen = _f[0], setIsFollowingOpen = _f[1];
    var _g = (0, react_1.useState)(false), isFollowersOpen = _g[0], setIsFollowersOpen = _g[1];
    var _h = (0, react_1.useState)(false), isEditBannerOpen = _h[0], setIsEditBannerOpen = _h[1];
    var handleEditProfileOpen = function () {
        setIsEditProfileOpen(true);
    };
    var handleFollowingOpen = function () {
        setIsFollowingOpen(true);
    };
    var handleFollowersOpen = function () {
        setIsFollowersOpen(true);
    };
    var handleBannerEdit = function () {
        setIsEditBannerOpen(true);
    };
    var isDesktop = (0, useBreakpoints_1.useBreakpoints)().isDesktop;
    if (isDesktop) {
        return (<>
        {isOwnProfile && (<EditProfile_1.default isOpen={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}/>)}

        {isOwnProfile && (<EditBanner_1.default isOpen={isEditBannerOpen} onOpenChange={setIsEditBannerOpen}/>)}

        <Followers_1.default isOpen={isFollowersOpen} onOpenChange={setIsFollowersOpen} userId={Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)}/>
        <Following_1.default isOpen={isFollowingOpen} onOpenChange={setIsFollowingOpen} userId={Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)}/>

        <div className="w-[48em] mx-auto px-4">
          <div className="h-40 relative group ">
            <img className="w-full h-full object-cover rounded-b-sm" src={(displayUser === null || displayUser === void 0 ? void 0 : displayUser.bannerImg) || "/BannerDefaultWhite.png"}/>
            {isOwnProfile && (<>
                <lucide_react_1.ImageUp className="absolute right-6 text-primary top-31 hover:cursor-pointer hover:scale-110 transition-transform z-10" onClick={handleBannerEdit}/>

                <div className="absolute inset-0 cursor-pointer" onClick={handleBannerEdit}/>
              </>)}
          </div>

          <div className="flex flex-col w-full">
            <div className="flex w-full">
              <div className="relative flex ml-[0.8em]">
                <react_avatar_1.Avatar className="w-27 h-27 rounded-full border-5 border-background mt-[-50px] bg-background" onClick={handleEditProfileOpen}>
                  <react_avatar_1.AvatarImage src={displayUser === null || displayUser === void 0 ? void 0 : displayUser.profileImg} alt="Foto de perfil" className="w-full h-full rounded-full object-cover hover:cursor-pointer"/>
                  <react_avatar_1.AvatarFallback className="w-full h-full flex items-center border-1 border-primary rounded-full justify-center text-primary text-5xl ">
                    {initials}
                  </react_avatar_1.AvatarFallback>
                  {isOwnProfile && (<div className="absolute bottom-2 right-0 bg-background rounded-full p-1 border border-primary shadow-sm">
                      <lucide_react_1.Pencil className="h-4 w-4 text-primary cursor-pointer rotate-90"/>
                    </div>)}
                </react_avatar_1.Avatar>
              </div>

              <div className="flex flex-col ml-[0.5em]">
                <p className="text-primary font-medium text-2xl">
                  {displayUser === null || displayUser === void 0 ? void 0 : displayUser.username}
                </p>
                <p className="text-[#a1a1a1] text-xs">{displayUser === null || displayUser === void 0 ? void 0 : displayUser.name}</p>
              </div>

              <div className="ml-auto mr-4 mt-2 gap-3 flex">
                {isOwnProfile ? (<button_1.Button variant="outline" className="flex items-center gap-2">
                    Configurações
                  </button_1.Button>) : (<div className="flex gap-3">
                    {renderFollowButton()}
                    <button_1.Button variant="outline" className="flex items-center gap-2">
                      <lucide_react_2.Send className="h-4 w-4"/>
                      Conversar
                    </button_1.Button>
                  </div>)}
              </div>
            </div>

            <div className="flex flex-row w-full pl-5 mt-1 gap-3 text-primary text-sm ">
              <div className="flex flex-row items-center gap-1" onClick={handleFollowingOpen}>
                <span className="hover:cursor-pointer">{followingCount}</span>
                <span className="hover:cursor-pointer">Seguindo</span>
              </div>

              <div className="flex flex-row items-center gap-1" onClick={handleFollowersOpen}>
                <span className="hover:cursor-pointer">{followersCount}</span>
                <span className="hover:cursor-pointer">Seguidores</span>
              </div>
            </div>
          </div>
        </div>
      </>);
    }
    return (<>
      {isOwnProfile && (<EditProfile_1.default isOpen={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}/>)}

      {isOwnProfile && (<EditBanner_1.default isOpen={isEditBannerOpen} onOpenChange={setIsEditBannerOpen}/>)}

      <Followers_1.default isOpen={isFollowersOpen} onOpenChange={setIsFollowersOpen} userId={Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)}/>
      <Following_1.default isOpen={isFollowingOpen} onOpenChange={setIsFollowingOpen} userId={Number(displayUser === null || displayUser === void 0 ? void 0 : displayUser.id)}/>

      <div className="w-full md:max-w-[77vw] mx-auto">
        <div className="h-35 relative group">
          <img className="h-full w-full object-cover" src={(displayUser === null || displayUser === void 0 ? void 0 : displayUser.bannerImg) || "/BannerDefaultWhite.png"} alt="Banner do perfil"/>
          {isOwnProfile && (<>
              <lucide_react_1.ImageUp className="absolute right-6 text-primary top-28 hover:cursor-pointer hover:scale-110 transition-transform z-10" onClick={handleBannerEdit}/>

              <div className="absolute inset-0 cursor-pointer" onClick={handleBannerEdit}/>
            </>)}
        </div>

        <div className="flex flex-col w-full">
          <div className="flex w-full">
            <div className="relative flex ml-[0.8em]">
              <react_avatar_1.Avatar className="w-27 h-27 rounded-full border-5 border-background mt-[-50px] bg-background" onClick={handleEditProfileOpen}>
                <react_avatar_1.AvatarImage src={displayUser === null || displayUser === void 0 ? void 0 : displayUser.profileImg} alt="Foto de perfil" className="w-full h-full rounded-full object-cover hover:cursor-pointer"/>
                <react_avatar_1.AvatarFallback className="w-full h-full flex items-center border-1 border-primary rounded-full justify-center text-primary text-5xl ">
                  {initials}
                </react_avatar_1.AvatarFallback>

                {isOwnProfile && (<div className="absolute bottom-2 right-0 bg-background rounded-full p-1 border border-primary shadow-sm">
                    <lucide_react_1.Pencil className="h-4 w-4 text-primary cursor-pointer rotate-90"/>
                  </div>)}
              </react_avatar_1.Avatar>
            </div>

            <div className="flex flex-col ml-[0.5em]">
              <p className="text-primary text-base">{displayUser === null || displayUser === void 0 ? void 0 : displayUser.username}</p>
              <p className="text-[#a1a1a1] text-xs">{displayUser === null || displayUser === void 0 ? void 0 : displayUser.name}</p>
            </div>

            <div className="ml-auto mr-4 mt-2 gap-3 flex">
              {isOwnProfile ? (<button_1.Button variant="outline" className="flex items-center gap-2">
                  Configurações
                </button_1.Button>) : (<div className="flex gap-3">
                  {renderFollowButton()}
                  <button_1.Button variant="outline" className="flex items-center gap-2">
                    <lucide_react_2.Send className="h-4 w-4"/>
                    Conversar
                  </button_1.Button>
                </div>)}
            </div>
          </div>

          <div className="flex flex-row w-full pl-5 mt-1 gap-3 text-primary text-sm ">
            <div className="flex flex-row items-center gap-1" onClick={handleFollowingOpen}>
              <span className="hover:cursor-pointer">{followingCount}</span>
              <span className="hover:cursor-pointer">Seguindo</span>
            </div>

            <div className="flex flex-row items-center gap-1" onClick={handleFollowersOpen}>
              <span className="hover:cursor-pointer">{followersCount}</span>
              <span className="hover:cursor-pointer">Seguidores</span>
            </div>
          </div>
        </div>
      </div>
    </>);
}
