import ImagesDataDisplay from "../components/data-display/images-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ImagesPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative">
          <ImagesDataDisplay />
        </main>
      </div>
    </>
  );
}