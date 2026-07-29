import Navbar from '../components/Navbar';
import SocialFeed from '../components/SocialFeed';

export default function SocialPage() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <main className="mx-auto px-4 py-5 sm:px-6">
        <SocialFeed />
      </main>
    </div>
  );
}
