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
      <form className="flex flex-col p-10 gap-5">
        <h1 className="text-xl font-medium">Crear ticket</h1>
        <input
          type="text"
          defaultValue={"TCKT-1"}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
          disabled
        />
        <div className="relative">
          <select className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none">
            <option selected>Seleccionar cliente</option>
            <option value="1">Jean Bolívar</option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5" />
        </div>
        <div className="relative">
          <select className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none">
            <option selected>Seleccionar elemento</option>
            <option value="1">Lenovo Ideapad 3</option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5" />
        </div>
        <div className="flex w-full justify-end gap-4">
          <button className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4">
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
            Crear
          </button>
        </div>
      </form>
    </dialog>
  );
}

function EditModal({ isOpen, close }: ModalProps) {
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
      <form className="flex flex-col p-10 gap-5">
        <h1 className="text-xl font-medium">Editar ticket</h1>
        <input
          type="text"
          defaultValue={"TCKT-1"}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
          disabled
        />
        <input
          type="text"
          defaultValue={"Jean Bolívar"}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
          disabled
        />
        <div className="relative">
          <select className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none">
            <option selected>Seleccionar elemento</option>
            <option value="1">Lenovo Ideapad 3</option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5" />
        </div>
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
    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 last:border-b-0">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-[#2096ed] whitespace-nowrap dark:text-white"
      >
        1
      </th>
      <td className="px-6 py-2">
        <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-full">
          Abierto
        </div>
      </td>
      <td className="px-6 py-4">Jean Bolívar</td>
      <td className="px-6 py-4">Lenovo Ideapad 3</td>
      <td className="px-6 py-4">20/20/20</td>
      <td className="px-6 py-4">20/20/20</td>
      <td className="px-6 py-4">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Editar ticket
          </button>
        )}
        {action === "DELETE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Eliminar ticket
          </button>
        )}
        {action === "VIEW_SERVICES" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Servicios de ticket
          </button>
        )}
        {action === "VIEW_PROBLEMS" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Problemas de ticket
          </button>
        )}
        {action === "VIEW_MESSAGES" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Mensajes de ticket
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
          Editar ticket
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
          Eliminar ticket
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_SERVICES");
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
          Servicios de ticket
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_PROBLEMS");
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
          Problemas de ticket
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_MESSAGES");
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
          Mensajes de ticket
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
          Crear ticket
        </div>
      </li>
    </ul>
  );
}

export default function TicketDataDisplay() {
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
        <nav className="flex justify-between items-center">
          <div className="font-medium">
            Menu <Right className="w-3 h-3 inline" /> Tickets
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
        <hr className="border-1 border-slate-300 my-5" />
        <div className="relative overflow-x-auto sm:rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-[#2096ed] uppercase bg-blue-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  #
                </th>
                <th scope="col" className="px-6 py-3">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3">
                  Elemento
                </th>
                <th scope="col" className="px-6 py-3">
                  Creación
                </th>
                <th scope="col" className="px-6 py-3">
                  Actualización
                </th>
                <th scope="col" className="px-6 py-3">
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
