import Navbar from '../components/Navbar';
import SocialFeed from '../components/SocialFeed';

export default function SocialPage() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <main className="mx-auto px-4 py-5 sm:px-6 relative max-w-[1200px]">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] right-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <SocialFeed />
      </main>
    </div>
  );
}
