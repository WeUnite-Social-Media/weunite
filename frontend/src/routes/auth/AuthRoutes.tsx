import { Route, Routes } from "react-router-dom";
import { PublicRoutes } from "../PublicRoutes";
import { VerifyResetToken } from "@/pages/auth/VerifyResetToken";
import { SendResetPassword } from "@/pages/auth/SendResetPassword";
import { VerifyEmail } from "@/pages/auth/VerifyEmail";
import { Index } from "@/pages/auth/Index";
import { ResetPassword } from "@/pages/auth/ResetPassword";

export function AuthRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path={"*"} element={<Index />} />
        <Route path={"verify-email/:email"} element={<VerifyEmail />} />
        <Route path={"send-reset-password"} element={<SendResetPassword />} />
        <Route
          path={"verify-reset-token/:email"}
          element={<VerifyResetToken />}
        />
        <Route
          path={"reset-password/:verificationToken"}
          element={<ResetPassword />}
        />
      </Route>
    </Routes>
  );
}
