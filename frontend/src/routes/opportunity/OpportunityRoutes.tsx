import { Opportunity } from "@/pages/opportunity/Opportunity";
import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "../PrivateRoutes";

export function OpportunityRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Opportunity />} />
      </Route>
    </Routes>
  );
}
