import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { NextUIProvider } from "@nextui-org/react";
import "./input.css";
import Router from "./Router.tsx";
import './i18n.ts';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <Router />
      </NextUIProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
