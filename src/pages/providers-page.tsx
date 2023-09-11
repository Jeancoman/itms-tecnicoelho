import ProvidersDataDisplay from "../components/data-display/providers-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ProvidersPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative">
          <ProvidersDataDisplay />
        </main>
      </div>
    </>
  );
}