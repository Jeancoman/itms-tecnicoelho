import PublicationsDataDisplay from "../components/data-display/publications-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function PublicationsPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <PublicationsDataDisplay />
        </main>
      </div>
    </>
  );
}