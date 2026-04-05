import { Profile } from "@/features/profile/pages/Profile";
import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "@/app/routes/PrivateRoutes";

export function ProfileRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Profile />} />
        <Route path="/:username" element={<Profile />} />
      </Route>
    </Routes>
  );
}
