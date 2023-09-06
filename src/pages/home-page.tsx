import NavPanel from "../components/misc/nav-panel";

export default function HomePage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr,_5fr] py-5">
        <NavPanel />
        <main className="bg-white rounded-xl mr-5 relative">
          HomeMenu
        </main>
      </div>
    </>
  );
}
