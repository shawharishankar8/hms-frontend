import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { initializeIcons } from "@fluentui/react";
import App from "./App";
import {initCornerstone} from "./utils/cornerstoneInit.js";

initCornerstone();
initializeIcons();
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
