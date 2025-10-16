import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Organizations from "./pages/Organizations";
import Warehouses from "./pages/Warehouses";
import Branches from "./pages/Branches";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="branches" element={<Branches />} />
          <Route path="dashboard" element={<PlaceholderPage name="Dashboard" />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="locations" element={<PlaceholderPage name="Locations" />} />
          <Route path="goods-types" element={<PlaceholderPage name="Goods Types" />} />
          <Route path="model-goods" element={<PlaceholderPage name="Model Goods" />} />
          <Route path="uoms" element={<PlaceholderPage name="UoMs" />} />
          <Route path="partners" element={<PlaceholderPage name="Partners" />} />
          <Route path="goods-receipts" element={<PlaceholderPage name="Goods Receipts" />} />
          <Route path="goods-issues" element={<PlaceholderPage name="Goods Issues" />} />
          <Route path="inventory-counts" element={<PlaceholderPage name="Inventory Counts" />} />
          <Route path="putaway" element={<PlaceholderPage name="Putaway" />} />
          <Route path="inventory" element={<PlaceholderPage name="Inventory" />} />
          <Route path="reports" element={<PlaceholderPage name="Reports" />} />
          <Route path="authentication" element={<PlaceholderPage name="Authentication" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

// Placeholder component for routes that are not yet implemented
const PlaceholderPage = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold text-gray-700">{name}</h1>
    <p className="mt-2 text-lg text-gray-500">This page is under construction.</p>
  </div>
);