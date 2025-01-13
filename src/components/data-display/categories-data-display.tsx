import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Categoría,
  CategoríaTipo,
  Selected,
} from "../../types";
import CategoryService from "../../services/category-service";
import toast, { Toaster } from "react-hot-toast";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useCategorySearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { createRowNumber } from "../../utils/functions";

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  categoría,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [formData, setFormData] = useState<Categoría>(categoría!);
  const [selectedType] = useState<Selected>({
    label: categoría?.tipo === "PRODUCTO" ? "Producto" : "Ticket",
    value: categoría?.tipo,
  });
  const [nameExist, setNameExist] = useState(false);
  const [stillWritingName, setStillWritingName] = useState(false);

  const resetFormData = () => {
    setFormData(categoría!);
    setIsConfirmationScreen(false);
    setNameExist(false);
    setStillWritingName(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Editando categoría...");
    void CategoryService.update(categoría?.id!, formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  const checkName = useCallback(
    debounce(async (nombre, tipo) => {
      if (nombre.length >= 1 && tipo) {
        const exist = await CategoryService.getByExactNombre(
          nombre,
          1,
          100,
          tipo
        );
        if (exist && categoría?.nombre !== nombre) {
          setNameExist(true);
          setStillWritingName(false);
        } else {
          setNameExist(false);
          setStillWritingName(false);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkName(formData.nombre, selectedType.value);
  }, [formData.nombre]);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
          setIsConfirmationScreen(false);
        }
      });
    } else {
      closeModal();
      ref.current?.close();
      setIsConfirmationScreen(false);
    }
  }, [closeModal, isOpen]);

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA - Datos actuales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Datos actuales
            </h3>
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {categoría?.nombre || "No especificado"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p className="text-gray-900 font-medium text-base break-words whitespace-pre-wrap">
                  {categoría?.descripción || "No especificada"}
                </p>
              </div>
              {/* Tipo */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Tipo
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {categoría?.tipo === "PRODUCTO" ? "Producto" : "Ticket"}
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - Nuevos datos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Nuevos datos
            </h3>
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.nombre !== categoría?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre || "No especificado"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p
                  className={`text-base font-medium break-words whitespace-pre-wrap ${
                    formData.descripción !== categoría?.descripción
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.descripción || "No especificada"}
                </p>
              </div>
              {/* Tipo */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Tipo
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    selectedType?.value !== categoría?.tipo
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {selectedType?.label || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsConfirmationScreen(false)} // Retorna al formulario
          className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={handleFinalSubmit} // Confirmación final
          className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar cambios" : "Editar categoría"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4 group text-base font-normal"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                });
                setStillWritingName(true);
              }}
              value={formData.nombre}
              placeholder="Introducir nombre"
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !nameExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  nameExist,
              })}
              required
              pattern="^.{1,100}$"
              name="name"
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !nameExist,
                ["mt-2 text-sm text-red-500 block"]: nameExist,
              })}
            >
              {nameExist
                ? "Esta categoría ya está registrada"
                : "Minimo 1 carácter, máximo 100"}
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
              minLength={1}
              maxLength={500}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="relative">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Tipo<span className="text-red-600 text-lg">*</span>
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
            <button
              className={clsx({
                ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  !nameExist,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  nameExist || stillWritingName,
              })}
            >
              Completar
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [selectedType, setSelectedType] = useState<Selected>({
    label: "Producto",
    value: "PRODUCTO",
  });
  const [formData, setFormData] = useState<Categoría>({
    nombre: "",
    descripción: "",
    tipo: "PRODUCTO",
    esDigital: false,
  });
  const [nameExist, setNameExist] = useState(false);
  const [stillWritingName, setStillWritingName] = useState(false);
  const [fetch, setFetch] = useState(false);

  const resetFormData = () => {
    setFormData({
      nombre: "",
      descripción: "",
      tipo: "PRODUCTO",
      esDigital: false,
    });
    setSelectedType({
      label: "Producto",
      value: "PRODUCTO",
    });
    setIsConfirmationScreen(false);
    setNameExist(false);
    setStillWritingName(false);
    setFetch(false)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Añadiendo categoría...");
    void CategoryService.create(formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  const checkName = useCallback(
    debounce(async (nombre, tipo) => {
      if (nombre.length >= 1 && tipo) {
        const exist = await CategoryService.getByExactNombre(
          nombre,
          1,
          100,
          tipo
        );
        if (exist) {
          setNameExist(true);
          setStillWritingName(false);
        } else {
          setNameExist(false);
          setStillWritingName(false);
        }
      }
      setFetch(false);
    }, 500),
    []
  );

  useEffect(() => {
    checkName(formData.nombre, selectedType.value);
  }, [formData.nombre, selectedType.value]);

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

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* NOMBRE */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre || "No especificado"}
            </p>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Descripción
            </p>
            <p className="text-gray-900 font-medium text-base break-words whitespace-pre-wrap">
              {formData.descripción || "No especificada"}
            </p>
          </div>

          {/* TIPO */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Tipo
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {selectedType?.label || "No especificado"}
            </p>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsConfirmationScreen(false)} // Retorna al formulario
          className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={handleFinalSubmit} // Confirmación final
          className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
        >
          Guardar
        </button>
      </div>
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar categoría" : "Añadir categoría"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4 group"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                });
                setStillWritingName(true);
              }}
              value={formData.nombre}
              placeholder="Introducir nombre"
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !nameExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  nameExist,
              })}
              required
              pattern="^.{1,100}$"
              name="name"
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !nameExist,
                ["mt-2 text-sm text-red-500 block"]: nameExist,
              })}
            >
              {nameExist
                ? "Esta categoría ya está registrada"
                : "Minimo 1 carácter, máximo 100"}
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
              minLength={1}
              maxLength={500}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="relative">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Tipo<span className="text-red-600 text-lg">*</span>
            </label>
            <Select
              onChange={() => {
                setFormData({
                  ...formData,
                  tipo: selectedType.value as CategoríaTipo,
                });
                setFetch(true);
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
                  label: "Ticket",
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
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button
              className={clsx({
                ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  !nameExist,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  nameExist ||
                  stillWritingName ||
                  selectedType.label?.startsWith("Selecciona") ||
                  fetch,
              })}
            >
              Completar
            </button>
          </div>
        </form>
      )}
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
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Eliminar categoría</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando categoría...");
          CategoryService.delete(categoría?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data.status === "success") {
              toast.success(data.message);
            } else {
              toast.error(data.message);
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

function ViewModal({ isOpen, closeModal, categoría }: ModalProps) {
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
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos de la categoría</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {categoría?.nombre || "No especificado"}
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <p className="text-gray-900 font-medium text-base break-words whitespace-pre-wrap">
                {categoría?.descripción || "No especificada"}
              </p>
            </div>

            {/* TIPO */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Tipo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {categoría?.tipo === "PRODUCTO" ? "Producto" : "Ticket"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={closeModal}
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
  const setJustSearched = useCategorySearchParamStore(
    (state) => state.setJustSearched
  );

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
                ? "Introduzca el nombre"
                : ""
            }
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
        ) : null}
        {selectedSearchType.value === "TIPO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                if (isOpen) {
                  setInput(selectedType.value as string);
                }
              }}
              options={[
                {
                  value: "SERVICIO",
                  label: "Ticket",
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
                if (isOpen) {
                  setIsPrecise(e.target.checked);
                }
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

function DataRow({
  categoría,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.categoría
      ? "EDIT"
      : permissions.find()?.eliminar.categoría
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.categoría ||
    permissions.find()?.eliminar.categoría;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  return (
    <tr className="font-semibold">
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
      >
        {row_number}
      </th>
      <td className="px-6 py-4 border border-slate-300 truncate">
        {categoría?.nombre}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[300px]">
        {categoría?.descripción || "No especificada"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {categoría?.tipo === "PRODUCTO" ? "Producto" : "Ticket"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[210px] w-[210px] relative"
      >
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar categoría
            </button>
            <EditModal
              categoría={categoría}
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Eliminar categoría
            </button>
            <DeleteModal
              categoría={categoría}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW" && (
          <>
            <button
              onClick={() => {
                setIsViewOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar categoría
            </button>
            <ViewModal
              categoría={categoría}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
            />
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => null}
            openSearchModal={() => null}
            id={categoría?.id}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              25
            }
          />
        )}
        {anyAction ? (
          <button
            id={`acciones-btn-${categoría?.id}`}
            className="bg-gray-300 border right-6 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            onClick={() => setIsDropup(!isDropup)}
          >
            <More className="w-5 h-5 inline fill-black" />
          </button>
        ) : null}
      </td>
    </tr>
  );
}

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

function IndividualDropup({ id, close, selectAction, top, left }: DropupProps) {
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
      style={{ top: top, left }}
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
      <li>
        <div
          onClick={() => {
            selectAction("VIEW");
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
          Mostrar categoría
        </div>
      </li>
    </ul>
  );
}

export default function CategoriesDataDisplay() {
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.categoría ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useCategorySearchParamStore((state) => state.searchCount);
  const resetSearchCount = useCategorySearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useCategorySearchParamStore((state) => state.input);
  const param = useCategorySearchParamStore((state) => state.param);
  const setIsPrecise = useCategorySearchParamStore(
    (state) => state.setIsPrecise
  );
  const isPrecise = useCategorySearchParamStore((state) => state.isPrecise);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const [isSearch, setIsSearch] = useState(false);
  const justSearched = useCategorySearchParamStore(
    (state) => state.justSearched
  );
  const setJustSearched = useCategorySearchParamStore(
    (state) => state.setJustSearched
  );
  const size = 8;

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
    if (searchCount === 0 || isOperationCompleted) {
      CategoryService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setCategories([]);
          setWasSearch(false);
          resetSearchCount();
        } else {
          setCategories(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          setWasSearch(false);
          resetSearchCount();
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (param === "TIPO") {
        let loadingToast = undefined;
        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }
        CategoryService.getByTipo(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setCategories([]);
          } else {
            setCategories(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "NOMBRE") {
        let loadingToast = undefined;
        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }
        if (isPrecise && wasSearch) {
          CategoryService.getByExactNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setCategories([]);
            } else {
              setCategories(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsPrecise(false);
            setIsOperationCompleted(false);
          });
        } else {
          CategoryService.getByNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setCategories([]);
            } else {
              setCategories(data.rows);
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
            <span className="text-[#2096ed]">Categorías</span>
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
                openSearchModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={resetSearchCount}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={openAddModal}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Añadir categoría
                </button>
              </>
            ) : null}
            {action === "SEARCH" ? (
              <>
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
                    onClick={() => setIsSearch(true)}
                    className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                  >
                    Buscar categoría
                  </button>
                )}
              </>
            ) : null}
            <button
              id="acciones-btn"
              onClick={() => {
                setIsDropup(!isDropup);
              }}
              className="bg-gray-300 border hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            >
              <More className="w-5 h-5 inline fill-black" />
            </button>
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {categories.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
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
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => {
                  return (
                    <DataRow
                      action={""}
                      categoría={category}
                      setOperationAsCompleted={setAsCompleted}
                      key={category.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (categories.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningúna categoría encontrada
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningúna categoría registrada."
                  : "Esto puede deberse a un error del servidor, o a que ningúna categoría concuerda con tu busqueda"}
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
      {categories.length > 0 && loading == false && (
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
      <AddModal
        isOpen={isAddOpen}
        closeModal={closeAddModal}
        setOperationAsCompleted={setAsCompleted}
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
