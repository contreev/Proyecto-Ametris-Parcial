// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Alquimistas from "./pages/Alquimistas";
import Misiones from "./pages/Misiones";
import Transmutaciones from "./pages/Transmutaciones";
import AuthPage from "./pages/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "alquimistas", element: <Alquimistas /> },
      { path: "misiones", element: <Misiones /> },
      { path: "transmutaciones", element: <Transmutaciones /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
