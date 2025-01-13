import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Selected,
  HistoricoInventario,
  Producto,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useHistoricoSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import HistoricoService from "../../services/historico-service";
import session from "../../utils/session";
import ProductService from "../../services/producto-service";
import SelectWithSearch from "../misc/select-with-search";
import { format } from "date-fns";
import { createRowNumber } from "../../utils/functions";
import clsx from "clsx";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Selected>({
    value: -1,
    label: "Seleccionar producto",
  });
  const [selectedMotivo, setSelectedMotivo] = useState<Selected>({
    label: "Recuento",
    value: "Recuento",
  });
  const [formData, setFormData] = useState<HistoricoInventario>({
    tipoCambio: "Ajuste",
    motivo: "Recuento",
    existenciasAnterior: 0,
    existenciasNuevo: 0,
    producto_id: -1,
    usuario_id: session.find()?.usuario.id,
    usuarioNombre: `${session.find()?.usuario.nombre} ${
      session.find()?.usuario.apellido
    }, ${session.find()?.usuario.documento}`,
  });
  const [retirarCantidad, setRetirarCantidad] = useState(0);

  const resetFormData = () => {
    setFormData({
      tipoCambio: "Ajuste",
      motivo: "Recuento",
      existenciasAnterior: 0,
      existenciasNuevo: 0,
      usuario_id: session.find()?.usuario.id,
    });
    setSelectedProducto({
      label: "Seleccionar producto",
      value: -1,
    });
    setSelectedMotivo({
      label: "Recuento",
      value: "Recuento",
    });
  };

  const handleProductoChange = (value: any, label: any) => {
    setSelectedProducto({ value, label });
    const productoSeleccionado = productos.find((p) => p.id === Number(value));
    if (productoSeleccionado) {
      setFormData({
        ...formData,
        producto_id: Number(value),
        existenciasAnterior: productoSeleccionado.existencias,
        productoNombre: productoSeleccionado.nombre,
      });
    }
  };

  useEffect(() => {
    if (productos.length === 0) {
      ProductService.getAll(1, 100000000).then((data) => {
        if (data) {
          setProductos(data.rows);
        }
      });
    }
  }, []);

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
      onClick={(e: any) => {
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
        <h1 className="text-xl font-bold text-white">Ajustar inventario</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Ajustando inventario...");
          void HistoricoService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("El ajuste no pudo ser realizado.");
            } else {
              toast.success("El ajuste fue realizado con exito.");
            }
          });
        }}
      >
        <div className="relative">
          <label className="block text-gray-600 text-base font-medium mb-2">
            Motivo<span className="text-red-600 text-lg">*</span>
          </label>
          <Select
            onChange={() => {
              setFormData({
                ...formData,
                motivo: selectedMotivo.value as string,
              });
            }}
            options={[
              {
                value: "Recuento",
                label: "Recuento",
                onClick: (value, label) => {
                  setSelectedMotivo({
                    value,
                    label,
                  });
                },
              },
              {
                value: "Perdida",
                label: "Perdida",
                onClick: (value, label) => {
                  setSelectedMotivo({
                    value,
                    label,
                  });
                },
              },
              {
                value: "Robo",
                label: "Robo",
                onClick: (value, label) => {
                  setSelectedMotivo({
                    value,
                    label,
                  });
                },
              },
              {
                value: "Daño",
                label: "Daño",
                onClick: (value, label) => {
                  setSelectedMotivo({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedMotivo}
          />
        </div>
        <div className="relative">
          <label className="block text-gray-600 text-base font-medium mb-2">
            Producto<span className="text-red-600 text-lg">*</span>
          </label>
          <SelectWithSearch
            options={productos.map((producto) => ({
              value: producto.id,
              label: `${producto.nombre}, ${producto.código}`,
              onClick: handleProductoChange,
            }))}
            onChange={() => {
              setFormData({
                ...formData,
                producto_id: Number(selectedProducto.value),
                existenciasNuevo: 0,
              });
              setRetirarCantidad(0);
            }}
            selected={selectedProducto}
          />
        </div>
        <div className="flex gap-4">
          <div className="w-2/4">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Existencias actuales
            </label>
            <input
              type="number"
              value={formData.existenciasAnterior}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
              readOnly
            />
          </div>
          <div className="w-2/4">
            {selectedMotivo.value === "Recuento" ? (
              <>
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Existencias contadas
                  <span className="text-red-600 text-lg">*</span>
                </label>
                <input
                  type="number"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      existenciasNuevo: parseInt(e.target.value),
                    });
                  }}
                  value={formData.existenciasNuevo ?? ""}
                  className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  required
                  min={0}
                  max={10000000000}
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  10 dígitos máximo
                </span>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-gray-600 text-base font-medium mb-2">
                    Retirar existencias
                    <span className="text-red-600 text-lg">*</span>
                  </label>
                  <input
                    type="number"
                    onChange={(e) => {
                      const cantidad = parseInt(e.target.value);

                      setRetirarCantidad(cantidad);

                      const existenciasFinales =
                        (formData.existenciasAnterior || 0) - cantidad;

                      setFormData({
                        ...formData,
                        existenciasNuevo: existenciasFinales,
                      });
                    }}
                    value={retirarCantidad ?? ""}
                    className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
                    required
                    min={1}
                    max={formData.existenciasAnterior}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-base font-medium mb-2">
                    Existencias finales
                  </label>
                  <input
                    type="number"
                    value={formData.existenciasNuevo ?? ""}
                    className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
                    readOnly
                  />
                </div>
              </>
            )}
          </div>
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

function HistoricoModal({ isOpen, closeModal, historico }: ModalProps) {
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
      closeModal();
      ref.current?.close();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (!dialogDimensions) return;
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
        <h1 className="text-xl font-bold text-white">Datos del registro</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Tipo de cambio */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Tipo de Cambio
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.tipoCambio || "No especificado"}
              </p>
            </div>
            {/* Motivo */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Motivo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.motivo || "No especificado"}
              </p>
            </div>
            {/* Comentarios */}
            {/* Existencias Anteriores */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Existencias antes
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.existenciasAnterior ?? "No especificado"}
              </p>
            </div>
            {/* Existencias Nuevas */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Existencias después
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.existenciasNuevo ?? "No especificado"}
              </p>
            </div>
            {/* Usuario */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Usuario
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.usuario
                  ? `${historico?.usuario?.nombre} ${historico?.usuario?.apellido}, ${historico?.usuario?.documento}`
                  : historico?.usuarioNombre}
              </p>
            </div>
            {/* Producto */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Producto
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.producto
                  ? historico.producto.nombre
                  : historico?.productoNombre}
              </p>
            </div>
            {/* Fecha del cambio */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Fecha de Cambio
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {historico?.fechaCambio
                  ? format(
                      new Date(historico?.fechaCambio),
                      "dd/MM/yyyy hh:mm a"
                    )
                  : "No especificada"}
              </p>
            </div>
          </div>
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

function DataRow({ historico, row_number }: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const closeViewModal = () => {
    setIsViewOpen(false);
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
        {historico?.tipoCambio}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[300px]">
        {historico?.motivo}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[300px]">
        {historico?.existenciasAnterior}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[300px]">
        {historico?.existenciasNuevo}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate">{`${historico?.producto?.nombre}`}</td>
      {/*
         <td className="px-6 py-4 border border-slate-300 truncate">{`${historico?.usuario?.nombre} ${historico?.usuario?.apellido}, ${historico?.usuario?.documento}`}</td>
        */}
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {format(new Date(historico?.fechaCambio!), "dd/MM/yyyy hh:mm a")}
      </td>
      <td className="px-6 py-3 border border-slate-300 w-[200px] truncate relative">
        <button
          onClick={() => {
            setIsViewOpen(true);
          }}
          className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
        >
          Mostrar registro
        </button>
        <HistoricoModal
          historico={historico}
          isOpen={isViewOpen}
          closeModal={closeViewModal}
          setOperationAsCompleted={() => null}
        />
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
            Ajustar inventario
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
          Buscar registro
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
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const tempInput = useHistoricoSearchParamStore((state) => state.tempInput);
  const secondTempInput = useHistoricoSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useHistoricoSearchParamStore((state) => state.setInput);
  const setTempInput = useHistoricoSearchParamStore(
    (state) => state.setTempInput
  );
  const setSecondInput = useHistoricoSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useHistoricoSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useHistoricoSearchParamStore((state) => state.setParam);
  const setSecondParam = useHistoricoSearchParamStore(
    (state) => state.setSecondParam
  );
  const incrementSearchCount = useHistoricoSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useHistoricoSearchParamStore(
    (state) => state.setJustSearched
  );

  const resetSearch = () => {
    setTempInput("");
    setSecondTempInput("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
    });
    setSelectedFecha({
      value: "",
      label: "Seleccionar tipo de busqueda",
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
        <h1 className="text-xl font-bold text-white">Buscar registro</h1>
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
                value: "FECHA",
                label: "Fecha",
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
        {selectedSearchType.value === "FECHA" ? (
          <div className="relative">
            <Select
              onChange={() => {
                if (isOpen) {
                  setSecondParam(selectedFecha.value as string);
                }
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
        {selectedFecha.value === "ENTRE" ? (
          <>
            {" "}
            <input
              type="date"
              placeholder="Fecha inicial"
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
            <input
              type="date"
              placeholder="Fecha final"
              value={secondTempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                if (isOpen) {
                  setSecondInput(e.target.value);
                }
                setSecondTempInput(e.target.value);
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
                (selectedFecha.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "FECHA"),
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

/*
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
    </ul>
  );
}
*/

export default function HistoricoDataDisplay() {
  const [historico, setHistorico] = useState<HistoricoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.producto ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useHistoricoSearchParamStore(
    (state) => state.searchCount
  );
  const resetSearchCount = useHistoricoSearchParamStore(
    (state) => state.resetSearchCount
  );
  const param = useHistoricoSearchParamStore((state) => state.param);
  const secondParam = useHistoricoSearchParamStore(
    (state) => state.secondParam
  );
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const input = useHistoricoSearchParamStore((state) => state.input);
  const secondInput = useHistoricoSearchParamStore(
    (state) => state.secondInput
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useHistoricoSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useHistoricoSearchParamStore(
    (state) => state.justSearched
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
    if (searchCount === 0) {
      HistoricoService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setHistorico([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setHistorico(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          resetSearchCount();
          setWasSearch(false);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (param === "FECHA" && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        if (secondParam === "HOY") {
          HistoricoService.getToday(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "RECIENTEMENTE") {
          HistoricoService.getRecent(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTA_SEMANA") {
          HistoricoService.getThisWeek(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_MES") {
          HistoricoService.getThisMonth(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_AÑO") {
          HistoricoService.getThisYear(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ENTRE") {
          HistoricoService.getBetween(
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            size
          ).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setHistorico([]);
            } else {
              setHistorico(data.rows);
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
            <span className="text-[#2096ed]">Historico de inventario</span>
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
                    Buscar registro
                  </button>
                )}
              </>
            ) : null}
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
                  Ajustar inventario
                </button>
              </>
            ) : null}
            {permissions.find()?.editar.producto ? (
              <button
                id="acciones-btn"
                onClick={() => {
                  setIsDropup(!isDropup);
                }}
                className="bg-gray-300 border hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                <More className="w-5 h-5 inline fill-black" />
              </button>
            ) : null}
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {historico.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Tipo de cambio
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Motivo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Antes
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Después
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {historico.map((historico, index) => {
                  return (
                    <DataRow
                      action={""}
                      historico={historico}
                      setOperationAsCompleted={setAsCompleted}
                      key={historico.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (historico.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún registro encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay nada registrado en el historico."
                  : "Esto puede deberse a un error del servidor, o a que ningún registro concuerda con tu busqueda"}
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
      {historico.length > 0 && loading == false && (
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
    </>
  );
}
