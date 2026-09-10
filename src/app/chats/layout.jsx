import TopNav from "@/components/TopNav/TopNav";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-dvh">
      <main className="min-h-dvh pb-20 mt-[40px]">
<TopNav></TopNav>
        {children}
      </main>
    </div>
  );
}