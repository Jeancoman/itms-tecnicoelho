import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as Delete } from "/src/assets/delete.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Producto,
  Categoría,
  Selected,
  Imagen,
  Impuesto,
} from "../../types";
import ProductService from "../../services/producto-service";
import Slugifier from "../../utils/slugifier";
import toast, { Toaster } from "react-hot-toast";
import CategoryService from "../../services/category-service";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import { useProductSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import clsx from "clsx";
import { format } from "date-fns";
import MultiSelect from "../misc/multi-select";
import ImpuestoService from "../../services/impuesto-service";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(true);
  const [randomString, setRandomString] = useState(Slugifier.randomString());
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [selectedImpuestos, setSelectedImpuestos] = useState<Selected[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: -1,
    label: "Seleccionar categoría",
  });
  const [formData, setFormData] = useState<Producto>({
    slug: "",
    marca: "",
    modelo: "",
    nombre: "",
    descripción: "",
    precioCompra: 0,
    precioVenta: 0,
    existencias: 0,
    esPúblico: false,
    categoría_id: -1,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      marca: "",
      modelo: "",
      nombre: "",
      descripción: "",
      precioCompra: 0,
      precioVenta: 0,
      existencias: 0,
      esPúblico: false,
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
    setRandomString(Slugifier.randomString());
    setSelectedImpuestos([]);
  };

  console.log(selectedImpuestos)

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
      void CategoryService.getAll(1, 1000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data.rows);
        }
      });
    }

    void ImpuestoService.getAll(1, 1000).then((data) => {
      if (data === false) {
        setLoading(false);
      } else {
        setLoading(false);
        setImpuestos(data.rows);
      }
    });
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit  rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir producto</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo producto...");
          void ProductService.create(formData).then((data) => {
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
        <div className="w-full">
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
                slug: `${Slugifier.slugifyWithRandomString(e.target.value)}${
                  e.target.value === "" ? "" : "-"
                }${e.target.value === "" ? "" : randomString}`,
              });
            }}
            value={formData.nombre}
            placeholder="Nombre*"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-1/3">
            <input
              type="number"
              placeholder="Existencias*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  existencias: Number(e.target.value),
                });
              }}
              value={formData.existencias === 0 ? "" : formData.existencias}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              min={0}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Número invalido
            </span>
          </div>
          <div className="w-1/3">
            <input
              type="number"
              placeholder="Precio de compra*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  precioCompra: !isNaN(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0.0,
                });
              }}
              value={
                formData.precioCompra === 0 ? "" : String(formData.precioCompra)
              }
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              min={0}
              step="0.01"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Formato debe ser 0,00 o 0.00
            </span>
          </div>
          <div className="w-1/3">
            <input
              type="number"
              placeholder="Precio de venta*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  precioVenta: !isNaN(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0.0,
                });
              }}
              value={
                formData.precioVenta === 0 ? "" : String(formData.precioVenta)
              }
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              min={0}
              step="0.01"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Formato debe ser 0,00 o 0.00
            </span>
          </div>
        </div>
        <div className="relative">
          {categories.length > 0 && (
            <SelectWithSearch
              options={categories
                .filter((category) => category.tipo === "PRODUCTO")
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
        <div className="w-full">
          <textarea
            rows={3}
            placeholder="Descripción"
            onChange={(e) => {
              setFormData({
                ...formData,
                descripción: e.target.value,
              });
            }}
            value={formData.descripción || ""}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="relative">
          <MultiSelect
            //@ts-ignore
            options={impuestos.map((impuesto) => ({
              value: impuesto.id,
              label: `${impuesto.codigo} - ${impuesto.porcentaje}% `,
            }))}
            selectedValues={selectedImpuestos}
            label="Seleccionar impuestos"
            onChange={(newValues) => setSelectedImpuestos(newValues)}
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
              ¿Público en sitio web?
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
            <button
              className={clsx({
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  selectedCategory.label?.startsWith("Seleccionar"),
                ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  true,
              })}
            >
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
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [formData, setFormData] = useState<Producto>(producto!);
  const [randomString, setRandomString] = useState(Slugifier.randomString());
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: producto?.categoría_id,
    label: producto?.categoría?.nombre,
  });

  const resetFormData = () => {
    setFormData(producto!);
    setSelectedCategory({
      value: producto?.categoría_id,
      label: producto?.categoría?.nombre,
    });
    setRandomString(Slugifier.randomString());
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
  }, [isOpen]);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
      void CategoryService.getAll(1, 1000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data.rows);
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar producto</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando producto...");
          void ProductService.update(producto?.id!, formData).then((data) => {
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
        <div className="w-full">
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
                slug: `${Slugifier.slugifyWithRandomString(e.target.value)}${
                  e.target.value === "" ? "" : "-"
                }${e.target.value === "" ? "" : randomString}`,
              });
            }}
            value={formData.nombre}
            placeholder="Nombre*"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-2/4">
            <input
              type="number"
              placeholder="Existencias*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  existencias: Number(e.target.value),
                });
              }}
              value={formData.existencias === 0 ? "" : formData.existencias}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              min={0}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Número invalido
            </span>
          </div>
          <div className="w-2/4">
            <input
              type="number"
              placeholder="Precio de compra*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  precioCompra: !isNaN(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0.0,
                });
              }}
              value={
                formData.precioCompra === 0 ? "" : String(formData.precioCompra)
              }
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              min={0}
              step="0.01"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Formato debe ser 0,00 o 0.00
            </span>
          </div>
          <div className="w-2/4">
            <input
              type="number"
              placeholder="Precio de venta*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  precioVenta: !isNaN(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0.0,
                });
              }}
              value={
                formData.precioVenta === 0 ? "" : String(formData.precioVenta)
              }
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              min={0}
              step="0.01"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Formato debe ser 0,00 o 0.00
            </span>
          </div>
        </div>
        <div className="relative">
          {categories.length > 0 && (
            <SelectWithSearch
              options={categories
                .filter((category) => category.tipo === "PRODUCTO")
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
        <div className="w-full">
          <textarea
            rows={3}
            placeholder="Descripción"
            onChange={(e) => {
              setFormData({
                ...formData,
                descripción: e.target.value,
              });
            }}
            value={formData.descripción || ""}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
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

function ImagesModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  imagenes,
  producto,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [toUpdate, setToUpdate] = useState<Imagen[]>(imagenes || []);
  const [toCreate, setToCreate] = useState<Imagen[]>(
    imagenes?.length === 0
      ? [
          {
            id: -1,
            url: "",
            esPública: false,
          },
        ]
      : []
  );
  const [toDelete, setToDelete] = useState<Imagen[]>([]);
  const [lastID, setLastID] = useState(-2);

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

  const handleAddImage = () => {
    const imagen: Imagen = {
      id: lastID,
      url: "",
      esPública: false,
    };
    setToCreate([...toCreate, imagen]);
    setLastID(lastID - 1);
  };

  const handleDeleteImage = (id: number) => {
    if (id > 0) {
      const imageToDeleteFromUpdate = toUpdate.find((img) => img.id === id);
      if (imageToDeleteFromUpdate) {
        setToDelete([...toDelete, imageToDeleteFromUpdate]);
        setToUpdate(toUpdate.filter((img) => img.id !== id));
      }
    } else {
      const imageToDeleteFromCreate = toCreate.find((img) => img.id === id);
      if (imageToDeleteFromCreate) {
        setToCreate(toCreate.filter((img) => img.id !== id));
      }
    }
  };

  const resetFormData = () => {
    setToUpdate(imagenes || []);
    setToCreate([
      {
        id: -1,
        url: "",
        esPública: false,
      },
    ]);
    setToDelete([]);
    setLastID(-2);
  };

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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit max-h-[500px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar imagenes</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando imagenes...");
          void ProductService.editImages(producto?.id!, {
            toUpdate,
            toCreate,
            toDelete,
          }).then((data) => {
            if (data) {
              toast.dismiss(loadingToast);
              toast.success("Imagenes editadas con exito.");
            } else {
              toast.dismiss(loadingToast);
              toast.error("Imagenes no pudieron ser editadas.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        {toUpdate.map((imagen) => (
          <div className="w-full flex gap-2 items-center" key={imagen.id}>
            <div className="w-full">
              <input
                type="url"
                onChange={(e) => {
                  const data = {
                    ...imagen,
                    url: e.target.value,
                  };
                  setToUpdate([
                    ...toUpdate.filter((img) => img.id !== imagen.id),
                    ...[data],
                  ]);
                }}
                value={imagen.url}
                placeholder="Enlace de imagen*"
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Enlace de imagen invalido
              </span>
            </div>
            <Delete
              onClick={() => handleDeleteImage(imagen.id!)}
              className="fill-white bg-red-400 p-2 h-10 w-10 rounded-lg cursor-pointer hover:bg-red-500 transition ease-in-out delay-100 duration-300"
            />
          </div>
        ))}
        {toCreate.map((imagen) => (
          <div className="w-full flex gap-2 items-center" key={imagen.id}>
            <div className="w-full">
              <input
                type="url"
                onChange={(e) => {
                  const data = {
                    ...imagen,
                    url: e.target.value,
                  };
                  setToCreate([
                    ...toCreate.filter((img) => img.id !== imagen.id),
                    ...[data],
                  ]);
                }}
                value={imagen.url}
                placeholder="Enlace de imagen*"
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Enlace de imagen invalido
              </span>
            </div>
            <Delete
              onClick={() => handleDeleteImage(imagen.id!)}
              className="fill-white bg-red-400 p-2 h-10 w-10 rounded-lg cursor-pointer hover:bg-red-500 transition ease-in-out delay-100 duration-300"
            />
          </div>
        ))}
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={handleAddImage}
            className="text-[#2096ed] bg-blue-100 font-semibold rounded-lg p-2 px-4 hover:bg-blue-200 transition ease-in-out delay-100 duration-300"
          >
            Añadir imagen
          </button>
          <div className="flex gap-2 justify-self-end justify-end">
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
      className="w-2/5 h-fit rounded-xl shadow text-base"
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

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const setIsPrecise = useProductSearchParamStore(
    (state) => state.setIsPrecise
  );
  const setTempIsPrecise = useProductSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useProductSearchParamStore(
    (state) => state.tempIsPrecise
  );
  const tempInput = useProductSearchParamStore((state) => state.tempInput);
  const setInput = useProductSearchParamStore((state) => state.setInput);
  const setTempInput = useProductSearchParamStore(
    (state) => state.setTempInput
  );
  const setParam = useProductSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useProductSearchParamStore(
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit max-h-[500px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar producto</h1>
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
                value: "CÓDIGO",
                label: "Código",
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
            selectedSearchType.value === "CÓDIGO"
              ? "Introduzca código del producto"
              : selectedSearchType.value === "NOMBRE"
              ? "Introduzca nombre del producto"
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

function DataRow({ producto, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.editar.producto
      ? "EDIT"
      : permissions.find()?.eliminar.producto
      ? "DELETE"
      : "NONE"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
    permissions.find()?.editar.producto
      ? true
      : permissions.find()?.eliminar.producto
      ? true
      : false;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeImageModal = () => {
    setIsImageOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const formatter = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  });

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {producto?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {producto?.código}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate">
        {producto?.nombre}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {producto?.categoría?.nombre}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {formatter.format(producto?.precioCompra || 0)}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {formatter.format(producto?.precioVenta || 0)}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {producto?.existencias}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[200px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
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
        {action === "VIEW_IMAGES" && (
          <>
            <button
              onClick={() => {
                setIsImageOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar imagenes
            </button>
            <ImagesModal
              producto={producto}
              isOpen={isImageOpen}
              closeModal={closeImageModal}
              setOperationAsCompleted={setOperationAsCompleted}
              imagenes={producto?.imagens}
            />
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => null}
            id={producto?.id}
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
            id={`acciones-btn-${producto?.id}`}
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

function ReportModal({ isOpen, closeModal }: ModalProps) {
  const [param, setParam] = useState("");
  const [secondParam, setSecondParam] = useState("");
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de reporte",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de reporte",
  });

  const resetSearch = () => {
    setParam("");
    setSecondInput("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de reporte",
    });
    setSelectedFecha({
      value: "",
      label: "Seleccionar tipo de reporte",
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit max-h-[500px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Generar reporte</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSearchType.value !== "") {
            if (param === "VENDIDO_EN") {
              const loadingToast = toast.loading("Generando reporte...");
              if (secondParam !== "ENTRE") {
                void ProductService.getBySoldOn(secondParam).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows
                        .filter((producto) => producto.venta_cantidad > 0)
                        .map((producto) => {
                          return {
                            Fecha: format(
                              new Date(producto?.venta_fecha),
                              "dd/MM/yyyy"
                            ),
                            Código: producto?.código,
                            Nombre: producto?.nombre,
                            "Precio de venta": producto?.precio,
                            Cantidad: producto?.venta_cantidad,
                            Total: producto?.venta_total,
                            "Nombre del cliente":
                              producto?.cliente_nombre +
                              " " +
                              producto?.cliente_apellido,
                            "Documento del cliente":
                              producto?.cliente_documento,
                          };
                        }),
                      "reporte-de-productos-vendidos-" +
                        new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else {
                void ProductService.getBySoldBetween(
                  new Date(input).toISOString().split("T")[0],
                  new Date(secondInput).toISOString().split("T")[0]
                ).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows
                        .filter((producto) => producto.venta_cantidad > 0)
                        .map((producto) => {
                          return {
                            Fecha: format(
                              new Date(producto?.venta_fecha),
                              "dd/MM/yyyy"
                            ),
                            Código: producto?.código,
                            Nombre: producto?.nombre,
                            "Precio de venta": producto?.precio,
                            Cantidad: producto?.venta_cantidad,
                            Total: producto?.venta_total,
                            "Nombre del cliente":
                              producto?.cliente_nombre +
                              " " +
                              producto?.cliente_apellido,
                            "Documento del cliente":
                              producto?.cliente_documento,
                          };
                        }),
                      "reporte-de-productos-vendidos-" +
                        new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              }
            } else if (param === "COMPRADO_EN") {
              const loadingToast = toast.loading("Generando reporte...");
              if (secondParam !== "ENTRE") {
                void ProductService.getByPurchasedOn(secondParam).then(
                  (data) => {
                    if (data === false) {
                      toast.dismiss(loadingToast);
                      toast.error("Error obteniendo datos.");
                    } else {
                      ExportCSV.handleDownload(
                        data.rows
                          .filter((producto) => producto.compra_cantidad > 0)
                          .map((producto) => {
                            return {
                              Fecha: format(
                                new Date(producto?.compra_fecha),
                                "dd/MM/yyyy"
                              ),
                              Código: producto?.código,
                              Nombre: producto?.nombre,
                              "Precio de compra": producto?.precio,
                              Cantidad: producto?.compra_cantidad,
                              Total: producto?.compra_total,
                              "Nombre del proveedor":
                                producto?.proveedor_nombre,
                              "Documento del proveedor":
                                producto?.proveedor_documento,
                            };
                          }),
                        "reporte-de-productos-comprados-" +
                          new Date().toISOString()
                      );
                      toast.dismiss(loadingToast);
                    }
                    closeModal();
                  }
                );
              } else {
                void ProductService.getByPurchasedBetween(
                  new Date(input).toISOString().split("T")[0],
                  new Date(secondInput).toISOString().split("T")[0]
                ).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows
                        .filter((producto) => producto.compra_cantidad > 0)
                        .map((producto) => {
                          return {
                            Fecha: format(
                              new Date(producto?.compra_fecha),
                              "dd/MM/yyyy"
                            ),
                            Código: producto?.código,
                            Nombre: producto?.nombre,
                            "Precio de compra": producto?.precio,
                            Cantidad: producto?.compra_cantidad,
                            Total: producto?.compra_total,
                            "Nombre del proveedor": producto?.proveedor_nombre,
                            "Documento del proveedor":
                              producto?.proveedor_documento,
                          };
                        }),
                      "reporte-de-productos-comprados-" +
                        new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              }
            } else if (param === "MAS_VENDIDO") {
              const loadingToast = toast.loading("Generando reporte...");
              void ProductService.getMoreSold().then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.map((producto: any) => {
                      return {
                        Código: producto?.código,
                        Nombre: producto?.nombre,
                        "Precio de venta": producto?.precio,
                        Total: producto?.total_vendido,
                      };
                    }),
                    "reporte-de-productos-mas-vendidos-" +
                      new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            } else if (param === "MAS_COMPRADO") {
              const loadingToast = toast.loading("Generando reporte...");
              void ProductService.getMoreSold().then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.map((producto: any) => {
                      return {
                        Código: producto?.código,
                        Nombre: producto?.nombre,
                        "Precio de compra": producto?.precio,
                        Total: producto?.total_comprado,
                      };
                    }),
                    "reporte-de-productos-mas-comprados-" +
                      new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            } else if (param === "STOCK_BAJO") {
              const loadingToast = toast.loading("Generando reporte...");
              void ProductService.getLowStock().then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows.map((producto: any) => {
                      return {
                        Código: producto?.código,
                        Nombre: producto?.nombre,
                        "Precio de compra": producto?.precio_compra,
                        "Precio de venta": producto?.precio_venta,
                        Existencias: producto?.existencias,
                      };
                    }),
                    "reporte-de-productos-existencias-bajo-" +
                      new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            } else if (param === "SIN_STOCK") {
              const loadingToast = toast.loading("Generando reporte...");
              void ProductService.getZeroStock().then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows.map((producto: any) => {
                      return {
                        Código: producto?.código,
                        Nombre: producto?.nombre,
                        "Precio de compra": producto?.precio_compra,
                        "Precio de venta": producto?.precio_venta,
                        Existencias: producto?.existencias,
                      };
                    }),
                    "reporte-de-productos-cero-existencias-" +
                      new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            }
          }
          closeModal();
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              setParam(selectedSearchType.value as string);
            }}
            options={[
              {
                value: "VENDIDO_EN",
                label: "Fecha de  venta",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "COMPRADO_EN",
                label: "Fecha de compra",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "MAS_VENDIDO",
                label: "Más vendidos",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "MAS_COMPRADO",
                label: "Más comprados",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "STOCK_BAJO",
                label: "Stock bajo",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "SIN_STOCK",
                label: "Cero existencias",
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
        {selectedSearchType.value === "COMPRADO_EN" ||
        selectedSearchType.value === "VENDIDO_EN" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setSecondParam(selectedFecha.value as string);
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
        {selectedFecha.value === "ENTRE" &&
        (selectedSearchType.value === "COMPRADO_EN" ||
          selectedSearchType.value === "VENDIDO_EN") ? (
          <>
            {" "}
            <input
              type="date"
              placeholder="Fecha inicial"
              value={input}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setInput(e.target.value);
              }}
              required
            />
            <input
              type="date"
              placeholder="Fecha final"
              value={secondInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setSecondInput(e.target.value);
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
                selectedFecha.label?.startsWith("Seleccionar"),
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

function Dropup({ close, selectAction }: DropupProps) {
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
          mt-2
          m-0
          bg-clip-padding
          border
        "
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.producto) && (
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
            Añadir producto
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
          Buscar producto
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.producto) && (
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
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.producto) && (
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
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.producto) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_IMAGES");
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
            Editar imagenes
          </div>
        </li>
      )}
    </ul>
  );
}

export default function ProductsDataDisplay() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.crear.producto
      ? "ADD"
      : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useProductSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useProductSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useProductSearchParamStore((state) => state.input);
  const param = useProductSearchParamStore((state) => state.param);
  const isPrecise = useProductSearchParamStore((state) => state.isPrecise);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const [isReport, setIsReport] = useState(false);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

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
      ProductService.getAll(page, 8).then((data) => {
        if (data === false) {
          setNotFound(true);
          setProducts([]);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setProducts(data.rows);
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
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          ProductService.getByExactNombre(input, page, 8).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setProducts([]);
              setLoading(false);
            } else {
              setProducts(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (param === "CÓDIGO") {
          ProductService.getByExactCódigo(input, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProducts([]);
              setLoading(false);
            } else {
              setProducts(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        }
      } else if (!isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          ProductService.getByNombre(input, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProducts([]);
              setLoading(false);
            } else {
              setProducts(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "CÓDIGO") {
          ProductService.getByCódigo(input, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setProducts([]);
              setLoading(false);
            } else {
              setProducts(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
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
    console.log(page);
  }, [searchCount]);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-600" />{" "}
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Productos
            </span>
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
                Añadir producto
              </button>
            ) : null}
            {action === "SEARCH" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={resetSearchCount}
                    className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={() => setIsSearch(true)}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Buscar producto
                </button>
              </>
            ) : null}
            {action === "REPORT" ? (
              <button
                onClick={() => setIsReport(true)}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Generar reporte
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
        {products.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Precio de compra
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Precio de venta
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Existencias
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <DataRow
                      action={""}
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
        {(notFound === true ||
          (products.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún producto encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún producto registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún producto concuerda con tu busqueda."}
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
      {products.length > 0 && loading == false && (
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
