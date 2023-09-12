import CategoriesDataDisplay from "../components/data-display/categories-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function CategoriesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative">
          <CategoriesDataDisplay />
        </main>
      </div>
    </>
  );
}