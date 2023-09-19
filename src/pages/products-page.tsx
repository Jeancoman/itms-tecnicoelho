import ProductsDataDisplay from "../components/data-display/products-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function ProductsPage() {

  return (
    <> 
      <div className="h-screen bg-[#2096ed] grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ProductsDataDisplay />
        </main>
      </div>
    </>
  );
}