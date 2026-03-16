"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = EditProfile;
var button_1 = require("@/shared/components/ui/button");
var dialog_1 = require("@/shared/components/ui/dialog");
var input_1 = require("@/shared/components/ui/input");
var avatar_1 = require("@/shared/components/ui/avatar");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var react_1 = require("react");
var useUsers_1 = require("@/features/profile/state/useUsers");
var updateProfile_schema_1 = require("@/features/profile/schemas/updateProfile.schema");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var form_1 = require("@/shared/components/ui/form");
function EditProfile(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var _b = (0, react_1.useState)(null), preview = _b[0], setPreview = _b[1];
    var editProfile = (0, useUsers_1.useUpdateProfile)();
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(updateProfile_schema_1.updateProfileSchema),
        defaultValues: {
            name: user === null || user === void 0 ? void 0 : user.name,
            username: user === null || user === void 0 ? void 0 : user.username,
            media: null,
        },
    });
    var handleFile = function (file) {
        if (!file) {
            form.setValue("media", null);
            return;
        }
        form.setValue("media", file);
        var url = URL.createObjectURL(file);
        setPreview(function (old) {
            if (old)
                URL.revokeObjectURL(old);
            return url;
        });
    };
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id))
                            return [2 /*return*/];
                        return [4 /*yield*/, editProfile.mutateAsync({
                                data: {
                                    name: values.name.trim(),
                                    username: values.username.trim(),
                                    profileImg: (values === null || values === void 0 ? void 0 : values.media) || undefined,
                                },
                                username: user.username,
                            })];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            form.reset(__assign(__assign({}, values), { media: null }));
                            onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[30em] md:max-w-[40em]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Editar Perfil</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Faça as alterações necessárias no seu perfil.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-3 justify-center">
                <form_1.FormField control={form.control} name="media" render={function (_a) {
            var _b;
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormControl>
                        <div>
                          <input_1.Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={function (e) {
                    var _a, _b;
                    var file = (_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
                    handleFile(file);
                    field.onChange(file);
                }}/>
                          <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                            <avatar_1.Avatar className="w-28 h-28 rounded-full">
                              <avatar_1.AvatarImage src={preview ||
                    (user === null || user === void 0 ? void 0 : user.profileImg) ||
                    "/placeholder.png"} alt="Foto de perfil" className="object-cover"/>
                              <avatar_1.AvatarFallback className="text-xl">
                                {(_b = user === null || user === void 0 ? void 0 : user.name) === null || _b === void 0 ? void 0 : _b.substring(0, 2).toUpperCase()}
                              </avatar_1.AvatarFallback>
                            </avatar_1.Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                              Alterar
                            </div>
                          </label>
                        </div>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <form_1.FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="grid gap-3">
                    <form_1.FormLabel htmlFor="name">Nome</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input id="name" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="username" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="grid gap-3">
                    <form_1.FormLabel htmlFor="username">Username</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input id="username" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <dialog_1.DialogFooter className="flex flex-row-reverse gap-2 mt-4">
              <button_1.Button type="submit" disabled={editProfile.isPending}>
                {editProfile.isPending ? "Salvando..." : "Salvar"}
              </button_1.Button>
              <dialog_1.DialogClose asChild>
                <button_1.Button variant="outline" type="button">
                  Cancelar
                </button_1.Button>
              </dialog_1.DialogClose>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
