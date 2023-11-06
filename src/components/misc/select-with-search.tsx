import { useEffect, useRef, useState } from "react";
import { OptionGroupProps, OptionProps, SelectProps } from "../../types";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Search } from "/src/assets/search.svg";
import clsx from "clsx";

function Option({ value, label, onClick, closeOnClick }: OptionProps) {
  return (
    <div>
      <div
        onClick={() => {
          onClick(value, label);
          closeOnClick?.();
        }}
        className="py-2 px-2 block w-full whitespace-nowrap bg-transparent text-slate-600 hover:bg-slate-100 cursor-pointer"
      >
        {label}
      </div>
    </div>
  );
}

function OptionGroup({
  drop,
  options,
  close,
  closeOnOptionClick,
  top,
  left,
  width,
}: OptionGroupProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== "custom-select" &&
        event.target.id !== "custom-select-inside" &&
        event.target.id !== "custom-select-button"
      ) {
        ref.current?.close();
        close();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === "Escape") {
        close();
        ref.current?.close();
      }
    };

    if (drop) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleEscape);
    } else {
      close();
      ref.current?.close();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [drop]);

  return (
    <dialog
      ref={ref}
      className="backdrop:bg-transparent max-h-48 overflow-auto scrollbar-none bg-white text-base z-[3000] py-1 list-none text-left rounded mt-1 shadow m-0 bg-clip-padding border border-slate-300"
      style={{
        position: "absolute",
        top: top,
        left: left,
        width: width,
      }}
      onClick={(e) => {
        e.stopPropagation();
        const dialogDimensions = ref.current?.getBoundingClientRect()!;
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          close();
          ref.current?.close();
        }
      }}
    >
      <div>
        <div className="py-2 px-2 block w-full whitespace-nowrap bg-transparent text-slate-600 relative">
          <input
            type="text"
            placeholder="Filtrar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="border p-2 h-2/4 border-slate-300 rounded outline-none w-full"
          />
          <Search className="absolute top-4 right-5 fill-slate-400" />
        </div>
      </div>
      {search !== ""
        ? options
            .filter((option) => option.label?.includes(search))
            .map((option) => {
              return (
                <Option
                  value={option.value}
                  label={option.label}
                  onClick={option.onClick}
                  closeOnClick={closeOnOptionClick}
                  key={option.value}
                />
              );
            })
        : options.map((option) => {
            return (
              <Option
                value={option.value}
                label={option.label}
                onClick={option.onClick}
                closeOnClick={closeOnOptionClick}
                key={option.value}
              />
            );
          })}
    </dialog>
  );
}

export default function SelectWithSearch({
  selected,
  options,
  onChange,
  small,
}: SelectProps) {
  const [drop, setDrop] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.();
  }, [selected]);

  return (
    <>
      <div
        ref={divRef}
        className={clsx({
          ["border border-slate-300 relative p-2 rounded-md cursor-default select-none overflow-hidden font-base"]:
            !drop && !selected.label?.startsWith("Seleccionar"),
          ["border border-blue-300 text-blue-400 relative p-2 rounded-md cursor-default select-none overflow-hidden font-base"]:
            drop && selected.label?.startsWith("Seleccionar"),
          ["border border-blue-300 relative p-2 rounded-md cursor-default select-none overflow-hidden font-base"]:
            drop && !selected.label?.startsWith("Seleccionar"),
          ["border border-slate-300 text-slate-400 relative p-2 rounded-md cursor-default select-none overflow-hidden font-base"]:
            !drop && selected.label?.startsWith("Seleccionar"),
        })}
        onClick={() => {
          setDrop(!drop);
        }}
        id="custom-select"
      >
        <input type="text" readOnly={true} pattern="^(?!Seleccionar)" id="custom-select-inside" className="truncate cursor-none pointer-events-none w-full outline-none caret-transparent" value={selected.label} />
        <Down
          id="custom-select-button"
          className={clsx({
            ["absolute h-4 w-4 top-3 right-5 fill-blue-600"]: drop && !small,
            ["absolute h-4 w-4 top-3 right-5 fill-slate-300"]: !drop && !small,
            ["absolute h-4 w-4 top-3 right-2 fill-blue-600"]: drop && small,
            ["absolute h-4 w-4 top-3 right-2 fill-slate-300"]: !drop && small,
          })}
        />
      </div>
      {drop ? (
        <OptionGroup
          closeOnOptionClick={() => {
            setDrop(false);
          }}
          close={() => {
            setDrop(false);
          }}
          options={options}
          drop={drop}
          top={
            divRef?.current?.getBoundingClientRect().top! +
            window.scrollY +
            divRef?.current?.getBoundingClientRect().height!
          }
          left={divRef?.current?.getBoundingClientRect().left! + window.scrollX}
          width={`${divRef?.current?.getBoundingClientRect().width}px`}
        />
      ) : null}
    </>
  );
}
