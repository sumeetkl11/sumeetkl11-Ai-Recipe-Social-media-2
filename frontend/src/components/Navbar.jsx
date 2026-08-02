import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

import { createPortal } from 'react-dom';

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
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const navContent = (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/20 h-14 flex justify-between items-center px-4 md:px-10">
        <Link to="/dashboard" className="font-headline-md text-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cooking</span>
          Kitchen Canvas
        </Link>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer active:scale-95" title="Notifications">notifications</button>
          
          <div className="relative" ref={dropdownRef}>
            <div 
              className="w-8 h-8 rounded-full overflow-hidden border border-white/50 shadow-sm cursor-pointer active:scale-95 transition-transform"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img alt="User Avatar" className="w-full h-full object-cover" src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden py-1 z-50">
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Settings
                </Link>
                <div className="h-px bg-slate-200/50 my-1"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-between items-center px-4 py-2 bg-white/40 backdrop-blur-2xl border border-white/30 w-[calc(100%-40px)] max-w-2xl rounded-full shadow-[0_40px_40px_-15px_rgba(245,158,11,0.08)]">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink to="/generate" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>auto_awesome</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Generate</span>
            </>
          )}
        </NavLink>

        <NavLink to="/recipes" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>restaurant_menu</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Recipes</span>
            </>
          )}
        </NavLink>

        <NavLink to="/pantry" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Pantry</span>
            </>
          )}
        </NavLink>

        <NavLink to="/social" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>group</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Social</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/meal-plan" className={({isActive}) => `flex flex-col items-center justify-center rounded-full px-4 sm:px-6 py-2 transition-transform duration-200 active:scale-90 ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-white/20'}`}>
          {({isActive}) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>calendar_month</span>
              <span className="font-label-sm text-xs sm:text-sm hidden sm:block">Plan</span>
            </>
          )}
        </NavLink>
      </nav>
    </>
  );

  return createPortal(navContent, document.body);
}
