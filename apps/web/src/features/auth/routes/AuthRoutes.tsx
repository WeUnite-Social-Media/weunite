import { Route, Routes } from "react-router-dom";
import { PublicRoutes } from "@/app/routes/PublicRoutes";
import { VerifyResetToken } from "@/features/auth/pages/VerifyResetToken";
import { SendResetPassword } from "@/features/auth/pages/SendResetPassword";
import { VerifyEmail } from "@/features/auth/pages/VerifyEmail";
import { Index } from "@/features/auth/pages/Index";
import { ResetPassword } from "@/features/auth/pages/ResetPassword";

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
