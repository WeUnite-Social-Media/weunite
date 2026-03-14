import { Opportunity } from "@/features/opportunities/pages/Opportunity";
import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "@/app/routes/PrivateRoutes";

export function OpportunityRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Opportunity />} />
      </Route>
    </Routes>
  );
}
