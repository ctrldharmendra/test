import BottomNav from "@/components/bottomNav/BottomNav";


export default function AppLayout({ children }) {
  return (
    <div className="min-h-dvh">
      <main className="min-h-dvh pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}