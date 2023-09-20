import ProvidersDataDisplay from "../components/data-display/providers-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ProvidersPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ProvidersDataDisplay />
        </main>
      </div>
    </>
  );
}