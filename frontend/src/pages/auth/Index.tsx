import { Login } from "@/components/auth/Login";
import { SignUp } from "@/components/auth/SignUp";
import { SignUpCompany } from "@/components/auth/SignUpCompany";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/").pop() || "login";
  
  const setCurrentTab = (tab: string) => {
    navigate(`/auth/${tab}`);
  };

  useEffect(() => {
    if (!["login", "signup", "signupcompany"].includes(path)) {
      navigate("/auth/login", { replace: true });
    }
  }, [path, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Tabs value={path} onValueChange={setCurrentTab}>
        <TabsContent value="signup">
          <SignUp setCurrentTab={setCurrentTab} />
        </TabsContent>

        <TabsContent value="login">
          <Login setCurrentTab={setCurrentTab} />
        </TabsContent>
        <TabsContent value="signupcompany">
          <SignUpCompany setCurrentTab={setCurrentTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

