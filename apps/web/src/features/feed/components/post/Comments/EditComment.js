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
exports.EditComment = EditComment;
var button_1 = require("@/shared/components/ui/button");
var dialog_1 = require("@/shared/components/ui/dialog");
var label_1 = require("@/shared/components/ui/label");
var textarea_1 = require("@/shared/components/ui/textarea");
var useComments_1 = require("@/features/feed/state/useComments");
var createPost_schema_1 = require("@/features/feed/schemas/post/createPost.schema");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var react_1 = require("react");
function EditComment(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, comment = _a.comment;
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(createPost_schema_1.createPostSchema),
        defaultValues: {
            text: "",
            media: null,
        },
    });
    var user = (0, useAuthStore_1.useAuthStore)().user;
    var updateCommentMutation = (0, useComments_1.useUpdateComments)();
    (0, react_1.useEffect)(function () {
        if (comment && open) {
            form.reset({
                text: comment.text || "",
                media: null,
            });
        }
    }, [comment, open, form]);
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id))
                            return [2 /*return*/];
                        return [4 /*yield*/, updateCommentMutation.mutateAsync({
                                data: {
                                    text: values.text,
                                    media: values.media,
                                },
                                userId: Number(user.id),
                                commentId: Number(comment === null || comment === void 0 ? void 0 : comment.id),
                                postId: Number(comment === null || comment === void 0 ? void 0 : comment.post.id),
                            })];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            form.reset();
                            onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    var isSubmitting = updateCommentMutation.isPending;
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Editar comentário</dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label_1.Label htmlFor="comment-text">
                O que você gostaria de compartilhar?
              </label_1.Label>
              <react_hook_form_1.Controller name="text" control={form.control} render={function (_a) {
            var field = _a.field;
            return (<textarea_1.Textarea id="comment-text" placeholder="Escreva sua mensagem aqui..." className="min-h-[150px]" {...field}/>);
        }}/>
            </div>
          </div>
          <dialog_1.DialogFooter className="mt-4">
            <dialog_1.DialogClose asChild>
              <button_1.Button variant="outline" className="hover:cursor-pointer">
                Cancelar
              </button_1.Button>
            </dialog_1.DialogClose>
            <button_1.Button type="submit" variant="third" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Editar"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
