import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, Apple, LayoutDashboard } from 'lucide-react';
import ClickSpark from './ClickSpark';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function DesktopBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Recipes', icon: UtensilsCrossed, path: '/generate' },
    { name: 'Pantry', icon: Apple, path: '/pantry' },
    { name: 'Plan', icon: LayoutDashboard, path: '/meal-plan' }
  ];

  const containerRef = React.useRef(null);
  


  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex" ref={containerRef}>
      <nav 
        className="glass-panel rounded-full p-2 flex items-center gap-1 shadow-2xl border border-white/20"
        style={{ backdropFilter: 'blur(30px)', background: 'rgba(255,255,255,0.75)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <ClickSpark
              key={item.name}
              sparkColor="#f59e0b"
              sparkSize={6}
              sparkRadius={20}
              sparkCount={6}
              duration={500}
              extraScale={1.3}
            >
              <button
                onClick={() => navigate(item.path)}
                className={`
                  relative px-6 py-2.5 rounded-full flex items-center gap-2.5 text-sm font-semibold transition-all duration-300
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-md" style={{ zIndex: -1 }} />
                )}
                <Icon size={18} className={isActive ? 'drop-shadow-sm' : ''} />
                <span>{item.name}</span>
              </button>
            </ClickSpark>
          );
        })}
      </nav>
    </div>
  );
}
