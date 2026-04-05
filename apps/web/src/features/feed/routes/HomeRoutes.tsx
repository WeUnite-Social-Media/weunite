import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "@/app/routes/PrivateRoutes";
import { Home } from "@/features/feed/pages/Home";

export function HomeRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/home" element={<Home />} />
        <Route path="" element={<Home />} />
      </Route>
    </Routes>
  );
}
