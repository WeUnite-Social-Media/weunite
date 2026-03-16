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
exports.SignUp = SignUp;
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var card_1 = require("@/shared/components/ui/card");
var form_1 = require("@/shared/components/ui/form");
var input_1 = require("@/shared/components/ui/input");
var button_1 = require("@/shared/components/ui/button");
var progress_1 = require("@/shared/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var dotlottie_react_1 = require("@lottiefiles/dotlottie-react");
var checkbox_1 = require("@/shared/components/ui/checkbox");
var usePasswordStrength_1 = require("@/features/auth/hooks/usePasswordStrength");
var react_1 = require("react");
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_router_dom_1 = require("react-router-dom");
var useAuthMessages_1 = require("@/features/auth/hooks/useAuthMessages");
var signUp_schema_1 = require("@/features/auth/schemas/signUp.schema");
function SignUp(_a) {
    var setCurrentTab = _a.setCurrentTab;
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(signUp_schema_1.signUpSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            role: "athlete",
        },
    });
    var _b = (0, react_1.useState)(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = (0, useAuthStore_1.useAuthStore)(), signup = _c.signup, loading = _c.loading;
    var password = form.watch("password");
    var progress = (0, usePasswordStrength_1.usePasswordStrength)(password);
    var navigate = (0, react_router_dom_1.useNavigate)();
    function onSubmit(values) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, signup(values)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            navigate("/auth/verify-email/".concat(values.email));
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    (0, useAuthMessages_1.useAuthMessages)();
    return (<div className="flex flex-col space-y-2">
      <div className="flex justify-center">
        <dotlottie_react_1.DotLottieReact src="https://lottie.host/a06a613a-efd2-4dbd-96d0-2f4fd7344792/0jYYhWcj4H.lottie" loop autoplay className="w-50 m-0"/>
      </div>

      <card_1.Card className="w-110 lg:120 xl:w-125">
        <card_1.CardContent>
          <div className="text-center mb-3">
            <h2 className="text-2xl font-bold">Crie sua conta</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Preencha os dados abaixo para começar
            </p>
          </div>
          <div className="space-y-4">
            <form_1.Form {...form}>
              <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                <form_1.FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Name</form_1.FormLabel>
                      <form_1.FormControl>
                        <div className="relative">
                          <lucide_react_1.User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                          <input_1.Input type="text" placeholder="João da Silva" className="pl-8" {...field}/>
                        </div>
                      </form_1.FormControl>
                      <form_1.FormMessage className="text-xs"/>
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="username" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Username</form_1.FormLabel>
                      <form_1.FormControl>
                        <div className="relative">
                          <lucide_react_1.UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                          <input_1.Input type="text" placeholder="JoãoSilva" className="pl-8" {...field}/>
                        </div>
                      </form_1.FormControl>
                      <form_1.FormMessage className="text-xs"/>
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Email</form_1.FormLabel>
                      <form_1.FormControl>
                        <div className="relative">
                          <lucide_react_1.AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                          <input_1.Input type="email" placeholder="joaosilva@provedor.com" className="pl-8" {...field}/>
                        </div>
                      </form_1.FormControl>
                      <form_1.FormMessage className="text-xs"/>
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Password</form_1.FormLabel>
                      <form_1.FormControl>
                        <div className="relative">
                          <lucide_react_1.KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                          <input_1.Input type={showPassword ? "text" : "password"} placeholder="**********" className="pl-8" {...field}/>
                          <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-2.5 transition-transform duration-300 ease-in-out">
                            {showPassword ? (<lucide_react_1.EyeOff className="h-4 w-4 text-muted-foreground animate-pulse"/>) : (<lucide_react_1.Eye className="h-4 w-4 text-muted-foreground animate-pulse"/>)}
                          </button>
                        </div>
                      </form_1.FormControl>
                      <form_1.FormMessage className="text-xs"/>
                    </form_1.FormItem>);
        }}/>
                <div className="flex flex-col space-y-3">
                  <div>
                    <progress_1.Progress value={progress}/>
                    <span className="text-xs">Segurança da senha</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox id="terms" required/>
                    <label htmlFor="terms" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Aceitar{" "}
                      <a href="" className="underline decoration-solid">
                        termos e condições
                      </a>
                    </label>
                  </div>

                  <button_1.Button type="submit" disabled={loading}>
                    {loading ? <lucide_react_1.Loader2 /> : "Cadastrar"}
                  </button_1.Button>
                  <span className="text-xs">
                    Já se cadastrou? {""}
                    <a href="#" className="underline decoration-solid" onClick={function () { return setCurrentTab("login"); }}>
                      Login
                    </a>
                  </span>
                </div>
              </form>
            </form_1.Form>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
