import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { getQueryClient } from "@/queries/get-query-client";
import { router } from "@/router";

import "./index.css";

const queryClient = getQueryClient();
const loadGoogleMapsScript = () => {
  if (!document.getElementById("googleMaps")) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
};

loadGoogleMapsScript();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools />
    </QueryClientProvider>
  </StrictMode>,
);
