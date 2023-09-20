import ProblemsDataDisplay from "../components/data-display/problems-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ProblemsPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ProblemsDataDisplay />
        </main>
      </div>
    </>
  );
}