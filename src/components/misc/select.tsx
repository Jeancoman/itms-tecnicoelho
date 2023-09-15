import { useEffect, useRef, useState } from "react";
import { OptionGroupProps, OptionProps, SelectProps } from "../../types";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import clsx from "clsx";

function Option({ value, label, onClick, closeOnClick }: OptionProps) {
  return (
    <li>
      <div
        onClick={() => {
          onClick(value, label);
          closeOnClick?.();
        }}
        className="py-2 px-2 font-medium block w-full whitespace-nowrap bg-transparent text-slate-600 hover:bg-slate-100 cursor-pointer"
      >
        {label}
      </div>
    </li>
  );
}

function OptionGroup({ options, close, closeOnOptionClick }: OptionGroupProps) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== "custom-select" &&
        event.target.id !== "custom-select-inside" &&
        event.target.id !== "custom-select-button"
      ) {
        close();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <ul
      ref={ref}
      className="w-full absolute bg-white text-base z-[3000] py-1 list-none text-left rounded mt-1 shadow-md m-0 bg-clip-padding border border-slate-300"
    >
      {options.map((option) => {
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
    </ul>
  );
}

export default function Select({ selected, options, onChange }: SelectProps) {
  const [drop, setDrop] = useState(false);
  const [thisLabel, setThisLabel] = useState(selected.label);

  useEffect(() => {
    setThisLabel(selected.label);
    onChange?.();
  }, [selected]);

  return (
    <>
      <div
        className={clsx({
          ["border border-blue-300 relative p-2 rounded-md cursor-default select-none overflow-hidden"]:
            drop,
          ["border border-slate-300 relative p-2 rounded-md cursor-default select-none overflow-hidden"]:
            !drop,
        })}
        onClick={() => {
          setDrop(!drop);
        }}
        id="custom-select"
      >
        <div id="custom-select-inside" className="font-medium text-slate-600">
          {thisLabel}
        </div>
        <Down
          id="custom-select-button"
          className={clsx({
            ["absolute h-4 w-4 top-3 right-5 fill-blue-600 cursor-pointer"]:
              drop,
            ["absolute h-4 w-4 top-3 right-5 fill-slate-600 cursor-pointer"]:
              !drop,
          })}
        />
      </div>
      {drop && (
        <OptionGroup
          closeOnOptionClick={() => {
            setDrop(false);
          }}
          close={() => {
            setDrop(false);
          }}
          options={options}
        />
      )}
    </>
  );
}
