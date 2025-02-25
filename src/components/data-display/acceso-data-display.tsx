import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import Pagination from "../misc/pagination";
import {
  DataRowProps,
  AccesoUsuario,
  Usuario,
  ModalProps,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import { useAccesoSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import { useNavigate, useParams } from "react-router-dom";
import UserService from "../../services/user-service";
import { createRowNumber } from "../../utils/functions";
import { format } from "date-fns";
import clsx from "clsx";
import Select from "../misc/select";

/*
function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  categoría,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Categoría>(categoría!);
  const [selectedType] = useState<Selected>({
    label: categoría?.tipo === "PRODUCTO" ? "Producto" : "Servicio",
    value: categoría?.tipo,
  });

  const resetFormData = () => {
    setFormData(categoría!);
  };

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
  }, [closeModal, isOpen]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (
          dialogDimensions && // Check if dialogDimensions is defined
          (e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom)
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar categoría</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group text-base font-normal"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando categoría...");
          void CategoryService.update(categoría?.id!, formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Categoría no pudo ser editada.");
            } else {
              toast.success("Categoría editada con exito.");
            }
          });
        }}
      >
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Nombre*
          </label>
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            placeholder="Introducir nombre"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Descripción
          </label>
          <textarea
            rows={3}
            placeholder="Introducir descripción"
            onChange={(e) => {
              setFormData({
                ...formData,
                descripción: e.target.value,
              });
            }}
            value={formData.descripción}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="relative">
          <label className="block text-gray-600 text-base font-medium mb-2">
            Tipo*
          </label>
          <select
            className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
            value={selectedType.value}
            disabled={true}
          >
            <option value={selectedType.value}>{selectedType.label}</option>
          </select>
          <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
        </div>
        <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  esDigital: e.target.checked,
                });
              }}
              checked={formData.esDigital}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Es digital?
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                closeModal();
                resetFormData();
              }}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedType, setSelectedType] = useState<Selected>({
    label: "Seleccionar tipo",
    value: "",
  });
  const [formData, setFormData] = useState<Categoría>({
    nombre: "",
    descripción: "",
    tipo: "PRODUCTO",
    esDigital: false,
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      descripción: "",
      tipo: "PRODUCTO",
      esDigital: false,
    });
    setSelectedType({
      label: "Seleccionar tipo",
      value: "",
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

  return (
    <dialog
      ref={ref}
      onClick={(e: any) => {
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir categoría</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo categoría...");
          void CategoryService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Categoría no pudo ser añadida.");
            } else {
              toast.success("Categoría añadida con exito.");
            }
          });
        }}
      >
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Nombre*
          </label>
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            placeholder="Introducir nombre"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Descripción
          </label>
          <textarea
            rows={3}
            placeholder="Introducir descripción"
            onChange={(e) => {
              setFormData({
                ...formData,
                descripción: e.target.value,
              });
            }}
            value={formData.descripción}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="relative">
          <label className="block text-gray-600 text-base font-medium mb-2">
            Tipo*
          </label>
          <Select
            onChange={() => {
              setFormData({
                ...formData,
                tipo: selectedType.value as CategoríaTipo,
              });
            }}
            options={[
              {
                value: "PRODUCTO",
                label: "Producto",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "SERVICIO",
                label: "Servicio",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedType}
          />
        </div>
        <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  esDigital: e.target.checked,
                });
              }}
              checked={formData.esDigital}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Es digital?
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  categoría,
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando categoría...");
          CategoryService.delete(categoría?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Categoría eliminada con exito.");
            } else {
              toast.error("Categoría no pudo ser eliminada.");
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
            Continuar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedType, setSelectedType] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de categoría",
  });
  const setIsPrecise = useCategorySearchParamStore(
    (state) => state.setIsPrecise
  );
  const setTempIsPrecise = useCategorySearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useCategorySearchParamStore(
    (state) => state.tempIsPrecise
  );
  const tempInput = useCategorySearchParamStore((state) => state.tempInput);
  const setInput = useCategorySearchParamStore((state) => state.setInput);
  const setTempInput = useCategorySearchParamStore(
    (state) => state.setTempInput
  );
  const setParam = useCategorySearchParamStore((state) => state.setParam);
  const incrementSearchCount = useCategorySearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

  const resetSearch = () => {
    setTempInput("");
    setTempIsPrecise(false);
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
    });
    setSelectedType({
      value: "",
      label: "Seleccionar tipo de categoría",
    });
    setWasSearch(false);
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          resetSearch();
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      resetSearch();
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar categoría</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSearchType.value !== "") {
            resetSearch();
            incrementSearchCount();
            closeModal();
            setWasSearch(true);
          }
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              setParam(selectedSearchType.value as string);
            }}
            options={[
              {
                value: "NOMBRE",
                label: "Nombre",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "TIPO",
                label: "Tipo",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedSearchType}
          />
        </div>
        {selectedSearchType.value === "NOMBRE" ? (
          <input
            type="text"
            placeholder={
              selectedSearchType.value === "NOMBRE"
                ? "Introduzca nombre del usuario"
                : ""
            }
            value={tempInput}
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
            onChange={(e) => {
              setInput(e.target.value);
              setTempInput(e.target.value);
            }}
            required
          />
        ) : null}
        {selectedSearchType.value === "TIPO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setInput(selectedType.value as string);
              }}
              options={[
                {
                  value: "SERVICIO",
                  label: "Servicio",
                  onClick: (value, label) => {
                    setSelectedType({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "PRODUCTO",
                  label: "Producto",
                  onClick: (value, label) => {
                    setSelectedType({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedType}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setIsPrecise(e.target.checked);
                setTempIsPrecise(e.target.checked);
              }}
              checked={tempIsPrecise}
              id="checkbox"
              disabled={selectedSearchType.value === "TIPO"}
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Busqueda exacta?
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                closeModal();
                resetSearch();
              }}
              className="text-gray-500  bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button
              className={clsx({
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  selectedSearchType.label?.startsWith("Seleccionar") ||
                  (selectedType.label?.startsWith("Seleccionar") &&
                    selectedSearchType.value === "TIPO"),
                ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  true,
              })}
            >
              Buscar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
*/

function DataRow({ acceso, row_number }: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const closeViewModal = () => {
    setIsViewOpen(false);
  };

  return (
    <tr className="font-semibold">
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
      >
        {row_number}
      </th>
      <td className="px-6 py-4 border border-slate-300">{acceso?.ip}</td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[300px]">
        {acceso?.dispositivo}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[80px]">
        {acceso?.navegador}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate">
        {acceso?.sistemaOperativo}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {acceso?.urlSolicitada}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {acceso?.peticionMetodo === "POST" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            POST
          </div>
        ) : acceso?.peticionMetodo === "PATCH" ? (
          <div className="bg-blue-200 text-center text-blue-600 text-xs py-2 font-bold rounded-lg capitalize">
            PATCH
          </div>
        ) : (
          <div className="bg-red-200 text-center text-red-600 text-xs py-2 font-bold rounded-lg capitalize">
            DELETE
          </div>
        )}
      </td>
      <td className="px-6 py-3 border border-slate-300 w-[200px] relative truncate">
        <button
          onClick={() => {
            setIsViewOpen(true);
          }}
          className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
        >
          Mostrar registro
        </button>
        <AccesoModal
          acceso={acceso}
          isOpen={isViewOpen}
          closeModal={closeViewModal}
          setOperationAsCompleted={() => null}
        />
      </td>
    </tr>
  );
}

function AccesoModal({ isOpen, closeModal, acceso }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        ref.current?.close();
      }
    };

    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleKeyDown);
    } else {
      closeModal();
      ref.current?.close();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  // Función para formatear el JSON con indentación
  const formatJSON = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2); // Sangría de 2 espacios
    } catch {
      return jsonString; // Si no es un JSON válido, se retorna tal cual
    }
  };

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (!dialogDimensions) return;
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Detalle de acceso</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* IP */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                IP
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.ip || "No especificada"}
              </p>
            </div>
            {/* Dispositivo */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Dispositivo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.dispositivo || "No especificado"}
              </p>
            </div>
            {/* Navegador */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Navegador
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.navegador || "No especificado"}
              </p>
            </div>
            {/* Sistema Operativo */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Sistema Operativo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.sistemaOperativo || "No especificado"}
              </p>
            </div>
            {/* URL Solicitada */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                URL Solicitada
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.urlSolicitada || "No especificada"}
              </p>
            </div>
            {/* URL Referida */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                URL Referida
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.urlReferida || "No especificada"}
              </p>
            </div>
            {/* Método de petición */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Método de Petición
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.peticionMetodo || "No especificado"}
              </p>
            </div>
            {/* Fecha de Creación */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Fecha de Acceso
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {acceso?.creado
                  ? format(new Date(acceso?.creado), "dd/MM/yyyy hh:mm a")
                  : "No especificada"}
              </p>
            </div>
            {/* Encabezados de la petición */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Encabezados de la Petición
              </p>
              <div className="max-h-60 overflow-auto bg-gray-100 p-2 rounded text-sm font-mono whitespace-pre">
                {acceso?.peticionEncabezados
                  ? formatJSON(acceso.peticionEncabezados)
                  : "No especificados"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              closeModal();
              ref.current?.close();
            }}
            className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const tempInput = useAccesoSearchParamStore((state) => state.tempInput);
  const secondTempInput = useAccesoSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useAccesoSearchParamStore((state) => state.setInput);
  const setTempInput = useAccesoSearchParamStore((state) => state.setTempInput);
  const setSecondInput = useAccesoSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useAccesoSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useAccesoSearchParamStore((state) => state.setParam);
  const setSecondParam = useAccesoSearchParamStore(
    (state) => state.setSecondParam
  );
  const incrementSearchCount = useAccesoSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useAccesoSearchParamStore(
    (state) => state.setJustSearched
  );

  const resetSearch = () => {
    setTempInput("");
    setSecondTempInput("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
    });
    setSelectedFecha({
      value: "",
      label: "Seleccionar tipo de busqueda",
    });
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          resetSearch();
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      resetSearch();
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar registro</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSearchType.value !== "") {
            resetSearch();
            incrementSearchCount();
            closeModal();
            setWasSearch(true);
            setJustSearched(true);
          }
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              if (isOpen) {
                setParam(selectedSearchType.value as string);
              }
            }}
            options={[
              {
                value: "FECHA",
                label: "Fecha",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedSearchType}
          />
        </div>
        {selectedSearchType.value === "FECHA" ? (
          <div className="relative">
            <Select
              onChange={() => {
                if (isOpen) {
                  setSecondParam(selectedFecha.value as string);
                }
              }}
              options={[
                {
                  value: "HOY",
                  label: "Hoy",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "RECIENTEMENTE",
                  label: "Recientemente",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTA_SEMANA",
                  label: "Esta semana",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTE_MES",
                  label: "Este mes",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTE_AÑO",
                  label: "Este año",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ENTRE",
                  label: "Entre las fechas",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedFecha}
            />
          </div>
        ) : null}
        {selectedFecha.value === "ENTRE" ? (
          <>
            {" "}
            <input
              type="date"
              placeholder="Fecha inicial"
              value={tempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                if (isOpen) {
                  setInput(e.target.value);
                }
                setTempInput(e.target.value);
              }}
              required
            />
            <input
              type="date"
              placeholder="Fecha final"
              value={secondTempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                if (isOpen) {
                  setSecondInput(e.target.value);
                }
                setSecondTempInput(e.target.value);
              }}
              required
            />
          </>
        ) : null}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              closeModal();
              resetSearch();
            }}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button
            className={clsx({
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedSearchType.label?.startsWith("Seleccionar") ||
                (selectedFecha.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "FECHA"),
              ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                true,
            })}
          >
            Buscar
          </button>
        </div>
      </form>
    </dialog>
  );
}

/*
function Dropup({ close, selectAction }: DropupProps) {
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
          right-0
          top-9
          py-2
          list-none
          text-left
          rounded-lg
          shadow-lg
          mt-2
          m-0
          bg-clip-padding
          border
        "
    >
      {permissions.find()?.crear.categoría && (
        <li>
          <div
            onClick={() => {
              selectAction("ADD");
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
            Añadir categoría
          </div>
        </li>
      )}
      <li>
        <div
          onClick={() => {
            selectAction("SEARCH");
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
          Buscar categoría
        </div>
      </li>
    </ul>
  );
}

function IndividualDropup({ id, close, selectAction, top }: DropupProps) {
  const dropupRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target) &&
        event.target.id !== `acciones-btn-${id}`
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
      ref={dropupRef}
      className="
          min-w-max
          fixed
          bg-white
          text-base
          z-50
          py-2
          list-none
          text-left
          rounded-lg
          shadow-xl
          mt-2
          m-0
          bg-clip-padding
          border
        "
      style={{ top: top }}
    >
      {permissions.find()?.editar.categoría && (
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
            Editar categoría
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.categoría && (
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
            Eliminar categoría
          </div>
        </li>
      )}
    </ul>
  );
}
*/

export default function AccesoDataDisplay() {
  const { id } = useParams();
  const [accesos, setAccesos] = useState<AccesoUsuario[]>([]);
  const [user, setUser] = useState<Usuario>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useAccesoSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useAccesoSearchParamStore(
    (state) => state.resetSearchCount
  );
  const [isSearch, setIsSearch] = useState(false);
  const input = useAccesoSearchParamStore((state) => state.input);
  const param = useAccesoSearchParamStore((state) => state.param);
  const secondInput = useAccesoSearchParamStore((state) => state.secondInput);
  const secondParam = useAccesoSearchParamStore((state) => state.secondParam);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useAccesoSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useAccesoSearchParamStore((state) => state.justSearched);
  const navigate = useNavigate();
  const size = 8;

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (searchCount === 0) {
      UserService.getAccesos(+id!, page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setAccesos([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setAccesos(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          resetSearchCount();
          setWasSearch(false);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (param === "FECHA" && wasSearch) {
        let loadingToast = undefined;
        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }
        if (secondParam === "HOY") {
          UserService.getToday(page, size, id!).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "RECIENTEMENTE") {
          UserService.getRecent(page, size, id!).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTA_SEMANA") {
          UserService.getThisWeek(page, size, id!).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_MES") {
          UserService.getThisMonth(page, size, id!).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_AÑO") {
          UserService.getThisYear(page, size, id!).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ENTRE") {
          UserService.getBetween(
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            size,
            id!
          ).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setAccesos([]);
            } else {
              setAccesos(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        }
      }
    }

    if (!user) {
      UserService.getById(+id!).then((data) => {
        if (data) {
          setUser(data);
        }
      });
    }
  }, [isOperationCompleted, searchCount, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute h-full w-full px-12 py-5">
        <nav className="flex justify-between items-center select-none max-[380px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span
              onClick={() => {
                navigate("/usuarios");
              }}
              className="hover:text-[#2096ed] cursor-pointer"
            >
              Usuarios
            </span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">{id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" /> Actividad de{" "}
            <span className="text-[#2096ed]">
              {user?.nombre} {user?.apellido}, {user?.documento}
            </span>
          </div>
          <div className="flex gap-2 relative">
            {searchCount > 0 ? (
              <button
                type="button"
                onClick={resetSearchCount}
                className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cancelar busqueda
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/usuarios")}
                className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Volver
              </button>
            )}
            {searchCount === 0 ? (
              <button
                onClick={() => setIsSearch(true)}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Buscar registro
              </button>
            ) : null}
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {accesos.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    IP
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Dispositivo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Navegador
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Sistema operativo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    URL solicitada
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Metodo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {accesos.map((acceso, index) => {
                  return (
                    <DataRow
                      action={""}
                      acceso={acceso}
                      setOperationAsCompleted={setAsCompleted}
                      key={acceso.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true || (accesos.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningúna registro encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningúna acceso registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún registro concuerda con tu busqueda"}
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
                  className="inline w-14 h-14 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
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
      {accesos.length > 0 && loading == false && (
        <Pagination
          pages={pages}
          current={current}
          next={() => {
            if (current < pages && current !== pages) {
              setPage(page + 1);
              setJustSearched(false);
            }
          }}
          prev={() => {
            if (current > 1) {
              setPage(page - 1);
            }
          }}
        />
      )}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 1000,
          },
          error: {
            duration: 1500
          }
        }}
      />
      <SearchModal
        isOpen={isSearch}
        closeModal={() => setIsSearch(false)}
        setOperationAsCompleted={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}
