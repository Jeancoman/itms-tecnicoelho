import TicketsDataDisplay from "../components/data-display/tickets-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function TicketsPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[657px]">
          <TicketsDataDisplay />
        </main>
      </div>
    </>
  );
}