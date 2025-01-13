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
  Venta,
  EmbeddedDataRowProps,
  EmbeddedTableProps,
  Producto,
  Cliente,
  DetalleVenta,
  Selected,
  Impuesto,
  impuestoCalculado,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import ProductService from "../../services/producto-service";
import SaleService from "../../services/sales-service";
import ClientService from "../../services/client-service";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import { useSaleSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import { useNavigate } from "react-router-dom";
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
  const [clients, setClients] = useState<Cliente[]>([]);
  const [impuestosVenta, setImpuestosVenta] = useState<Impuesto[]>([]);
  const [productos, setProductos] = useState<Producto[]>();
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [selectedTipo, setSelectedTipo] = useState<Selected>({
    value: "CONTADO",
    label: "Contado",
  });
  const [selectedMoneda, setSelectedMselectedMoneda] = useState<Selected>({
    value: "BOLIVAR",
    label: "Bolívar",
  });
  const [formData, setFormData] = useState<Venta>({
    subtotal: 0,
    total: 0,
    cliente_id: -1,
    detalles: [],
    tipoPago: "CONTADO",
    tipoMoneda: "BOLIVAR",
  });
  /*
  const [deudaFormData, setDeudaFormData] = useState<DeudaCliente>({
    deudaPendiente: 0,
  });
  */
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [impuestosCalculados, setImpuestosCalculados] = useState<
    { impuesto: Impuesto; total: number }[]
  >([]);
  const size = 8;
  /*
  const [abono, setAbono] = useState(0);
  */

  const resetFormData = () => {
    setFormData({
      subtotal: 0,
      total: 0,
      cliente_id: -1,
      detalles: [],
      tipoPago: "CONTADO",
      tipoMoneda: "BOLIVAR",
    });
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
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

  const calculateProductTaxes = (detalles: DetalleVenta[]) => {
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

  const calculateSaleTaxes = (venta: Venta, impuestosVenta: Impuesto[]) => {
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
    setPage(1);
    searchProducts(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (clients.length === 0) {
      setLoading(true);
      ClientService.getAll(1, 10000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setClients(data.rows);
          setLoading(false);
        }
      });
    }

    if (impuestosVenta.length === 0) {
      ImpuestoService.getAll(1, 10000).then((data) => {
        if (data) {
          setImpuestosVenta(
            data.rows.filter((impuesto) => impuesto.aplicaA === "VENTA")
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    const productTaxes = calculateProductTaxes(formData.detalles || []);
    const saleTaxes = calculateSaleTaxes(formData, impuestosVenta);

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
    impuestosVenta,
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

    const loadingToast = toast.loading("Añadiendo venta...");
    SaleService.create(updatedFormData, impuestosCalculados).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      resetFormData();
      if (data === false) {
        toast.error("La venta no pudo ser añadida.");
      } else {
        toast.success("La venta fue añadida con exito.");
      }
      close();
    });
  };

  return (
    <>
      <form
        className="flex flex-col gap-5 h-fit max-w-5xl group"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-1/3 min-w-60">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Cliente<span className="text-red-600 text-lg">*</span>
              </label>
              {clients.length > 0 && (
                <SelectWithSearch
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre}${
                      client.apellido ? " " + client.apellido : ""
                    }, ${client.documento}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      cliente_id: Number(selectedClient.value),
                    });
                  }}
                />
              )}
              {clients.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar cliente</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
                </>
              )}
              {clients.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando clientes...</option>
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
              <div className="flex w-full gap-1">
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
          <div className="flex gap-4">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Moneda de pago<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex w-full gap-1">
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
          </div>
          {/*
        selectedTipo.value === "CREDITO" && (
          <>
            <div className="flex gap-4">
              <div className="w-2/4">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Abonado*
                </label>
                <input
                  type="number"
                  placeholder="Introducir la cantidad abonada"
                  onChange={(e) => {
                    setAbono(
                      !isNaN(Number(e.target.value))
                        ? Number(e.target.value)
                        : 0.0
                    );
                  }}
                  value={abono === 0 ? "" : String(abono)}
                  className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-full"
                  required
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="w-full">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  placeholder="Introducir fecha de vencimiento"
                  onChange={(e) => {
                    setDeudaFormData({
                      ...deudaFormData,
                      fechaVencimiento: e.target.value as any,
                    });
                  }}
                  value={deudaFormData.fechaVencimiento as any}
                  className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-[30%]"
                />
              </div>
            </div>
          </>
        )
        */}
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
            detalles_venta={formData?.detalles?.filter(
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
            detalles_venta={formData?.detalles}
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
                  resetFormData();
                }}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cancelar
              </button>
              <button
                className={clsx({
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    selectedClient.label?.startsWith("Seleccionar") ||
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
        venta={formData}
        clienteNombre={selectedClient.label ?? ""}
      />
    </>
  );
}

function ConfirmationModal({
  isOpen,
  closeModal,
  handleFinalSubmit,
  impuestosCalculados,
  venta,
  clienteNombre,
}: ModalProps & {
  handleFinalSubmit: () => void;
  impuestosCalculados: impuestoCalculado[];
  clienteNombre: string;
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
        <h1 className="text-xl font-bold text-white">Confirmar venta</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Cliente
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {clienteNombre}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Moneda de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(venta?.tipoMoneda!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Condición de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(venta?.tipoPago!)}
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
                }).format(venta?.total!)}
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
                }).format(venta?.subtotal!)}
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
                        Precio de venta
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
                    {venta!.detalles
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

/*
function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  deuda,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<DeudaCliente>(deuda!);
  const [abono, setAbono] = useState(0);

  const resetFormData = () => {
    setFormData(deuda!);
    setAbono(0);
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
  }, [closeModal, isOpen]);

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
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar deuda</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group text-base font-normal"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando deuda...");
          void DeudaClienteService.update(deuda?.id!, {
            ...formData,
            deudaPendiente: formData.deudaPendiente! - abono,
          }).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Deuda no pudo ser editada.");
            } else {
              toast.success("Deuda editada con éxito.");
            }
          });
        }}
      >
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Abonado*
          </label>
          <input
            type="number"
            placeholder="Introducir la cantidad abonada"
            onChange={(e) => {
              const value = Number(e.target.value);
              // Permitir cualquier número, incluyendo 0
              if (value >= 0 && value <= (formData.deudaPendiente || 0)) {
                setAbono(value);
              }
            }}
            value={abono} // Cambia esto para permitir 0
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:border-red-500 invalid:text-red-500"
            required
            min={0}
            step="0.01"
            readOnly={formData.pagada}
          />
          <span className="mt-2 text-sm text-gray-600">
            Máximo: {formData.deudaPendiente?.toFixed(2)}
          </span>
        </div>
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Deuda pendiente
          </label>
          <input
            type="text"
            value={`${(formData.deudaPendiente || 0) - abono}`}
            readOnly
            className="border p-2 rounded outline-none bg-gray-100 w-full"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-base font-medium mb-2">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            placeholder="Introducir fecha de vencimiento"
            onChange={(e) => {
              setFormData({
                ...formData,
                fechaVencimiento: e.target.value as any,
              });
            }}
            value={format(new Date(formData.fechaVencimiento!), "yyyy-MM-dd")}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
            readOnly={formData.pagada}
          />
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
*/

function ViewModal({ isOpen, closeModal, venta }: ModalProps) {
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
        <h1 className="text-xl font-bold text-white">Datos de la venta</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Cliente
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {venta?.historico_ventum?.cliente_nombre}
                {venta?.historico_ventum?.cliente_apellido
                  ? " " + venta?.historico_ventum?.cliente_apellido
                  : ""}
                , {venta?.historico_ventum?.cliente_documento}
              </p>
            </div>

            {/* Moneda de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Moneda de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(venta?.tipoMoneda!)}
              </p>
            </div>

            {/* Condición de Pago */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Condición de Pago
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(venta?.tipoPago!)}
              </p>
            </div>

            {/* Impuestos */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Impuestos
              </p>
              <div className="text-gray-900 font-medium text-base break-words">
                {venta?.historico_ventum?.impuestos?.length! > 0 &&
                venta?.historico_ventum?.impuestos?.some(
                  ({ total }) => total > 0
                ) ? (
                  <ul className="list-disc list-inside">
                    {venta?.historico_ventum?.impuestos
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
                }).format(venta?.total!)}
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
                }).format(venta?.subtotal!)}
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
                        Precio de venta
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
                    {venta!.detalles
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

function DataRow({ venta, setOperationAsCompleted, row_number }: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.eliminar.venta && !venta?.anulada
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);

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
      <td className="px-6 py-4 border border-slate-300 min-w-[60px] w-[80px] truncate">
        {format(new Date(venta?.fecha!), "dd/MM/yyyy hh:mm a")}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {venta?.historico_ventum?.cliente_nombre}{" "}
        {venta?.historico_ventum?.cliente_apellido},{" "}
        {venta?.historico_ventum?.cliente_documento}
      </td>
      <td className="px-6 py-2 border border-slate-300 min-w-[60px] w-[150px]">
        {formatter.format(venta?.subtotal || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300 min-w-[60px] w-[150px]">
        {formatter.format(venta?.total || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {!venta?.anulada ? (
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
        className="px-6 py-2 border border-slate-300 min-w-[180px] w-[180px] relative"
      >
        {action === "VIEW_AS_PDF" && (
          <>
            <button
              onClick={() => {
                navigate("/ventas/" + venta?.id + "/factura");
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Factura
            </button>
          </>
        )}
        {(action === "DELETE" && !venta?.anulada) && (
          <>
            <button
              onClick={() => {
                setIsDeleteOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Anular venta
            </button>
            <DeleteModal
              venta={venta}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {(action === "VIEW" || venta?.anulada) && action !== "VIEW_AS_PDF" && (
          <>
            <button
              onClick={() => {
                setIsViewOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar venta
            </button>
            <ViewModal
              venta={venta}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
            />
          </>
        )}
        {isDropup && (
          <IndividualDropup
            anulada={venta?.anulada ?? false}
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            id={venta?.id}
            tipoPago={venta?.tipoPago || "CONTADO"}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              35
            }
          />
        )}
        <button
          id={`acciones-btn-${venta?.id}`}
          className="bg-gray-300 border right-4 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
          onClick={() => setIsDropup(!isDropup)}
        >
          <More className="w-5 h-5 inline fill-black" />
        </button>
      </td>
    </tr>
  );
}

function EmbeddedDataRow({
  detalle_venta,
  producto,
  action,
  onChange,
  row_number,
}: EmbeddedDataRowProps) {
  const max = producto?.existencias!;
  const precio = producto?.precioVenta!;
  const [detalle, setDetalle] = useState<DetalleVenta>(
    detalle_venta
      ? { ...detalle_venta, subtotal: Number(detalle_venta.subtotal) }
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
      typeof detalle_venta === "undefined" ||
      !isEqual(detalle_venta, detalle)
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
        {formatter.format(producto?.precioVenta || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {detalle_venta?.cantidad || 0}/{max}
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
              if ((detalle_venta?.cantidad || 0) < max) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_venta?.cantidad || 0) + 1,
                  subtotal: precio * ((detalle_venta?.cantidad || 0) + 1),
                });
              }
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Añadir
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if ((detalle_venta?.cantidad || 0) > 0) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_venta?.cantidad || 0) - 1,
                  subtotal: precio * ((detalle_venta?.cantidad || 0) - 1),
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

function EmbeddedDetailsDataRow({
  detalle_venta,
  producto,
  action,
  onChange,
  row_number,
}: EmbeddedDataRowProps) {
  const max = producto?.existencias!;
  const precio = producto?.precioVenta!;
  const [detalle, setDetalle] = useState<DetalleVenta>(
    detalle_venta
      ? { ...detalle_venta, subtotal: Number(detalle_venta.subtotal) }
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
      typeof detalle_venta === "undefined" ||
      !isEqual(detalle_venta, detalle)
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
        {formatter.format(producto?.precioVenta || 0)}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {detalle_venta?.cantidad || 0}/{max}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {action === "ADD" ? (
          <button
            type="button"
            onClick={() => {
              if ((detalle_venta?.cantidad || 0) < max) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_venta?.cantidad || 0) + 1,
                  subtotal: precio * ((detalle_venta?.cantidad || 0) + 1),
                });
              }
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Añadir
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if ((detalle_venta?.cantidad || 0) > 0) {
                setDetalle({
                  ...detalle,
                  cantidad: (detalle_venta?.cantidad || 0) - 1,
                  subtotal: precio * ((detalle_venta?.cantidad || 0) - 1),
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
  onChange,
  detalles_venta,
  products,
  searchTerm,
  action,
}: EmbeddedTableProps) {
  const [productos, setProductos] = useState<Producto[] | undefined>(products);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [detalles, setDetalles] = useState<DetalleVenta[]>(
    detalles_venta ? detalles_venta : []
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
          setThisPage(data.current);
          setCurrent?.(data.current);
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
      typeof detalles_venta === "undefined" ||
      !isEqual(detalles_venta, detalles)
    )
      onChange(detalles);
  }, [detalles]);

  useEffect(() => {
    if (!isEqual(detalles_venta?.sort(), detalles.sort())) {
      setDetalles(detalles_venta ? detalles_venta : []);
    }
  }, [detalles_venta]);

  const secondOnChange = (detalle: DetalleVenta) => {
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
                    Precio de venta
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
                      detalle_venta={detalles.find(
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
        <div className="grid w-fit h-4/5 self-center ml-12 mb-20">
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

function EmbeddedDetailsTable({
  detalles_venta,
  action,
  products,
  onChange,
}: EmbeddedTableProps) {
  const [detalles, setDetalles] = useState<DetalleVenta[]>(
    detalles_venta ? detalles_venta : []
  );

  useEffect(() => {
    if (
      typeof detalles_venta === "undefined" ||
      !isEqual(detalles_venta, detalles)
    )
      onChange(detalles);
  }, [detalles]);

  useEffect(() => {
    if (!isEqual(detalles_venta?.sort(), detalles.sort())) {
      setDetalles(detalles_venta ? detalles_venta : []);
    }
  }, [detalles_venta]);

  const secondOnChange = (detalle: DetalleVenta) => {
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
      {typeof detalles_venta !== "undefined" && detalles_venta?.length > 0 && (
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
              {detalles_venta
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
                      detalle_venta={detail}
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
  venta,
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
        <h1 className="text-xl font-bold text-white">Anular venta</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Anulando venta...");
          SaleService.delete(venta?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("La venta fue anulada con exito.");
            } else {
              toast.error("LA venta no pudo ser anulada.");
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
  const [clients, setClients] = useState<Cliente[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const tempInput = useSaleSearchParamStore((state) => state.tempInput);
  const secondTempInput = useSaleSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useSaleSearchParamStore((state) => state.setInput);
  const setTempInput = useSaleSearchParamStore((state) => state.setTempInput);
  const setSecondInput = useSaleSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useSaleSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useSaleSearchParamStore((state) => state.setParam);
  const setSecondParam = useSaleSearchParamStore(
    (state) => state.setSecondParam
  );
  const setSearchId = useSaleSearchParamStore((state) => state.setSearchId);
  const incrementSearchCount = useSaleSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useSaleSearchParamStore(
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
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
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

  useEffect(() => {
    if (selectedSearchType.value === "CLIENTE") {
      console.log("AQUI");
      if (clients.length === 0) {
        setLoading(true);
        void ClientService.getAll(1, 10000).then((data) => {
          if (data === false) {
            setLoading(false);
          } else {
            setClients(data.rows);
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
        <h1 className="text-xl font-bold text-white">Buscar venta</h1>
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
              {
                value: "CLIENTE",
                label: "Cliente",
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
        {selectedSearchType.value === "CLIENTE" ? (
          <>
            <div className="relative">
              {clients.length > 0 && (
                <SelectWithSearch
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre}${
                      client.apellido ? " " + client.apellido : ""
                    }, ${client.documento}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                  onChange={() => {
                    if (isOpen) {
                      setSearchId(selectedClient.value as number);
                    }
                  }}
                />
              )}
              {clients.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar cliente</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
                </>
              )}
              {clients.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando clientes...</option>
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
                  selectedSearchType?.value === "FECHA") ||
                (selectedClient.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "CLIENTE"),
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
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [inputDates, setInputDates] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [clients, setClients] = useState<Cliente[]>([]);
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
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
    });
    setInputDates({ start: "", end: "" });
    setClients([]);
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
    const fetchClients = async () => {
      setLoading(true);
      const data = await ClientService.getAll(1, 10000);
      if (data) {
        setClients(data.rows);
      }
      setLoading(false);
    };

    if (selectedSearchType.value === "CLIENTE" && clients.length === 0) {
      fetchClients();
    }
  }, [selectedSearchType, clients.length]);

  const mapVentasToCSV = (ventas: Venta[]) =>
    ventas.map((venta) => ({
      Fecha: format(new Date(venta.fecha as any), "dd/MM/yyyy hh:mm a"),
      Subtotal: venta.subtotal,
      Total: venta.total,
      "Nombre de cliente": `${venta.historico_ventum?.cliente_nombre} ${venta.historico_ventum?.cliente_apellido}`,
      "Documento de cliente": venta.historico_ventum?.cliente_documento || "",
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
      ExportCSV.handleDownload(mapVentasToCSV(data.rows), filename);
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
      const filename = `reporte-de-ventas-${new Date().toISOString()}`;

      switch (fecha) {
        case "HOY":
          fetchFunction = () => SaleService.getToday(1, 10000);
          break;
        case "RECIENTEMENTE":
          fetchFunction = () => SaleService.getRecent(1, 10000);
          break;
        case "ESTA_SEMANA":
          fetchFunction = () => SaleService.getThisWeek(1, 10000);
          break;
        case "ESTE_MES":
          fetchFunction = () => SaleService.getThisMonth(1, 10000);
          break;
        case "ESTE_AÑO":
          fetchFunction = () => SaleService.getThisYear(1, 10000);
          break;
        case "ENTRE":
          fetchFunction = () =>
            SaleService.getBetween(
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
    } else if (selectedSearchType.value === "CLIENTE") {
      const filename = `reporte-de-ventas-${new Date().toISOString()}`;
      await fetchAndDownloadReport(
        () => SaleService.getByClient(selectedClient.value as number, 1, 10000),
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
                value: "CLIENTE",
                label: "Cliente",
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

        {selectedSearchType.value === "CLIENTE" && (
          <div className="relative">
            {loading ? (
              <div className="relative">
                <select
                  className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                  disabled
                >
                  <option>Buscando clientes...</option>
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
                options={clients.map((client) => ({
                  value: client.id,
                  label: `${client.nombre} ${client.apellido}${
                    client.documento ? "," : ""
                  } ${client.documento ? client.documento : ""}`,
                  onClick: (value, label) => {
                    setSelectedClient({
                      value,
                      label,
                    });
                  },
                }))}
                selected={selectedClient}
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
                  (selectedSearchType.value === "CLIENTE" &&
                    selectedClient.value === -1),
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
      {permissions.find()?.crear.venta && (
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
            Añadir venta
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
          Buscar venta
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
}: DropupProps & { anulada: boolean } & { tipoPago: "CONTADO" | "CREDITO" }) {
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
      {permissions.find()?.eliminar.venta && !anulada && (
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
            Anular venta
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
          Mostrar venta
        </div>
      </li>
      {/*
      permissions.find()?.editar.venta && tipoPago === "CREDITO" && (
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
            Deuda
          </div>
        </li>
      ) */}
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_AS_PDF");
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
          Factura
        </div>
      </li>
    </ul>
  );
}

export default function SalesDataDisplay() {
  const [sales, setSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.venta ? "ADD" : "SEARCH"
  );
  const [secondAction, setSecondAction] = useState<`${Action}`>("ADD");
  const [_sale, setSale] = useState<Venta>();
  const [toEdit, setToEdit] = useState(false);
  const [toAdd, setToAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useSaleSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useSaleSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useSaleSearchParamStore((state) => state.input);
  const param = useSaleSearchParamStore((state) => state.param);
  const searchId = useSaleSearchParamStore((state) => state.searchId);
  const secondInput = useSaleSearchParamStore((state) => state.secondInput);
  const secondParam = useSaleSearchParamStore((state) => state.secondParam);
  const [isSearch, setIsSearch] = useState(false);
  const [isReport, setIsReport] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useSaleSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useSaleSearchParamStore((state) => state.justSearched);
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
      SaleService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setSales([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setSales(data.rows);
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
          SaleService.getToday(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "RECIENTEMENTE") {
          SaleService.getRecent(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTA_SEMANA") {
          SaleService.getThisWeek(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_MES") {
          SaleService.getThisMonth(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_AÑO") {
          SaleService.getThisYear(page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ENTRE") {
          SaleService.getBetween(
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            size
          ).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setSales([]);
            } else {
              setSales(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        }
      } else if (param === "CLIENTE" && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        SaleService.getByClient(searchId, page, size).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setSales([]);
          } else {
            setSales(data.rows);
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
            <span className="text-[#2096ed]" onClick={resetSearchCount}>
              Ventas
            </span>{" "}
            {toAdd ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Añadir venta</span>
              </>
            ) : toEdit ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar venta</span>
              </>
            ) : null}
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                selectSecondAction={selectSecondAction}
                openAddModal={() => null}
                toAdd={toAdd}
                toEdit={toEdit}
                openSearchModal={() => null}
                openReportModal={() => null}
              />
            )}
            {!(toAdd || toEdit) ? (
              <>
                {action === "ADD" ? (
                  <>
                    {searchCount > 0 ? (
                      <button
                        type="button"
                        onClick={resetSearchCount}
                        className="text-gray-500 text-sm bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                      >
                        Cancelar busqueda
                      </button>
                    ) : null}
                    <button
                      onClick={openAddModal}
                      className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                    >
                      Añadir venta
                    </button>
                  </>
                ) : null}
                {action === "SEARCH" ? (
                  <>
                    {searchCount > 0 ? (
                      <button
                        type="button"
                        onClick={resetSearchCount}
                        className="text-gray-500 text-sm bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                      >
                        Cancelar busqueda
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsSearch(true)}
                        className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                      >
                        Buscar venta
                      </button>
                    )}
                  </>
                ) : null}
                {action === "REPORT" ? (
                  <>
                    {searchCount > 0 ? (
                      <button
                        type="button"
                        onClick={resetSearchCount}
                        className="text-gray-500 text-sm bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                      >
                        Cancelar busqueda
                      </button>
                    ) : null}
                    <button
                      onClick={() => setIsReport(true)}
                      className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                    >
                      Generar reporte
                    </button>
                  </>
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
                  className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
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
            {sales.length > 0 && loading == false && (
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
                        Fecha de venta
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 border border-slate-300"
                      >
                        Cliente
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
                    {sales.map((sale, index) => {
                      return (
                        <DataRow
                          action={action}
                          venta={sale}
                          setOperationAsCompleted={setAsCompleted}
                          key={sale.id}
                          onClick={() => {
                            setToEdit(true), setSale(sale);
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
              (sales.length === 0 && loading === false)) && (
              <div className="grid w-full h-4/5">
                <div className="place-self-center  flex flex-col items-center">
                  <Face className="fill-[#2096ed] h-20 w-20" />
                  <p className="font-bold text-xl text-center mt-1">
                    Nínguna venta encontrada
                  </p>
                  <p className="font-medium text text-center mt-1">
                    {searchCount === 0
                      ? "Esto puede deberse a un error del servidor, o a que no hay ningúna venta registrada."
                      : "Esto puede deberse a un error del servidor, o a que ningúna venta concuerda con tu busqueda."}
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
      {sales.length > 0 && loading == false && !toAdd && !toEdit && (
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
