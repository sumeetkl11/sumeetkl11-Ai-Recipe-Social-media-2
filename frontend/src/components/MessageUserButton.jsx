import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import api from '../services/api';

export default function MessageUserButton({ userId, className = '', label = 'Message', iconOnly = false }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    if (!userId || loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/conversations', { otherUserId: userId });
      navigate('/messages', {
        state: {
          selectedConversation: response.data.data
        }
      });
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleStartConversation}
      disabled={loading}
      className={className}
      title={label}
    >
      <MessageCircle className="h-4 w-4" />
      {!iconOnly && <span>{loading ? 'Opening...' : label}</span>}
    </button>
  );
}
