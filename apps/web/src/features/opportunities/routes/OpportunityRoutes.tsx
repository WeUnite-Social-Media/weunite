import { Opportunity } from "@/features/opportunities/pages/Opportunity";
import { MyOpportunities } from "@/features/opportunities/pages/MyOpportunities";
import { OpportunitySubscribersPage } from "@/features/opportunities/pages/OpportunitySubscribersPage";
import { SavedOpportunitiesPage } from "@/features/opportunities/pages/SavedOpportunitiesPage";
import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "@/app/routes/PrivateRoutes";

export function OpportunityRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Opportunity />} />
        <Route path="/my-opportunities" element={<MyOpportunities />} />
        <Route path="/saved" element={<SavedOpportunitiesPage />} />
        <Route
          path="/:opportunityId/subscribers"
          element={<OpportunitySubscribersPage />}
        />
      </Route>
    </Routes>
  );
}
