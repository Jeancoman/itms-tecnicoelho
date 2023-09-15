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
  Producto,
} from "../../types";
import ProductService from "../../services/producto-service";
import Slugifier from "../../utils/slugifier";
import { Editor } from "@tinymce/tinymce-react";
import toast, { Toaster } from "react-hot-toast";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Producto>({
    slug: "",
    nombre: "",
    descripción: "",
    precio: 0,
    stock: 0,
    esPúblico: false,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      nombre: "",
      descripción: "",
      precio: 0,
      stock: 0,
      esPúblico: false,
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
      className="w-2/5 h-fit max-h-[510px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir producto</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo producto...");
          ProductService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Producto no pudo ser añadido.");
            } else {
              toast.success("Producto añadido con exito.");
            }
          });
        }}
      >
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
              nombre: e.target.value,
              slug: Slugifier.slugifyWithRandomString(e.target.value),
            });
          }}
          value={formData.nombre}
          placeholder="Nombre*"
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Stock*"
            onChange={(e) => {
              setFormData({
                ...formData,
                stock: Number(e.target.value),
              });
            }}
            value={formData.stock === 0 ? "" : formData.stock}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
          <input
            type="tel"
            placeholder="Precio*"
            onChange={(e) => {
              setFormData({
                ...formData,
                precio: Number(e.target.value),
              });
            }}
            value={formData.precio === 0 ? "" : formData.precio}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
        </div>
        <Editor
          tinymceScriptSrc={"/tinymce/tinymce.min.js"}
          onEditorChange={(_evt, editor) =>
            setFormData({
              ...formData,
              descripción: editor.getContent(),
            })
          }
          initialValue="<p>Escriba aquí la descripción del producto.</p>"
          init={{
            height: 200,
            menubar: true,
            promotion: false,
            ui_mode: "split",
            plugins: ["wordcount"],
            toolbar:
              "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            language: "es",
          }}
        />
        <div className="flex w-full justify-between items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  esPúblico: e.target.checked,
                });
              }}
              checked={formData.esPúblico}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Hacer público en sitio web?
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
              Completar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  producto,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Producto>(producto!);

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
      className="w-2/5 h-fit max-h-[510px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar producto</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando producto...");
          ProductService.update(producto?.id!, formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Producto no pudo ser editado.");
            } else {
              toast.success("Producto editado con exito.");
            }
          });
        }}
      >
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
              nombre: e.target.value,
              slug: Slugifier.slugifyWithRandomString(e.target.value),
            });
          }}
          value={formData.nombre}
          placeholder="Nombre*"
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Stock*"
            onChange={(e) => {
              setFormData({
                ...formData,
                stock: Number(e.target.value),
              });
            }}
            value={formData.stock === 0 ? "" : formData.stock}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
          <input
            type="tel"
            placeholder="Precio*"
            onChange={(e) => {
              setFormData({
                ...formData,
                precio: Number(e.target.value),
              });
            }}
            value={formData.precio === 0 ? "" : formData.precio}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
        </div>
        <Editor
          tinymceScriptSrc={"/tinymce/tinymce.min.js"}
          onEditorChange={(_evt, editor) =>
            setFormData({
              ...formData,
              descripción: editor.getContent(),
            })
          }
          value={formData.descripción}
          init={{
            height: 200,
            menubar: true,
            promotion: false,
            ui_mode: "split",
            plugins: ["wordcount"],
            toolbar:
              "undo redo | blocks | " +
              "bold italic forecolor | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            language: "es",
          }}
        />
        <div className="flex w-full justify-between items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  esPúblico: e.target.checked,
                });
              }}
              checked={formData.esPúblico}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Hacer público en sitio web?
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
  producto,
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
          const loadingToast = toast.loading("Eliminando producto...");
          ProductService.delete(producto?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Producto eliminado con exito.");
            } else {
              toast.error("Producto no pudo ser eliminado.");
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

function DataRow({ action, producto, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  return (
    <tr className="bg-white border border-slate-300 dark:bg-gray-900 dark:border-gray-700">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-[#2096ed] whitespace-nowrap dark:text-white"
      >
        {producto?.id}
      </th>
      <td className="px-6 py-4 truncate max-w-[200px]">{producto?.slug}</td>
      <td className="px-6 py-4 truncate">{producto?.nombre}</td>
      <td className="px-6 py-4 truncate max-w-[200px]">
        {producto?.descripción}
      </td>
      <td className="px-6 py-4">{producto?.precio}</td>
      <td className="px-6 py-4">{producto?.stock}</td>
      <td className="px-6 py-4">
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
            >
              Editar producto
            </button>
            <EditModal
              producto={producto}
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
            >
              Eliminar producto
            </button>
            <DeleteModal
              producto={producto}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
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
          Editar producto
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
          Eliminar producto
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
          Añadir producto
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

export default function ProductsDataDisplay() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
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

    ProductService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setProducts(data);
        setLoading(false);
      }
      setIsOperationCompleted(false);
    });
  }, [isOperationCompleted]);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center">
          <div className="font-medium">
            Menu <Right className="w-3 h-3 inline" /> Productos
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
                console.log("click", isDropup);
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            >
              Acciones
              <Down className="ml-2 mb-0.5 w-3 h-3 inline fill-white" />
            </button>
          </div>
        </nav>
        <hr className="border-1 border-slate-200 my-5" />
        {products.length > 0 && loading == false && (
          <div className="relative overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs bg-[#2096ed] uppercase text-white dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <DataRow
                      action={action}
                      producto={product}
                      setOperationAsCompleted={setAsCompleted}
                      key={product.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {notFound === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Productos no encontrados
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que simplemente
                no hay ningún producto registrado.
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
      {products.length > 0 && loading == false && <Pagination />}
      <Toaster position="bottom-right" reverseOrder={false} />
      <AddModal
        isOpen={isAddOpen}
        closeModal={closeAddModal}
        setOperationAsCompleted={setAsCompleted}
      />
    </>
  );
}
