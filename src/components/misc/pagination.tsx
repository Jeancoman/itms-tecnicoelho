import { ReactComponent as Left } from "../../assets/arrow-left-solid.svg";
import { ReactComponent as Right } from "../../assets/arrow-right-solid.svg";

export default function Pagination() {
  return (
    <nav className="absolute bottom-5 left-8 flex items-center gap-4 ">
      <div className="p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-pointer hover:bg-blue-100">
        <Left className="h-4 w-4" />
      </div>
      <div className="font-medium text-slate-600">
        Mostrando página <span className="font-bold text-[#2096ed]">1</span> de{" "}
        <span className="font-bold text-[#2096ed]">1</span>
      </div>
      <div className="p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-pointer hover:bg-blue-100">
        <Right className="h-4 w-4" />
      </div>
    </nav>
  );
}
