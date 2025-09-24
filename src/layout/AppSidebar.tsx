// src/layouts/AppSidebar.tsx
import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  ShoppingCart,
  PlugZap,
  MoreHorizontal,
  Info,
  Package,
  CreditCard,
} from "lucide-react"; // ✅ icons
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

// ✅ Main menu items (direct links)
const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5 text-blue-500" />,
    name: "upload Media",
    path: "/home",
  },
  
  {
    name: "My Orders",
    icon: <ShoppingCart className="w-5 h-5 text-orange-500" />,
    path: "/basic-tables",
  },
  {
    name: "About",
    icon: <Info className="w-5 h-5 text-cyan-500" />,
    path: "/blank",
  },

{
    icon: <UserCircle className="w-5 h-5 text-purple-500" />,
    name: "Account information",
    path: "/profile",
  },



];

// ✅ Other menu items (direct links)
const othersItems: NavItem[] = [
  {
    icon: <Package className="w-5 h-5 text-pink-500" />,
    name: "Subscriptions",
    path: "/subscriptions",
  },
  {
    icon: <CreditCard className="w-5 h-5 text-violet-500" />,
    name: "Payment details",
    path: "/payment",
  },
  {
    icon: <PlugZap className="w-5 h-5 text-red-500" />,
    name: "Sign In",
    path: "/signin",
  },
  {
    icon: <PlugZap className="w-5 h-5 text-red-500" />,
    name: "Sign Up",
    path: "/signup",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span className="menu-item-icon-size">{nav.icon}</span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r transition-all z-50 
        ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="py-8 flex justify-center">
        <Link to="/">
          <img
            src="/images/logo/VisialiveLogo.png"
            alt="Logo"
            width={150}
            height={40}
          />
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-4 text-xs uppercase text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? "" : <MoreHorizontal />}
              </h2>
              {renderMenuItems(navItems)}
            </div>
            <div>
              <h2 className="mb-4 text-xs uppercase text-gray-400">
                {isExpanded || isHovered || isMobileOpen ? "Others" : <MoreHorizontal />}
              </h2>
              {renderMenuItems(othersItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
