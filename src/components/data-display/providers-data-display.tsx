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
  Proveedor,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import ProviderService from "../../services/provider-service";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import session from "../../utils/session";
import { useProviderSearchParamStore } from "../../store/searchParamStore";
import clsx from "clsx";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import { format } from "date-fns";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const [documentType, setDocumentType] = useState<Selected>({
    value: "RIF",
    label: "RIF",
  });
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Proveedor>({
    nombre: "",
    documento: undefined,
    descripción: "",
    telefono: "",
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      documento: undefined,
      descripción: "",
      telefono: "",
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
      className="w-2/5 h-fit rounded-md shadow-md"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir proveedor</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          let updatedFormData = { ...formData };
          updatedFormData.documento = formData.documento
            ? documentType.value === "V"
              ? "V-" + formData.documento
              : formData.documento
            : undefined;
          const loadingToast = toast.loading("Añadiendo proveedor...");
          ProviderService.create(updatedFormData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Proveedor no pudo ser añadido.");
            } else {
              toast.success("Proveedor añadido con exito.");
            }
          });
        }}
      >
        <div className="w-full">
          <input
            type="text"
            placeholder="Nombre*"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
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
                  value: "RIF",
                  label: "RIF",
                  onClick: (value, label) => {
                    setDocumentType({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={documentType}
            />
          </div>
          <div className="w-[80%]">
            <input
              type="text"
              placeholder="Documento"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  documento: e.target.value,
                });
              }}
              value={formData.documento}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{7,}$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 7 caracteres
            </span>
          </div>
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
            value={formData.descripción}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="w-full">
          <input
            type="tel"
            placeholder="Teléfono"
            onChange={(e) => {
              setFormData({
                ...formData,
                telefono: e.target.value,
              });
            }}
            value={formData.telefono}
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^\+?(\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Formato de teléfono invalido
          </span>
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
      </form>
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
  const [documentType, setDocumentType] = useState<Selected>({
    value: proveedor?.documento?.startsWith("V") ? "V" : "RIF",
    label: proveedor?.documento?.startsWith("V") ? "V" : "RIF",
  });
  const [formData, setFormData] = useState<Proveedor>({
    ...proveedor!,
    documento: proveedor?.documento?.startsWith("V")
      ? proveedor?.documento?.slice(2)
      : proveedor?.documento,
  });

  const resetFormData = () => {
    setFormData({
      ...proveedor!,
      documento: proveedor?.documento?.startsWith("V")
        ? proveedor?.documento?.slice(2)
        : proveedor?.documento,
    });
    setDocumentType({
      value: proveedor?.documento?.startsWith("V") ? "V" : "RIF",
      label: proveedor?.documento?.startsWith("V") ? "V" : "RIF",
    });
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
      className="w-2/5 h-fit rounded-md shadow text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar proveedor</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando proveedor...");
          ProviderService.update(proveedor?.id!, formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Proveedor editado con exito.");
            } else {
              toast.error("Proveedor no pudo ser editado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <div className="w-full">
          <input
            type="text"
            placeholder="Nombre*"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
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
                  value: "RIF",
                  label: "RIF",
                  onClick: (value, label) => {
                    setDocumentType({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={documentType}
            />
          </div>
          <div className="w-[80%]">
            <input
              type="text"
              placeholder="Documento"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  documento: e.target.value,
                });
              }}
              value={formData.documento}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{7,}$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 7 caracteres
            </span>
          </div>
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
        <div className="w-full">
          <input
            type="tel"
            placeholder="Teléfono"
            onChange={(e) => {
              setFormData({
                ...formData,
                telefono: e.target.value,
              });
            }}
            value={formData.telefono}
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^\+?(\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Formato de teléfono invalido
          </span>
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
      </form>
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
      className="w-2/5 h-fit rounded-xl shadow text-base font-normal"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando proveedor...");
          ProviderService.delete(proveedor?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Proveedor eliminado con exito.");
            } else {
              toast.error("Proveedor no pudo ser eliminado.");
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
      className="w-1/3 h-fit rounded-md shadow text-base"
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
            setInput(e.target.value);
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
  const [param, setParam] = useState("");
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de reporte",
  });

  const resetSearch = () => {
    setParam("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de reporte",
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
      className="w-1/3 min-h-[200px] h-fit rounded-md shadow text-base"
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
            if (param === "TODOS") {
              const loadingToast = toast.loading("Generando reporte...");
              ProviderService.getAll(1, 100000).then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Noy datos para reportar.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows.map((venta) => {
                      return {
                        "Nombre del proveedor": venta?.nombre,
                        "Documento del proveedor": venta?.documento,
                        "Telefono del proveedor": venta?.telefono,
                        "Fecha de registro": format(
                          new Date(venta?.registrado),
                          "dd/MM/yyyy"
                        ),
                      };
                    }),
                    "reporte-de-proveedores-" + new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            } else if (param === "TOTAL") {
              const loadingToast = toast.loading("Generando reporte...");
              ProviderService.orderByTotal(1, 100000).then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows
                      .filter((venta) => venta.compra_cantidad > 0)
                      .map((venta) => {
                        return {
                          "Nombre del proveedor": venta?.nombre,
                          "Documento del proveedor": venta?.documento,
                          "Telefono del proveedor": venta?.telefono,
                          "Fecha de registro": format(
                            new Date(venta?.registrado),
                            "dd/MM/yyyy"
                          ),
                          "Total de compras": venta?.total_compras,
                        };
                      }),
                    "reporte-de-proveedores-" + new Date().toISOString()
                  );
                  toast.dismiss(loadingToast);
                }
                closeModal();
              });
            } else if (param === "CANTIDAD") {
              const loadingToast = toast.loading("Generando reporte...");
              ProviderService.orderByCantidad(1, 10000).then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows.map((venta: any) => {
                      return {
                        "Nombre del proveedor": venta?.nombre,
                        "Documento del proveedor": venta?.documento,
                        "Telefono del proveedor": venta?.telefono,
                        "Fecha de registro": format(
                          new Date(venta?.registrado),
                          "dd/MM/yyyy"
                        ),
                        "Cantidad de compras": venta?.cantidad_compras,
                      };
                    }),
                    "reporte-de-proveedores-" + new Date().toISOString()
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
            className={clsx({
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedSearchType.label?.startsWith("Seleccionar"),
              ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                true,
            })}
          >
            Generar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ proveedor, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.editar.proveedor
      ? "EDIT"
      : permissions.find()?.eliminar.proveedor
      ? "DELETE"
      : "NONE"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
    permissions.find()?.editar.proveedor
      ? true
      : permissions.find()?.eliminar.proveedor
      ? true
      : false;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

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
        {proveedor?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300">{proveedor?.nombre}</td>
      <td className="px-6 py-4 border border-slate-300">
        {proveedor?.documento
          ? proveedor.documento !== ""
            ? proveedor.documento
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {proveedor?.descripción
          ? proveedor.descripción !== ""
            ? proveedor.descripción
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {proveedor?.telefono
          ? proveedor.telefono !== ""
            ? proveedor.telefono
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {proveedor?.registrado
          ? format(new Date(proveedor.registrado), "dd/MM/yyyy")
          : "Formateando..."}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[210px] relative"
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
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            openSearchModal={() => {}}
            id={proveedor?.id}
            top={
              ref?.current?.getBoundingClientRect().top! +
              window.scrollY +
              ref?.current?.getBoundingClientRect().height! -
              15
            }
            right={
              ref?.current?.getBoundingClientRect().left! +
              window.scrollX -
              1060
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
        permissions.find()?.crear.proveedor) && (
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
        permissions.find()?.editar.proveedor) && (
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.proveedor) && (
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
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.crear.proveedor
      ? "ADD"
      : "SEARCH"
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
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const [isReport, setIsReport] = useState(false);

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
      ProviderService.getAll(page, 8).then((data) => {
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
        if (param === "NOMBRE") {
          ProviderService.getByExactNombre(input, page, 8).then((data) => {
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
            setIsOperationCompleted(false);
          });
        } else if (param === "DOCUMENTO") {
          ProviderService.getByExactDocumento(input, page, 8).then((data) => {
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
            setIsOperationCompleted(false);
          });
        }
      } else {
        if (param === "NOMBRE") {
          ProviderService.getByNombre(input, page, 8).then((data) => {
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
            setIsOperationCompleted(false);
          });
        } else if (param === "DOCUMENTO") {
          ProviderService.getByDocumento(input, page, 8).then((data) => {
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
            setIsOperationCompleted(false);
          });
        }
      }
    }
  }, [isOperationCompleted, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Proveedores
            </span>
          </div>
          <div className="flex gap-2">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
                openSearchModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <button
                onClick={openAddModal}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Añadir proveedor
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
                  Buscar proveedor
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
        {providers.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
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
                    Registrado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => {
                  return (
                    <DataRow
                      action={""}
                      proveedor={provider}
                      setOperationAsCompleted={setAsCompleted}
                      key={provider.id}
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
