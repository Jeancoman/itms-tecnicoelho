import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "../../assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import Pagination from "../misc/pagination";
import { ModalProps, DataRow, DropupProps, Action } from "../../types";

function AddModal({ isOpen, close }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          close();
          ref.current?.close();
        }
      });
    } else {
      close();
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
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
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <form className="flex flex-col p-10 gap-5" autoComplete="off">
        <h1 className="text-xl font-medium">Registrar venta</h1>
        <input
          type="text"
          placeholder="Nombre"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />

        <input
          type="text"
          placeholder="Apellido"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="text"
          placeholder="Cédula"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="tel"
          placeholder="Telefono"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="text"
          placeholder="Dirección"
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <div className="flex w-full justify-end gap-4">
          <button className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4">
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
            Guardar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ action }: DataRow) {
  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        1
      </th>
      <td className="px-6 py-4 border border-slate-300">20/S/20-001</td>
      <td className="px-6 py-4 border border-slate-300">Jean Bolívar</td>
      <td className="px-6 py-4 border border-slate-300">14%</td>
      <td className="px-6 py-4 border border-slate-300">100.00</td>
      <td className="px-6 py-4 border border-slate-300">114.00</td>
      <td className="px-6 py-4 border border-slate-300">20/20/20</td>
      <td className="px-6 py-4 border border-slate-300">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Editar venta
          </button>
        )}
        {action === "DELETE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Eliminar venta
          </button>
        )}
        {action === "VIEW_AS_PDF" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            PDF de venta
          </button>
        )}
      </td>
    </tr>
  );
}

function Dropup({ close, selectAction, openAddModal }: DropupProps) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)  && event.target.id !== "acciones-btn") {
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
      className="
          min-w-max
          absolute
          bg-white
          text-base
          z-50
          right-8
          top-14
          py-2
          list-none
          text-left
          rounded-lg
          shadow-lg
          mt-1
          m-0
          bg-clip-padding
          border-none
        "
    >
      <li>
        <div
          onClick={() => {
            selectAction("EDIT");
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Editar venta
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("DELETE");
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Eliminar venta
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_AS_PDF");
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Listar como PDF
        </div>
      </li>
      <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      <li>
        <div
          onClick={() => {
            openAddModal();
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Registrar venta
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            openAddModal();
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Hacer consulta
        </div>
      </li>
    </ul>
  );
}

export default function SalesDataDisplay() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");

  const openAddModal = () => {
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const closeDropup = () => {
    setIsDropup(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  return (
    <>
      <div className="absolute w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Ventas
          </div>
          <div>
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={openAddModal}
              />
            )}
            <button
             id="acciones-btn"
              onClick={() => {
                setIsDropup(!isDropup)
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            >
              Acciones
              <Down className="ml-2 mb-0.5 w-3 h-3 inline fill-white" />
            </button>
          </div>
        </nav>
        <hr className="border-1 border-slate-200 my-5" />
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm font-medium text-slate-600 text-left">
            <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
              <tr className="border-2 border-[#2096ed]">
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  #
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Impuesto
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Subtotal
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 border border-slate-300">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              <DataRow action={action} />
            </tbody>
          </table>
        </div>
      </div>
      <Pagination />
      <AddModal isOpen={isAddOpen} close={closeAddModal} />
    </>
  );
}
