import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../lib/auth-context";

export function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/dashboard",
    },
    {
      name: "Statistics",
      href: "/stats",
      icon: BarChart3,
      current: location.pathname === "/stats",
    },
  ];

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              HabitForge
            </Link>
            <span className="text-sm text-muted-foreground ml-2">
              Forge your future, one habit at a time.
            </span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            HabitForge
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={async () => {
                try {
                  await logout();
                  navigate("/login");
                } catch (error) {
                  console.error("Logout error:", error);
                  navigate("/login");
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 