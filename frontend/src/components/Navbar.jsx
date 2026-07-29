import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  ChefHat,
  ChevronDown,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  UtensilsCrossed,
  WandSparkles
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import NotificationBadge from './NotificationBadge';
import UserAvatar from './UserAvatar';

const desktopNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/pantry', label: 'Pantry', icon: UtensilsCrossed },
  { to: '/generate', label: 'Generate', icon: WandSparkles },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/meal-plan', label: 'Meal Plan', icon: Calendar },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/social', label: 'Social', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle }
];

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/generate', label: 'Create', icon: WandSparkles },
  { to: '/marketplace', label: 'Shop', icon: ShoppingBag },
  { to: '/social', label: 'Social', icon: Heart },
  { to: '/profile', label: 'Profile', icon: User }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
        <div className="glass-shell px-4 py-3 sm:px-5">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <Link to="/dashboard" className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(45deg,#FF3CAC_0%,#784BA0_50%,#2B86C5_100%)] text-white shadow-[0_16px_28px_rgba(120,75,160,0.28)]">
                <ChefHat className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-display text-[1.05rem] font-extrabold text-slate-900">Kitchen Canvas</span>
                <span className="block truncate text-[11px] font-medium tracking-[0.04em] text-slate-500">SOCIAL COOKING, ELEVATED</span>
              </div>
            </Link>

            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="custom-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/90 bg-white/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {desktopNavItems.map((item) => (
                  <DesktopNavLink
                    key={item.to}
                    to={item.to}
                    icon={<item.icon className="h-4 w-4" />}
                    label={item.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <NotificationBadge />

              <Link
                to="/settings"
                className="hidden rounded-full border border-white/90 bg-white/72 p-2.5 text-slate-600 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:text-slate-900 md:inline-flex"
              >
                <Settings className="h-4 w-4" />
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-white/90 bg-white/78 px-2.5 py-2 text-sm font-medium text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
                >
                  <UserAvatar
                    name={user?.name || 'User'}
                    src={user?.avatar_url}
                    size={36}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full object-cover text-sm font-semibold text-white"
                    textClassName="text-sm font-semibold text-white"
                  />
                  <div className="hidden text-left md:block">
                    <span className="block max-w-28 truncate text-sm font-semibold">{user?.name || 'User'}</span>
                    <span className="block max-w-28 truncate text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Studio account</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-[28px] border border-white/90 bg-white/82 py-2 shadow-[0_24px_44px_rgba(15,23,42,0.08)] backdrop-blur-[18px]">
                    <div className="border-b border-white/90 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user?.name || 'User'}
                          src={user?.avatar_url}
                          size={44}
                          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full object-cover font-semibold text-white"
                          textClassName="font-semibold text-white"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                          <p className="truncate text-xs font-medium text-slate-500">{user?.email || 'user@example.com'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-2 py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white/85 hover:text-slate-900"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white/85 hover:text-slate-900"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mx-2 flex w-[calc(100%-1rem)] items-center justify-center gap-3 rounded-full bg-[linear-gradient(45deg,#FF3CAC_0%,#784BA0_50%,#2B86C5_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(120,75,160,0.2)]"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[min(calc(100vw-1rem),28rem)] -translate-x-1/2 px-0 lg:hidden">
        <div className="grid grid-cols-5 rounded-[30px] border border-white/90 bg-white/78 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.08)] backdrop-blur-[20px]">
          {mobileNavItems.map((item) => (
            <MobileNavLink key={item.to} to={item.to} icon={<item.icon className="h-4 w-4" />} label={item.label} />
          ))}
        </div>
      </div>
    </>
  );
}

function DesktopNavLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium tracking-[-0.02em] transition ${
          isActive
            ? 'bg-[linear-gradient(45deg,#FF3CAC_0%,#784BA0_50%,#2B86C5_100%)] text-white shadow-[0_14px_28px_rgba(120,75,160,0.2)]'
            : 'text-slate-600 hover:bg-white/90 hover:text-slate-900'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNavLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-semibold tracking-[-0.02em] transition ${
          isActive
            ? 'bg-[linear-gradient(45deg,#FF3CAC_0%,#784BA0_50%,#2B86C5_100%)] text-white shadow-[0_14px_26px_rgba(120,75,160,0.22)]'
            : 'text-slate-500'
        }`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
