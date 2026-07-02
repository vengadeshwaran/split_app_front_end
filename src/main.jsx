import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { store } from "./redux/store/store";
import Routes from "./Routes";
import "./index.css";

const backendUrl = import.meta.env.BACKEND_URL;
if (!import.meta.env.DEV && !backendUrl) {
  console.error("[Config] BACKEND_URL is not set. API calls will fail in production.");
}
const apiBaseURL = import.meta.env.DEV ? "/api" : `${backendUrl}/api`;
axios.defaults.baseURL = apiBaseURL;

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Routes />
      </Provider>
    </QueryClientProvider>
  </StrictMode>
);
