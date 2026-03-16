"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = Index;
var Login_1 = require("@/features/auth/components/Login");
var SignUp_1 = require("@/features/auth/components/SignUp");
var SignUpCompany_1 = require("@/features/auth/components/SignUpCompany");
var tabs_1 = require("@/shared/components/ui/tabs");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
function Index() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var location = (0, react_router_dom_1.useLocation)();
    var path = location.pathname.split("/").pop() || "login";
    var setCurrentTab = function (tab) {
        navigate("/auth/".concat(tab));
    };
    (0, react_1.useEffect)(function () {
        if (!["login", "signup", "signupcompany"].includes(path)) {
            navigate("/auth/login", { replace: true });
        }
    }, [path, navigate]);
    return (<div className="flex items-center justify-center h-screen">
      <tabs_1.Tabs value={path} onValueChange={setCurrentTab}>
        <tabs_1.TabsContent value="signup">
          <SignUp_1.SignUp setCurrentTab={setCurrentTab}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="login">
          <Login_1.Login setCurrentTab={setCurrentTab}/>
        </tabs_1.TabsContent>
        <tabs_1.TabsContent value="signupcompany">
          <SignUpCompany_1.SignUpCompany setCurrentTab={setCurrentTab}/>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
