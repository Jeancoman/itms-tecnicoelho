import PurchasesDataDisplay from "../components/data-display/purchases-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function PurchasesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative">
          <PurchasesDataDisplay />
        </main>
      </div>
    </>
  );
}