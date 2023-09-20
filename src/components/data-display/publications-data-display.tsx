import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/public/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/public/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/public/assets/thinking.svg";
import { ReactComponent as Warning } from "/public/assets/circle-exclamation-solid.svg";
import Slugifier from "../../utils/slugifier";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Publicación,
  SectionProps,
} from "../../types";
import PublicationService from "../../services/publication-service";
import toast, { Toaster } from "react-hot-toast";
import { Editor } from "@tinymce/tinymce-react";
import { format } from "date-fns";

function AddSection({ close, setOperationAsCompleted }: SectionProps) {
  const [formData, setFormData] = useState<Publicación>({
    slug: "",
    título: "",
    contenido: "",
    esPública: false,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      título: "",
      contenido: "",
      esPública: false,
    });
  };

  return (
    <form
      className="h-fit grid grid-cols-2 gap-5 py-4"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        resetFormData()
        const loadingToast = toast.loading("Creando publicación...");
        PublicationService.create(formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          close();
          if (data === false) {
            toast.error("Publicación no pudo ser creada.");
          } else {
            toast.success("Publicación creada con exito.");
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
                Pública
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

  return (
    <form
      className="h-fit grid grid-cols-2 gap-5 py-4"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        const loadingToast = toast.loading("Editando publicación...");
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
                Pública
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
  action,
  publicación,
  setOperationAsCompleted,
  onClick,
}: DataRowProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
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
      <td className="px-6 py-4 border border-slate-300 w-[210px]">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <>
            <button
              onClick={onClick}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
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
        {action === "PREVIEW" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline">
            Previsualizar publicación
          </button>
        )}
      </td>
    </tr>
  );
}

/*
function EmbeddedDataRow({ onClick }: EmbeddedDataRowProps) {
  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap border border-slate-300"
      >
        <div className="mb-[0.125rem] min-h-[1.5rem] justify-center flex items-center">
          <input
            className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            type="checkbox"
            id="checkbox"
          />
        </div>
      </th>
      <td className="font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 text-center">
        1
      </td>
      <td className="px-6 border border-slate-300 flex justify-center">
        <img
          src="https://i.natgeofe.com/n/4f5aaece-3300-41a4-b2a8-ed2708a0a27c/domestic-dog_thumb_3x2.jpg"
          className="h-8 w-8 object-cover"
        />
      </td>
      <td className="px-6 py-2 border border-slate-300 max-w-[250px] truncate">
        https://i.natgeofe.com/n/4f5aaece-3300-41a4-b2a8-ed2708a0a27c/domestic-dog_thumb_3x2.jpg
      </td>
    </tr>
  );
}

function EmbeddedTable({ onClick }: EmbeddedTableProps) {
  return (
    <div className="relative overflow-x-auto h-full">
      <table className="w-full text-sm font-medium text-slate-600 text-left">
        <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
          <tr className="border-2 border-[#2096ed]">
            <th scope="col" className="px-6 py-2 border border-slate-300"></th>
            <th scope="col" className="px-6 py-2 border border-slate-300">
              #
            </th>
            <th scope="col" className="px-6 py-2 border border-slate-300">
              Preview
            </th>
            <th scope="col" className="px-6 py-2 border border-slate-300">
              URL
            </th>
          </tr>
        </thead>
        <tbody>
          <EmbeddedDataRow onClick={onClick} />
        </tbody>
      </table>
    </div>
  );
}
*/

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
          mt-2
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
          Editar publicación
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
          Eliminar publicación
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("PREVIEW");
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
          Previsualizar publicación
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
          Crear publicación
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
          Buscar publicación
        </div>
      </li>
    </ul>
  );
}

export default function PublicationsDataDisplay() {
  const [publications, setPublications] = useState<Publicación[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");
  //@ts-ignore
  const [publication, setPublication] = useState<Publicación>({});
  const [toEdit, setToEdit] = useState(false);
  const [toAdd, setToAdd] = useState(false);

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
    if (isOperationCompleted) {
      setLoading(true);
      setNotFound(false);
    }

    if (!(toAdd && toEdit) && !loading && notFound) {
      setLoading(true);
      setNotFound(false);
    }

    PublicationService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setPublications(data);
        setLoading(false);
      }
      setIsOperationCompleted(false);
    });
  }, [isOperationCompleted, toEdit, toAdd]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-6">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            {toAdd ? (
              <>
                Publicaciones{" "}
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Crear publicación</span>
              </>
            ) : toEdit ? (
              <>
                Publicaciones{" "}
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar publicación</span>
              </>
            ) : (
              <span className="text-[#2096ed]">Publicaciones</span>
            )}
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
              //@ts-ignore
              setPublication({});
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
                          action={action}
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
            {!(toEdit && toAdd) && notFound === true && (
              <div className="grid w-full h-4/5">
                <div className="place-self-center  flex flex-col items-center">
                  <Face className="fill-[#2096ed] h-20 w-20" />
                  <p className="font-bold text-xl text-center mt-1">
                    Nínguna publicación encontrada
                  </p>
                  <p className="font-medium text text-center mt-1">
                    Esto puede deberse a un error del servidor, o a que
                    simplemente no hay ningúna publicación registrada.
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
          </>
        )}
      </div>
      {publications.length > 0 && loading == false && !toAdd && !toEdit && (
        <Pagination />
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}
