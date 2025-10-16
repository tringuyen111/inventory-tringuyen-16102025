import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Organizations from "./pages/Organizations";
import Branches from "./pages/Branches";
import Warehouses from "./pages/Warehouses";
import Locations from "./pages/Locations";
import { Toaster } from "./components/ui/Toaster";

// Placeholder for pages that are not yet created
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-3xl font-bold text-muted-foreground">{title}</h1>
  </div>
);

const Dashboard = () => <Placeholder title="Dashboard" />;
const Inventory = () => <Placeholder title="Onhand Inventory" />;
const GoodsReceipts = () => <Placeholder title="Goods Receipts" />;
const GoodsIssues = () => <Placeholder title="Goods Issues" />;
const Putaway = () => <Placeholder title="Putaway" />;
const InventoryCounts = () => <Placeholder title="Inventory Counts" />;
const GoodsTypes = () => <Placeholder title="Goods Types" />;
const ModelGoods = () => <Placeholder title="Goods Models" />;
const Reports = () => <Placeholder title="Reports" />;
const Authentication = () => <Placeholder title="Authentication" />;
const UoMs = () => <Placeholder title="Units of Measure" />;
const Partners = () => <Placeholder title="Partners" />;

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/goods-receipts" element={<GoodsReceipts />} />
          <Route path="/goods-issues" element={<GoodsIssues />} />
          <Route path="/putaway" element={<Putaway />} />
          <Route path="/inventory-counts" element={<InventoryCounts />} />
          <Route path="/goods-types" element={<GoodsTypes />} />
          <Route path="/model-goods" element={<ModelGoods />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/uoms" element={<UoMs />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/locations" element={<Locations />} />
        </Route>
      </Routes>
      <Toaster />
    </HashRouter>
  );
}

export default App;