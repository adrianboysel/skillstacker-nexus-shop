import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Package, Gift, Star, Users, LogOut } from "lucide-react";

export type AdminTopNavProps = {
  onLogout?: () => void;
};

const items = [
  { label: "Inventory", to: "/admin/inventory", icon: Package },
  { label: "Giveaways", to: "/admin/giveaways", icon: Gift },
  { label: "Product Points", to: "/admin/product-points", icon: Star },
  { label: "Users", to: "/admin/users", icon: Users },
] as const;

export function AdminTopNav({ onLogout }: AdminTopNavProps) {
  const location = useLocation();

  return (
    <header className="w-full">
      <nav aria-label="Admin navigation" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;

            return (
              <Button key={item.to} variant={isActive ? "default" : "outline"} size="sm" asChild>
                <NavLink to={item.to} end className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              </Button>
            );
          })}
        </div>

        {onLogout ? (
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        ) : null}
      </nav>
    </header>
  );
}
