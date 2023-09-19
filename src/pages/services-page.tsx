import ServicesDataDisplay from "../components/data-display/services-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ServicesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ServicesDataDisplay />
        </main>
      </div>
    </>
  );
}