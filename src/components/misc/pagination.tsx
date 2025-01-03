import { ReactComponent as Left } from "../../assets/arrow-left-solid.svg";
import { ReactComponent as Right } from "../../assets/arrow-right-solid.svg";
import { PaginationProps } from "../../types";
import clsx from "clsx";

export default function Pagination({
  current,
  pages,
  next,
  prev,
  className,
  customText,
}: PaginationProps) {
  return (
    <div
      className={
        className
          ? className
          : "absolute bottom-5 left-8 flex items-center gap-4"
      }
    >
      <div
        onClick={prev}
        className={clsx({
          ["p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-pointer hover:bg-blue-100"]:
            current > 1,
          ["p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-not-allowed"]:
            current <= 1,
        })}
      >
        <Left className="h-4 w-4" />
      </div>
      <div className="font-medium text-slate-600">
        {customText ? customText : "Mostrando página"}{" "}
        <span className="font-bold text-[#2096ed]">{current}</span> de{" "}
        <span className="font-bold text-[#2096ed]">{pages}</span>
      </div>
      <div
        onClick={next}
        className={clsx({
          ["p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-pointer hover:bg-blue-100"]:
            current < pages,
          ["p-2 border rounded-lg border-[#2096ed] fill-[#2096ed] cursor-not-allowed"]:
            current === pages,
        })}
      >
        <Right className="h-4 w-4" />
      </div>
    </div>
  );
}
