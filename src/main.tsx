import React from "react";
import ReactDOM from "react-dom/client";
import { AppProfiler } from "./AppProfiler.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProfiler />
  </React.StrictMode>
);
