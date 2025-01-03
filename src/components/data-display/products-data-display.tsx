import { useCallback, useEffect, useRef, useState } from "react";
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
  ReportType,
} from "../../types";
import ProductService from "../../services/producto-service";
import Slugifier from "../../utils/slugifier";
import toast, { Toaster } from "react-hot-toast";
import CategoryService from "../../services/category-service";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useProductSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import clsx from "clsx";
import { format } from "date-fns";
import MultiSelect from "../misc/multi-select";
import ImpuestoService from "../../services/impuesto-service";
import ImageService from "../../services/image-service";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
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
    nombre: "",
    descripción: "",
    precioCompra: 0,
    precioVenta: 0,
    existencias: 0,
    esPúblico: false,
    categoría_id: -1,
    exento: false,
  });

  const resetFormData = () => {
    setFormData({
      slug: "",
      nombre: "",
      descripción: "",
      precioCompra: 0,
      precioVenta: 0,
      existencias: 0,
      esPúblico: false,
      exento: false,
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
    setRandomString(Slugifier.randomString());
    setSelectedImpuestos([]);
    setIsConfirmationScreen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Añadiendo producto...");
    void ProductService.create(formData, selectedImpuestos).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
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
      void CategoryService.getAll(1, 1000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data.rows);
        }
      });
    }

    if (impuestos.length == 0) {
      void ImpuestoService.getAll(1, 1000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setImpuestos(data.rows);
        }
      });
    }
  }, []);

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Marca 
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Marca
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.marca || "No especificada"}
            </p>
          </div>

          {/* Modelo *
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Modelo
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.modelo || "No especificado"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre || "No especificado"}
            </p>
          </div>
          */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre || "No especificado"}
            </p>
          </div>
          {/* Existencias */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Existencias
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {typeof formData.existencias === "number"
                ? formData.existencias
                : "No especificado"}
            </p>
          </div>

          {/* Precio de compra */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Precio de compra
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {typeof formData.precioCompra === "number"
                ? formData.precioCompra
                : "No especificado"}
            </p>
          </div>

          {/* Precio de venta */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Precio de venta
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {typeof formData.precioVenta === "number"
                ? formData.precioVenta
                : "No especificado"}
            </p>
          </div>

          {/* Categoría */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Categoría
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {selectedCategory?.label || "No especificada"}
            </p>
          </div>

          {/* Descripción */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Descripción
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.descripción || "No especificada"}
            </p>
          </div>

          {/* Exento de impuesto */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Exento de impuesto
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.exento ? "Sí" : "No"}
            </p>
          </div>

          {/* Impuestos seleccionados (solo si NO está exento) */}
          {!formData.exento && (
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Impuestos
              </p>
              {selectedImpuestos && selectedImpuestos.length > 0 ? (
                <ul className="list-disc ml-5 text-gray-900 font-medium text-base">
                  {selectedImpuestos.map((imp) => (
                    <li key={imp.value}>{imp.label}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-900 font-medium text-base break-words">
                  No se seleccionaron impuestos
                </p>
              )}
            </div>
          )}

          {/* Publicado */}
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Publicado
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.esPúblico ? "Sí" : "No"}
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsConfirmationScreen(false)}
          className="text-gray-500 text-base bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={handleFinalSubmit}
          className="bg-[#2096ed] text-base text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
        >
          Guardar
        </button>
      </div>
    </div>
  );

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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar producto" : "Añadir producto"}
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
              URL Slug*
            </label>
            <input
              type="text"
              placeholder="Generado automáticamente"
              value={formData.slug}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
              disabled
            />
          </div>
          {/*
           <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Marca*
              </label>
              <input
                type="text"
                placeholder="Introducir marca"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    marca: e.target.value,
                  });
                }}
                value={formData.marca}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{1,50}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Modelo*
              </label>
              <input
                type="text"
                placeholder="Introducir modelo"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    modelo: e.target.value,
                  });
                }}
                value={formData.modelo}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^.{1,50}$"
                required
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
          </div>
            */}

          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre*
            </label>
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
              placeholder="Introducir nombre*"
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,250}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 250
            </span>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Existencias*
              </label>
              <input
                type="number"
                placeholder="Introducir existencias"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    existencias: Number(e.target.value),
                  });
                }}
                value={formData.existencias}
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                min={0}
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Número invalido
              </span>
            </div>
            <div className="w-1/3">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Precio de compra*
              </label>
              <input
                type="number"
                placeholder="Introducir precio de compra"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    precioCompra: !isNaN(Number(e.target.value))
                      ? Number(e.target.value)
                      : 0.0,
                  });
                }}
                value={formData.precioCompra}
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
              <label className="block text-gray-600 text-base font-medium mb-2">
                Precio de venta*
              </label>
              <input
                type="number"
                placeholder="Introducir precio de venta"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    precioVenta: !isNaN(Number(e.target.value))
                      ? Number(e.target.value)
                      : 0.0,
                  });
                }}
                value={formData.precioVenta}
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
            <label className="block text-gray-600 text-base font-medium mb-2">
              Categoría*
            </label>
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
                <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
              value={formData.descripción || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={2000}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 2000
            </span>
          </div>
          {!formData.exento && (
            <div className="relative">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Impuestos
              </label>
              <MultiSelect
                //@ts-ignore
                options={impuestos
                  .filter((impuesto) => impuesto.aplicaA === "PRODUCTO")
                  .map((impuesto) => ({
                    value: impuesto.id,
                    label: `${impuesto.codigo} - ${impuesto.porcentaje}% `,
                  }))}
                selectedValues={selectedImpuestos}
                label="Seleccionar impuestos"
                onChange={(newValues) => setSelectedImpuestos(newValues)}
              />
            </div>
          )}
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
              <input
                className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange={(e) => {
                  if (selectedImpuestos.length === 0) {
                    setFormData({
                      ...formData,
                      exento: e.target.checked,
                    });
                  }
                }}
                checked={formData.exento}
                id="checkbox"
              />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                htmlFor="checkbox"
              >
                Exento de impuesto
              </label>
            </div>
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
                Publicado
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
      )}
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
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [formData, setFormData] = useState<Producto>(producto!);
  const [randomString, setRandomString] = useState(Slugifier.randomString());
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const initialImpuestos =
    producto?.impuestos?.map((impuesto) => ({
      value: impuesto.id,
      label: impuesto.codigo ?? "",
    })) || []; // Default to an empty array if producto or impuestos is undefined
  const [selectedImpuestos, setSelectedImpuestos] =
    useState<Selected[]>(initialImpuestos);
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
    setIsConfirmationScreen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Editando producto...");
    void ProductService.update(producto?.id!, formData, {
      old: initialImpuestos,
      new: selectedImpuestos,
    }).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

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

    if (impuestos.length == 0) {
      void ImpuestoService.getAll(1, 1000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setImpuestos(data.rows);
        }
      });
    }
  }, []);

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* Contenedor principal */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA - Datos actuales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Datos actuales
            </h3>
            <div className="space-y-5">
              {/* Marca 
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Marca
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.marca || "No especificada"}
                </p>
              </div>
              */}
              {/* Modelo 
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Modelo
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.modelo || "No especificado"}
                </p>
              </div>
              */}
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.nombre || "No especificado"}
                </p>
              </div>
              {/* Existencias */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Existencias
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {typeof producto?.existencias === "number"
                    ? producto.existencias
                    : "No especificado"}
                </p>
              </div>
              {/* Precio de compra */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Precio de compra
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {typeof producto?.precioCompra === "number"
                    ? producto.precioCompra
                    : "No especificado"}
                </p>
              </div>
              {/* Precio de venta */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Precio de venta
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {typeof producto?.precioVenta === "number"
                    ? producto.precioVenta
                    : "No especificado"}
                </p>
              </div>
              {/* Categoría */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Categoría
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.categoría?.nombre || "No especificada"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.descripción || "No especificada"}
                </p>
              </div>
              {/* Exento de impuesto */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Exento de impuesto
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.exento ? "Sí" : "No"}
                </p>
              </div>
              {/* Impuestos (si no está exento) */}
              {!producto?.exento && (
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Impuestos
                  </p>
                  {producto?.impuestos && producto.impuestos.length > 0 ? (
                    <ul className="list-disc ml-5 text-gray-900 font-medium text-base">
                      {producto.impuestos.map((imp) => (
                        <li key={imp.id}>
                          {imp.codigo} - {imp.porcentaje}%
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-900 font-medium text-base break-words">
                      No se especificaron impuestos
                    </p>
                  )}
                </div>
              )}
              {/* Publicado */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Publicado
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {producto?.esPúblico ? "Sí" : "No"}
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
              {/* Marca 
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Marca
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.marca !== producto?.marca
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.marca || "No especificada"}
                </p>
              </div>
              */}
              {/* Modelo 
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Modelo
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.modelo !== producto?.modelo
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.modelo || "No especificado"}
                </p>
              </div>
              */}
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.nombre !== producto?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre || "No especificado"}
                </p>
              </div>
              {/* Existencias */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Existencias
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.existencias !== producto?.existencias
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {typeof formData.existencias === "number"
                    ? formData.existencias
                    : "No especificado"}
                </p>
              </div>
              {/* Precio de compra */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Precio de compra
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.precioCompra !== producto?.precioCompra
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {typeof formData.precioCompra === "number"
                    ? formData.precioCompra
                    : "No especificado"}
                </p>
              </div>
              {/* Precio de venta */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Precio de venta
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.precioVenta !== producto?.precioVenta
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {typeof formData.precioVenta === "number"
                    ? formData.precioVenta
                    : "No especificado"}
                </p>
              </div>
              {/* Categoría */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Categoría
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    // Compara el id de la categoría anterior con el nuevo seleccionado
                    selectedCategory?.value !== producto?.categoría_id
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {selectedCategory?.label || "No especificada"}
                </p>
              </div>
              {/* Descripción */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Descripción
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.descripción !== producto?.descripción
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.descripción || "No especificada"}
                </p>
              </div>
              {/* Exento de impuesto */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Exento de impuesto
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.exento !== producto?.exento
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.exento ? "Sí" : "No"}
                </p>
              </div>
              {/* Impuestos (si no está exento) */}
              {!formData.exento && (
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Impuestos
                  </p>
                  {/* Simple verificación de diferencia: 
                      si cambia la longitud del array de impuestos o si difiere algún elemento */}
                  <div
                    className={`${
                      JSON.stringify(
                        selectedImpuestos?.map((imp) => imp.value).sort()
                      ) !==
                      JSON.stringify(
                        producto?.impuestos?.map((imp) => imp.id).sort()
                      )
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    } text-base font-medium`}
                  >
                    {selectedImpuestos && selectedImpuestos.length > 0 ? (
                      <ul className="list-disc ml-5">
                        {selectedImpuestos.map((imp) => (
                          <li key={imp.value}>{imp.label}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No se seleccionaron impuestos</p>
                    )}
                  </div>
                </div>
              )}
              {/* Publicado */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Publicado
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.esPúblico !== producto?.esPúblico
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.esPúblico ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsConfirmationScreen(false)}
          className="text-gray-500 text-base bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={handleFinalSubmit}
          className="bg-[#2096ed] text-base text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );

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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar cambios" : "Editar producto"}
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
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              URL Slug*
            </label>
            <input
              type="text"
              placeholder="Generado automáticamente"
              value={formData.slug}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
              disabled
            />
          </div>
          {/*
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Marca*
              </label>
              <input
                type="text"
                placeholder="Introducir marca"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    marca: e.target.value,
                  });
                }}
                value={formData.marca}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{1,50}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Modelo*
              </label>
              <input
                type="text"
                placeholder="Introducir modelo"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    modelo: e.target.value,
                  });
                }}
                value={formData.modelo}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^.{1,50}$"
                required
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
          </div>
            */}
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre*
            </label>
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
              placeholder="Introducir nombre*"
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              required
              pattern="^.{1,250}$"
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 250
            </span>
          </div>
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Existencias*
              </label>
              <input
                type="number"
                placeholder="Introducir existencias"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    existencias: Number(e.target.value),
                  });
                }}
                value={formData.existencias}
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                min={0}
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Número invalido
              </span>
            </div>
            <div className="w-1/3">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Precio de compra*
              </label>
              <input
                type="number"
                placeholder="Introducir precio de compra"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    precioCompra: !isNaN(Number(e.target.value))
                      ? Number(e.target.value)
                      : 0.0,
                  });
                }}
                value={formData.precioCompra}
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
              <label className="block text-gray-600 text-base font-medium mb-2">
                Precio de venta*
              </label>
              <input
                type="number"
                placeholder="Introducir precio de venta"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    precioVenta: !isNaN(Number(e.target.value))
                      ? Number(e.target.value)
                      : 0.0,
                  });
                }}
                value={formData.precioVenta}
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
            <label className="block text-gray-600 text-base font-medium mb-2">
              Categoría*
            </label>
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
                <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
              value={formData.descripción || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={1}
              maxLength={2000}
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 2000
            </span>
          </div>
          {!formData.exento && (
            <div className="relative">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Impuestos
              </label>
              <MultiSelect
                //@ts-ignore
                options={impuestos
                  .filter((impuesto) => impuesto.aplicaA === "PRODUCTO")
                  .map((impuesto) => ({
                    value: impuesto.id,
                    label: `${impuesto.codigo} - ${impuesto.porcentaje}% `,
                  }))}
                selectedValues={selectedImpuestos}
                label="Seleccionar impuestos"
                onChange={(newValues) => setSelectedImpuestos(newValues)}
              />
            </div>
          )}
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
              <input
                className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange={(e) => {
                  if (selectedImpuestos.length === 0) {
                    setFormData({
                      ...formData,
                      exento: e.target.checked,
                    });
                  }
                }}
                checked={formData.exento}
                id="checkbox"
              />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                htmlFor="checkbox"
              >
                Exento de impuesto
              </label>
            </div>
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
                Publicado
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
      )}
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
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>(
    {}
  );
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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const result = await ImageService.upload(file);
      if (result.status === "error") {
        toast.error(result.message);
      } else if (result.url) {
        if (id > 0) {
          setToUpdate((prev) =>
            prev.map((img) =>
              img.id === id ? { ...img, url: result.url } : img
            )
          );
        } else {
          setToCreate((prev) =>
            prev.map((img) =>
              img.id === id ? { ...img, url: result.url } : img
            )
          );
        }
      }
    } catch (error) {
      toast.error("Error al subir la imagen");
    }
    setIsUploading((prev) => ({ ...prev, [id]: false }));
  };

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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
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
            <div className="w-full flex gap-2">
              <div className="w-full">
                <input
                  type="url"
                  onChange={(e) => {
                    const data = { ...imagen, url: e.target.value };
                    setToUpdate([
                      ...toUpdate.filter((img) => img.id !== imagen.id),
                      data,
                    ]);
                  }}
                  value={imagen.url}
                  placeholder="Enlace de imagen*"
                  className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  required
                  pattern="^(https?:\/\/[\w\.\-\/]+)(\.(jpg|jpeg|gif|png))?$"
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  Enlace de imagen invalido
                </span>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, imagen.id!)}
                  className="hidden"
                  id={`fileInput-${imagen.id}`}
                  disabled={isUploading[imagen.id!]}
                />
                <label
                  htmlFor={`fileInput-${imagen.id}`}
                  className={`inline-flex items-center justify-center px-4 py-2 bg-[#2096ed] text-white rounded cursor-pointer hover:bg-[#1182d5] transition ${
                    isUploading[imagen.id!]
                      ? "pointer-events-none opacity-70"
                      : ""
                  }`}
                >
                  {isUploading[imagen.id!] ? (
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
              </div>
            </div>
            <Delete
              onClick={() => handleDeleteImage(imagen.id!)}
              className="fill-white bg-red-400 p-2 h-9 w-10 rounded cursor-pointer hover:bg-red-500 transition ease-in-out delay-100 duration-300"
            />
          </div>
        ))}
        {toCreate.map((imagen) => (
          <div className="w-full flex gap-2 items-center" key={imagen.id}>
            <div className="w-full flex gap-2">
              <div className="w-full">
                <input
                  type="url"
                  onChange={(e) => {
                    const data = { ...imagen, url: e.target.value };
                    setToCreate([
                      ...toCreate.filter((img) => img.id !== imagen.id),
                      data,
                    ]);
                  }}
                  value={imagen.url}
                  placeholder="Enlace de imagen*"
                  className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  required
                  pattern="^(https?:\/\/[\w\.\-\/]+)(\.(jpg|jpeg|gif|png))?$"
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  Enlace de imagen invalido
                </span>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, imagen.id!)}
                  className="hidden"
                  id={`fileInput-${imagen.id}`}
                  disabled={isUploading[imagen.id!]}
                />
                <label
                  htmlFor={`fileInput-${imagen.id}`}
                  className={`inline-flex items-center justify-center px-4 py-2 bg-[#2096ed] text-white rounded cursor-pointer hover:bg-[#1182d5] transition ${
                    isUploading[imagen.id!]
                      ? "pointer-events-none opacity-70"
                      : ""
                  }`}
                >
                  {isUploading[imagen.id!] ? (
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
              </div>
            </div>
            <Delete
              onClick={() => handleDeleteImage(imagen.id!)}
              className="fill-white bg-red-400 p-2 h-9 w-10 rounded cursor-pointer hover:bg-red-500 transition ease-in-out delay-100 duration-300"
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Eliminar producto</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando producto...");
          ProductService.delete(producto?.id!).then((data) => {
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

function ViewModal({ isOpen, closeModal, producto }: ModalProps) {
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos del producto</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Marca 
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Marca
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.marca || "No especificada"}
            </p>
          </div>

          {/* Modelo *
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Modelo
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.modelo || "No especificado"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre || "No especificado"}
            </p>
          </div>
          */}

            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {producto?.nombre || "No especificado"}
              </p>
            </div>

            {/* Existencias */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Existencias
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {typeof producto?.existencias === "number"
                  ? producto?.existencias
                  : "No especificado"}
              </p>
            </div>

            {/* Precio de compra */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Precio de compra
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {typeof producto?.precioCompra === "number"
                  ? producto?.precioCompra
                  : "No especificado"}
              </p>
            </div>

            {/* Precio de venta */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Precio de venta
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {typeof producto?.precioVenta === "number"
                  ? producto?.precioVenta
                  : "No especificado"}
              </p>
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Categoría
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {producto?.categoría?.nombre || "No especificada"}
              </p>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {producto?.descripción || "No especificada"}
              </p>
            </div>

            {/* Exento de impuesto */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Exento de impuesto
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {producto?.exento ? "Sí" : "No"}
              </p>
            </div>

            {/* Impuestos seleccionados (solo si NO está exento) */}
            {!producto?.exento && (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Impuestos
                </p>
                {producto?.impuestos && producto?.impuestos.length > 0 ? (
                  <ul className="list-disc ml-5 text-gray-900 font-medium text-base">
                    {producto?.impuestos.map((imp) => (
                      <li key={imp.id}>{imp.codigo}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-900 font-medium text-base break-words">
                    No se seleccionaron impuestos
                  </p>
                )}
              </div>
            )}

            {/* Publicado */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Publicado
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {producto?.esPúblico ? "Sí" : "No"}
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.producto
      ? "EDIT"
      : permissions.find()?.eliminar.producto
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.producto ||
    permissions.find()?.eliminar.producto;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeImageModal = () => {
    setIsImageOpen(false);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
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
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
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
        {action === "VIEW" && (
          <>
            <button
              onClick={() => {
                setIsViewOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar producto
            </button>
            <ViewModal
              producto={producto}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
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
        ) : null}
      </td>
    </tr>
  );
}

const reportConfig: Record<
  ReportType,
  {
    fetch: (params: any) => Promise<any>;
    mapToCSV: (data: any) => any[];
    filename: string;
  }
> = {
  VENDIDO_EN: {
    fetch: async ({ secondParam, input, secondInput }) => {
      if (secondParam !== "ENTRE") {
        return ProductService.getBySoldOn(secondParam);
      }
      return ProductService.getBySoldBetween(
        new Date(input).toISOString().split("T")[0],
        new Date(secondInput).toISOString().split("T")[0]
      );
    },
    mapToCSV: (data: any) =>
      data.rows
        .filter((producto: any) => producto.venta_cantidad > 0)
        .map((producto: any) => ({
          Fecha: format(new Date(producto?.venta_fecha), "dd/MM/yyyy hh:mm a"),
          Código: producto?.código,
          Nombre: producto?.nombre,
          "Precio de venta": producto?.precio,
          Cantidad: producto?.venta_cantidad,
          Total: producto?.venta_total,
          "Nombre del cliente": `${producto?.cliente_nombre} ${producto?.cliente_apellido}`,
          "Documento del cliente": producto?.cliente_documento,
        })),
    filename: `reporte-de-productos-vendidos-${new Date().toISOString()}`,
  },
  COMPRADO_EN: {
    fetch: async ({ secondParam, input, secondInput }) => {
      if (secondParam !== "ENTRE") {
        return ProductService.getByPurchasedOn(secondParam);
      }
      return ProductService.getByPurchasedBetween(
        new Date(input).toISOString().split("T")[0],
        new Date(secondInput).toISOString().split("T")[0]
      );
    },
    mapToCSV: (data: any) =>
      data.rows
        .filter((producto: any) => producto.compra_cantidad > 0)
        .map((producto: any) => ({
          Fecha: format(new Date(producto?.compra_fecha), "dd/MM/yyyy hh:mm a"),
          Código: producto?.código,
          Nombre: producto?.nombre,
          "Precio de compra": producto?.precio,
          Cantidad: producto?.compra_cantidad,
          Total: producto?.compra_total,
          "Nombre del proveedor": producto?.proveedor_nombre,
          "Documento del proveedor": producto?.proveedor_documento,
        })),
    filename: `reporte-de-productos-comprados-${new Date().toISOString()}`,
  },
  MAS_VENDIDO: {
    fetch: ProductService.getMoreSold,
    mapToCSV: (data: any) =>
      data.map((producto: any) => ({
        Código: producto?.código,
        Nombre: producto?.nombre,
        "Precio de venta": producto?.precio,
        Total: producto?.total_vendido,
      })),
    filename: `reporte-de-productos-mas-vendidos-${new Date().toISOString()}`,
  },
  MAS_COMPRADO: {
    fetch: ProductService.getMorePurchased, // Asegúrate de que este método exista
    mapToCSV: (data: any) =>
      data.map((producto: any) => ({
        Código: producto?.código,
        Nombre: producto?.nombre,
        "Precio de compra": producto?.precio,
        Total: producto?.total_comprado,
      })),
    filename: `reporte-de-productos-mas-comprados-${new Date().toISOString()}`,
  },
  STOCK_BAJO: {
    fetch: ProductService.getLowStock,
    mapToCSV: (data: any) =>
      data.rows.map((producto: any) => ({
        Código: producto?.código,
        Nombre: producto?.nombre,
        "Precio de compra": producto?.precio_compra,
        "Precio de venta": producto?.precio_venta,
        Existencias: producto?.existencias,
      })),
    filename: `reporte-de-productos-existencias-bajo-${new Date().toISOString()}`,
  },
  SIN_STOCK: {
    fetch: ProductService.getZeroStock,
    mapToCSV: (data: any) =>
      data.rows.map((producto: any) => ({
        Código: producto?.código,
        Nombre: producto?.nombre,
        "Precio de compra": producto?.precio_compra,
        "Precio de venta": producto?.precio_venta,
        Existencias: producto?.existencias,
      })),
    filename: `reporte-de-productos-cero-existencias-${new Date().toISOString()}`,
  },
};

function ReportModal({ isOpen, closeModal }: ModalProps) {
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parámetro de reporte",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de reporte",
  });
  const [inputDates, setInputDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const ref = useRef<HTMLDialogElement>(null);

  const resetSearch = useCallback(() => {
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parámetro de reporte",
    });
    setSelectedFecha({
      value: "",
      label: "Seleccionar tipo de reporte",
    });
    setInputDates({ start: "", end: "" });
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

  const fetchAndDownloadReport = useCallback(
    async (reportType: ReportType) => {
      const config = reportConfig[reportType];
      const loadingToast = toast.loading("Generando reporte...");

      try {
        const data = await config.fetch({
          secondParam: selectedFecha.value,
          input: inputDates.start,
          secondInput: inputDates.end,
        });

        if (!data || (data.rows && data.rows.length === 0)) {
          toast.dismiss(loadingToast);
          toast.error("No se encontraron datos para el reporte.");
          return;
        }

        const csvData = config.mapToCSV(data);
        ExportCSV.handleDownload(csvData, config.filename);
        toast.dismiss(loadingToast);
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error("Ocurrió un error al generar el reporte.");
      } finally {
        closeModal();
        resetSearch();
      }
    },
    [selectedFecha.value, inputDates, closeModal, resetSearch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const { value: reportType } = selectedSearchType;

      if (!reportType) return;

      if (
        (reportType === "VENDIDO_EN" || reportType === "COMPRADO_EN") &&
        selectedFecha.value === ""
      ) {
        return;
      }

      fetchAndDownloadReport(reportType as ReportType);
    },
    [selectedSearchType, selectedFecha, fetchAndDownloadReport]
  );

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
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
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-scroll scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Generar reporte</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        {/* Selección del tipo de reporte */}
        <Select
          options={[
            {
              value: "VENDIDO_EN",
              label: "Vendidos en",
              onClick: (value, label) => {
                setSelectedSearchType({
                  value,
                  label,
                });
              },
            },
            {
              value: "COMPRADO_EN",
              label: "Comprados en",
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
              label: "Existencias bajas",
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

        {/* Selección del tipo de fecha para ciertos reportes */}
        {(selectedSearchType.value === "VENDIDO_EN" ||
          selectedSearchType.value === "COMPRADO_EN") && (
          <Select
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
        )}

        {/* Inputs de fecha si se selecciona "ENTRE" */}
        {selectedFecha.value === "ENTRE" &&
          (selectedSearchType.value === "VENDIDO_EN" ||
            selectedSearchType.value === "COMPRADO_EN") && (
            <>
              <input
                type="date"
                placeholder="Fecha inicial"
                value={inputDates.start}
                className="border p-2 rounded outline-none focus:border-[#2096ed]"
                onChange={(e) =>
                  setInputDates((prev) => ({ ...prev, start: e.target.value }))
                }
                required
              />
              <input
                type="date"
                placeholder="Fecha final"
                value={inputDates.end}
                className="border p-2 rounded outline-none focus:border-[#2096ed]"
                onChange={(e) =>
                  setInputDates((prev) => ({ ...prev, end: e.target.value }))
                }
                required
              />
            </>
          )}

        {/* Botones de acción */}
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
              "bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 transition ease-in-out delay-100 duration-300",
              {
                "pointer-events-none opacity-30":
                  selectedSearchType.value === "" ||
                  ((selectedSearchType.value === "VENDIDO_EN" ||
                    selectedSearchType.value === "COMPRADO_EN") &&
                    selectedFecha.value === ""),
              }
            )}
          >
            Generar
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
      {permissions.find()?.crear.producto && (
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
      {permissions.find()?.editar.producto && (
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
      {permissions.find()?.eliminar.producto && (
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
          Mostrar producto
        </div>
      </li>
      {permissions.find()?.editar.producto && (
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
    permissions.find()?.crear.producto ? "ADD" : "SEARCH"
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
      ProductService.getAll(page, size).then((data) => {
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
          ProductService.getByExactNombre(input, page, size).then((data) => {
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
          ProductService.getByExactCódigo(input, page, size).then((data) => {
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
          ProductService.getByNombre(input, page, size).then((data) => {
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
          ProductService.getByCódigo(input, page, size).then((data) => {
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
        <nav className="flex justify-between items-center select-none max-[380px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-600" />{" "}
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Productos
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
