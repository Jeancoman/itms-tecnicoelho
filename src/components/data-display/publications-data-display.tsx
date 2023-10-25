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
  Imagen,
} from "../../types";
import PublicationService from "../../services/publication-service";
import toast, { Toaster } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import { format } from "date-fns";
import permissions from "../../utils/permissions";
import session from "../../utils/session";
import {
  usePublicationSearchParamStore,
  usePurchaseSearchParamStore,
} from "../../store/searchParamStore";
import Select from "../misc/select";
import { useSearchedStore } from "../../store/searchedStore";
import ImageService from "../../services/image-service";

function AddSection({ close, setOperationAsCompleted }: SectionProps) {
  const [formData, setFormData] = useState<Publicación>({
    slug: "",
    título: "",
    contenido: "",
    esPública: false,
    imagen: {
      url: "",
      descripción: "",
      esPública: false,
    },
    usuario_id: session.find()?.usuario.id,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      título: "",
      contenido: "",
      esPública: false,
      imagen: {
        url: "",
        descripción: "",
        esPública: false,
      },
      usuario_id: session.find()?.usuario.id,
    });
  };

  return (
    <form
      className="h-fit grid grid-cols-2 gap-5 py-4"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        resetFormData();
        const loadingToast = toast.loading("Añadiendo publicación...");
        PublicationService.create(formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          close();
          if (data === false) {
            toast.error("Publicación no pudo ser añadida.");
          } else {
            toast.success("Publicación añadida con exito.");
          }
        });
      }}
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
        <input
          type="text"
          placeholder="slug"
          value={formData.slug}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          disabled
        />
        <input
          type="text"
          onChange={(e) => {
            setFormData({
              ...formData,
              título: e.target.value,
              slug: Slugifier.slugifyWithRandomString(e.target.value),
            });
          }}
          value={formData.título}
          placeholder="Título*"
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          required
        />
        <input
          type="url"
          placeholder="URL de portada*"
          onChange={(e) => {
            setFormData({
              ...formData,
              imagen: {
                url: e.target.value || "",
                descripción: formData.imagen?.descripción,
                esPública: false,
              },
            });
          }}
          value={formData.imagen?.url}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          required
          name="url"
        />
        <textarea
          rows={6}
          placeholder="Descripción de portada"
          onChange={(e) => {
            setFormData({
              ...formData,
              imagen: {
                url: formData.imagen?.url || "",
                descripción: e.target.value,
                esPública: false,
              },
            });
          }}
          value={formData.imagen?.descripción}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex h-full items-end">
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
                ¿Es pública en sitio web?
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
            <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function EditSection({
  close,
  setOperationAsCompleted,
  publicación,
}: SectionProps) {
  const [formData, setFormData] = useState<Publicación>(publicación!);
  const [imageFormData, setImageFormData] = useState<Imagen>(
    publicación?.imagen!
  );

  return (
    <form
      className="h-fit grid grid-cols-2 gap-5 py-4"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        const loadingToast = toast.loading("Editando publicación...");
        ImageService.update(imageFormData?.id!, imageFormData);
        PublicationService.update(publicación?.id!, formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          if (data === false) {
            toast.error("Publicación no pudo ser editada.");
          } else {
            toast.success("Publicación editada con exito.");
          }
        });
      }}
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
        <input
          type="text"
          placeholder="slug"
          value={formData.slug}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          disabled
        />
        <input
          type="text"
          onChange={(e) => {
            setFormData({
              ...formData,
              título: e.target.value,
              slug: Slugifier.slugifyWithRandomString(e.target.value),
            });
          }}
          value={formData.título}
          placeholder="Título*"
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          required
        />
        <input
          type="url"
          placeholder="URL de portada*"
          onChange={(e) => {
            setImageFormData({
              ...imageFormData,
              url: e.target.value,
            });
          }}
          value={imageFormData.url}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          required
          name="url"
        />
        <textarea
          rows={6}
          placeholder="Descripción de portada"
          onChange={(e) => {
            setImageFormData({
              ...imageFormData,
              descripción: e.target.value,
            });
          }}
          value={imageFormData.descripción}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex h-full items-end">
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
                ¿Es pública en sitio web?
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </div>
    </form>
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
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando publicación...");
          PublicationService.delete(publicación?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Publicación eliminada con exito.");
            } else {
              toast.error("Publicación no pudo ser eliminada.");
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
            onClick={close}
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
}: DataRowProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>("EDIT");
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {publicación?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {publicación?.título}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {publicación?.contenido}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {format(new Date(publicación?.creada!), "dd/MM/yyyy")}
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
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[220px] relative"
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
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            id={publicación?.id}
            top={
              ref?.current?.getBoundingClientRect().top! +
              window.scrollY +
              ref?.current?.getBoundingClientRect().height! -
              15
            }
            right={
              ref?.current?.getBoundingClientRect().left! +
              window.scrollX -
              1085
            }
          />
        )}
        <button
          id={`acciones-btn-${publicación?.id}`}
          className="bg-gray-300 border right-4 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
          onClick={() => setIsDropup(!isDropup)}
        >
          <More className="w-5 h-5 inline fill-black" />
        </button>
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
          right-8
          top-14
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.publicación) && (
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

function IndividualDropup({
  id,
  close,
  selectAction,
  top,
  right,
}: DropupProps) {
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
      style={{ top: top, right: right }}
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.publicación) && (
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.publicación) && (
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
    </ul>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const tempInput = usePurchaseSearchParamStore((state) => state.tempInput);
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
  const incrementSearchCount = usePurchaseSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setIsPrecise = usePublicationSearchParamStore(
    (state) => state.setIsPrecise
  );
  const setTempIsPrecise = usePublicationSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

  const resetSearch = () => {
    setTempInput("");
    setSecondTempInput("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
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
      className="w-1/3 min-h-[200px] h-fit rounded-md shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar publicaciones</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
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
              setInput(e.target.value);
              setTempInput(e.target.value);
            }}
          />
        ) : null}
        <div className="flex w-full justify-between items-center">
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
              onClick={closeModal}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
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
  const [action, setAction] = useState<`${Action}`>("ADD");
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
  const [isSearch, setIsSearch] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

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
    if (searchCount === 0 || isOperationCompleted) {
      PublicationService.getAll(page, 8).then((data) => {
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
        PublicationService.getByTitulo(input, page, 8).then((data) => {
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
          setIsOperationCompleted(false);
        });
      } else if (!isPrecise && wasSearch) {
        PublicationService.getByExactTitulo(input, page, 8).then((data) => {
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
          setIsOperationCompleted(false);
        });
      }
    }
  }, [isOperationCompleted, searchCount, toEdit, toAdd, page]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]" onClick={resetSearchCount}>
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
          <div className="flex gap-2">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <button
                onClick={openAddModal}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Añadir publicación
              </button>
            ) : null}
            {action === "SEARCH" ? (
              <button
                onClick={() => setIsSearch(true)}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Buscar publicación
              </button>
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
              <div className="relative overflow-x-auto">
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
                        Contenido
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Creada
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
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((publication) => {
                      return (
                        <DataRow
                          action={""}
                          publicación={publication}
                          setOperationAsCompleted={setAsCompleted}
                          key={publication.id}
                          onClick={() => {
                            setToEdit(true), setPublication(publication);
                          }}
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
