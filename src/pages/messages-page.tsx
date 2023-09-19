import MessagesDataDisplay from "../components/data-display/messages-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function MessagesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[657px]">
          <MessagesDataDisplay />
        </main>
      </div>
    </>
  );
}