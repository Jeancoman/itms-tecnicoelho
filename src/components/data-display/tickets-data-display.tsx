import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "../../assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "../../assets/thinking.svg";
import { ReactComponent as Warning } from "../../assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Ticket,
  Cliente,
  Elemento,
} from "../../types";
import ClientService from "../../services/client-service";
import toast from "react-hot-toast";
import ElementService from "../../services/element-service";
import TicketService from "../../services/ticket-service";

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  elemento,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Elemento>(elemento!);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      closeModal();
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
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/5 h-fit max-h-[500px] rounded-xl shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar elemento</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando elemento...");
          ElementService.update(
            elemento?.id!,
            formData,
            elemento?.cliente_id!
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Elemento no pudo ser editado.");
            } else {
              toast.success("Elemento editado con exito.");
            }
          });
        }}
      >
        <input
          type="text"
          onChange={(e) => {
            setFormData({
              ...formData,
              nombre: e.target.value,
            });
          }}
          placeholder="Nombre*"
          value={formData.nombre}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <textarea
          rows={3}
          placeholder="Descripción"
          onChange={(e) => {
            setFormData({
              ...formData,
              descripción: e.target.value,
            });
          }}
          value={formData.descripción}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [elements, setElements] = useState<Elemento[]>([]);
  const [selectedClient, setSelectedClient] = useState(-1);
  const [selectedElement, setSelectedElement] = useState(-1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState<Ticket>({
    tipo: "TIENDA",
    estado: "ABIERTO",
    elemento_id: -1,
  });

  const resetFormData = () => {
    setFormData({
      tipo: "TIENDA",
      estado: "ABIERTO",
      elemento_id: -1,
    });
    setSelectedClient(-1);
    setSelectedElement(-1);
    setSelectedType("")
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
          resetFormData();
        }
      });
    } else {
      closeModal();
      ref.current?.close();
      resetFormData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (clients.length === 0) {
      ClientService.getAll().then((data) => {
        if (data === false) {
        } else {
          setClients(data);
        }
      });
    } else {
      ElementService.getAll(selectedClient).then((data) => {
        if (data === false) {
        } else {
          setElements(data);
        }
      });
    }
  }, [selectedElement]);

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
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/5 h-fit max-h-[500px] rounded-xl shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Crear ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Creando ticket...");
          TicketService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Ticket no pudo ser creado.");
            } else {
              toast.success("Ticket añadido con exito.");
            }
          });
        }}
      >
        <div className="relative">
          <select
            onChange={(e) => {
              setSelectedType(e.target.value);
            }}
            className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none"
            value={selectedType}
          >
            <option value="">Seleccionar tipo</option>
            <option value="TIENDA">Tienda</option>
            <option value="DOMICILIO">Domicilio</option>
            <option value="REMOTO">Remoto</option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5" />
        </div>
        <div className="relative">
          <select
            onChange={(e) => {
              setSelectedClient(Number(e.target.value));
            }}
            className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none"
            value={selectedClient}
          >
            <option value={-1}>Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre} {client.apellido}, {client.cédula}
              </option>
            ))}
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5" />
        </div>
        {clients.length > 0 && elements.length > 0 && (
          <div className="relative">
            <select
              onChange={(e) => {
                setFormData({
                  ...formData,
                  elemento_id: Number(e.target.value),
                });
                setSelectedElement(Number(e.target.value));
              }}
              className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none"
              value={selectedElement}
            >
              <option value={-1}>Seleccionar elemento</option>
              {elements.map((element) => (
                <option key={element.id} value={element.id}>
                  {element.nombre}
                </option>
              ))}
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5" />
          </div>
        )}
        {clients.length > 0 && elements.length === 0 && selectedClient > 0 ? (
          <div className="relative">
            <select
              disabled={true}
              className="border w-full p-2 rounded-lg outline-none focus:border-[#2096ed] appearance-none"
              value={-1}
            >
              <option value={-1}>Cliente no tiene elementos</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5" />
          </div>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  elemento,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      closeModal();
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
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando elemento...");
          ElementService.delete(elemento?.id!, elemento?.cliente_id!).then(
            (data) => {
              toast.dismiss(loadingToast);
              if (data) {
                toast.success("Elemento eliminado con exito.");
              } else {
                toast.error("Elemento no pudo ser eliminado.");
              }
              setOperationAsCompleted();
            }
          );
        }}
      >
        <div className="place-self-center  flex flex-col items-center">
          <Warning className="fill-red-400 h-16 w-16" />
          <p className="font-bold text-lg text-center mt-2">
            ¿Esta seguro de que desea continuar?
          </p>
          <p className="font-medium text text-center mt-1">
            Los cambios provocados por esta acción son irreversibles.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={closeModal}
            className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
            Continuar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ action }: DataRowProps) {
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
            Mostrar servicios
          </button>
        )}
        {action === "VIEW_PROBLEMS" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Mostrar problemas
          </button>
        )}
        {action === "VIEW_MESSAGES" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Mostrar mensajes
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
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== "acciones-btn"
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
          border
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
          Mostrar problemas
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
          Mostrar servicios
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
          Mostrar mensajes
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
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

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  useEffect(() => {
    TicketService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setTickets(data);
        setLoading(false);
      }
      setIsOperationCompleted(false);
    });
  }, [isOperationCompleted]);

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
                setIsDropup(!isDropup);
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
                  Creado
                </th>
                <th scope="col" className="px-6 py-3">
                  Actualizado
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
      <AddModal
        isOpen={isAddOpen}
        closeModal={closeAddModal}
        setOperationAsCompleted={setAsCompleted}
      />
    </>
  );
}
