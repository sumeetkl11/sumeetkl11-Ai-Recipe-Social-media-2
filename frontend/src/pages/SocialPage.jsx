import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import SocialFeed from '../components/SocialFeed';
import api from '../services/api';

export default function SocialPage() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const response = await api.get('/conversations');
        const convos = response.data.data || [];
        const count = convos.reduce((acc, c) => acc + (c.unread_count || 0), 0);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching conversations for unread count', err);
      }
    };
    fetchUnread();
  }, []);

  const floatingButton = (
    <Link 
      to="/messages"
      className="fixed bottom-28 right-4 md:right-8 cc-glass-panel p-4 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group border border-white/50 shadow-lg"
    >
      <span className="material-symbols-outlined text-primary text-[28px] group-hover:text-amber-600 transition-colors">chat</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <div className="page-bg min-h-screen relative">
      <Navbar />

      <main className="mx-auto px-4 py-5 sm:px-6 relative max-w-[1200px]">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] right-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <SocialFeed />
      </main>

      {/* Floating Messages Button */}
      {createPortal(floatingButton, document.body)}
    </div>
  );
}
