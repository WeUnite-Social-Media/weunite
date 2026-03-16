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
exports.SendResetPassword = SendResetPassword;
var button_1 = require("@/shared/components/ui/button");
var card_1 = require("@/shared/components/ui/card");
var form_1 = require("@/shared/components/ui/form");
var input_1 = require("@/shared/components/ui/input");
var lucide_react_1 = require("lucide-react");
var react_hook_form_1 = require("react-hook-form");
var react_router_dom_1 = require("react-router-dom");
var zod_1 = require("@hookform/resolvers/zod");
var useResendTimer_1 = require("@/features/auth/hooks/useResendTimer");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useAuthMessages_1 = require("@/features/auth/hooks/useAuthMessages");
var recovery_schema_1 = require("@/features/auth/schemas/recovery.schema");
function SendResetPassword() {
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(recovery_schema_1.sendResetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });
    var _a = (0, useResendTimer_1.useResendTimer)(60), timer = _a.timer, canResend = _a.canResend, startTimer = _a.startTimer;
    var sendResetPassword = (0, useAuthStore_1.useAuthStore)().sendResetPassword;
    var navigate = (0, react_router_dom_1.useNavigate)();
    function onSubmit(value) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sendResetPassword(value)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            navigate("/auth/verify-reset-token/".concat(value.email));
                        }
                        startTimer();
                        return [2 /*return*/];
                }
            });
        });
    }
    (0, useAuthMessages_1.useAuthMessages)();
    return (<div className="flex items-center justify-center min-h-screen p-4">
      <card_1.Card className="w-[380px] max-w-full">
        <card_1.CardHeader className="space-y-2">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={function () { return navigate("/auth"); }}>
            <lucide_react_1.ArrowLeft size={16}/> Voltar
          </button>
          <div className="flex flex-col text-center space-y-2">
            <card_1.CardTitle className="text-2xl font-bold">
              Redefinição de senha
            </card_1.CardTitle>
            <card_1.CardDescription className="text-muted-foreground">
              Insira seu e-mail para redefinir sua senha
            </card_1.CardDescription>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="pt-4">
          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <form_1.FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="w-full">
                    <form_1.FormLabel>E-mail</form_1.FormLabel>
                    <form_1.FormControl>
                      <div className="relative">
                        <lucide_react_1.AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <input_1.Input type="email" placeholder="weunite@exemplo.com" className="pl-8" {...field}/>
                      </div>
                    </form_1.FormControl>
                    <form_1.FormDescription className="text-sm">
                      Você receberá um código de verificação
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
              <button_1.Button className="w-full" type="submit" disabled={form.formState.isSubmitting ||
            !form.formState.isDirty ||
            !canResend}>
                {form.formState.isSubmitting ? (<lucide_react_1.Loader2 className="animate-spin"/>) : ("Confirmar")}
              </button_1.Button>
            </form>
          </form_1.Form>
        </card_1.CardContent>
        <card_1.CardFooter className="flex justify-center border-t pt-2">
          <div className="text-sm text-center">
            <button_1.Button variant="link" className="p-0 h-auto text-muted-foreground cursor-pointer" onClick={function () {
            var emailValue = form.getValues().email;
            if (emailValue) {
                form.handleSubmit(onSubmit)();
            }
            else {
                form.setError("email", {
                    type: "manual",
                    message: "Insira um e-mail para reenviar.",
                });
            }
        }} disabled={form.formState.isSubmitting || !canResend}>
              {canResend ? "Reenviar e-mail" : "Reenviar em ".concat(timer, "s")}
            </button_1.Button>
          </div>
        </card_1.CardFooter>
      </card_1.Card>
    </div>);
}
