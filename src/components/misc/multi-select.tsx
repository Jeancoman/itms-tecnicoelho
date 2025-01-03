import { useEffect, useRef, useState } from "react";
import { OptionGroupProps, OptionProps, MultiSelectProps } from "../../types";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import clsx from "clsx";

function Option({
  value,
  label,
  //@ts-ignore
  onClick,
  toggleOption,
  closeOnClick,
}: OptionProps & {
  toggleOption: (value: string | number, label: string) => void;
}) {
  return (
    <div
      onClick={() => {
        toggleOption(value!, label!), closeOnClick?.();
      }}
      className="py-2 px-2 block w-full whitespace-nowrap bg-transparent text-slate-600 hover:bg-slate-100 cursor-pointer"
    >
      {label}
    </div>
  );
}

function OptionGroup({
  drop,
  options,
  close,
  toggleOption,
  top,
  left,
  width,
  closeOnOptionClick,
}: OptionGroupProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== "multi-select" &&
        event.target.id !== "multi-select-inside" &&
        event.target.id !== "multi-select-button"
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
      className="backdrop:bg-transparent max-h-48 overflow-auto bg-white text-base z-[3000] py-1 list-none text-left rounded mt-1 shadow m-0 bg-clip-padding border border-slate-300 w-full sm:w-auto"
      style={{
        position: "absolute",
        top: top,
        left: left,
        maxWidth: width,
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
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <Option
            value={option.value}
            label={option.label}
            //@ts-ignore
            toggleOption={toggleOption}
            closeOnClick={closeOnOptionClick}
            key={option.value}
          />
        </div>
      ))}
    </dialog>
  );
}

export default function MultiSelect({
  selectedValues,
  options,
  onChange,
  small,
  label,
}: MultiSelectProps & {
  label: string;
}) {
  const [drop, setDrop] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  const toggleOption = (value: string, label: string) => {
    const alreadySelected = selectedValues.some((item) => item.value === value);
    const newSelection = alreadySelected
      ? selectedValues.filter((item) => item.value !== value)
      : [...selectedValues, { value, label }];
    onChange(newSelection);
  };

  return (
    <>
      <div
        ref={divRef}
        className={clsx(
          "border relative p-2 rounded-md cursor-default select-none overflow-hidden font-base",
          {
            "border-slate-300": !drop,
            "border-blue-300": drop,
            "text-slate-400": !drop && label.startsWith("Selecciona"),
            "text-blue-400": drop && label.startsWith("Selecciona"),
          }
        )}
        onClick={() => {
          setDrop(!drop);
        }}
        id="multi-select"
      >
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <span
              key={item.value}
              className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center"
            >
              {item.label}
              <button
                className="ml-2 text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  //@ts-ignore
                  toggleOption?.(item.value!, item.label!);
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        {selectedValues.length === 0 && (
          <input
            type="text"
            readOnly={true}
            pattern="^(?!Selecciona)"
            id="multi-select-inside"
            className="truncate cursor-none pointer-events-none w-full outline-none caret-transparent"
            value={label}
          />
        )}
        <Down
          id="multi-select-button"
          className={clsx("absolute h-4 w-4 top-3 fill-current", {
            "right-5": !small,
            "right-2": small,
            "text-blue-600": drop,
            "text-slate-300": !drop,
          })}
        />
      </div>
      {drop ? (
        <OptionGroup
          close={() => setDrop(false)}
          closeOnOptionClick={() => {
            setDrop(false);
          }}
          options={options}
          drop={drop}
          selectedValues={selectedValues}
          //@ts-ignore
          toggleOption={toggleOption}
          top={
            divRef.current
              ? divRef.current.getBoundingClientRect().top +
                window.scrollY +
                divRef.current.getBoundingClientRect().height
              : 0
          }
          left={
            divRef.current
              ? divRef.current.getBoundingClientRect().left + window.scrollX
              : 0
          }
          width={
            divRef.current
              ? `${divRef.current.getBoundingClientRect().width}px`
              : "100%"
          }
        />
      ) : null}
    </>
  );
}
