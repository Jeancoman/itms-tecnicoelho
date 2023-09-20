import ElementsDataDisplay from "../components/data-display/elements-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ElementsPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ElementsDataDisplay />
        </main>
      </div>
    </>
  );
}