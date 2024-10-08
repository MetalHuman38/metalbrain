import ReactDOM from "react-dom/client";
import App from "./App";
import React from "react";
import QueryProvider from "./services/react-query/QueryProvider";
import UserProvider from "./services/context/user/UseContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <UserProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </UserProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
