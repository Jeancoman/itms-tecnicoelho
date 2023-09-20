import NavPanel from "../components/misc/nav-panel";

export default function HomePage() {

  return (
    <> 
      <div className="min-h-screen bg-white grid grid-cols-[1fr,_5fr] scrollbar-none overflow-hidden">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          HomeMenu
        </main>
      </div>
    </>
  );
}
