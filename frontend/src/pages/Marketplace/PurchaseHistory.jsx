import Navbar from '../../components/Navbar';

export default function PurchaseHistory() {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Purchase History</h1>
        <div className="glass-card text-center p-12 text-slate-500">
          Purchase history & analytics coming soon...
        </div>
      </main>
    </div>
  );
}
