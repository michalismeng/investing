import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/ErrorPage.tsx";
import DDMValuationComponent from "./components/DDMValuationComponent.tsx";
import CompaniesComponent from "./components/Companies.tsx";
import TimelineComponent from "./components/TimelineComponent.tsx";
import 'bootstrap/dist/css/bootstrap.css';
import DiaryComponent from "./components/Diary.tsx";

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
        element: <TimelineComponent />,
      },
      {
        path: "/valuation",
        element: <DDMValuationComponent />,
      },
      {
        path: "/diary",
        element: <DiaryComponent />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
