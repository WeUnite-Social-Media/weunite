import { Profile } from "@/pages/profile/Profile";
import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "../PrivateRoutes";

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
