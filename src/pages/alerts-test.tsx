// pages/alerts-test.tsx
import React from "react";
import { NextPage } from "next";
import AlertsShowcase from "../components/AlertsShowcase";

const AlertsTestPage: NextPage = () => {
  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <h1 className="text-white text-3xl font-bold text-center mb-6">
        Wonderland Alerts Showcase
      </h1>
      <AlertsShowcase />
    </div>
  );
};

export default AlertsTestPage;
