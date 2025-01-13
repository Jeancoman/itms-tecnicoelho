import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Proveedor,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import ProviderService from "../../services/provider-service";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useProviderSearchParamStore } from "../../store/searchParamStore";
import clsx from "clsx";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import { format } from "date-fns";
import { createRowNumber } from "../../utils/functions";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [documentType, setDocumentType] = useState<Selected>({
    value: "V",
    label: "V",
  });
  const [formData, setFormData] = useState<Proveedor>({
    nombre: "",
    documento: undefined,
    descripción: "",
    telefono: "",
  });

  const resetFormData = useCallback(() => {
    setFormData({
      nombre: "",
      documento: undefined,
      descripción: "",
      telefono: "",
    });
    setDocumentType({
      value: "V",
      label: "V",
    });
    setIsConfirmationScreen(false);
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  }, []);

  const handleClose = useCallback(() => {
    closeModal();
    ref.current?.close();
    resetFormData();
  }, [closeModal, resetFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = async () => {
    handleClose();

    let updatedFormData = { ...formData };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      updatedFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Añadiendo proveedor...");
    const data = await ProviderService.create(updatedFormData);

    toast.dismiss(loadingToast);

    setOperationAsCompleted();

    if (data.status === "error") {
      toast.error(data.message);
    } else {
      toast.success(data.message);
    }
  };

  const handleInputChange =
    (field: keyof Proveedor) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Define una función para obtener el patrón y el mensaje de error según el tipo de documento
  const getDocumentoPatternAndMessage = () => {
    switch (documentType.value) {
      case "V":
      case "E":
        return {
          pattern: /^(\d{8}|\d{8}-\d{1})$/,
          message: "Formato válido: 12345678 o 12345678-0",
        };
      case "G":
      case "J":
        return {
          pattern: /^\d{8}-\d{1}$/,
          message: "Formato válido: 12345678-0",
        };
      case "P":
        return {
          pattern: /^\d{8}$/,
          message: "Formato válido: 12345678",
        };
      default:
        return {
          pattern: /^.*$/, // Acepta cualquier formato por defecto
          message: "Formato inválido",
        };
    }
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleEscape);
    } else {
      handleClose();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape, handleClose]);

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* NOMBRE */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre || "No especificado"}
            </p>
          </div>

          {/* DOCUMENTO */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Documento
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {documentType.value}-{formData.documento}
            </p>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Descripción
            </p>
            <p className="text-gray-900 font-medium text-base whitespace-pre-wrap">
              {formData.descripción || "No especificada"}
            </p>
          </div>

          {/* TELÉFONO */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Teléfono
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.telefono || "No especificado"}
            </p>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsConfirmationScreen(false)}
          className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 
                       hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={handleFinalSubmit}
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
          {isConfirmationScreen ? "Confirmar proveedor" : "Añadir proveedor"}
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
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Introducir nombre"
              onChange={handleInputChange("nombre")}
              value={formData.nombre}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,150}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 150
            </span>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Documento<span className="text-red-600 text-lg">*</span>
            </label>
            <div className="flex gap-1">
              <div className="relative w-[20%]">
                <Select
                  options={[
                    {
                      value: "V",
                      label: "V",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "J",
                      label: "J",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "G",
                      label: "G",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "E",
                      label: "E",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "P",
                      label: "P",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={documentType}
                  small
                />
              </div>
              <div className="w-[80%]">
                <input
                  type="text"
                  placeholder="Introducir documento"
                  onChange={handleInputChange("documento")}
                  value={formData.documento || ""}
                  className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  pattern={getDocumentoPatternAndMessage().pattern.source}
                  required
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  {getDocumentoPatternAndMessage().message}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Descripción
            </label>
            <textarea
              rows={3}
              id="description"
              placeholder="Introducir descripción"
              onChange={handleInputChange("descripción")}
              value={formData.descripción}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={500}
              name="descripción"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Introducir teléfono"
              onChange={handleInputChange("telefono")}
              value={formData.telefono}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^\+(?:[0-9]●?){10,12}[0-9]$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Teléfono debe estar en formato E.164
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  proveedor,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const initialDocumentType = proveedor?.documento
    ? proveedor.documento.split("-")[0]
    : "V";
  const [documentType, setDocumentType] = useState<Selected>({
    value: initialDocumentType,
    label: initialDocumentType,
  });
  const initialDocumento = proveedor?.documento
    ? proveedor.documento.split("-").slice(1).join("-")
    : "";
  const [formData, setFormData] = useState<Proveedor>({
    ...proveedor!,
    documento: initialDocumento,
  });

  const resetFormData = () => {
    setFormData({
      ...proveedor!,
      documento: proveedor?.documento
        ? proveedor.documento.split("-").slice(1).join("-") // Extraer el documento sin el prefijo
        : "",
    });
    setDocumentType({
      value: proveedor?.documento?.charAt(0) || "V",
      label: proveedor?.documento?.charAt(0) || "V",
    });
    setIsConfirmationScreen(false);
  };

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  }, []);

  const handleClose = useCallback(() => {
    closeModal();
    ref.current?.close();
    resetFormData();
  }, [closeModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = async () => {
    closeModal();
    ref.current?.close();

    let updatedFormData = { ...formData };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      updatedFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Editando proveedor...");
    const data = await ProviderService.update(proveedor?.id!, updatedFormData);

    toast.dismiss(loadingToast);
    setOperationAsCompleted();

    if (data.status === "success") {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  // Define una función para obtener el patrón y el mensaje de error según el tipo de documento
  const getDocumentoPatternAndMessage = () => {
    switch (documentType.value) {
      case "V":
      case "E":
        return {
          pattern: /^(\d{8}|\d{8}-\d{1})$/,
          message: "Formato válido: 12345678 o 12345678-0",
        };
      case "G":
      case "J":
        return {
          pattern: /^\d{8}-\d{1}$/,
          message: "Formato válido: 12345678-0",
        };
      case "P":
        return {
          pattern: /^\d{8}$/,
          message: "Formato válido: 12345678",
        };
      default:
        return {
          pattern: /^.*$/, // Acepta cualquier formato por defecto
          message: "Formato inválido",
        };
    }
  };

  const handleInputChange =
    (field: keyof Proveedor) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleEscape);
    } else {
      handleClose();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape, handleClose]);

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
                  {proveedor?.nombre || "No especificado"}
                </p>
              </div>
              {/* Documento */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {proveedor?.documento || "No especificado"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p className="text-gray-900 font-medium text-base whitespace-pre-wrap">
                  {proveedor?.descripción || "No especificada"}
                </p>
              </div>
              {/* Teléfono */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Teléfono
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {proveedor?.telefono || "No especificado"}
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
                    formData.nombre !== proveedor?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre || "No especificado"}
                </p>
              </div>
              {/* Documento */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    `${documentType.value}-${formData.documento}` !==
                    proveedor?.documento
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {documentType.value}-{formData.documento}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p
                  className={`text-base font-medium whitespace-pre-wrap ${
                    formData.descripción !== proveedor?.descripción
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.descripción || "No especificada"}
                </p>
              </div>
              {/* Teléfono */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Teléfono
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.telefono !== proveedor?.telefono
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.telefono || "No especificado"}
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
          {isConfirmationScreen ? "Confirmar cambios" : "Editar proveedor"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              placeholder="Introducir nombre"
              onChange={handleInputChange("nombre")}
              value={formData.nombre}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,150}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 150
            </span>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Documento<span className="text-red-600 text-lg">*</span>
            </label>
            <div className="flex gap-1">
              <div className="relative w-[20%]">
                <Select
                  options={[
                    {
                      value: "V",
                      label: "V",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "J",
                      label: "J",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "G",
                      label: "G",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "E",
                      label: "E",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "P",
                      label: "P",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={documentType}
                  small={true}
                />
              </div>
              <div className="w-[80%]">
                <input
                  type="text"
                  placeholder="Introducir documento"
                  onChange={handleInputChange("documento")}
                  value={formData.documento || ""}
                  className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  pattern={getDocumentoPatternAndMessage().pattern.source}
                  required
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  {getDocumentoPatternAndMessage().message}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Introducir descripción"
              onChange={handleInputChange("descripción")}
              value={formData.descripción || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={500}
              name="descripción"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="Teléfono"
              onChange={handleInputChange("telefono")}
              value={formData.telefono}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^\+(?:[0-9]●?){10,12}[0-9]$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Teléfono debe estar en formato E.164
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
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
  proveedor,
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
        <h1 className="text-xl font-bold text-white">Eliminar proveedor</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando proveedor...");
          ProviderService.delete(proveedor?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data.status === "error") {
              toast.error(data.message);
            } else {
              toast.success(data.message);
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

function ViewModal({ isOpen, closeModal, proveedor }: ModalProps) {
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
        <h1 className="text-xl font-bold text-white">Datos del proveedor</h1>
      </div>
      <div className="p-8 pt-6">
        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {proveedor?.nombre || "No especificado"}
              </p>
            </div>

            {/* DOCUMENTO */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Documento
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {proveedor?.documento}
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <p className="text-gray-900 font-medium text-base whitespace-pre-wrap">
                {proveedor?.descripción || "No especificada"}
              </p>
            </div>

            {/* TELÉFONO */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Teléfono
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {proveedor?.telefono || "No especificado"}
              </p>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
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
  const setIsPrecise = useProviderSearchParamStore(
    (state) => state.setIsPrecise
  );
  const setTempIsPrecise = useProviderSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useProviderSearchParamStore(
    (state) => state.tempIsPrecise
  );
  const tempInput = useProviderSearchParamStore((state) => state.tempInput);
  const setInput = useProviderSearchParamStore((state) => state.setInput);
  const setTempInput = useProviderSearchParamStore(
    (state) => state.setTempInput
  );
  const setParam = useProviderSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useProviderSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useProviderSearchParamStore(
    (state) => state.setJustSearched
  );

  const resetSearch = () => {
    setTempInput("");
    setTempIsPrecise(false);
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
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
        <h1 className="text-xl font-bold text-white">Buscar proveedor</h1>
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
                value: "DOCUMENTO",
                label: "Documento",
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
        <input
          type="text"
          placeholder={
            selectedSearchType.value === "NOMBRE"
              ? "Introduzca nombre del proveedor"
              : selectedSearchType.value === "DOCUMENTO"
              ? "Introduzca documento del proveedor"
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
        <div className="flex w-full justify-between items-center">
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
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Busqueda exacta?
            </label>
          </div>
          <div className="flex gap-2">
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
                  selectedSearchType.label?.startsWith("Seleccionar"),
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

function ReportModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parámetro de reporte",
  });

  const resetSearch = useCallback(() => {
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parámetro de reporte",
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetSearch();
        closeModal();
        ref.current?.close();
      }
    },
    [resetSearch, closeModal]
  );

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleKeyDown);
    } else {
      resetSearch();
      ref.current?.close();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, resetSearch]);

  const handleClickOutside = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = ref.current;
    if (dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        closeModal();
        dialog.close();
        resetSearch();
      }
    }
  };

  const generateReport = useCallback(
    async (fetchFunction: () => Promise<any>, mapData: (data: any) => any) => {
      const loadingToastId = toast.loading("Generando reporte...");
      try {
        const data = await fetchFunction();
        toast.dismiss(loadingToastId);
        if (!data || data === false) {
          toast.error("No se encontraron datos para el reporte.");
        } else {
          ExportCSV.handleDownload(
            data.rows.map(mapData),
            `reporte-de-proveedores-${new Date().toISOString()}`
          );
        }
      } catch (error) {
        toast.dismiss(loadingToastId);
        toast.error("Ocurrió un error al generar el reporte.");
      } finally {
        closeModal();
      }
    },
    [closeModal]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSearchType.value) return;

    switch (selectedSearchType.value) {
      case "TODOS":
        await generateReport(
          () => ProviderService.getAll(1, 100000),
          (proveedor: any) => ({
            "Nombre del proveedor": proveedor?.nombre,
            "Documento del proveedor": proveedor?.documento,
            "Telefono del proveedor": proveedor?.telefono,
            "Fecha de registro": format(
              new Date(proveedor?.registrado),
              "dd/MM/yyyy"
            ),
          })
        );
        break;

      case "TOTAL":
        await generateReport(
          () => ProviderService.orderByTotal(1, 100000),
          (proveedor: any) => ({
            "Nombre del proveedor": proveedor?.nombre,
            "Documento del proveedor": proveedor?.documento,
            "Telefono del proveedor": proveedor?.telefono,
            "Fecha de registro": format(
              new Date(proveedor?.registrado),
              "dd/MM/yyyy"
            ),
            "Total de compras": proveedor?.total_compras,
          })
        );
        break;

      case "CANTIDAD":
        await generateReport(
          () => ProviderService.orderByCantidad(1, 10000),
          (proveedor: any) => ({
            "Nombre del proveedor": proveedor?.nombre,
            "Documento del proveedor": proveedor?.documento,
            "Telefono del proveedor": proveedor?.telefono,
            "Fecha de registro": format(
              new Date(proveedor?.registrado),
              "dd/MM/yyyy"
            ),
            "Cantidad de compras": proveedor?.cantidad_compras,
          })
        );
        break;

      default:
        toast.error("Tipo de reporte no válido.");
    }
  };

  return (
    <dialog
      ref={ref}
      onClick={handleClickOutside}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Generar reporte</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <Select
            options={[
              {
                value: "TODOS",
                label: "Todos los proveedores",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "TOTAL",
                label: "Total de compras",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "CANTIDAD",
                label: "Cantidad de compras",
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
            type="submit"
            className={clsx(
              "bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300",
              {
                "pointer-events-none opacity-30":
                  selectedSearchType.value === "",
              }
            )}
            disabled={selectedSearchType.value === ""}
          >
            Generar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({
  proveedor,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.proveedor
      ? "EDIT"
      : permissions.find()?.eliminar.proveedor
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.proveedor ||
    permissions.find()?.eliminar.proveedor;

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
        {proveedor?.nombre}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate min-w-[100px]">
        {proveedor?.documento || "No especificado"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {proveedor?.descripción || "No especificada"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate">
        {proveedor?.telefono || "No especificado"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[210px] w-[210px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar proveedor
            </button>
            <EditModal
              proveedor={proveedor}
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
              Eliminar proveedor
            </button>
            <DeleteModal
              proveedor={proveedor}
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
              Mostrar proveedor
            </button>
            <ViewModal
              proveedor={proveedor}
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
            id={proveedor?.id}
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
            id={`acciones-btn-${proveedor?.id}`}
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
      {permissions.find()?.crear.proveedor && (
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
            Añadir proveedor
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
          Buscar proveedor
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("REPORT");
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
          Generar reporte
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
      {permissions.find()?.editar.proveedor && (
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
            Editar proveedor
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.proveedor && (
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
            Eliminar proveedor
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
          Mostrar proveedor
        </div>
      </li>
    </ul>
  );
}

export default function ProvidersDataDisplay() {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.proveedor ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useProviderSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useProviderSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useProviderSearchParamStore((state) => state.input);
  const param = useProviderSearchParamStore((state) => state.param);
  const isPrecise = useProviderSearchParamStore((state) => state.isPrecise);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setIsPrecise = useProviderSearchParamStore(
    (state) => state.setIsPrecise
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useProviderSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useProviderSearchParamStore(
    (state) => state.justSearched
  );
  const [isReport, setIsReport] = useState(false);
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
    if (searchCount === 0) {
      ProviderService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setProviders([]);
          setLoading(false);
          setWasSearch(false);
        } else {
          setProviders(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          setWasSearch(true);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (isPrecise && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        if (param === "NOMBRE") {
          ProviderService.getByExactNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProviders([]);
              setLoading(false);
            } else {
              setProviders(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "DOCUMENTO") {
          ProviderService.getByExactDocumento(input, page, size).then(
            (data) => {
              if (data === false) {
                setNotFound(true);
                setProviders([]);
                setLoading(false);
              } else {
                setProviders(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsOperationCompleted(false);
            }
          );
        }
      } else if (wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        if (param === "NOMBRE") {
          ProviderService.getByNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProviders([]);
              setLoading(false);
            } else {
              setProviders(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "DOCUMENTO") {
          ProviderService.getByDocumento(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProviders([]);
              setLoading(false);
            } else {
              setProviders(data.rows);
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
            <span
              onClick={() => {
                resetSearchCount();
                setIsPrecise(false);
              }}
              className="text-[#2096ed] cursor-pointer"
            >
              Proveedores
            </span>
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
                    onClick={() => {
                      resetSearchCount();
                      setIsPrecise(false);
                    }}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={openAddModal}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Añadir proveedor
                </button>
              </>
            ) : null}
            {action === "SEARCH" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetSearchCount();
                      setIsPrecise(false);
                    }}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSearch(true)}
                    className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                  >
                    Buscar proveedor
                  </button>
                )}
              </>
            ) : null}
            {action === "REPORT" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetSearchCount();
                      setIsPrecise(false);
                    }}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={() => setIsReport(true)}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Generar reporte
                </button>
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
        {providers.length > 0 && loading == false && (
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
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Teléfono
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, index) => {
                  return (
                    <DataRow
                      action={""}
                      proveedor={provider}
                      setOperationAsCompleted={setAsCompleted}
                      key={provider.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (providers.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún proveedor encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún proveedor registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún proveedor concuerda con tu busqueda."}
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
      {providers.length > 0 && loading == false && (
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
      <Toaster position="bottom-right" reverseOrder={false} />
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
      <ReportModal
        isOpen={isReport}
        closeModal={() => setIsReport(false)}
        setOperationAsCompleted={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}
