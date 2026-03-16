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
exports.Login = Login;
var button_1 = require("@/shared/components/ui/button");
var card_1 = require("@/shared/components/ui/card");
var input_1 = require("@/shared/components/ui/input");
var react_router_dom_1 = require("react-router-dom");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var form_1 = require("@/shared/components/ui/form");
var react_1 = require("react");
var dotlottie_react_1 = require("@lottiefiles/dotlottie-react");
var lucide_react_1 = require("lucide-react");
var login_schema_1 = require("@/features/auth/schemas/login.schema");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var useAuthMessages_1 = require("@/features/auth/hooks/useAuthMessages");
var separator_1 = require("@/shared/components/ui/separator");
function Login(_a) {
    var setCurrentTab = _a.setCurrentTab;
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(login_schema_1.loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    var _b = (0, react_1.useState)(false), showPassword = _b[0], setShowPassword = _b[1];
    var login = (0, useAuthStore_1.useAuthStore)().login;
    var navigate = (0, react_router_dom_1.useNavigate)();
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, login(values)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    (0, useAuthMessages_1.useAuthMessages)();
    return (<div className="">
      <div className="flex flex-col items-center">
        <dotlottie_react_1.DotLottieReact src="https://lottie.host/5ce60653-911c-4bcc-b385-b8be5f43b51e/OGOTw3OGfF.lottie" loop autoplay className="w-50 m-0"/>
      </div>

      <card_1.Card className="w-[24em] lg:w-[30em] xl:w-[32em]">
        <div className="flex flex-col item-center text-center">
          <form_1.FormItem>
            <h1 className="text-2xl font-bold">Bem-Vindo a WeUnite</h1>
          </form_1.FormItem>
        </div>

        <div className="item-center text-center">
          <button_1.Button variant="outline" className="w-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
            </svg>
            <span className="font-normal text">Continue com Google</span>
          </button_1.Button>
        </div>

        <div className="flex justify-around items-center text-sm">
          <separator_1.Separator className="bg-separator-post data-[orientation=horizontal]:w-30 ml-10"/>

          <span className="text-muted-foreground">ou</span>

          <separator_1.Separator className="bg-separator-post data-[orientation=horizontal]:w-30 mr-10"/>
        </div>

        <form_1.Form {...form}>
          <form className="-mt-7 p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <form_1.FormField control={form.control} name="username" render={function (_a) {
            var field = _a.field;
            return (<div className="grid gap-2">
                    <form_1.FormLabel>Username</form_1.FormLabel>
                    <form_1.FormControl>
                      <div className="relative">
                        <input_1.Input id="username" type="username" placeholder="WeUnite" {...field}/>
                      </div>
                    </form_1.FormControl>
                    <form_1.FormMessage className="text-chart-5"/>
                  </div>);
        }}/>

              <form_1.FormField control={form.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<div className="grid gap-2">
                    <div className="flex items-center">
                      <form_1.FormLabel>Senha</form_1.FormLabel>
                      <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline" onClick={function () { return navigate("/auth/send-reset-password"); }}>
                        Esqueceu sua senha?
                      </a>
                    </div>

                    <form_1.FormControl>
                      <div className="relative">
                        <input_1.Input id="password" type={showPassword ? "text" : "password"} placeholder="**********" {...field}/>
                        <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-2.5 transition-transform duration-300 ease-in-out">
                          {showPassword ? (<lucide_react_1.EyeOff className="h-4 w-4 text-muted-foreground animate-pulse"/>) : (<lucide_react_1.Eye className="h-4 w-4 text-muted-foreground animate-pulse"/>)}
                        </button>
                      </div>
                    </form_1.FormControl>
                    <form_1.FormMessage className="text-chart-5"/>
                  </div>);
        }}/>
              <button_1.Button type="submit" className="w-full " disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (<lucide_react_1.Loader2 className="animate-spin"/>) : ("Login")}
              </button_1.Button>

              <div className="text-center text-sm">
                Não tem uma conta? <br />
                <span className="text-muted-foreground">
                  Cadastre-se como{" "}
                  <a href="#" className="underline decoration-solid" onClick={function () { return setCurrentTab("signupcompany"); }}>
                    clube
                  </a>{" "}
                  ou{" "}
                  <a href="#" className="underline decoration-solid" onClick={function () { return setCurrentTab("signup"); }}>
                    atleta
                  </a>
                </span>
              </div>
            </div>
          </form>
        </form_1.Form>
      </card_1.Card>
    </div>);
}
