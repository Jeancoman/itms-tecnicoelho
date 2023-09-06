import SalesDataDisplay from "../components/data-display/sales-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function SalesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr] py-5">
        <NavPanel />
        <main className="bg-white rounded-xl mr-5 relative">
          <SalesDataDisplay />
        </main>
      </div>
    </>
  );
}