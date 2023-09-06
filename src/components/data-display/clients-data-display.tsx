import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "../../assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "../../assets/thinking.svg";
import Pagination from "../misc/pagination";
import { ModalProps, DataRow, DropupProps, Action, Cliente } from "../../types";
import { Toaster } from "react-hot-toast";
import ClientService from "../../services/client-service";

function AddModal({ isOpen, close }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Cliente>({
    nombre: "",
    apellido: "",
    cédula: "",
    email: "",
    telefono: "",
    dirección: "",
    enviarMensajes: false,
    contraseña: "",
  });

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
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir cliente</h1>
      </div>
      <form className="flex flex-col p-8 pt-6 gap-4" autoComplete="off">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
          />
          <input
            type="text"
            placeholder="Apellido"
            onChange={(e) => {
              setFormData({
                ...formData,
                apellido: e.target.value,
              });
            }}
            value={formData.apellido}
            className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
          />
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cédula"
            onChange={(e) => {
              setFormData({
                ...formData,
                cédula: e.target.value,
              });
            }}
            value={formData.cédula}
            className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
          />
          <input
            type="tel"
            placeholder="Telefono"
            onChange={(e) => {
              setFormData({
                ...formData,
                telefono: e.target.value,
              });
            }}
            value={formData.telefono}
            className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
          />
        </div>
        <input
          type="email"
          placeholder="E-mail"
          onChange={(e) => {
            setFormData({
              ...formData,
              email: e.target.value,
            });
          }}
          value={formData.email}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="text"
          placeholder="Dirección"
          onChange={(e) => {
            setFormData({
              ...formData,
              dirección: e.target.value,
            });
          }}
          value={formData.dirección}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <input
          type="text"
          placeholder="Contraseña"
          onChange={(e) => {
            setFormData({
              ...formData,
              contraseña: e.target.value,
            });
          }}
          value={formData.contraseña}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <div className="flex w-full justify-between items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  enviarMensajes: e.target.checked,
                });
              }}
              checked={formData.enviarMensajes}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Enviar mensajes?
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4"
            >
              Cancelar
            </button>
            <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
              Añadir
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ action, cliente }: DataRow) {
  return (
    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 last:border-b-0">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-[#2096ed] whitespace-nowrap dark:text-white"
      >
        {cliente?.id}
      </th>
      <td className="px-6 py-4">{cliente?.nombre}</td>
      <td className="px-6 py-4">{cliente?.apellido}</td>
      <td className="px-6 py-4">{cliente?.cédula}</td>
      <td className="px-6 py-4">{cliente?.telefono}</td>
      <td className="px-6 py-4">{cliente?.dirección}</td>
      <td className="px-6 py-4">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Editar cliente
          </button>
        )}
        {action === "DELETE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Eliminar cliente
          </button>
        )}
      </td>
    </tr>
  );
}

function Dropup({ close, selectAction, openAddModal }: DropupProps) {
  const dropupRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target) &&
        event.target.id !== "acciones-btn"
      ) {
        close();
        console.log("click outside");
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <ul
      ref={dropupRef}
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
          shadow-xl
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
          Editar cliente
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
          Eliminar cliente
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
          Añadir cliente
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

export default function ClientsDataDisplay() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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

  useEffect(() => {
    ClientService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setClientes(data);
        setLoading(false);
      }
    });
  }, []);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center">
          <div className="font-medium">
            Menu <Right className="w-3 h-3 inline" /> Clientes
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
        <hr className="border-1 border-slate-200 my-5" />
        {clientes.length > 0 && (
          <div className="relative overflow-x-auto sm:rounded-lg shadow">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-[#2096ed] uppercase bg-blue-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Apellido
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Cédula
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Telefono
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Dirección
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
        )}
        {notFound === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Clientes no encontrados
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que simplemente
                no hay ningún cliente registrado.
              </p>
            </div>
          </div>
        )}
        {loading === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-14 h-14 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {clientes.length > 0 && <Pagination />}
      <Toaster position="bottom-right" reverseOrder={false} />
      <AddModal isOpen={isAddOpen} close={closeAddModal} />
    </>
  );
}
