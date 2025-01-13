import { useEffect, useRef, useState } from "react";
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
  Imagen,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import ImageService from "../../services/image-service";
import permissions from "../../utils/permissions";
import { useImageSearchParamStore } from "../../store/searchParamStore";
import Select from "../misc/select";
import { useSearchedStore } from "../../store/searchedStore";
import clsx from "clsx";
import { createRowNumber } from "../../utils/functions";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerScreen, setIsViewerScreen] = useState(false); // Nuevo estado para el visualizador
  const [formData, setFormData] = useState<Imagen>({
    url: "",
    descripción: "",
    esPública: true,
  });

  const resetFormData = () => {
    setFormData({
      url: "",
      descripción: "",
      esPública: true,
    });
    setIsConfirmationScreen(false);
    setIsViewerScreen(false); // Reiniciar visualizador al resetear
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Añadiendo imagen...");
    void ImageService.create(formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
    resetFormData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await ImageService.upload(file);
      console.log(result);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.url) {
        setFormData({ ...formData, url: result.url });
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    }
    setIsUploading(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        ref.current?.close();
        resetFormData();
      }
    };

    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleEscape);
    } else {
      closeModal();
      ref.current?.close();
      resetFormData();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* ENLACE */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Enlace
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.url || "No especificado"}
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

          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Publicada
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData?.esPública ? "Sí" : "No"}
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

  const renderViewerScreen = () => (
    <>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          {/* Mostrar la imagen cargada */}
          {formData.url ? (
            <img
              src={formData.url}
              alt="Visualización"
              className="w-full h-auto object-contain rounded-md"
            />
          ) : (
            <p className="text-gray-500">No hay imagen para mostrar.</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsViewerScreen(false)}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen
            ? "Confirmar imagen"
            : isViewerScreen
            ? "Visualizar imagen"
            : "Añadir imagen"}
        </h1>
      </div>
      {/* Renderizar diferentes pantallas según el estado */}
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : isViewerScreen ? (
        renderViewerScreen()
      ) : (
        <>
          <form
            className="flex flex-col p-8 pt-6 gap-4 group"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Enlace<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-full">
                  <input
                    type="url"
                    placeholder="Introducir enlace de la imagen"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        url: e.target.value,
                      });
                    }}
                    value={formData.url}
                    className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                    required
                    name="url"
                  />
                  <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                    Enlace de imagen inválido
                  </span>
                </div>
                <div className="relative flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileInput"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="fileInput"
                    className={`inline-flex items-center justify-center px-4 py-2 bg-[#2096ed] text-white rounded cursor-pointer hover:bg-[#1182d5] transition ${
                      isUploading ? "pointer-events-none opacity-70" : ""
                    }`}
                  >
                    {isUploading ? (
                      <svg
                        aria-hidden="true"
                        className="inline w-5 h-5 animate-spin text-blue-200 fill-[#2096ed]"
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
                    ) : (
                      "Subir"
                    )}
                  </label>
                  {/* Botón "Ver" agregado */}
                  <button
                    type="button"
                    onClick={() => setIsViewerScreen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition"
                    disabled={!formData.url} // Deshabilitar si no hay URL
                  >
                    Ver
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Descripción
              </label>
              <textarea
                rows={6}
                placeholder="Introducir descripción de la imagen"
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
                Mínimo 10 caracteres
              </span>
            </div>
            <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
                <input
                  className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      esPública: e.target.checked,
                    });
                  }}
                  checked={formData.esPública}
                  id="checkbox"
                />
                <label
                  className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                  htmlFor="checkbox"
                >
                  Publicada
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    ref.current?.close();
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
        </>
      )}
    </dialog>
  );
}

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  imagen,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerScreen, setIsViewerScreen] = useState(false); // Nuevo estado para el visualizador
  const [formData, setFormData] = useState<Imagen>(imagen!);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await ImageService.upload(file);
      console.log(result);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.url) {
        setFormData({ ...formData, url: result.url });
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Editando imagen...");
    void ImageService.update(imagen?.id!, formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "success") {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      setOperationAsCompleted();
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        ref.current?.close();
      }
    };

    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleEscape);
    } else {
      closeModal();
      ref.current?.close();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

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
              {/* Enlace */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Enlace
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {imagen?.url || "No especificado"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p className="text-gray-900 font-medium text-base whitespace-pre-wrap">
                  {imagen?.descripción || "No especificada"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Publicada
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {imagen?.esPública ? "Sí" : "No"}
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
              {/* Enlace */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Enlace
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.url !== imagen?.url
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.url || "No especificado"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p
                  className={`text-base font-medium whitespace-pre-wrap ${
                    formData.descripción !== imagen?.descripción
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.descripción || "No especificada"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Publicada
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.esPública !== imagen?.esPública
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.esPública ? "Sí" : "No"}
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

  const renderViewerScreen = () => (
    <>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          {/* Mostrar la imagen cargada */}
          {formData.url ? (
            <img
              src={formData.url}
              alt="Visualización"
              className="w-full h-auto object-contain rounded-md"
            />
          ) : (
            <p className="text-gray-500">No hay imagen para mostrar.</p>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsViewerScreen(false)}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit max-h-[500px] rounded shadow text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen
            ? "Confirmar cambios"
            : isViewerScreen
            ? "Visualizar imagen"
            : "Editar imagen"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : isViewerScreen ? (
        renderViewerScreen()
      ) : (
        <>
          <form
            className="flex flex-col p-8 pt-6 gap-4 group"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Enlace<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-full">
                  <input
                    type="url"
                    placeholder="Introducir enlace de la imagen"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        url: e.target.value,
                      });
                    }}
                    value={formData.url}
                    className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                    required
                    name="url"
                  />
                  <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                    Enlace de imagen inválido
                  </span>
                </div>
                <div className="relative flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id={"fileInputEdit" + imagen?.id}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor={"fileInputEdit" + imagen?.id}
                    className={`inline-flex items-center justify-center px-4 py-2 bg-[#2096ed] text-white rounded cursor-pointer hover:bg-[#1182d5] transition ${
                      isUploading ? "pointer-events-none opacity-70" : ""
                    }`}
                  >
                    {isUploading ? (
                      <svg
                        aria-hidden="true"
                        className="inline w-5 h-5 animate-spin text-blue-200 fill-[#2096ed]"
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
                    ) : (
                      "Subir"
                    )}
                  </label>
                  {/* Botón "Ver" */}
                  <button
                    type="button"
                    onClick={() => setIsViewerScreen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition"
                    disabled={!formData.url} // Deshabilitar si no hay URL
                  >
                    Ver
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Descripción
              </label>
              <textarea
                rows={6}
                placeholder="Introducir descripción de la imagen"
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
                Mínimo 10 caracteres
              </span>
            </div>
            <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
                <input
                  className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  type="checkbox"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      esPública: e.target.checked,
                    });
                  }}
                  checked={formData.esPública}
                  id="checkbox"
                />
                <label
                  className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                  htmlFor="checkbox"
                >
                  Publicada
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    setFormData(imagen!);
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
        </>
      )}
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  imagen,
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
        <h1 className="text-xl font-bold text-white">Eliminar imagen</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando imagen...");
          ImageService.delete(imagen?.id!).then((data) => {
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
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function VisualizeModal({ isOpen, closeModal, imagen }: ModalProps) {
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
      ref.current?.close();
    }

    // Limpia el listener cuando el componente se desmonta o cambia isOpen
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (dialogDimensions) {
          if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
          ) {
            closeModal();
            ref.current?.close();
          }
        }
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Visualizador de imagen</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          {/* Agregamos la imagen aquí */}
          <img
            src={imagen?.url}
            alt="Visualización"
            className="w-full h-auto object-contain rounded-md"
          />
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

function ViewModal({ isOpen, closeModal, imagen }: ModalProps) {
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
        <h1 className="text-xl font-bold text-white">Datos de la imagen</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Enlace
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {imagen?.url || "No especificado"}
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <p className="text-gray-900 font-medium text-base whitespace-pre-wrap">
                {imagen?.descripción || "No especificada"}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Publicada
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {imagen?.esPública ? "Sí" : "No"}
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

function DataRow({
  imagen,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.imagen
      ? "EDIT"
      : permissions.find()?.eliminar.imagen
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.imagen || permissions.find()?.eliminar.imagen;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeVisualizerModal = () => {
    setIsVisualizerOpen(false);
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
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        <span
          className="hover:text-[#2096ed] cursor-pointer"
          onClick={() => setIsVisualizerOpen(true)}
        >
          {imagen?.url}
        </span>
        <VisualizeModal
          imagen={imagen}
          isOpen={isVisualizerOpen}
          closeModal={closeVisualizerModal}
          setOperationAsCompleted={() => null}
        />
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {imagen?.descripción || "No especificada"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[200px] w-[200px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar imagen
            </button>
            <EditModal
              imagen={imagen}
              isOpen={isEditOpen}
              closeModal={closeEditModal}
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
              Mostrar imagen
            </button>
            <ViewModal
              imagen={imagen}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
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
              Eliminar imagen
            </button>
            <DeleteModal
              imagen={imagen}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => null}
            id={imagen?.id}
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
            id={`acciones-btn-${imagen?.id}`}
            className="bg-gray-300 border right-6 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            onClick={() => setIsDropup(!isDropup)}
          >
            <More className="w-5 h-5 inline fill-black" />
          </button>
        ) : (
          <button className="font-medium line-through text-[#2096ed] dark:text-blue-500 -ml-2 py-1 px-2 rounded-lg cursor-default">
            Nada permitido
          </button>
        )}
      </td>
    </tr>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const setIsPrecise = useImageSearchParamStore((state) => state.setIsPrecise);
  const setTempIsPrecise = useImageSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useImageSearchParamStore(
    (state) => state.tempIsPrecise
  );
  const tempInput = useImageSearchParamStore((state) => state.tempInput);
  const setInput = useImageSearchParamStore((state) => state.setInput);
  const setTempInput = useImageSearchParamStore((state) => state.setTempInput);
  const setParam = useImageSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useImageSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useImageSearchParamStore(
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
        <h1 className="text-xl font-bold text-white">Buscar imagen</h1>
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
                value: "URL",
                label: "URL",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "DESCRIPCIÓN",
                label: "Descripción",
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
            selectedSearchType.value === "URL"
              ? "Introduzca el enlace de la imagen"
              : selectedSearchType.value === "DESCRIPCIÓN"
              ? "Introduzca descripción de la imagen"
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
      {permissions.find()?.crear.imagen && (
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
            Añadir imagen
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
          Buscar imagen
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
      {permissions.find()?.editar.imagen && (
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
            Editar imagen
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.imagen && (
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
            Eliminar imagen
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
          Mostrar imagen
        </div>
      </li>
    </ul>
  );
}

export default function ImagesDataDisplay() {
  const [images, setImages] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.imagen ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useImageSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useImageSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useImageSearchParamStore((state) => state.input);
  const param = useImageSearchParamStore((state) => state.param);
  const [isSearch, setIsSearch] = useState(false);
  const setIsPrecise = useImageSearchParamStore((state) => state.setIsPrecise);
  const isPrecise = useImageSearchParamStore((state) => state.isPrecise);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useImageSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useImageSearchParamStore((state) => state.justSearched);
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
      ImageService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setImages([]);
          setLoading(false);
          setWasSearch(false);
        } else {
          setImages(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          setWasSearch(false);
        }
        setIsOperationCompleted(false);
      });
    } else if (isPrecise && wasSearch) {
      let loadingToast = undefined;
      if (justSearched) {
        loadingToast = toast.loading("Buscando...");
      }
      if (param === "URL") {
        ImageService.getExactUrl(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setImages([]);
            setLoading(false);
          } else {
            setImages(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "DESCRIPCIÓN") {
        ImageService.getExactDescription(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setImages([]);
            setLoading(false);
          } else {
            setImages(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      }
    } else if (wasSearch) {
      let loadingToast = undefined;
      if (justSearched) {
        loadingToast = toast.loading("Buscando...");
      }
      if (param === "URL") {
        ImageService.getByUrl(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setImages([]);
            setLoading(false);
          } else {
            setImages(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "DESCRIPCIÓN") {
        ImageService.getDescription(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setImages([]);
            setLoading(false);
          } else {
            setImages(data.rows);
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
  }, [isOperationCompleted, page, searchCount]);

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
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Galería
            </span>
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrecise(false);
                      resetSearchCount();
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
                  Añadir imagen
                </button>
              </>
            ) : null}
            {action === "SEARCH" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPrecise(false);
                      resetSearchCount();
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
                    Buscar imagen
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
        {images.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    URL
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {images.map((image, index) => {
                  return (
                    <DataRow
                      action={action}
                      imagen={image}
                      setOperationAsCompleted={setAsCompleted}
                      key={image.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true || (images.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningúna imagen encontrada
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningúna imagen registrada."
                  : "Esto puede deberse a un error del servidor, o a que ningúna imagen concuerda con tu busqueda."}
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
      {images.length > 0 && loading == false && (
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
            duration: 1500,
          },
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
