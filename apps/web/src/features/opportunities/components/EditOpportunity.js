"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditOpportunity = EditOpportunity;
var button_1 = require("@/shared/components/ui/button");
var dialog_1 = require("@/shared/components/ui/dialog");
var input_1 = require("@/shared/components/ui/input");
var label_1 = require("@/shared/components/ui/label");
var textarea_1 = require("@/shared/components/ui/textarea");
var calendar_1 = require("@/shared/components/ui/calendar");
var dropdown_menu_1 = require("@/shared/components/ui/dropdown-menu");
var useOpportunities_1 = require("@/features/opportunities/state/useOpportunities");
var updateOpportunity_schema_1 = require("@/features/opportunities/schemas/opportunity/updateOpportunity.schema");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/shared/lib/utils");
var CreateSkill_1 = require("./skill/CreateSkill");
var SelectedSkills_1 = require("./skill/SelectedSkills");
function EditOpportunity(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, opportunity = _a.opportunity;
    var _b = (0, react_1.useState)(false), isCalendarOpen = _b[0], setIsCalendarOpen = _b[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(updateOpportunity_schema_1.updateOpportunitySchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            dateEnd: undefined,
            skills: [],
        },
    });
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var updateOpportunityMutation = (0, useOpportunities_1.useUpdateOpportunity)();
    (0, react_1.useEffect)(function () {
        var _a;
        if (opportunity && open) {
            form.reset({
                title: opportunity.title || "",
                description: opportunity.description || "",
                location: opportunity.location || "",
                dateEnd: opportunity.dateEnd
                    ? new Date(opportunity.dateEnd)
                    : undefined,
                skills: ((_a = opportunity.skills) === null || _a === void 0 ? void 0 : _a.map(function (skill) { return skill.name; })) || [],
            });
        }
    }, [opportunity, open, form]);
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id) || !(opportunity === null || opportunity === void 0 ? void 0 : opportunity.id))
                            return [2 /*return*/];
                        return [4 /*yield*/, updateOpportunityMutation.mutateAsync({
                                data: {
                                    opportunityId: Number(opportunity.id),
                                    title: values.title,
                                    description: values.description,
                                    location: values.location,
                                    dateEnd: values.dateEnd,
                                    skills: (_a = values.skills) === null || _a === void 0 ? void 0 : _a.map(function (skillName, index) { return ({
                                        id: index + 1,
                                        name: skillName,
                                    }); }),
                                },
                                companyId: Number(user.id),
                            })];
                    case 1:
                        result = _b.sent();
                        if (result.success) {
                            form.reset();
                            onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    var isSubmitting = updateOpportunityMutation.isPending;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="w-[90vw] max-w-[40em] max-h-[90vh] overflow-y-auto p-4" aria-describedby={undefined}>
        <dialog_1.DialogHeader className="pb-2">
          <dialog_1.DialogTitle className="text-lg">Editar Oportunidade</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2 text-sm">
          <div className="grid gap-1">
            <label_1.Label htmlFor="opportunity-title" className="text-xs font-medium">
              Título
            </label_1.Label>
            <react_hook_form_1.Controller name="title" control={form.control} render={function (_a) {
            var field = _a.field;
            return (<textarea_1.Textarea id="opportunity-title" placeholder="Ex: Oportunidade para lateral esquerdo" className="min-h-[50px] resize-none text-sm" {...field}/>);
        }}/>
          </div>

          <div className="grid gap-1">
            <label_1.Label htmlFor="opportunity-description" className="text-xs font-medium">
              Descrição
            </label_1.Label>
            <react_hook_form_1.Controller name="description" control={form.control} render={function (_a) {
            var field = _a.field;
            return (<textarea_1.Textarea id="opportunity-description" placeholder="Descreva a oportunidade..." className="min-h-[60px] resize-none text-sm" {...field}/>);
        }}/>
          </div>

          <div className="grid gap-1">
            <label_1.Label htmlFor="opportunity-location" className="text-xs font-medium">
              Localização
            </label_1.Label>
            <react_hook_form_1.Controller name="location" control={form.control} render={function (_a) {
            var field = _a.field;
            return (<input_1.Input id="opportunity-location" placeholder="Ex: São Paulo, SP" className="h-8 text-sm" {...field}/>);
        }}/>
          </div>

          <div className="grid gap-1">
            <label_1.Label htmlFor="opportunity-dateEnd" className="text-xs font-medium">
              Data limite
            </label_1.Label>
            <react_hook_form_1.Controller name="dateEnd" control={form.control} render={function (_a) {
            var field = _a.field;
            return (<dropdown_menu_1.DropdownMenu open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant="outline" className={(0, utils_1.cn)("w-full justify-between text-left font-normal h-8 text-sm", !field.value && "text-muted-foreground")}>
                      <div className="flex items-center">
                        <lucide_react_1.CalendarIcon className="mr-2 h-3 w-3"/>
                        {field.value ? ((0, date_fns_1.format)(field.value, "dd/MM/yyyy", { locale: locale_1.ptBR })) : (<span>Selecione uma data</span>)}
                      </div>
                      <lucide_react_1.ChevronDownIcon className="ml-2 h-3 w-3"/>
                    </button_1.Button>
                  </dropdown_menu_1.DropdownMenuTrigger>
                  <dropdown_menu_1.DropdownMenuContent className="w-auto p-0" align="start">
                    <calendar_1.Calendar mode="single" selected={field.value} onSelect={function (date) {
                    field.onChange(date);
                    setIsCalendarOpen(false);
                }} disabled={function (date) { return date < new Date(); }} initialFocus locale={locale_1.ptBR}/>
                  </dropdown_menu_1.DropdownMenuContent>
                </dropdown_menu_1.DropdownMenu>);
        }}/>
          </div>

          <div className="grid gap-1">
            <label_1.Label htmlFor="opportunity-skills" className="text-xs font-medium">
              Habilidades
            </label_1.Label>
            <react_hook_form_1.Controller name="skills" control={form.control} render={function (_a) {
            var _b;
            var field = _a.field;
            return (<>
                  <CreateSkill_1.default selectedSkills={field.value || []} onSkillsChange={field.onChange}/>
                  {(((_b = field.value) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0 && (<SelectedSkills_1.SelectedSkills skills={field.value || []} showRemove={true} onRemoveSkill={function (skill) {
                        var newSkills = (field.value || []).filter(function (s) { return s !== skill; });
                        field.onChange(newSkills);
                    }} className="mt-2"/>)}
                </>);
        }}/>
          </div>

          <dialog_1.DialogFooter className="mt-4 flex-col-reverse sm:flex-row gap-2">
            <dialog_1.DialogClose asChild>
              <button_1.Button variant="outline" className="h-8 text-sm hover:cursor-pointer">
                Cancelar
              </button_1.Button>
            </dialog_1.DialogClose>
            <button_1.Button type="submit" className="h-8 text-sm variant-third bg-third hover:bg-third-hover" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
