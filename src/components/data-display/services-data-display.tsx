import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/public/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/public/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/public/assets/thinking.svg";
import { ReactComponent as Warning } from "/public/assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Servicio,
  Selected,
  Categoría,
} from "../../types";
import { useParams } from "react-router-dom";
import ServiceService from "../../services/service-service";
import toast, { Toaster } from "react-hot-toast";
import Select from "../misc/select";
import CategoryService from "../../services/category-service";
import { format } from "date-fns";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const { id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: -1,
    label: "Seleccionar categoría",
  });
  const [formData, setFormData] = useState<Servicio>({
    nombre: "",
    descripción: "",
    estado: "PENDIENTE",
    categoría_id: -1,
    ticket_id: Number(id),
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      descripción: "",
      estado: "PENDIENTE",
      categoría_id: -1,
      ticket_id: Number(id),
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
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
    if (categories.length === 0) {
      setLoading(true);
      CategoryService.getAll().then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data);
        }
      });
    }
  }, []);

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
      className="w-2/5 h-fit rounded-md shadow-md scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadiendo servicio</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo servicio...");
          ServiceService.create(Number(id), formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Servicio no pudo ser añadido.");
            } else {
              toast.success("Servicio añadido con exito.");
            }
          });
        }}
      >
        <div className="flex gap-2">
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
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
            required
          />
          <div className="relative w-2/4">
            {categories.length > 0 && (
              <Select
                options={categories
                  .filter((category) => category.tipo === "SERVICIO")
                  .map((category) => ({
                    value: category.id,
                    label: category.nombre,
                    onClick: (value, label) => {
                      setSelectedCategory({
                        value,
                        label,
                      });
                    },
                  }))}
                selected={selectedCategory}
                onChange={() => {
                  setFormData({
                    ...formData,
                    categoría_id: selectedCategory.value! as number,
                  });
                }}
              />
            )}
            {categories.length === 0 && loading === false && (
              <>
                <select
                  className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Seleccionar categoría</option>
                </select>
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
              </>
            )}
            {categories.length === 0 && loading === true && (
              <>
                <select
                  className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Buscando categorías...</option>
                </select>
                <svg
                  aria-hidden="true"
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
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
                <span className="sr-only">Cargando...</span>
              </>
            )}
          </div>
        </div>
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
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  servicio,
}: ModalProps) {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Servicio>(servicio!);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: formData.categoría_id,
    label: formData.categoría?.nombre,
  });

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

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
      CategoryService.getAll().then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data);
        }
      });
    }
  }, []);

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
      className="w-2/5 h-fit rounded-md shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar servicio</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando servicio...");
          ServiceService.update(Number(id), servicio?.id!, formData).then(
            (data) => {
              toast.dismiss(loadingToast);
              setOperationAsCompleted();
              if (data) {
                toast.success("Servicio editado con exito.");
              } else {
                toast.error("Servicio no pudo ser editado.");
              }
              setOperationAsCompleted();
            }
          );
        }}
      >
        <div className="flex gap-2">
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
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
          <div className="relative w-2/4">
            {categories.length > 0 && (
              <Select
                options={categories
                  .filter((category) => category.tipo === "SERVICIO")
                  .map((category) => ({
                    value: category.id,
                    label: category.nombre,
                    onClick: (value, label) => {
                      setSelectedCategory({
                        value,
                        label,
                      });
                    },
                  }))}
                selected={selectedCategory}
                onChange={() => {
                  setFormData({
                    ...formData,
                    categoría_id: selectedCategory.value! as number,
                  });
                }}
              />
            )}
            {categories.length === 0 && loading === false && (
              <>
                <select
                  className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Seleccionar categoría</option>
                </select>
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
              </>
            )}
            {categories.length === 0 && loading === true && (
              <>
                <select
                  className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Buscando categorías...</option>
                </select>
                <svg
                  aria-hidden="true"
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
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
                <span className="sr-only">Cargando...</span>
              </>
            )}
          </div>
        </div>
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
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  servicio,
}: ModalProps) {
  const { id } = useParams();
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
      className="w-2/5 h-fit rounded-md shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando servicio...");
          ServiceService.delete(Number(id), servicio?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Servicio eliminado con exito.");
            } else {
              toast.error("Servicio no pudo ser eliminado.");
            }
            setOperationAsCompleted();
          });
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

function DataRow({ action, setOperationAsCompleted, servicio }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {servicio?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {servicio?.nombre}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {servicio?.descripción}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {servicio?.estado === "COMPLETADO" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Completado
          </div>
        ) : servicio?.estado === "INICIADO" ? (
          <div className="bg-blue-200 text-center text-blue-600 text-xs py-2 font-bold rounded-lg capitalize">
            Iniciado
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg capitalize">
            Pendiente
          </div>
        )}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {format(new Date(servicio?.añadido!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-4 border border-slate-300 w-[210px]">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 py-1 px-2 rounded-lg"
            >
              Editar servicio
            </button>
            <EditModal
              servicio={servicio}
              isOpen={isEditOpen}
              closeModal={closeEditModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "DELETE" && (
          <>
            <button
              onClick={() => {
                setIsDeleteOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 py-1 px-2 rounded-lg"
            >
              Eliminar servicio
            </button>
            <DeleteModal
              servicio={servicio}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW_OPERATIONS" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Mostrar operaciones
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
          Editar servicio
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
          Eliminar servicio
        </div>
      </li>
      <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_OPERATIONS");
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
          Mostrar operaciones
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
          Añadir servicio
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

export default function ServicesDataDisplay() {
  const { id } = useParams();
  const [services, setServices] = useState<Servicio[]>([]);
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

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (isOperationCompleted) {
      setLoading(true);
    }

    ServiceService.getAll(Number(id)).then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setServices(data);
        setLoading(false);
        setNotFound(false);
      }
      setIsOperationCompleted(false);
    });
  }, [isOperationCompleted]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center text-slate-600 select-none">
          <div className="font-medium">
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Tickets{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="font-bold text-[#2096ed]">{id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" /> Servicios
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
        {services.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Añadido
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  return (
                    <DataRow
                      action={action}
                      servicio={service}
                      setOperationAsCompleted={setAsCompleted}
                      key={service.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {notFound === true && (
          <div className="grid w-full h-4/5 text-slate-600">
            <div className="place-self-center flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún servicio encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que simplemente
                este ticket no tenga ningún servicio registrado.
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
                <span className="sr-only">Cargando...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {services.length > 0 && loading == false && <Pagination />}
      <Toaster position="bottom-right" reverseOrder={false} />
      <AddModal
        isOpen={isAddOpen}
        closeModal={closeAddModal}
        setOperationAsCompleted={setAsCompleted}
      />
    </>
  );
}
