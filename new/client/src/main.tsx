import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/ErrorPage.tsx";
import DDMValuationComponent from "./components/DDMValuationComponent.tsx";
import CompaniesComponent from "./components/Companies.tsx";
import CompanyDetailsComponent from "./components/CompanyDetailsComponent.tsx";
import 'bootstrap/dist/css/bootstrap.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <CompaniesComponent />,
      },
      {
        path: "/companies",
        element: <CompaniesComponent />,
      },
      {
        path: "/companies/:id",
        element: <CompanyDetailsComponent />,
      },
      {
        path: "/valuation",
        element: <DDMValuationComponent />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
