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
exports.default = EditBanner;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var dialog_1 = require("@/shared/components/ui/dialog");
var button_1 = require("@/shared/components/ui/button");
var input_1 = require("@/shared/components/ui/input");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useUsers_1 = require("@/features/profile/state/useUsers");
var updateProfile_schema_1 = require("@/features/profile/schemas/updateProfile.schema");
function EditBanner(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange;
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var _b = (0, react_1.useState)(null), preview = _b[0], setPreview = _b[1];
    var _c = (0, react_1.useState)(null), selectedFile = _c[0], setSelectedFile = _c[1];
    var updateProfileBanner = (0, useUsers_1.useUpdateProfile)();
    var deleteProfileBanner = (0, useUsers_1.useDeleteProfileBanner)();
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(updateProfile_schema_1.updateProfileSchema),
        defaultValues: {
            name: (user === null || user === void 0 ? void 0 : user.name) || "",
            username: (user === null || user === void 0 ? void 0 : user.username) || "",
            media: null,
        },
    });
    var resizeImage = function (file, targetWidth, targetHeight) {
        return new Promise(function (resolve) {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var img = new Image();
            img.onload = function () {
                var originalWidth = img.width, originalHeight = img.height;
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                var scaleX = targetWidth / originalWidth;
                var scaleY = targetHeight / originalHeight;
                var scale = Math.max(scaleX, scaleY);
                var scaledWidth = originalWidth * scale;
                var scaledHeight = originalHeight * scale;
                var x = (targetWidth - scaledWidth) / 2;
                var y = (targetHeight - scaledHeight) / 2;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                canvas.toBlob(function (blob) {
                    var resizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                }, file.type, 0.92); // Qualidade 92% para melhor resultado
            };
            img.src = URL.createObjectURL(file);
        });
    };
    var handleFileSelect = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var resizedFile, url_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file) {
                        form.setValue("media", null);
                        setPreview(null);
                        setSelectedFile(null);
                        return [2 /*return*/];
                    }
                    if (!file.type.startsWith("image/")) {
                        alert("Por favor, selecione apenas arquivos de imagem.");
                        return [2 /*return*/];
                    }
                    if (file.size > 10 * 1024 * 1024) {
                        alert("A imagem deve ter no máximo 10MB.");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, resizeImage(file, 1584, 396)];
                case 2:
                    resizedFile = _a.sent();
                    setSelectedFile(resizedFile);
                    url_1 = URL.createObjectURL(resizedFile);
                    setPreview(function (old) {
                        if (old)
                            URL.revokeObjectURL(old);
                        return url_1;
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Erro ao processar imagem:", error_1);
                    alert("Erro ao processar a imagem. Tente novamente.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedFile)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, updateProfileBanner.mutateAsync({
                            username: (user === null || user === void 0 ? void 0 : user.username) || "",
                            data: {
                                name: (user === null || user === void 0 ? void 0 : user.name) || "",
                                username: (user === null || user === void 0 ? void 0 : user.username) || "",
                                email: (user === null || user === void 0 ? void 0 : user.email) || "",
                                bannerImg: selectedFile,
                            },
                        })];
                case 2:
                    _a.sent();
                    handleCancel();
                    onOpenChange(false);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Erro ao atualizar banner:", error_2);
                    alert("Erro ao salvar o banner. Tente novamente.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.username))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteProfileBanner.mutateAsync(user.username)];
                case 2:
                    _a.sent();
                    handleCancel();
                    onOpenChange(false);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Erro ao excluir banner:", error_3);
                    alert("Erro ao excluir o banner. Tente novamente.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () {
        setSelectedFile(null);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        form.setValue("media", null);
    };
    var handleClose = function () {
        handleCancel();
        onOpenChange(false);
    };
    return (<dialog_1.Dialog open={isOpen} onOpenChange={handleClose}>
      <dialog_1.DialogContent className="max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Alterar foto de capa</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          <div className="aspect-[4/1] w-full overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center">
            {preview || (user === null || user === void 0 ? void 0 : user.bannerImg) ? (<img src={preview || (user === null || user === void 0 ? void 0 : user.bannerImg)} alt="Preview do banner" className="w-full h-full object-cover"/>) : (<div className="flex flex-col items-center gap-2 text-gray-500">
                <lucide_react_1.ImageUp className="h-8 w-8"/>
                <span className="text-sm">Nenhuma imagem selecionada</span>
              </div>)}
          </div>

          <div className="flex justify-center gap-2">
            <input_1.Input id="banner-file-input" type="file" accept="image/*" className="hidden" onChange={function (e) {
            var _a, _b;
            var file = (_b = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : null;
            handleFileSelect(file);
        }}/>
            <button_1.Button variant="outline" onClick={function () { var _a; return (_a = document.getElementById("banner-file-input")) === null || _a === void 0 ? void 0 : _a.click(); }} className="flex-1">
              <lucide_react_1.ImageUp className="h-4 w-4 mr-2"/>
              {selectedFile ? "Alterar imagem" : "Selecionar imagem"}
            </button_1.Button>

            {(user === null || user === void 0 ? void 0 : user.bannerImg) && (<button_1.Button variant="outline" onClick={handleDelete} disabled={deleteProfileBanner.isPending} className="text-red-600 hover:text-red-700 hover:border-red-300">
                <lucide_react_1.Trash2 className="h-4 w-4"/>
              </button_1.Button>)}
          </div>

          <div className="flex justify-center md:justify-end gap-2">
            <button_1.Button onClick={handleClose} className="w-[10em] md:w-[8em]" disabled={updateProfileBanner.isPending}>
              <lucide_react_1.X className="h-4 w-4"/>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleSave} variant="third" className="w-[10em] md:w-[8em]" disabled={updateProfileBanner.isPending || !selectedFile}>
              <lucide_react_1.Check className="h-4 w-4"/>
              {updateProfileBanner.isPending ? "Salvando..." : "Salvar"}
            </button_1.Button>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
