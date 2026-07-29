import Navbar from '../../components/Navbar';

export default function WishlistPage() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Wishlists</h1>
          <button className="cta-button">Create Wishlist</button>
        </div>
        
        <div className="glass-card text-center p-12 text-slate-500">
          Wishlist features coming soon...
        </div>
      </main>
    </div>
  );
}
