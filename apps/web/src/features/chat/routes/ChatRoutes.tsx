import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "@/app/routes/PrivateRoutes";
import { Chat } from "@/features/chat/pages";

export function ChatRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoutes />}>
        <Route index element={<Chat />} />
      </Route>
    </Routes>
  );
}
