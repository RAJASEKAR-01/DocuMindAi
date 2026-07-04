import { NavLink, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  ArrowUpTrayIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useCurrentUser, useLogout } from "../../features/auth/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { to: "/upload", label: "Upload", icon: ArrowUpTrayIcon },
  { to: "/history", label: "History", icon: ClockIcon },
  { to: "/profile", label: "Profile", icon: UserCircleIcon },
];

const Navbar = () => {
  const user = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-paper-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 font-extrabold text-lg tracking-tight"
        >
          <span className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-accent" />
          </span>
          DocuMind <span className="text-accent-dark">AI</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-ink text-white" : "text-ink-muted hover:bg-paper-soft"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-medium text-ink-muted">
            {user?.name?.split(" ")[0]}
          </span>
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
            aria-label="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex items-center justify-around border-t border-paper-border">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                isActive ? "text-ink" : "text-ink-muted"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
