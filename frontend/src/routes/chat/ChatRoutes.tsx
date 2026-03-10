import { Route, Routes } from "react-router-dom";
import { PrivateRoutes } from "../PrivateRoutes";
import { Chat } from "@/pages/chat";

export function ChatRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoutes />}>
        <Route index element={<Chat />} />
      </Route>
    </Routes>
  );
}
