"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var client_1 = require("react-dom/client");
var react_router_dom_1 = require("react-router-dom");
var react_query_1 = require("@tanstack/react-query");
require("./index.css");
var App_tsx_1 = require("./App.tsx");
var sonner_1 = require("sonner");
var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            // ✅ Nunca mostra loading se já tem dados em cache
            notifyOnChangeProps: ["data", "error"],
            // ✅ Mantém dados em cache mesmo quando componente desmonta
            gcTime: 30 * 60 * 1000, // 30 minutos
        },
    },
});
(0, client_1.createRoot)(document.getElementById("root")).render(<react_1.StrictMode>
    <react_router_dom_1.BrowserRouter>
      <react_query_1.QueryClientProvider client={queryClient}>
        <App_tsx_1.default />
        <sonner_1.Toaster />
      </react_query_1.QueryClientProvider>
    </react_router_dom_1.BrowserRouter>
  </react_1.StrictMode>);
