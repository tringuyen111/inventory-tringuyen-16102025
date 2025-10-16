import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import Header from "./Header"; // Import the new Header component
import {
  LayoutDashboard,
  Warehouse,
  Package,
  BarChart3,
  ChevronDown,
  BookUser,
  UserCog,
  Package2,
} from "lucide-react";

// New navigation structure
const navigation = [
  { name: "Dashboards", href: "/dashboard", icon: LayoutDashboard, type: "link" },
  {
    name: "Warehouse",
    icon: Warehouse,
    type: "group",
    children: [
      { name: "Onhand", href: "/inventory" },
      { name: "Goods Receipt", href: "/goods-receipts" },
      { name: "Goods Issue", href: "/goods-issues" },
      { name: "Putaway", href: "/putaway" },
      { name: "Inventory Counts", href: "/inventory-counts" },
    ],
  },
  {
    name: "Goods",
    icon: Package,
    type: "group",
    children: [
      { name: "Goods Type", href: "/goods-types" },
      { name: "Goods Model", href: "/model-goods" },
    ],
  },
  { name: "Reports", href: "/reports", icon: BarChart3, type: "link" },
  { name: "Admin", type: "header" },
  { name: "Authentication", href: "/authentication", icon: UserCog, type: "link" },
  {
    name: "Catalog",
    icon: BookUser,
    type: "group",
    children: [
      { name: "UoM", href: "/uoms" },
      { name: "Partner", href: "/partners" },
      { name: "Organization", href: "/organizations" },
      { name: "Branch", href: "/branches" },
      { name: "Warehouse", href: "/warehouses" },
      { name: "Location", href: "/locations" },
    ],
  },
];

export default function Layout() {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <div className="min-h-screen bg-secondary/50">
      <div className="flex">
        <aside className="w-64 h-screen bg-card border-r border-border fixed top-0 left-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <Package2 className="h-6 w-6" />
              <span className="text-xl font-bold text-foreground">Delfi Pro</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navigation.map((item, index) => {
              if (item.type === "header") {
                return (
                  <h3 key={`${item.name}-${index}`} className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.name}
                  </h3>
                );
              }

              if (item.type === "group" && item.children) {
                const isGroupActive = item.children.some(child => location.pathname.startsWith(child.href));
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isGroupActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups.includes(item.name) && "rotate-180")} />
                    </button>
                    {openGroups.includes(item.name) && (
                      <div className="pl-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isChildActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === 'link' && item.icon) {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              }
              return null;
            })}
          </nav>
        </aside>

        <div className="flex flex-col flex-1 ml-64">
            <Header />
            <main className="flex-1 p-8">
              <Outlet />
            </main>
        </div>
      </div>
    </div>
  );
}