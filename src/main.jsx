import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { store } from "./redux/store/store";
import Routes from "./Routes";
import "./index.css";

const apiBaseURL = import.meta.env.DEV ? "/api" : `${import.meta.env.BACKEND_URL}/api`;
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
