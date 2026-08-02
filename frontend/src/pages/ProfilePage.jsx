// frontend/src/pages/ProfilePage.jsx
import { useParams } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { userId } = useParams();

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 relative">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <UserProfile userId={userId} />
      </div>
    </div>
  );
}
