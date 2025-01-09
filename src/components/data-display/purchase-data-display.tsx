import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  SectionProps,
  Compra,
  EmbeddedDataRowProps,
  EmbeddedTableProps,
  Producto,
  Selected,
  Proveedor,
  DetalleCompra,
  Impuesto,
  impuestoCalculado,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import ProductService from "../../services/producto-service";
import Provider from "../../services/provider-service";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import PurchaseService from "../../services/purchases-service";
import permissions from "../../utils/permissions";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import { usePurchaseSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import ProviderService from "../../services/provider-service";
import ExportCSV from "../misc/export-to-cvs";
import clsx from "clsx";
import ImpuestoService from "../../services/impuesto-service";
import { useConfirmationScreenStore } from "../../store/confirmationStore";
import { createRowNumber } from "../../utils/functions";

function AddSection({ close, setOperationAsCompleted, action }: SectionProps) {
  const isConfirmationScreen = useConfirmationScreenStore(
    (state) => state.isConfirmationScreen
  );
  const setIsConfirmationScreen = useConfirmationScreenStore(
    (state) => state.setIsConfirmationScreen
  );
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>();
  const [impuestosCompra, setImpuestosCompra] = useState<Impuesto[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Selected>({
    value: -1,
    label: "Seleccionar proveedor",
  });
  const [selectedTipo, setSelectedTipo] = useState<Selected>({
    value: "CONTADO",
    label: "Contado",
  });
  const [selectedMoneda, setSelectedMselectedMoneda] = useState<Selected>({
    value: "BOLIVAR",
    label: "Bolívar",
  });
  const [formData, setFormData] = useState<Compra>({
    subtotal: 0,
    total: 0,
    proveedor_id: -1,
    numeroFactura: "",
    detalles: [],
    tipoMoneda: "BOLIVAR",
    tipoPago: "CONTADO",
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [impuestosCalculados, setImpuestosCalculados] = useState<
    { impuesto: Impuesto; total: number }[]
  >([]);
  const size = 8;

  const resetFormData = () => {
    setFormData({
      subtotal: 0,
      total: 0,
      proveedor_id: -1,
      detalles: [],
      numeroFactura: "",
      tipoMoneda: "BOLIVAR",
      tipoPago: "CONTADO",
    });
    setSelectedProvider({
      value: -1,
      label: "Seleccionar proveedor",
    });
    setSelectedTipo({
      value: "CONTADO",
      label: "Contado",
    });
    setSelectedMselectedMoneda({
      value: "BOLIVAR",
      label: "Bolívar",
    });
    setIsConfirmationScreen(false);
    setImpuestosCalculados([]);
  };

  const searchProducts = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm === "") {
        ProductService.getAll(page, size).then((data) => {
          if (data === false) {
            setProductos([]);
          } else {
            setProductos(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
          }
        });
      }
      const data = await ProductService.getByCódigo(searchTerm, page, size);
      if (data === false) {
        const otherData = await ProductService.getByNombre(
          searchTerm,
          page,
          size
        );
        if (otherData === false) {
          setProductos([]);
        } else {
          setPages(otherData.pages);
          setCurrent(otherData.current);
          setProductos(otherData.rows);
        }
      } else {
        setPages(data.pages);
        setCurrent(data.current);
        setProductos(data.rows);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    setPage(1);
    searchProducts(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (providers.length === 0) {
      setLoading(true);
      Provider.getAll(1, 10000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setProviders(data.rows);
          setLoading(false);
        }
      });
    }

    if (impuestosCompra.length === 0) {
      ImpuestoService.getAll(1, 10000).then((data) => {
        if (data) {
          setImpuestosCompra(
            data.rows.filter((impuesto) => impuesto.aplicaA === "VENTA")
          );
        }
      });
    }
  }, []);

  const calculateProductTaxes = (detalles: DetalleCompra[]) => {
    const impuestosMap = new Map<
      number,
      { impuesto: Impuesto; total: number }
    >();

    detalles.forEach((detalle) => {
      detalle.producto?.impuestos?.forEach((impuesto) => {
        if (!impuesto.id) return; // Asegurarse de que el impuesto tenga un ID

        const subtotal = detalle.subtotal;
        const impuestoTotal = subtotal * (impuesto.porcentaje / 100);

        if (impuestosMap.has(impuesto.id)) {
          impuestosMap.get(impuesto.id)!.total += impuestoTotal;
        } else {
          impuestosMap.set(impuesto.id, { impuesto, total: impuestoTotal });
        }
      });
    });

    return Array.from(impuestosMap.values());
  };

  const calculateSaleTaxes = (venta: Compra, impuestosVenta: Impuesto[]) => {
    const impuestosMap = new Map<
      number,
      { impuesto: Impuesto; total: number }
    >();

    impuestosVenta.forEach((impuesto) => {
      const { tipoMoneda, tipoPago, subtotal } = venta;

      const aplicaMoneda =
        impuesto.tipoMoneda === null || impuesto.tipoMoneda === tipoMoneda;
      const aplicaPago =
        impuesto.condicionPago === null || impuesto.condicionPago === tipoPago;

      if (aplicaMoneda && aplicaPago && impuesto.id) {
        const impuestoTotal = subtotal * (impuesto.porcentaje / 100);

        if (impuestosMap.has(impuesto.id)) {
          impuestosMap.get(impuesto.id)!.total += impuestoTotal;
        } else {
          impuestosMap.set(impuesto.id, { impuesto, total: impuestoTotal });
        }
      }
    });

    return Array.from(impuestosMap.values());
  };

  useEffect(() => {
    const productTaxes = calculateProductTaxes(formData.detalles || []);
    const saleTaxes = calculateSaleTaxes(formData, impuestosCompra);

    // Combinar ambos impuestos asegurando que no haya duplicados
    const combinedTaxesMap = new Map<
      number,
      { impuesto: Impuesto; total: number }
    >();

    productTaxes.forEach(({ impuesto, total }) => {
      if (combinedTaxesMap.has(impuesto.id!)) {
        combinedTaxesMap.get(impuesto.id!)!.total += total;
      } else {
        combinedTaxesMap.set(impuesto.id!, { impuesto, total });
      }
    });

    saleTaxes.forEach(({ impuesto, total }) => {
      if (combinedTaxesMap.has(impuesto.id!)) {
        combinedTaxesMap.get(impuesto.id!)!.total += total;
      } else {
        combinedTaxesMap.set(impuesto.id!, { impuesto, total });
      }
    });

    const impuestosArray = Array.from(combinedTaxesMap.values());

    const impuestosTotal = impuestosArray.reduce(
      (acc, { total }) => acc + total,
      0
    );

    setImpuestosCalculados(impuestosArray);

    setFormData((prevFormData) => ({
      ...prevFormData,
      total: prevFormData.subtotal + impuestosTotal,
    }));
  }, [
    formData.detalles,
    formData.tipoPago,
    formData.tipoMoneda,
    impuestosCompra,
    formData.subtotal,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = async () => {
    close();
    setIsConfirmationScreen(false);

    let updatedFormData = {
      ...formData,
      detalles: formData?.detalles
        ?.filter((detalle) => detalle.cantidad > 0)
        .map((detalle) => ({
          ...detalle,
          producto: undefined, // Omite la propiedad o ponle un valor nulo
        })),
    };

    const loadingToast = toast.loading("Añadiendo compra...");
    PurchaseService.create(updatedFormData, impuestosCalculados).then(
      (data) => {
        toast.dismiss(loadingToast);
        setOperationAsCompleted();
        resetFormData();
        if (data === false) {
          toast.error("La compra no pudo ser añadida.");
        } else {
          toast.success("La compra fue añadida con exito.");
        }
      }
    );
  };

  return (
    <>
      <form
        className="flex flex-col gap-5 h-fit max-w-5xl group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 min-[444px]:flex-row">
            <div className="relative w-1/3 min-w-52">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Proveedor<span className="text-red-600 text-lg">*</span>
              </label>
              {providers.length > 0 && (
                <SelectWithSearch
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: `${provider.nombre}, ${provider.documento}`,
                    onClick: (value, label) => {
                      setSelectedProvider({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedProvider}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      proveedor_id: Number(selectedProvider.value),
                    });
                  }}
                />
              )}
              {providers.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar proveedor</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
                </>
              )}
              {providers.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando proveedores...</option>
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
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Condición de pago<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex w-full gap-1 min-w-40">
                <div className="relative">
                  <Select
                    options={[
                      {
                        value: "CONTADO",
                        label: "Contado",
                        onClick: (value, label) => {
                          setSelectedTipo({
                            value,
                            label,
                          });
                        },
                      },
                      {
                        value: "CREDITO",
                        label: "Credito",
                        onClick: (value, label) => {
                          setSelectedTipo({
                            value,
                            label,
                          });
                        },
                      },
                    ]}
                    selected={selectedTipo}
                    small={true}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        tipoPago: selectedTipo.value as any,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 min-[444px]:flex-row">
            <div>
              <label className="block text-gray-600 text-base font-medium mb-2">
                Moneda de pago<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex w-full gap-1 min-w-52">
                <div className="relative">
                  <Select
                    options={[
                      {
                        value: "BOLIVAR",
                        label: "Bolívar",
                        onClick: (value, label) => {
                          setSelectedMselectedMoneda({
                            value,
                            label,
                          });
                        },
                      },
                      {
                        value: "DIVISA",
                        label: "Divisa",
                        onClick: (value, label) => {
                          setSelectedMselectedMoneda({
                            value,
                            label,
                          });
                        },
                      },
                    ]}
                    selected={selectedMoneda}
                    small={true}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        tipoMoneda: selectedMoneda.value as any,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-1/5 min-w-40">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Fecha de compra<span className="text-red-600 text-lg">*</span>
              </label>
              <input
                type="datetime-local"
                placeholder="Introducir fecha de vencimiento"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    emisionFactura: e.target.value as any,
                  });
                }}
                value={formData.emisionFactura as any}
                required
                className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-full"
              />
            </div>
          </div>
          <div className="w-1/4 min-w-52">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Número de factura
            </label>
            <input
              type="text"
              placeholder="Introducir número de factura"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  numeroFactura: e.target.value,
                });
              }}
              value={formData.numeroFactura}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Formato debe ser 0,00 o 0.00
            </span>
          </div>
        </div>
        <div className="mt-2 row-start-2">
          <h3 className="text-lg font-medium">Resumen</h3>
          <div className="flex items-start mt-2 gap-8">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Subtotal:</span>
              <span className="text-base">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(formData.subtotal)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Impuestos:</span>
              <span className="text-base">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  impuestosCalculados.reduce(
                    (acc, impuesto) => acc + impuesto.total,
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Total:</span>
              <span className="text-base font-bold">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(formData.total)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 row-start-3 w-full">
          <div>
            <h2 className="text-xl font-medium">
              Lista de productos seleccionados
            </h2>
            <hr className="my-4 w-[61%] border-[#2096ed]" />
          </div>
          <EmbeddedDetailsTable
            onChange={(detalles) => {
              let subtotal = 0;
              if (detalles) {
                detalles.forEach((detalle) => {
                  subtotal += detalle.subtotal;
                });
              }

              setFormData((prevFormData) => ({
                ...prevFormData,
                subtotal: subtotal,
                detalles: detalles,
                // El total se recalculará en el useEffect que combina los impuestos
              }));
            }}
            setPages={(pages) => {
              setPages(pages);
            }}
            setCurrent={(current) => {
              setCurrent(current);
            }}
            page={page}
            action={action}
            products={formData?.productos}
            detalles_compra={formData?.detalles?.filter(
              (detalle) => detalle.cantidad > 0
            )}
          />
        </div>
        {impuestosCalculados.length > 0 &&
          impuestosCalculados?.some((impuesto) => impuesto.total > 0) && (
            <div className="flex flex-col gap-3 row-start-4 w-full">
              <h2 className="text-xl font-medium">Impuestos aplicados</h2>
              <hr className="my-4 w-[61%] border-[#2096ed]" />

              <div className="relative overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm font-medium text-slate-600 text-left">
                  <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                    <tr className="border-2 border-[#2096ed]">
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Código
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Nombre
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Porcentaje
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Monto Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {impuestosCalculados
                      .filter((impuesto) => impuesto.total > 0)
                      .map(({ impuesto, total }) => (
                        <tr key={impuesto.id} className="font-semibold">
                          <td className="px-6 py-3 border border-slate-300">
                            {impuesto.codigo}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {impuesto.nombre}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {impuesto.porcentaje}%
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {new Intl.NumberFormat("es-VE", {
                              style: "currency",
                              currency: "USD",
                            }).format(total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        <div className="flex flex-col gap-3 row-start-5 w-full relative">
          <div>
            <h2 className="text-xl font-medium">
              Lista de productos a seleccionar
            </h2>
            <hr className="my-4 w-[61%] border-[#2096ed]" />
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar producto por código o nombre..."
              className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-[61%] group/parent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              name="search"
            />
          </div>
          <EmbeddedTable
            onChange={(detalles) => {
              let subtotal = 0;
              if (detalles) {
                detalles.forEach((detalle) => {
                  subtotal += detalle.subtotal;
                });
              }

              setFormData((prevFormData) => ({
                ...prevFormData,
                subtotal: subtotal,
                detalles: detalles,
                // El total se recalculará en el useEffect que combina los impuestos
              }));
            }}
            setPages={(pages) => {
              setPages(pages);
            }}
            setCurrent={(current) => {
              setCurrent(current);
            }}
            page={page}
            action={action}
            products={productos}
            searchTerm={searchTerm}
            detalles_compra={formData?.detalles}
          />
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center pb-5">
            <div className="justify-self-start">
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
                className="flex items-center gap-4"
                customText="Mostrando página de productos"
              />
            </div>
            <div className="flex gap-2 justify-end bottom-5">
              <button
                type="button"
                onClick={() => {
                  close();
                }}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cancelar
              </button>
              <button
                className={clsx({
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    selectedProvider.label?.startsWith("Seleccionar") ||
                    formData.subtotal <= 0 ||
                    formData.total <= 0,
                  ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    true,
                })}
              >
                Completar
              </button>
            </div>
          </div>
        </div>
      </form>
      <ConfirmationModal
        isOpen={isConfirmationScreen}
        closeModal={() => setIsConfirmationScreen(false)}
        handleFinalSubmit={handleFinalSubmit}
        setOperationAsCompleted={() => null}
        impuestosCalculados={impuestosCalculados}
        compra={formData}
        proveedorNombre={selectedProvider.label ?? ""}
      />
    </>
  );
}

function ConfirmationModal({
  isOpen,
  closeModal,
  handleFinalSubmit,
  impuestosCalculados,
  compra,
  proveedorNombre,
}: ModalProps & {
  handleFinalSubmit: () => void;
  impuestosCalculados: impuestoCalculado[];
  proveedorNombre: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

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
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Confirmar compra</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Proveedor
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {proveedorNombre}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Moneda de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(compra?.tipoMoneda!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Condición de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(compra?.tipoPago!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Fecha de compra
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {format(
                  new Date(compra?.emisionFactura ?? 0),
                  "dd/MM/yyyy hh:mm a"
                )}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Número de factura
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {compra?.numeroFactura || "No especificado"}
              </p>
            </div>

            {/* Impuestos */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Impuestos
              </p>
              <div className="text-gray-900 font-medium text-base break-words">
                {impuestosCalculados.length > 0 &&
                impuestosCalculados.some(({ total }) => total > 0) ? (
                  <ul className="list-disc list-inside">
                    {impuestosCalculados
                      .filter(({ total }) => total > 0)
                      .map(({ impuesto, total }) => (
                        <li key={impuesto.id}>
                          {impuesto.codigo} ({impuesto.porcentaje}%):{" "}
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: "USD",
                          }).format(total)}
                        </li>
                      ))}
                  </ul>
                ) : (
                  "No se aplicaron impuestos."
                )}
              </div>
            </div>

            {/* Total */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Total
              </p>
              <p className="text-gray-900 font-bold text-base break-words">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(compra?.total!)}
              </p>
            </div>

            {/* Subtotal */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Subtotal
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(compra?.subtotal!)}
              </p>
            </div>

            {/* Lista de Productos */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Productos
              </p>
              <div className="text-gray-900 font-medium text-base break-words overflow-x-auto">
                <table className="w-full text-sm font-medium text-slate-600 text-left">
                  <thead className="text-xs bg-[#2096ed] uppercase text-white">
                    <tr>
                      <th className="px-6 py-3 border border-slate-300">
                        Código
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Nombre
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Precio de compra
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compra!.detalles
                      ?.filter((detalle) => detalle.subtotal > 0)
                      .map((detalle) => (
                        <tr key={detalle.producto_id}>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.producto_codigo}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.producto_nombre}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {new Intl.NumberFormat("es-VE", {
                              style: "currency",
                              currency: "USD",
                            }).format(detalle.precioUnitario)}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.cantidad}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {new Intl.NumberFormat("es-VE", {
                              style: "currency",
                              currency: "USD",
                            }).format(detalle.subtotal)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
    </dialog>
  );
}

function DataRow({
  compra,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.eliminar.compra && !compra?.anulada ? "DELETE" : "VIEW"
  );
  const ref = useRef<HTMLTableCellElement>(null);
  const [isDropup, setIsDropup] = useState(false);
  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
  };

  const formatter = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  });

  return (
    <tr className="font-semibold">
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
      >
        {row_number}
      </th>
      <td className="px-6 py-4 border border-slate-300 min-w-[60px] truncate">
        {format(new Date(compra?.emisionFactura ?? 0), "dd/MM/yyyy hh:mm a")}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {compra?.historico_compra?.proveedor_nombre},{" "}
        {compra?.historico_compra?.proveedor_documento}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {formatter.format(compra?.subtotal || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {formatter.format(compra?.total || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {!compra?.anulada ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Concretada
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg capitalize">
            Anulada
          </div>
        )}
      </td>
      <td
        ref={ref}
        className="px-6 py-2 border border-slate-300 min-w-[190px] w-[190px] relative"
      >
        {action === "DELETE" && !compra?.anulada && (
          <>
            <button
              onClick={() => {
                setIsDeleteOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Anular compra
            </button>
            <DeleteModal
              compra={compra}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {(action === "VIEW" || compra?.anulada) && (
          <>
            <button
              onClick={() => {
                setIsViewOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar compra
            </button>
            <ViewModal
              compra={compra}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
            />
          </>
        )}
        {isDropup && !compra?.anulada && (
          <IndividualDropup
            anulada={compra?.anulada ?? false}
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            id={compra?.id}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              30
            }
          />
        )}
        {!compra?.anulada && (
          <button
            id={`acciones-btn-${compra?.id}`}
            className="bg-gray-300 border right-4 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            onClick={() => setIsDropup(!isDropup)}
          >
            <More className="w-5 h-5 inline fill-black" />
          </button>
        )}
      </td>
    </tr>
  );
}

function ViewModal({ isOpen, closeModal, compra }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos de la compra</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Proveedor
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {compra?.historico_compra?.proveedor_nombre},{" "}
                {compra?.historico_compra?.proveedor_documento}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Moneda de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(compra?.tipoMoneda!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Condición de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(compra?.tipoPago!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Fecha de compra
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {format(
                  new Date(compra?.emisionFactura ?? 0),
                  "dd/MM/yyyy hh:mm a"
                )}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Número de factura
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {compra?.numeroFactura || "No especificado"}
              </p>
            </div>

            {/* Impuestos */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Impuestos
              </p>
              <div className="text-gray-900 font-medium text-base break-words">
                {compra?.historico_compra?.impuestos &&
                compra.historico_compra.impuestos.length > 0 &&
                compra?.historico_compra?.impuestos?.some(
                  ({ total }) => total > 0
                ) ? (
                  <ul className="list-disc list-inside">
                    {compra?.historico_compra?.impuestos
                      .filter(({ total }) => total > 0)
                      .map(({ impuesto, total }) => (
                        <li key={impuesto.id}>
                          {impuesto.codigo} ({impuesto.porcentaje}%):{" "}
                          {new Intl.NumberFormat("es-VE", {
                            style: "currency",
                            currency: "USD",
                          }).format(total)}
                        </li>
                      ))}
                  </ul>
                ) : (
                  "No se aplicaron impuestos."
                )}
              </div>
            </div>

            {/* Total */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Total
              </p>
              <p className="text-gray-900 font-bold text-base break-words">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(compra?.total!)}
              </p>
            </div>

            {/* Subtotal */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Subtotal
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {new Intl.NumberFormat("es-VE", {
                  style: "currency",
                  currency: "USD",
                }).format(compra?.subtotal!)}
              </p>
            </div>

            {/* Lista de Productos */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Productos
              </p>
              <div className="text-gray-900 font-medium text-base break-words overflow-x-auto">
                <table className="w-full text-sm font-medium text-slate-600 text-left">
                  <thead className="text-xs bg-[#2096ed] uppercase text-white">
                    <tr>
                      <th className="px-6 py-3 border border-slate-300">
                        Código
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Nombre
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Precio de compra
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 border border-slate-300">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compra!.detalles
                      ?.filter((detalle) => detalle.subtotal > 0)
                      .map((detalle) => (
                        <tr key={detalle.producto_id}>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.producto_codigo}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.producto_nombre}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {new Intl.NumberFormat("es-VE", {
                              style: "currency",
                              currency: "USD",
                            }).format(detalle.precioUnitario)}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {detalle.cantidad}
                          </td>
                          <td className="px-6 py-3 border border-slate-300">
                            {new Intl.NumberFormat("es-VE", {
                              style: "currency",
                              currency: "USD",
                            }).format(detalle.subtotal)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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

function EmbeddedDataRow({
  producto,
  detalle_compra,
  action,
  onChange,
  row_number,
}: EmbeddedDataRowProps) {
  const precio = producto?.precioCompra!;
  const [detalle, setDetalle] = useState<DetalleCompra>(
    detalle_compra
      ? { ...detalle_compra, subtotal: Number(detalle_compra.subtotal) }
      : {
          cantidad: 0,
          subtotal: 0,
          precioUnitario: precio,
          producto_id: producto?.id,
          producto: producto,
          producto_codigo: producto?.código!,
          producto_nombre: producto?.nombre!,
          impuestos: [],
        }
  );

  useEffect(() => {
    if (
      typeof detalle_compra === "undefined" ||
      !isEqual(detalle_compra, detalle)
    )
      onChange({
        ...detalle,
        impuestos:
          producto?.impuestos?.map((imp) => ({
            codigo: imp.codigo!,
            nombre: imp.nombre,
            porcentaje: imp.porcentaje,
            monto: detalle.subtotal * (imp.porcentaje / 100),
          })) || [],
      });
  }, [detalle]);

  const formatter = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  });

  return (
    <tr className="font-semibold">
      <th
        scope="row"
        className="font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 text-center"
      >
        {row_number}
      </th>
      <td className="px-6 py-2 border border-slate-300 truncate">
        {producto?.código}
      </td>
      <td className="px-6 py-2 border border-slate-300 truncate">
        {producto?.nombre}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {formatter.format(producto?.precioCompra || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {detalle_compra?.cantidad || 0}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {producto?.exento
          ? "Exento"
          : !producto?.impuestos || producto.impuestos.length === 0
          ? "Ninguno"
          : producto.impuestos.map((impuesto) => impuesto.codigo).join(", ")}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {action === "ADD" ? (
          <button
            type="button"
            onClick={() => {
              setDetalle({
                ...detalle,
                cantidad: (detalle_compra?.cantidad || 0) + 1,
                subtotal: precio * ((detalle_compra?.cantidad || 0) + 1),
              });
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Añadir
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if ((detalle_compra?.cantidad || 0) > 0) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_compra?.cantidad || 0) - 1,
                  subtotal: precio * ((detalle_compra?.cantidad || 0) - 1),
                });
              }
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Remover
          </button>
        )}
      </td>
    </tr>
  );
}

function EmbeddedTable({
  page,
  setPages,
  setCurrent,
  detalles_compra,
  onChange,
  products,
  searchTerm,
  action,
}: EmbeddedTableProps) {
  const [productos, setProductos] = useState<Producto[] | undefined>(products);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [detalles, setDetalles] = useState<DetalleCompra[]>(
    detalles_compra ? detalles_compra : []
  );
  const [thisPage, setThisPage] = useState(1);
  const size = 8;

  useEffect(() => {
    if (typeof products === "undefined" || searchTerm === "") {
      void ProductService.getAll(page!, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setProductos([]);
          setLoading(false);
        } else {
          setProductos(data.rows);
          setPages?.(data.pages);
          setCurrent?.(data.current);
          setThisPage(data.current);
          setLoading(false);
          setNotFound(false);
        }
      });
    } else if (products?.length === 0) {
      setProductos([]);
      setNotFound(true);
    } else {
      setProductos(products);
      setNotFound(false);
    }
  }, [page, products]);

  useEffect(() => {
    if (
      typeof detalles_compra === "undefined" ||
      !isEqual(detalles_compra, detalles)
    )
      onChange(detalles);
  }, [detalles]);

  useEffect(() => {
    if (!isEqual(detalles_compra?.sort(), detalles.sort())) {
      setDetalles(detalles_compra ? detalles_compra : []);
    }
  }, [detalles_compra]);

  const secondOnChange = (detalle: DetalleCompra) => {
    setDetalles((prevDetalles) => {
      const existingObjectIndex = prevDetalles.findIndex(
        (obj) => obj.producto_id === detalle.producto_id
      );

      if (existingObjectIndex >= 0) {
        return prevDetalles.map((item, index) =>
          index === existingObjectIndex ? detalle : item
        );
      } else {
        return [...prevDetalles, detalle];
      }
    });
  };

  return (
    <div>
      {typeof productos !== "undefined" &&
        productos?.length > 0 &&
        loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
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
                    Precio de compra
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Existencias
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Impuestos
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos?.map((product, index) => {
                  return (
                    <EmbeddedDataRow
                      producto={product}
                      key={product.id}
                      onChange={secondOnChange}
                      detalle_compra={detalles.find(
                        (detalle) => detalle.producto_id === product.id
                      )}
                      action={action}
                      row_number={createRowNumber(thisPage, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      {notFound === true && (
        <div className="grid w-fit h-4/5 self-center ml-40 mb-20">
          <div className="place-self-center flex flex-col items-center justify-center">
            <Face className="fill-[#2096ed] h-20 w-20" />
            <p className="font-bold text-xl text-center mt-1">
              Ningún producto encontrado
            </p>
          </div>
        </div>
      )}
      {loading === true && (
        <div className="grid w-fit h-4/5 ml-40 mb-20">
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
  );
}

function EmbeddedDetailsDataRow({
  producto,
  detalle_compra,
  action,
  onChange,
  row_number,
}: EmbeddedDataRowProps) {
  const precio = producto?.precioCompra!;
  const [detalle, setDetalle] = useState<DetalleCompra>(
    detalle_compra
      ? { ...detalle_compra, subtotal: Number(detalle_compra.subtotal) }
      : {
          cantidad: 0,
          subtotal: 0,
          precioUnitario: precio,
          producto_id: producto?.id,
          producto: producto,
          producto_codigo: producto?.código!,
          producto_nombre: producto?.nombre!,
          impuestos: [],
        }
  );

  useEffect(() => {
    if (
      typeof detalle_compra === "undefined" ||
      !isEqual(detalle_compra, detalle)
    )
      onChange({
        ...detalle,
        impuestos:
          producto?.impuestos?.map((imp) => ({
            codigo: imp.codigo!,
            nombre: imp.nombre,
            porcentaje: imp.porcentaje,
            monto: detalle.subtotal * (imp.porcentaje / 100),
          })) || [],
      });
  }, [detalle]);

  const formatter = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  });

  return (
    <tr className="font-semibold">
      <th
        scope="row"
        className="font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 text-center"
      >
        {row_number}
      </th>
      <td className="px-6 py-2 border border-slate-300 truncate">
        {producto?.código}
      </td>
      <td className="px-6 py-2 border border-slate-300 truncate">
        {producto?.nombre}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {formatter.format(producto?.precioCompra || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {detalle_compra?.cantidad || 0}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {action === "ADD" ? (
          <button
            type="button"
            onClick={() => {
              setDetalle({
                ...detalle,
                cantidad: (detalle_compra?.cantidad || 0) + 1,
                subtotal: precio * ((detalle_compra?.cantidad || 0) + 1),
              });
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Añadir
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if ((detalle_compra?.cantidad || 0) > 0) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_compra?.cantidad || 0) - 1,
                  subtotal: precio * ((detalle_compra?.cantidad || 0) - 1),
                });
              }
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Remover
          </button>
        )}
      </td>
    </tr>
  );
}

function EmbeddedDetailsTable({
  onChange,
  action,
  detalles_compra,
  products,
}: EmbeddedTableProps) {
  const [detalles, setDetalles] = useState<DetalleCompra[]>(
    detalles_compra ? detalles_compra : []
  );

  useEffect(() => {
    if (
      typeof detalles_compra === "undefined" ||
      !isEqual(detalles_compra, detalles)
    )
      onChange(detalles);
  }, [detalles]);

  useEffect(() => {
    if (!isEqual(detalles_compra?.sort(), detalles.sort())) {
      setDetalles(detalles_compra ? detalles_compra : []);
    }
  }, [detalles_compra]);

  const secondOnChange = (detalle: DetalleCompra) => {
    setDetalles((prevDetalles) => {
      const existingObjectIndex = prevDetalles.findIndex(
        (obj) => obj.producto_id === detalle.producto_id
      );

      if (existingObjectIndex >= 0) {
        return prevDetalles.map((item, index) =>
          index === existingObjectIndex ? detalle : item
        );
      } else {
        return [...prevDetalles, detalle];
      }
    });
  };

  return (
    <div>
      {typeof detalles_compra !== "undefined" &&
        detalles_compra?.length > 0 && (
          <div className="relative overflow-x-auto scrollbar-thin">
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
                    Precio de compra
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
                {detalles_compra
                  ?.map((detail) => {
                    if (detail.producto) {
                      return detail;
                    } else {
                      return {
                        ...detail,
                        producto: products?.find(
                          (producto) => producto.id === detail.producto_id
                        ),
                      };
                    }
                  })
                  .map((detail, index) => {
                    return (
                      <EmbeddedDetailsDataRow
                        producto={detail?.producto}
                        key={detail?.producto?.id}
                        onChange={secondOnChange}
                        detalle_compra={detail}
                        action={action}
                        row_number={index + 1}
                      />
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  compra,
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
        <h1 className="text-xl font-bold text-white">Anular compra</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Anulando compra...");
          PurchaseService.delete(compra?.id!).then((data) => {
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

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedProvider, setSelectedProvider] = useState<Selected>({
    value: -1,
    label: "Seleccionar proveedor",
  });
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const tempInput = usePurchaseSearchParamStore((state) => state.tempInput);
  const secondTempInput = usePurchaseSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = usePurchaseSearchParamStore((state) => state.setInput);
  const setTempInput = usePurchaseSearchParamStore(
    (state) => state.setTempInput
  );
  const setSecondInput = usePurchaseSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = usePurchaseSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = usePurchaseSearchParamStore((state) => state.setParam);
  const setSecondParam = usePurchaseSearchParamStore(
    (state) => state.setSecondParam
  );
  const setSearchId = usePurchaseSearchParamStore((state) => state.setSearchId);
  const incrementSearchCount = usePurchaseSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

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
    setSelectedProvider({
      value: -1,
      label: "Seleccionar proveedor",
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

  useEffect(() => {
    if (selectedSearchType.value === "PROVEEDOR") {
      console.log("AQUI");
      if (providers.length === 0) {
        setLoading(true);
        ProviderService.getAll(1, 10000).then((data) => {
          if (data === false) {
            setLoading(false);
          } else {
            setProviders(data.rows);
            setLoading(false);
          }
        });
      }
    }
  }, [selectedSearchType]);

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
        <h1 className="text-xl font-bold text-white">Buscar compra</h1>
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
                value: "FECHA",
                label: "Fecha",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "PROVEEDOR",
                label: "Proveedor",
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
        {selectedSearchType.value === "PROVEEDOR" ? (
          <>
            <div className="relative">
              {providers.length > 0 && (
                <SelectWithSearch
                  options={providers.map((provider) => ({
                    value: provider.id,
                    label: `${provider.nombre}, ${provider.documento}`,
                    onClick: (value, label) => {
                      setSelectedProvider({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedProvider}
                  onChange={() => {
                    setSearchId(selectedProvider.value as number);
                  }}
                />
              )}
              {providers.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar proveedor</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
                </>
              )}
              {providers.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando proveedores...</option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
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
          </>
        ) : null}
        {selectedSearchType.value === "FECHA" &&
        selectedSearchType.value === "FECHA" ? (
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
        {selectedFecha.value === "ENTRE" ? (
          <>
            {" "}
            <input
              type="date"
              placeholder="Fecha inicial"
              value={tempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setInput(e.target.value);
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
                setSecondInput(e.target.value);
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
                  selectedSearchType?.value === "FECHA") ||
                (selectedProvider.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "PROVEEDOR"),
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

function ReportModal({ isOpen, closeModal }: ModalProps) {
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parámetro de reporte",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de reporte",
  });
  const [selectedProvider, setSelectedProvider] = useState<Selected>({
    value: -1,
    label: "Seleccionar proveedor",
  });
  const [inputDates, setInputDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [providers, setProviders] = useState<Proveedor[]>([]);
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
    setSelectedProvider({
      value: -1,
      label: "Seleccionar proveedor",
    });
    setInputDates({ start: "", end: "" });
    setProviders([]);
    setLoading(false);
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

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      const data = await ProviderService.getAll(1, 10000);
      if (data) {
        setProviders(data.rows);
      }
      setLoading(false);
    };

    if (selectedSearchType.value === "PROVEEDOR" && providers.length === 0) {
      fetchProviders();
    }
  }, [selectedSearchType, providers.length]);

  const mapComprasToCSV = (compras: any[]) =>
    compras.map((compra) => ({
      Fecha: format(new Date(compra.fecha), "dd/MM/yyyy hh:mm a"),
      Subtotal: compra.subtotal,
      Total: compra.total,
      "Nombre de proveedor": compra?.historico_compra?.proveedor_nombre,
      "Documento de proveedor":
        compra?.historico_compra?.proveedor_documento || "",
    }));

  const fetchAndDownloadReport = async (
    fetchFunction: () => Promise<any>,
    filename: string
  ) => {
    const loadingToast = toast.loading("Generando reporte...");
    const data = await fetchFunction();
    if (!data) {
      toast.dismiss(loadingToast);
      toast.error("No se encontraron datos para el reporte.");
    } else {
      ExportCSV.handleDownload(mapComprasToCSV(data.rows), filename);
      toast.dismiss(loadingToast);
    }
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSearchType.value) return;

    if (selectedSearchType.value === "FECHA") {
      const { value: fecha } = selectedFecha;
      let fetchFunction: () => Promise<any>;
      const filename = `reporte-de-compras-${new Date().toISOString()}`;

      switch (fecha) {
        case "HOY":
          fetchFunction = () => PurchaseService.getToday(1, 10000);
          break;
        case "RECIENTEMENTE":
          fetchFunction = () => PurchaseService.getRecent(1, 10000);
          break;
        case "ESTA_SEMANA":
          fetchFunction = () => PurchaseService.getThisWeek(1, 10000);
          break;
        case "ESTE_MES":
          fetchFunction = () => PurchaseService.getThisMonth(1, 10000);
          break;
        case "ESTE_AÑO":
          fetchFunction = () => PurchaseService.getThisYear(1, 10000);
          break;
        case "ENTRE":
          fetchFunction = () =>
            PurchaseService.getBetween(
              new Date(inputDates.start).toISOString().split("T")[0],
              new Date(inputDates.end).toISOString().split("T")[0],
              1,
              10000
            );
          break;
        default:
          return;
      }

      await fetchAndDownloadReport(fetchFunction, filename);
    } else if (selectedSearchType.value === "PROVEEDOR") {
      const filename = `reporte-de-compras-${new Date().toISOString()}`;
      await fetchAndDownloadReport(
        () =>
          PurchaseService.getByProvider(
            selectedProvider.value as number,
            1,
            10000
          ),
        filename
      );
    }
  };

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
                value: "FECHA",
                label: "Fecha",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "PROVEEDOR",
                label: "Proveedor",
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

        {selectedSearchType.value === "PROVEEDOR" && (
          <div className="relative">
            {loading ? (
              <div className="relative">
                <select
                  className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                  disabled
                >
                  <option>Buscando proveedores...</option>
                </select>
                <svg
                  aria-hidden="true"
                  className="inline w-4 h-4 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
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
            ) : (
              <SelectWithSearch
                options={providers.map((provider) => ({
                  value: provider.id,
                  label: `${provider.nombre}${
                    provider.documento ? `, ${provider.documento}` : ""
                  }`,
                  onClick: (value, label) => {
                    setSelectedProvider({
                      value,
                      label,
                    });
                  },
                }))}
                selected={selectedProvider}
              />
            )}
          </div>
        )}

        {selectedSearchType.value === "FECHA" && (
          <>
            <div className="relative">
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
            </div>
            {selectedFecha.value === "ENTRE" && (
              <>
                <input
                  type="date"
                  placeholder="Fecha inicial"
                  value={inputDates.start}
                  className="border p-2 rounded outline-none focus:border-[#2096ed]"
                  onChange={(e) =>
                    setInputDates((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  required
                />
                <input
                  type="date"
                  placeholder="Fecha final"
                  value={inputDates.end}
                  className="border p-2 rounded outline-none focus:border-[#2096ed]"
                  onChange={(e) =>
                    setInputDates((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  required
                />
              </>
            )}
          </>
        )}

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
                  (selectedSearchType.value === "FECHA" &&
                    selectedFecha.value === "") ||
                  (selectedSearchType.value === "PROVEEDOR" &&
                    selectedProvider.value === -1),
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

function Dropup({
  close,
  selectAction,
  toAdd,
  toEdit,
  selectSecondAction,
}: DropupProps) {
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

  if (toAdd || toEdit) {
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
        <li>
          <div
            onClick={() => {
              selectSecondAction?.("ADD");
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
            Añadir
          </div>
        </li>
        <li>
          <div
            onClick={() => {
              selectSecondAction?.("REDUCE");
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
            Remover
          </div>
        </li>
      </ul>
    );
  }

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
      {permissions.find()?.crear.compra && (
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
            Añadir compra
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
          Buscar compra
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
  left,
  anulada,
}: DropupProps & { anulada: boolean }) {
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
      {permissions.find()?.eliminar.compra && !anulada && (
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
            Anular compra
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
          Mostrar compra
        </div>
      </li>
    </ul>
  );
}

export default function PurchaseDataDisplay() {
  const [purchases, setPurchases] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.compra ? "ADD" : "SEARCH"
  );
  const [secondAction, setSecondAction] = useState<`${Action}`>("ADD");
  const [_purchase, setPurchase] = useState<Compra>();
  const [toEdit, setToEdit] = useState(false);
  const [toAdd, setToAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = usePurchaseSearchParamStore((state) => state.searchCount);
  const resetSearchCount = usePurchaseSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = usePurchaseSearchParamStore((state) => state.input);
  const param = usePurchaseSearchParamStore((state) => state.param);
  const searchId = usePurchaseSearchParamStore((state) => state.searchId);
  const secondInput = usePurchaseSearchParamStore((state) => state.secondInput);
  const secondParam = usePurchaseSearchParamStore((state) => state.secondParam);
  const [isSearch, setIsSearch] = useState(false);
  const [isReport, setIsReport] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
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

  const selectSecondAction = (action: `${Action}`) => {
    setSecondAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (toEdit == false && toAdd == false) {
      selectSecondAction("ADD");
    }
  }, [toEdit, toAdd]);

  useEffect(() => {
    if (searchCount === 0) {
      PurchaseService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setPurchases([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setPurchases(data.rows);
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
        const loadingToast = toast.loading("Buscando...");
        if (secondParam === "HOY") {
          PurchaseService.getToday(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "RECIENTEMENTE") {
          PurchaseService.getRecent(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTA_SEMANA") {
          PurchaseService.getThisWeek(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_MES") {
          PurchaseService.getThisMonth(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_AÑO") {
          PurchaseService.getThisYear(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ENTRE") {
          PurchaseService.getBetween(
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            size
          ).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setPurchases([]);
            } else {
              setPurchases(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        }
      } else if (param === "PROVEEDOR" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        PurchaseService.getByProvider(searchId, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setPurchases([]);
          } else {
            setPurchases(data.rows);
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
  }, [isOperationCompleted, toEdit, searchCount, toAdd, pages]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none  max-[420px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]" onClick={resetSearchCount}>
              Compras{" "}
            </span>
            {toAdd ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Añadir compra</span>
              </>
            ) : toEdit ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar compra</span>
              </>
            ) : null}
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                selectSecondAction={selectSecondAction}
                openAddModal={() => {}}
                toAdd={toAdd}
                toEdit={toEdit}
                openSearchModal={() => {}}
                openReportModal={() => {}}
              />
            )}
            {!(toAdd || toEdit) ? (
              <>
                {action === "ADD" ? (
                  <button
                    onClick={openAddModal}
                    className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                  >
                    Añadir compra
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
                      Buscar compra
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
              </>
            ) : null}
            {toAdd || toEdit ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setToAdd(false);
                  }}
                  className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                >
                  Volver
                </button>
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
              </>
            ) : (
              <button
                id="acciones-btn"
                onClick={() => {
                  setIsDropup(!isDropup);
                }}
                className="bg-gray-300 border hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                <More className="w-5 h-5 inline fill-black" />
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
            action={secondAction}
          />
        ) : (
          <>
            {purchases.length > 0 && loading == false && (
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
                        Fecha de compra
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Proveedor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Subtotal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Estado
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
                    {purchases.map((purchase, index) => {
                      return (
                        <DataRow
                          action={action}
                          compra={purchase}
                          setOperationAsCompleted={setAsCompleted}
                          key={purchase.id}
                          onClick={() => {
                            setToEdit(true), setPurchase(purchase);
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
              (purchases.length === 0 && loading === false)) && (
              <div className="grid w-full h-4/5">
                <div className="place-self-center  flex flex-col items-center">
                  <Face className="fill-[#2096ed] h-20 w-20" />
                  <p className="font-bold text-xl text-center mt-1">
                    Nínguna compra encontrada
                  </p>
                  <p className="font-medium text text-center mt-1">
                    {searchCount === 0
                      ? "Esto puede deberse a un error del servidor, o a que no hay ningúna compra registrada."
                      : "Esto puede deberse a un error del servidor, o a que ningúna compra concuerda con tu busqueda."}
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
      {purchases.length > 0 && loading == false && !toAdd && !toEdit && (
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
