import ClientsDataDisplay from "../components/data-display/clients-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ClientsPage() {

  return (
    <> 
      <div className="min-h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative">
          <ClientsDataDisplay />
        </main>
      </div>
    </>
  );
}