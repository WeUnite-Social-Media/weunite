"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OpportunityCard;
var card_1 = require("@/shared/components/ui/card");
var avatar_1 = require("@/shared/components/ui/avatar");
var button_1 = require("@/shared/components/ui/button");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var alert_dialog_1 = require("@/shared/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var useGetTimeAgo_1 = require("@/shared/hooks/useGetTimeAgo");
var react_1 = require("react");
var getInitials_1 = require("@/shared/utils/getInitials");
var react_router_dom_1 = require("react-router-dom");
var DescriptionOpportunity_1 = require("./DescriptionOpportunity");
var EditOpportunity_1 = require("./EditOpportunity");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useOpportunities_1 = require("@/features/opportunities/state/useOpportunities");
function OpportunityCard(_a) {
    var _b, _c, _d, _e, _f;
    var opportunity = _a.opportunity;
    var initials = (0, getInitials_1.getInitials)(((_b = opportunity.company) === null || _b === void 0 ? void 0 : _b.username) || "");
    var navigate = (0, react_router_dom_1.useNavigate)();
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var deleteOpportunity = (0, useOpportunities_1.useDeleteOpportunity)();
    var _g = (0, react_1.useState)(false), isBookmarked = _g[0], setIsBookmarked = _g[1];
    var _h = (0, react_1.useState)(false), isDescriptionOpen = _h[0], setIsDescriptionOpen = _h[1];
    var _j = (0, react_1.useState)(false), isDeleteDialogOpen = _j[0], setIsDeleteDialogOpen = _j[1];
    var _k = (0, react_1.useState)(false), isEditOpportunityOpen = _k[0], setIsEditOpportunityOpen = _k[1];
    var timeAgo = (0, useGetTimeAgo_1.getTimeAgo)(opportunity.createdAt);
    var deadlineDate = new Date(opportunity.dateEnd).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    var isOwner = ((_c = opportunity.company) === null || _c === void 0 ? void 0 : _c.id) === (user === null || user === void 0 ? void 0 : user.id);
    var handleCompanyClick = function (e) {
        var _a;
        e.stopPropagation();
        if (isOwner) {
            navigate("/profile");
        }
        else {
            navigate("/profile/".concat((_a = opportunity.company) === null || _a === void 0 ? void 0 : _a.id));
        }
    };
    var handleDelete = function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        deleteOpportunity.mutate({
            companyId: Number(user.id),
            opportunityId: Number(opportunity.id),
        });
        setIsDeleteDialogOpen(false);
    };
    var handleEditOpportunityOpen = function () {
        setIsEditOpportunityOpen(true);
    };
    var handleCardClick = function () {
        setIsDescriptionOpen(true);
    };
    var handleApply = function (e) {
        e.stopPropagation();
    };
    var handleBookmark = function (e) {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
    };
    var handleDropdownClick = function (e) {
        e.stopPropagation();
    };
    return (<>
      <card_1.Card className="w-full max-w-[45em] bg-card shadow-none border-0 rounded-none border-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={handleCardClick}>
        <card_1.CardHeader className="flex flex-row items-center gap-2 mb-[0.5em]">
          <avatar_1.Avatar className="hover:cursor-pointer h-[2.8em] w-[2.8em]" onClick={handleCompanyClick}>
            <avatar_1.AvatarImage src={(_d = opportunity.company) === null || _d === void 0 ? void 0 : _d.profileImg} alt="company logo"/>
            <avatar_1.AvatarFallback className="bg-third/10 text-third font-semibold">
              {initials}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>

          <div className="flex flex-col">
            <card_1.CardTitle className="text-base font-medium hover:cursor-pointer" onClick={handleCompanyClick}>
              {(_e = opportunity.company) === null || _e === void 0 ? void 0 : _e.username}
            </card_1.CardTitle>

            <card_1.CardDescription className="text-xs">há {timeAgo}</card_1.CardDescription>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div onClick={handleDropdownClick}>
              <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <lucide_react_1.EllipsisVertical className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"/>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                  {isOwner ? (<>
                      <dropdown_menu_1.DropdownMenuItem onClick={handleEditOpportunityOpen} className="hover:cursor-pointer">
                        <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                        Editar
                      </dropdown_menu_1.DropdownMenuItem>

                      <alert_dialog_1.AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <alert_dialog_1.AlertDialogTrigger asChild>
                          <dropdown_menu_1.DropdownMenuItem className="hover:cursor-pointer" onSelect={function (e) {
                e.preventDefault();
                setIsDeleteDialogOpen(true);
            }}>
                            <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                            Excluir
                          </dropdown_menu_1.DropdownMenuItem>
                        </alert_dialog_1.AlertDialogTrigger>
                        <alert_dialog_1.AlertDialogContent>
                          <alert_dialog_1.AlertDialogHeader>
                            <alert_dialog_1.AlertDialogTitle>Tem certeza?</alert_dialog_1.AlertDialogTitle>
                            <alert_dialog_1.AlertDialogDescription>
                              Esta ação não pode ser desfeita. A oportunidade
                              será permanentemente removida da plataforma.
                            </alert_dialog_1.AlertDialogDescription>
                          </alert_dialog_1.AlertDialogHeader>
                          <alert_dialog_1.AlertDialogFooter>
                            <alert_dialog_1.AlertDialogCancel className="hover:cursor-pointer">
                              Cancelar
                            </alert_dialog_1.AlertDialogCancel>
                            <alert_dialog_1.AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-zinc-100 hover:cursor-pointer" disabled={deleteOpportunity.isPending}>
                              {deleteOpportunity.isPending
                ? "Deletando..."
                : "Excluir"}
                            </alert_dialog_1.AlertDialogAction>
                          </alert_dialog_1.AlertDialogFooter>
                        </alert_dialog_1.AlertDialogContent>
                      </alert_dialog_1.AlertDialog>

                      <dropdown_menu_1.DropdownMenuSeparator />
                      <dropdown_menu_1.DropdownMenuItem className="hover:cursor-pointer">
                        <lucide_react_1.Share className="mr-2 h-4 w-4"/>
                        Compartilhar
                      </dropdown_menu_1.DropdownMenuItem>
                    </>) : (<>
                      <dropdown_menu_1.DropdownMenuItem className="hover:cursor-pointer" onClick={function (e) {
                e.stopPropagation();
            }}>
                        <lucide_react_1.Share className="mr-2 h-4 w-4"/>
                        Compartilhar
                      </dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuSeparator />
                      <dropdown_menu_1.DropdownMenuItem className="text-red-600 hover:cursor-pointer">
                        <lucide_react_1.Flag className="mr-2 h-4 w-4"/>
                        Denunciar
                      </dropdown_menu_1.DropdownMenuItem>
                    </>)}
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="w-full mt-[-18px]">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              {opportunity.title}
            </h3>

            <p className="text-xs text-foreground line-clamp-3">
              {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <lucide_react_1.MapPin className="h-4 w-4"/>
                <span>{opportunity.location}</span>
              </div>

              <div className="flex items-center gap-1">
                <lucide_react_1.Calendar className="h-4 w-4"/>
                <span>Até {deadlineDate}</span>
              </div>

              <div className="flex items-center gap-1">
                <lucide_react_1.Users className="h-4 w-4"/>
                <span>{((_f = opportunity.subscribers) === null || _f === void 0 ? void 0 : _f.length) || 0} candidatos</span>
              </div>
            </div>
          </div>
        </card_1.CardContent>

        <card_1.CardFooter className="flex flex-col mt-[-15px]">
          <div className="flex w-full justify-between items-center">
            <card_1.CardAction className="flex items-center gap-3">
              {!isOwner && (<button_1.Button size="sm" variant="default" className="bg-third hover:bg-third/90 text-white rounded-full px-4" onClick={handleApply}>
                  Candidatar-se
                </button_1.Button>)}
            </card_1.CardAction>

            <card_1.CardAction className="flex items-center gap-2">
              <div onClick={handleBookmark} className="hover:cursor-pointer">
                <lucide_react_1.Bookmark className={"h-5 w-5 transition-colors ".concat(isBookmarked
            ? "text-third fill-third"
            : "text-muted-foreground hover:text-third")}/>
              </div>
            </card_1.CardAction>
          </div>
        </card_1.CardFooter>
      </card_1.Card>

      <DescriptionOpportunity_1.OpportunityDescription isOpen={isDescriptionOpen} onOpenChange={setIsDescriptionOpen} opportunity={opportunity}/>

      <EditOpportunity_1.EditOpportunity open={isEditOpportunityOpen} onOpenChange={setIsEditOpportunityOpen} opportunity={opportunity}/>
    </>);
}
