import ServicesDataDisplay from "../components/data-display/services-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ServicesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr] py-5">
        <NavPanel />
        <main className="bg-white rounded-xl mr-5 relative">
          <ServicesDataDisplay />
        </main>
      </div>
    </>
  );
}