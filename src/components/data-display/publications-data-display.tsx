import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Slugifier from "../../utils/slugifier";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Publicación,
  SectionProps,
  Selected,
} from "../../types";
import PublicationService from "../../services/publication-service";
import toast, { Toaster } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import { format } from "date-fns";
import permissions from "../../utils/permissions";
import session from "../../utils/session";
import { usePublicationSearchParamStore } from "../../store/searchParamStore";
import Select from "../misc/select";
import { useSearchedStore } from "../../store/searchedStore";
import clsx from "clsx";
import ImageService from "../../services/image-service";
import { useConfirmationScreenStore } from "../../store/confirmationStore";
import { createRowNumber } from "../../utils/functions";
import "/src/content.css";

function AddSection({ close, setOperationAsCompleted }: SectionProps) {
  const isConfirmationScreen = useConfirmationScreenStore(
    (state) => state.isConfirmationScreen
  );
  const setIsConfirmationScreen = useConfirmationScreenStore(
    (state) => state.setIsConfirmationScreen
  );
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [randomString, setRandomString] = useState(Slugifier.randomString());
  const [formData, setFormData] = useState<Publicación>({
    slug: "",
    título: "",
    contenido: "",
    esPública: false,
    portada: "",
    descripcionPortada: "",
    usuario_id: session.find()?.usuario.id,
    autor: `${session.find()?.usuario.nombre} ${
      session.find()?.usuario.apellido
    }, ${session.find()?.usuario.documento}`,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      título: "",
      contenido: "",
      esPública: false,
      portada: "",
      descripcionPortada: "",
      usuario_id: session.find()?.usuario.id,
    });
    setRandomString(Slugifier.randomString());
    setIsConfirmationScreen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await ImageService.upload(file);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.url) {
        setFormData({ ...formData, portada: result.url });
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

  const handleFinalSubmit = async () => {
    close();
    resetFormData();
    const loadingToast = toast.loading("Añadiendo publicación...");
    PublicationService.create(formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  return (
    <>
      <form
        className="h-fit grid grid-cols-1 sm:grid-cols-2 gap-5 py-4 group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="h-full">
          <Editor
            tinymceScriptSrc={"/tinymce/tinymce.min.js"}
            onEditorChange={(_evt, editor) =>
              setFormData({
                ...formData,
                contenido: editor.getContent(),
              })
            }
            initialValue="<p>Escriba aquí el contenido de la publicación.</p>"
            init={{
              menubar: true,
              promotion: false,
              height: 500,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "anchor",
                "visualblocks",
                "code",
                "media",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | removeformat",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              language: "es",
            }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label className="block text-gray-600 text-base font-medium">
            URL Slug<span className="text-red-600 text-lg">*</span>
          </label>
          <input
            type="text"
            placeholder="Generado automáticamente"
            value={formData.slug}
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
            disabled
          />
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Título<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  título: e.target.value,
                  slug: `${Slugifier.slugifyWithRandomString(e.target.value)}${
                    e.target.value === "" ? "" : "-"
                  }${e.target.value === "" ? "" : randomString}`,
                });
              }}
              value={formData.título}
              placeholder="Introducir título"
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,250}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 250
            </span>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Enlace de portada<span className="text-red-600 text-lg">*</span>
            </label>
            <div className="flex gap-2">
              <div className="w-full">
                <input
                  type="url"
                  placeholder="Introducir enlace de portada"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      portada: e.target.value,
                    });
                  }}
                  value={formData.portada}
                  className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  required
                  name="url"
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  Enlace de portada invalido
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
                <button
                  type="button"
                  onClick={() => setIsViewImageOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition"
                  disabled={!formData.portada} // Deshabilitar si no hay URL
                >
                  Ver
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Descripción de portada
            </label>
            <textarea
              rows={6}
              placeholder="Introducir descripción de portada"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  descripcionPortada: e.target.value,
                });
              }}
              value={formData.descripcionPortada}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={500}
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="flex flex-col gap-4 w-full lg:flex-row lg:justify-between lg:items-center">
            <div className="flex w-full justify-between items-center">
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
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  close();
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
        </div>
      </form>
      <AddConfirmationModal
        isOpen={isConfirmationScreen}
        closeModal={() => setIsConfirmationScreen(false)}
        handleFinalSubmit={handleFinalSubmit}
        setOperationAsCompleted={() => null}
        publicación={formData}
      />
      <VisualizeModal
        isOpen={isViewImageOpen}
        closeModal={() => setIsViewImageOpen(false)}
        imagen={{
          url: formData.portada,
          esPública: false,
        }}
        setOperationAsCompleted={() => null}
      />
    </>
  );
}

function AddConfirmationModal({
  isOpen,
  closeModal,
  handleFinalSubmit,
  publicación,
}: ModalProps & {
  handleFinalSubmit: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showFullDescripcionPortada, setShowFullDescripcionPortada] =
    useState(false);
  const [view, setView] = useState<"confirmation" | "contenidoDetail">(
    "confirmation"
  );

  const toggleDescripcionPortada = () => {
    setShowFullDescripcionPortada((prev) => !prev);
  };

  const navigateToContenidoDetail = () => {
    setView("contenidoDetail");
  };

  const navigateToConfirmation = () => {
    setView("confirmation");
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleKeyDown);
    } else {
      handleClose();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    closeModal();
    ref.current?.close();
    setView("confirmation"); // Resetear la vista al cerrar
    setShowFullDescripcionPortada(false); // Opcional: Resetear descripción
  };

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      {view === "confirmation" && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">
              Confirmar publicación
            </h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Título */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Título
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.título}
                  </p>
                </div>

                {/* URL Slug */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    URL Slug
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.slug}
                  </p>
                </div>

                {/* Enlace de portada */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Enlace de portada
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.portada}
                  </p>
                </div>

                {/* Descripción de portada */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Descripción de portada
                  </p>
                  <div
                    className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                      showFullDescripcionPortada
                        ? "max-h-80 overflow-y-auto"
                        : "max-h-40 overflow-hidden"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: publicación?.descripcionPortada ?? "",
                      }}
                    />
                  </div>
                  {(publicación?.descripcionPortada?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={toggleDescripcionPortada}
                      className="text-blue-500 mt-2"
                    >
                      {showFullDescripcionPortada ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </div>

                {/* Pública */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Pública
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.esPública ? "Sí" : "No"}
                  </p>
                </div>

                {/* Contenido */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Contenido
                  </p>
                  <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-40 overflow-hidden">
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{
                        __html: publicación?.contenido ?? "",
                      }}
                    />
                  </div>
                  {(publicación?.contenido?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={navigateToContenidoDetail}
                      className="text-blue-500 mt-2"
                    >
                      Ver más
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
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
        </>
      )}

      {view === "contenidoDetail" && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">
              Confirmar publicación
            </h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white rounded-lg mb-6">
              <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-80 overflow-y-auto">
                <div
                  className="content"
                  dangerouslySetInnerHTML={{
                    __html: publicación?.contenido ?? "",
                  }}
                />
              </div>
              {/* Botón para regresar a la confirmación */}
              <button
                type="button"
                onClick={navigateToConfirmation}
                className="text-blue-500 mt-4"
              >
                Ver menos
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}

function ViewModal({ isOpen, closeModal, publicación }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showFullDescripcionPortada, setShowFullDescripcionPortada] =
    useState(false);
  const [view, setView] = useState<"confirmation" | "contenidoDetail">(
    "confirmation"
  );

  const toggleDescripcionPortada = () => {
    setShowFullDescripcionPortada((prev) => !prev);
  };

  const navigateToContenidoDetail = () => {
    setView("contenidoDetail");
  };

  const navigateToConfirmation = () => {
    setView("confirmation");
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleKeyDown);
    } else {
      handleClose();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    closeModal();
    ref.current?.close();
    setView("confirmation"); // Resetear la vista al cerrar
    setShowFullDescripcionPortada(false); // Opcional: Resetear descripción
  };

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (
          dialogDimensions &&
          (e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom)
        ) {
          handleClose();
        }
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      {view === "confirmation" && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">
              Datos de la publicación
            </h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Título */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Título
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.título}
                  </p>
                </div>

                {/* URL Slug */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    URL Slug
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.slug}
                  </p>
                </div>

                {/* Enlace de portada */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Enlace de portada
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.portada}
                  </p>
                </div>

                {/* Descripción de portada */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Descripción de portada
                  </p>
                  <div
                    className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                      showFullDescripcionPortada
                        ? "max-h-80 overflow-y-auto"
                        : "max-h-40 overflow-hidden"
                    }`}
                  >
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{
                        __html: publicación?.descripcionPortada ?? "",
                      }}
                    />
                  </div>
                  {(publicación?.descripcionPortada?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={toggleDescripcionPortada}
                      className="text-blue-500 mt-2"
                    >
                      {showFullDescripcionPortada ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </div>

                {/* Pública */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Pública
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {publicación?.esPública ? "Sí" : "No"}
                  </p>
                </div>

                {/* Contenido */}
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Contenido
                  </p>
                  <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-40 overflow-hidden">
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{
                        __html: publicación?.contenido ?? "",
                      }}
                    />
                  </div>
                  {(publicación?.contenido?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={navigateToContenidoDetail}
                      className="text-blue-500 mt-2"
                    >
                      Ver más
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {view === "contenidoDetail" && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">
              Datos de la publicación
            </h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white rounded-lg mb-6">
              <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-80 overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: publicación?.contenido ?? "",
                  }}
                />
              </div>
              {/* Botón para regresar a la confirmación */}
              <button
                type="button"
                onClick={navigateToConfirmation}
                className="text-blue-500 mt-4"
              >
                Ver menos
              </button>
            </div>
          </div>
        </>
      )}
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

function EditSection({
  close,
  setOperationAsCompleted,
  publicación,
}: SectionProps) {
  const isConfirmationScreen = useConfirmationScreenStore(
    (state) => state.isConfirmationScreen
  );
  const setIsConfirmationScreen = useConfirmationScreenStore(
    (state) => state.setIsConfirmationScreen
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [randomString, setRandomString] = useState(Slugifier.randomString());
  const [formData, setFormData] = useState<Publicación>(publicación!);

  const resetFormData = () => {
    setFormData(publicación!);
    setRandomString(Slugifier.randomString());
    setIsConfirmationScreen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await ImageService.upload(file);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.url) {
        setFormData({ ...formData, portada: result.url });
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

  const handleFinalSubmit = async () => {
    close();
    resetFormData();
    const loadingToast = toast.loading("Editando publicación...");
    PublicationService.update(publicación?.id!, formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  return (
    <>
      <form
        className="h-fit grid grid-cols-1 sm:grid-cols-2 gap-5 py-4 group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="h-full">
          <Editor
            tinymceScriptSrc={"/tinymce/tinymce.min.js"}
            onEditorChange={(_evt, editor) =>
              setFormData({
                ...formData,
                contenido: editor.getContent(),
              })
            }
            value={formData.contenido}
            init={{
              menubar: true,
              promotion: false,
              height: 500,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "anchor",
                "visualblocks",
                "code",
                "media",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | removeformat",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              language: "es",
            }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <label className="block text-gray-600 text-base font-medium">
            URL Slug<span className="text-red-600 text-lg">*</span>
          </label>
          <input
            type="text"
            placeholder="Generado automáticamente"
            value={formData.slug}
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
            disabled
          />
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Título<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  título: e.target.value,
                  slug: `${Slugifier.slugifyWithRandomString(e.target.value)}${
                    e.target.value === "" ? "" : "-"
                  }${e.target.value === "" ? "" : randomString}`,
                });
              }}
              value={formData.título}
              placeholder="Introducir título"
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,250}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 250.
            </span>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Enlace de portada<span className="text-red-600 text-lg">*</span>
            </label>
            <div className="flex gap-2">
              <div className="w-full">
                <input
                  type="url"
                  placeholder="Introducir enlace de portada"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      portada: e.target.value,
                    });
                  }}
                  value={formData.portada}
                  className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  required
                  name="url"
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  Enlace de portada invalido
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
                <button
                  type="button"
                  onClick={() => setIsViewImageOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded cursor-pointer hover:bg-gray-600 transition"
                  disabled={!formData.portada} // Deshabilitar si no hay URL
                >
                  Ver
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Descripción de portada
            </label>
            <textarea
              rows={6}
              placeholder="Introducir descripción de portada"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  descripcionPortada: e.target.value,
                });
              }}
              value={formData.descripcionPortada}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={500}
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 500
            </span>
          </div>
          <div className="flex flex-col gap-4 w-full lg:flex-row lg:justify-between lg:items-center">
            <div className="flex w-full justify-between items-center">
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
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  close();
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
        </div>
      </form>
      <EditConfirmationModal
        isOpen={isConfirmationScreen}
        closeModal={() => setIsConfirmationScreen(false)}
        handleFinalSubmit={handleFinalSubmit}
        setOperationAsCompleted={() => null}
        publicación={publicación}
        formData={formData}
      />
      <VisualizeModal
        isOpen={isViewImageOpen}
        closeModal={() => setIsViewImageOpen(false)}
        imagen={{
          url: formData.portada,
          esPública: false,
        }}
        setOperationAsCompleted={() => null}
      />
    </>
  );
}

function EditConfirmationModal({
  isOpen,
  closeModal,
  handleFinalSubmit,
  publicación,
  formData,
}: ModalProps & {
  handleFinalSubmit: () => void;
  formData: Publicación;
}) {
  const publication = publicación;
  const ref = useRef<HTMLDialogElement>(null);
  const [showFullDescripcionPortada, setShowFullDescripcionPortada] =
    useState(false);
  const [view, setView] = useState<
    "confirmation" | "contenidoDetail" | "contenidoDetailNew"
  >("confirmation");

  const toggleDescripcionPortada = () => {
    setShowFullDescripcionPortada((prev) => !prev);
  };

  const navigateToContenidoDetail = () => {
    setView("contenidoDetail");
  };

  const navigateToContenidoDetailNew = () => {
    setView("contenidoDetailNew");
  };

  const navigateToConfirmation = () => {
    setView("confirmation");
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", handleKeyDown);
    } else {
      handleClose();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    closeModal();
    ref.current?.close();
    setView("confirmation");
    setShowFullDescripcionPortada(false);
  };

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      {view === "confirmation" && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">Confirmar cambios</h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Datos actuales */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Datos actuales
                  </h3>
                  <div className="space-y-5">
                    {/* Título */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Título
                      </p>
                      <p className="text-gray-900 font-medium text-base break-words">
                        {publication?.título}
                      </p>
                    </div>

                    {/* URL Slug */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        URL Slug
                      </p>
                      <p className="text-gray-900 font-medium text-base break-words">
                        {publication?.slug}
                      </p>
                    </div>

                    {/* Enlace de portada */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Enlace de portada
                      </p>
                      <p className="text-gray-900 font-medium text-base break-words">
                        {publication?.portada}
                      </p>
                    </div>

                    {/* Descripción de portada */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Descripción de portada
                      </p>
                      <div
                        className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                          showFullDescripcionPortada
                            ? "max-h-80 overflow-y-auto"
                            : "max-h-40 overflow-hidden"
                        }`}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: publication?.descripcionPortada ?? "",
                          }}
                        />
                      </div>
                      {(publication?.descripcionPortada?.length ?? 0) > 200 && (
                        <button
                          type="button"
                          onClick={toggleDescripcionPortada}
                          className="text-blue-500 mt-2"
                        >
                          {showFullDescripcionPortada ? "Ver Menos" : "Ver Más"}
                        </button>
                      )}
                    </div>

                    {/* Pública */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Pública
                      </p>
                      <p className="text-gray-900 font-medium text-base break-words">
                        {publication?.esPública ? "Sí" : "No"}
                      </p>
                    </div>

                    {/* Contenido */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Contenido
                      </p>
                      <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-40 overflow-hidden">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: publication?.contenido ?? "",
                          }}
                        />
                      </div>
                      {(publication?.contenido?.length ?? 0) > 200 && (
                        <button
                          type="button"
                          onClick={navigateToContenidoDetail}
                          className="text-blue-500 mt-2"
                        >
                          Ver más
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nuevos datos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Nuevos datos
                  </h3>
                  <div className="space-y-5">
                    {/* Título */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Título
                      </p>
                      <p
                        className={`text-base font-medium break-words ${
                          formData.título !== publication?.título
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        {formData.título}
                      </p>
                    </div>

                    {/* URL Slug */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        URL Slug
                      </p>
                      <p
                        className={`text-base font-medium break-words ${
                          formData.slug !== publication?.slug
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        {formData.slug}
                      </p>
                    </div>

                    {/* Enlace de portada */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Enlace de portada
                      </p>
                      <p
                        className={`text-base font-medium break-words ${
                          formData.portada !== publication?.portada
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        {formData.portada}
                      </p>
                    </div>

                    {/* Descripción de portada */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Descripción de portada
                      </p>
                      <div
                        className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                          showFullDescripcionPortada
                            ? "max-h-80 overflow-y-auto"
                            : "max-h-40 overflow-hidden"
                        }`}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formData.descripcionPortada ?? "",
                          }}
                        />
                      </div>
                      {(formData.descripcionPortada?.length ?? 0) > 200 && (
                        <button
                          type="button"
                          onClick={toggleDescripcionPortada}
                          className="text-blue-500 mt-2"
                        >
                          {showFullDescripcionPortada ? "Ver Menos" : "Ver Más"}
                        </button>
                      )}
                    </div>

                    {/* Pública */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Pública
                      </p>
                      <p
                        className={`text-base font-medium break-words ${
                          formData.esPública !== publication?.esPública
                            ? "text-blue-600 font-semibold"
                            : "text-gray-900"
                        }`}
                      >
                        {formData.esPública ? "Sí" : "No"}
                      </p>
                    </div>

                    {/* Contenido */}
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                        Contenido
                      </p>
                      <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-40 overflow-hidden">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formData.contenido ?? "",
                          }}
                        />
                      </div>
                      {(formData.contenido?.length ?? 0) > 200 && (
                        <button
                          type="button"
                          onClick={navigateToContenidoDetailNew}
                          className="text-blue-500 mt-2"
                        >
                          Ver más
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Volver
              </button>
              <button
                onClick={handleFinalSubmit}
                className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </>
      )}

      {(view === "contenidoDetail" || view === "contenidoDetailNew") && (
        <>
          <div className="bg-[#2096ed] py-4 px-8">
            <h1 className="text-xl font-bold text-white">
              Confirmar publicación
            </h1>
          </div>
          <div className="p-8 pt-6">
            <div className="bg-white rounded-lg mb-6">
              <div className="text-gray-900 font-medium text-base break-words p-2 border rounded max-h-80 overflow-y-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      view === "contenidoDetailNew"
                        ? formData.contenido ?? ""
                        : publication?.contenido ?? "",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={navigateToConfirmation}
                className="text-blue-500 mt-4"
              >
                Ver menos
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  publicación,
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
        <h1 className="text-xl font-bold text-white">Eliminar publicación</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando publicación...");
          PublicationService.delete(publicación?.id!).then((data) => {
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

function DataRow({
  publicación,
  setOperationAsCompleted,
  onClick,
  row_number,
}: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.publicación
      ? "EDIT"
      : permissions.find()?.eliminar.publicación
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.publicación ||
    permissions.find()?.eliminar.publicación;

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
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {publicación?.título}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-fit">
        {format(new Date(publicación?.creada!), "dd/MM/yyyy hh:mm a")}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {publicación?.esPública === true ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-full">
            Sí
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-full">
            No
          </div>
        )}
      </td>
      <td className="px-6 py-2 border border-slate-300 truncate">
        {publicación?.usuario
          ? `${publicación.usuario.nombre} ${publicación.usuario.apellido}`
          : ""}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[220px] w-[220px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={onClick}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar publicación
            </button>
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
              Eliminar publicación
            </button>
            <DeleteModal
              publicación={publicación}
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
              Mostrar publicación
            </button>
            <ViewModal
              publicación={publicación}
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
            openAddModal={() => {}}
            id={publicación?.id}
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
            id={`acciones-btn-${publicación?.id}`}
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
          shadow-xl
          mt-2
          m-0
          bg-clip-padding
          border
        "
    >
      {permissions.find()?.crear.publicación && (
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
            Añadir publicación
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
          Buscar publicación
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
      {permissions.find()?.editar.publicación && (
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
            Editar publicación
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.publicación && (
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
            Eliminar publicación
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
          Mostrar publicación
        </div>
      </li>
    </ul>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const tempInput = usePublicationSearchParamStore((state) => state.tempInput);
  const setInput = usePublicationSearchParamStore((state) => state.setInput);
  const setTempInput = usePublicationSearchParamStore(
    (state) => state.setTempInput
  );
  const tempIsPrecise = usePublicationSearchParamStore(
    (state) => state.tempIsPrecise
  );
  const setSecondTempInput = usePublicationSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = usePublicationSearchParamStore((state) => state.setParam);
  const incrementSearchCount = usePublicationSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setIsPrecise = usePublicationSearchParamStore(
    (state) => state.setIsPrecise
  );
  const setTempIsPrecise = usePublicationSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = usePublicationSearchParamStore(
    (state) => state.setJustSearched
  );

  const resetSearch = () => {
    setTempInput("");
    setSecondTempInput("");
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
        <h1 className="text-xl font-bold text-white">Buscar publicaciones</h1>
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
            setJustSearched(true)
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
                value: "TÍTULO",
                label: "Título",
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
        {selectedSearchType.value === "TÍTULO" ? (
          <input
            type="text"
            placeholder={"Introduzca título de la publicación"}
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

export default function PublicationsDataDisplay() {
  const [publications, setPublications] = useState<Publicación[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.publicación ? "ADD" : "SEARCH"
  );
  const [publication, setPublication] = useState<Publicación>();
  const [toEdit, setToEdit] = useState(false);
  const [toAdd, setToAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = usePublicationSearchParamStore(
    (state) => state.searchCount
  );
  const resetSearchCount = usePublicationSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = usePublicationSearchParamStore((state) => state.input);
  const isPrecise = usePublicationSearchParamStore((state) => state.isPrecise);
  const setIsPrecise = usePublicationSearchParamStore(
    (state) => state.setIsPrecise
  );
  const [isSearch, setIsSearch] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = usePublicationSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = usePublicationSearchParamStore((state) => state.justSearched);
  const size = 8;

  const openAddModal = () => {
    setToAdd(true);
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
      PublicationService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
          setPublications([]);
        } else {
          setPublications(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
          setNotFound(false);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (isPrecise && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        PublicationService.getByExactTitulo(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setPublications([]);
          } else {
            setPublications(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
          }
          toast.dismiss(loadingToast)
          setIsOperationCompleted(false);
        });
      } else if (wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        PublicationService.getByTitulo(input, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setPublications([]);
          } else {
            setPublications(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
          }
          toast.dismiss(loadingToast)
          setIsOperationCompleted(false);
        });
      }
    }
  }, [isOperationCompleted, searchCount, toEdit, toAdd, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none max-[420px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span
              className="text-[#2096ed] cursor-pointer hover:text-[#1182d5] transition ease-in-out delay-100 duration-300"
              onClick={() => {
                resetSearchCount();
                setIsPrecise(false);
              }}
            >
              Publicaciones
            </span>{" "}
            {toAdd ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Añadir publicación</span>
              </>
            ) : toEdit ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar publicación</span>
              </>
            ) : null}
          </div>
          <div className="flex gap-2 relative">
            {!toAdd && !toEdit ? (
              <>
                {isDropup && (
                  <Dropup
                    close={closeDropup}
                    selectAction={selectAction}
                    openAddModal={() => null}
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
                      Añadir publicación
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
                        Buscar publicación
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
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setToAdd(false);
                  setToEdit(false);
                }}
                className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Volver
              </button>
            )}
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {toAdd ? (
          <AddSection
            isOpen={toAdd}
            close={() => {
              setToAdd(false);
            }}
            setOperationAsCompleted={setAsCompleted}
          />
        ) : toEdit ? (
          <EditSection
            isOpen={toEdit}
            close={() => {
              setToEdit(false);
              setPublication(undefined);
            }}
            setOperationAsCompleted={setAsCompleted}
            publicación={publication}
          />
        ) : (
          <>
            {publications.length > 0 && loading == false && (
              <div className="relative overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm font-medium text-slate-600 text-left">
                  <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                    <tr className="border-2 border-[#2096ed]">
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Título
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Publicada
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Autor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((publication, index) => {
                      return (
                        <DataRow
                          action={""}
                          publicación={publication}
                          setOperationAsCompleted={setAsCompleted}
                          key={publication.id}
                          onClick={() => {
                            setToEdit(true), setPublication(publication);
                          }}
                          row_number={createRowNumber(current, size, index + 1)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {((!(toEdit && toAdd) && notFound === true) ||
              (publications.length === 0 && loading === false)) && (
              <div className="grid w-full h-4/5">
                <div className="place-self-center  flex flex-col items-center">
                  <Face className="fill-[#2096ed] h-20 w-20" />
                  <p className="font-bold text-xl text-center mt-1">
                    Nínguna publicación encontrada
                  </p>
                  <p className="font-medium text text-center mt-1">
                    {searchCount === 0
                      ? "Esto puede deberse a un error del servidor, o a que no hay ningúna publicación registrada."
                      : "Esto puede deberse a un error del servidor, o a que ningúna publicación concuerda con tu busqueda."}
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
          </>
        )}
      </div>
      {publications.length > 0 && loading == false && !toAdd && !toEdit && (
        <Pagination
          pages={pages}
          current={current}
          next={() => {
            if (current < pages && current !== pages) {
              setPage(page + 1);
              setJustSearched(false)
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
