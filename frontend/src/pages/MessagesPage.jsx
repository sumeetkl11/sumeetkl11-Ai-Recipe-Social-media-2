import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConversationList from '../components/ConversationList';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';
import Navbar from '../components/Navbar';
import useRevalidateOnFocus from '../hooks/useRevalidateOnFocus';
import UserAvatar from '../components/UserAvatar';

export default function MessagesPage() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation({
      ...conversation,
      unread_count: 0
    });
    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id
          ? { ...item, unread_count: 0 }
          : item
      )
    );
  };

  useEffect(() => {
    if (location.state?.selectedConversation) {
      setSelectedConversation(location.state.selectedConversation);
    }
  }, [location.state]);

  const fetchConversations = useCallback(async (options = {}) => {
    const silent = options.silent || conversations.length > 0;
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/conversations');
      const nextConversations = response.data.data || [];
      setConversations(nextConversations);
      setSelectedConversation((current) => {
        if (!current) {
          if (location.state?.selectedConversation) {
            const matched = nextConversations.find((item) => item.id === location.state.selectedConversation.id);
            return matched || location.state.selectedConversation;
          }
          return nextConversations[0] || null;
        }
        return nextConversations.find((item) => item.id === current.id) || current;
      });
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [conversations.length, location.state]);

  useRevalidateOnFocus(() => fetchConversations({ silent: true }), { intervalMs: 20000 });

  const handleMessageSent = () => fetchConversations({ silent: true });

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      
      <div className="mx-auto max-w-6xl px-4 py-4 md:py-6 relative">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="page-hero glass-panel mb-4 rounded-[30px] p-5 shadow-sm border border-white/60 bg-white/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
              <p className="mt-1 text-sm text-slate-500">Fast inbox sync with a live conversation layout.</p>
            </div>
            {refreshing && (
              <div className="glass-badge text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Refreshing
              </div>
            )}
          </div>
        </div>

        {loading && conversations.length === 0 ? (
          <div className="grid gap-4">
            <div className="glass-card loading-skeleton h-24 rounded-[28px]" />
            <div className="glass-card loading-skeleton h-[65vh] rounded-[28px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.3fr] xl:items-stretch xl:h-[calc(100vh-220px)]">
            
            {/* Sidebar: Conversation List */}
            <div className="glass-card overflow-hidden rounded-[30px] flex flex-col min-h-[260px]">
              <div className="border-b border-white/80 p-4">
                <span className="font-bold text-slate-800">Recent Chats</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            </div>

            {/* Main Section: Message Thread */}
            <div className="h-full min-h-[480px]">
              {selectedConversation ? (
                <div className="glass-card h-full flex flex-col rounded-[30px] overflow-hidden">
                  
                  <div className="flex items-center gap-3 border-b border-white/80 bg-white/50 p-4 sticky top-0 z-10 backdrop-blur-[18px]">
                    <UserAvatar 
                      name={selectedConversation.other_user_name} 
                      src={selectedConversation.other_user_avatar}
                      size={44}
                      className="rounded-full object-cover shadow-sm border border-black/5"
                      textClassName="text-white font-semibold"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight">
                        {selectedConversation.other_user_name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-[12px] text-slate-500">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-transparent px-3 sm:px-4">
                    <MessageThread conversation={selectedConversation} />
                  </div>

                  <div className="border-t border-white/80 bg-white/50 p-3 backdrop-blur-[18px]">
                    <MessageInput conversationId={selectedConversation.id} onMessageSent={handleMessageSent} />
                  </div>
                </div>
              ) : (
                <div className="glass-card h-full flex items-center justify-center rounded-[30px]">
                  <p className="text-slate-400">Select a chat to start messaging</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
