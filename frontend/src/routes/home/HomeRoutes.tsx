import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "../PrivateRoutes";
import { Home } from '@/pages/home/Home';  

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
