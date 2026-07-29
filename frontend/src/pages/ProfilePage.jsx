// frontend/src/pages/ProfilePage.jsx
import { useParams } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { userId } = useParams();

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <UserProfile userId={userId} />
      </div>
    </div>
  );
}
