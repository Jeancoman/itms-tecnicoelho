import SalesDataDisplay from "../components/data-display/sales-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function SalesPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <SalesDataDisplay />
        </main>
      </div>
    </>
  );
}