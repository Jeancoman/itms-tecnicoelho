import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as Search } from "/src/assets/search.svg";
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
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import ProductService from "../../services/producto-service";
import SaleService from "../../services/sales-service";
import ClientService from "../../services/client-service";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import session from "../../utils/session";
import debounce from "lodash.debounce";
import { useSaleSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import ExportCSV from "../misc/export-to-cvs";
import { useNavigate } from "react-router-dom";

function AddSection({ close, setOperationAsCompleted, action }: SectionProps) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>();
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [formData, setFormData] = useState<Venta>({
    impuesto: 0,
    subtotal: 0,
    total: 0,
    cliente_id: -1,
    detalles: [],
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const resetFormData = () => {
    setFormData({
      impuesto: 0,
      subtotal: 0,
      total: 0,
      cliente_id: -1,
      detalles: [],
    });
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
    });
  };

  const searchProducts = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm === "") {
        ProductService.getAll(page, 6).then((data) => {
          if (data === false) {
            setProductos([]);
          } else {
            setProductos(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
          }
        });
      }
      const data = await ProductService.getByCódigo(searchTerm, page, 6);
      if (data === false) {
        const otherData = await ProductService.getByNombre(searchTerm, page, 6);
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
    if (clients.length === 0) {
      setLoading(true);
      ClientService.getAll(1, 100).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setClients(data.rows);
          setLoading(false);
        }
      });
    }
  }, []);

  return (
    <form
      className="grid grid-cols-[2fr,_1fr] gap-5 h-fit w-full"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        const loadingToast = toast.loading("Registrando venta...");
        SaleService.create(formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          resetFormData();
          if (data === false) {
            toast.error("Venta no pudo ser registrada.");
          } else {
            toast.success("Venta registrada con exito.");
            formData.detalles?.forEach(async (detalle) => {
              //@ts-ignore
              await ProductService.update(detalle.producto_id!, {
                id: detalle.producto_id!,
                stock: detalle?.producto?.stock! - detalle.cantidad,
              });
            });
          }
          close();
        });
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Impuesto*"
            onChange={(e) => {
              const impuesto = isNaN(Number(e.target.value))
                ? 0
                : Number(e.target.value);
              setFormData({
                ...formData,
                total: formData.subtotal * (1 + impuesto / 100),
                impuesto,
              });
            }}
            value={formData.impuesto <= 0 ? "" : formData.impuesto}
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-3/12"
            min={0}
            required
            name="tax"
          />
          <div className="relative w-1/3">
            {clients.length > 0 && (
              <Select
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.nombre + " " + client.apellido + ", " + client.documento,
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
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
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
        </div>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Subtotal"
            value={
              formData.subtotal <= 0 ? "" : Number(formData.subtotal).toFixed(2)
            }
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-3/12"
            min={0}
            required
            disabled
            name="subtotal"
          />
          <input
            type="number"
            placeholder="Total"
            value={formData.total <= 0 ? "" : Number(formData.total).toFixed(2)}
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-1/3"
            min={0}
            required
            disabled
            name="total"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 row-start-2 w-full	">
        <div className="relative">
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
          <Search className="absolute top-2 left-96 fill-[#2096ed]" />
        </div>
        <EmbeddedTable
          onChange={(detalles) => {
            let subtotal = 0;
            if (detalles) {
              for (let detalle of detalles) {
                subtotal += detalle.subtotal;
              }
            }
            setFormData({
              ...formData,
              subtotal: subtotal,
              total: subtotal * (1 + formData.impuesto / 100),
              detalles: detalles,
            });
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
        />
        <div className="flex h-full items-end justify-end">
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
          <div className="flex gap-2 justify-end absolute bottom-5">
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
  venta,
  setOperationAsCompleted,
  action,
}: SectionProps) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>();
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: venta?.cliente_id,
    label: venta?.cliente?.nombre + " " + venta?.cliente?.apellido + ", " + venta?.cliente?.documento,
  });
  const [formData, setFormData] = useState<Venta>(venta!);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const previos = [...venta?.detalles!];

  const searchProducts = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm === "") {
        ProductService.getAll(page, 6).then((data) => {
          if (data === false) {
            setProductos([]);
          } else {
            setProductos(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
          }
        });
      }
      const data = await ProductService.getByCódigo(searchTerm, page, 6);
      if (data === false) {
        const otherData = await ProductService.getByNombre(searchTerm, page, 6);
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
    if (clients.length === 0) {
      setLoading(true);
      ClientService.getAll(1, 100).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setClients(data.rows);
          setLoading(false);
        }
      });
    }
  }, []);

  return (
    <form
      className="grid grid-cols-[2fr,_1fr] gap-5 h-fit w-full"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        const loadingToast = toast.loading("Editando venta...");
        SaleService.update(venta?.id!, formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          if (data === false) {
            toast.error("Venta no pudo ser editada.");
          } else {
            toast.success("Venta editada con exito.");
            formData.detalles?.forEach(async (detalle) => {
              const previo = previos?.find?.(
                (previo) => previo.producto_id === detalle.producto_id
              );
              const producto = venta?.productos?.find?.(
                (producto) => producto.id === detalle.producto_id
              );
              //@ts-ignore
              await ProductService.update(detalle.producto_id!, {
                id: detalle.producto_id!,
                stock: previo
                  ? producto?.stock! + (previo.cantidad - detalle.cantidad)
                  : producto?.stock! - detalle.cantidad,
              });
            });
          }
          close();
        });
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Impuesto*"
            onChange={(e) => {
              const impuesto = isNaN(Number(e.target.value))
                ? 0
                : Number(e.target.value);
              setFormData({
                ...formData,
                total: formData.subtotal * (1 + impuesto / 100),
                impuesto,
              });
            }}
            value={formData.impuesto <= 0 ? "" : Number(formData.impuesto)}
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-3/12"
            min={0}
            required
            name="tax"
          />
          <div className="relative w-1/3">
            {clients.length > 0 && (
              <Select
                options={clients.map((client) => ({
                  value: client.id,
                  label: client.nombre + " " + client.apellido + ", " + client.documento,
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
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
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
        </div>
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Subtotal"
            value={
              formData.subtotal <= 0 ? "" : Number(formData.subtotal).toFixed(2)
            }
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-3/12"
            min={0}
            required
            disabled
            name="subtotal"
          />
          <input
            type="number"
            placeholder="Total"
            value={formData.total <= 0 ? "" : Number(formData.total).toFixed(2)}
            className="border p-2 border-slate-300 rounded outline-none focus:border-[#2096ed] w-1/3"
            min={0}
            required
            disabled
            name="total"
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 row-start-2 w-full	">
        <div className="relative">
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
          <Search className="absolute top-2 left-96 fill-[#2096ed]" />
        </div>
        <EmbeddedTable
          onChange={(detalles) => {
            let subtotal = 0;

            if (detalles) {
              for (let detalle of detalles) {
                subtotal += Number(detalle.subtotal);
              }
            }
            if (detalles) {
              setFormData({
                ...formData,
                subtotal: subtotal,
                total: subtotal * (1 + Number(formData.impuesto) / 100),
                detalles: detalles,
              });
            }
          }}
          setPages={(pages) => {
            setPages(pages);
          }}
          detalles_venta={venta?.detalles}
          setCurrent={(current) => {
            setCurrent(current);
          }}
          page={page}
          action={action}
          products={productos}
          searchTerm={searchTerm}
        />
        <div className="flex h-full items-end justify-end">
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
          <div className="flex gap-2 justify-end absolute bottom-5">
            <button
              type="button"
              onClick={() => {
                close();
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
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando venta...");
          SaleService.delete(venta?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Venta eliminada con exito.");
            } else {
              toast.error("Venta no pudo ser eliminada.");
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
  venta,
  setOperationAsCompleted,
  onClick,
}: DataRowProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {venta?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {format(new Date(venta?.fecha!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {venta?.cliente?.nombre! + " " + venta?.cliente?.apellido!}
      </td>
      <td className="px-6 py-4 border border-slate-300">{venta?.impuesto}</td>
      <td className="px-6 py-2 border border-slate-300">{venta?.subtotal}</td>
      <td className="px-6 py-2 border border-slate-300">{venta?.total}</td>
      <td className="px-6 py-2 border border-slate-300 w-[210px]">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "EDIT" && (
          <>
            <button
              onClick={onClick}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar venta
            </button>
          </>
        )}
        {action === "VIEW_AS_PDF" && (
          <>
            <button
              onClick={() => {
                navigate("/ventas/" + venta?.id + "/pdf");
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar PDF
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
              Eliminar venta
            </button>
            <DeleteModal
              venta={venta}
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

function EmbeddedDataRow({
  detalle_venta,
  producto,
  action,
  onChange,
}: EmbeddedDataRowProps) {
  const max = producto?.stock!;
  const precio = producto?.precio!;
  const subtotal = 0;
  const [cantidad, setCantidad] = useState(
    detalle_venta ? detalle_venta.cantidad : 0
  );
  const [detalle, setDetalle] = useState<DetalleVenta>(
    detalle_venta
      ? { ...detalle_venta, subtotal: Number(detalle_venta.subtotal) }
      : {
          cantidad: cantidad,
          subtotal: subtotal,
          precioUnitario: precio,
          producto_id: producto?.id,
          producto: producto,
        }
  );

  useEffect(() => {
    onChange(detalle);
  }, [cantidad]);

  return (
    <tr>
      <th
        scope="row"
        className="font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 text-center"
      >
        {producto?.id}
      </th>
      <td className="px-6 py-2 border border-slate-300 max-w-[150px] truncate">
        {producto?.código}
      </td>
      <td className="px-6 py-2 border border-slate-300 max-w-[150px] truncate">
        {producto?.nombre}
      </td>
      <td className="px-6 py-2 border border-slate-300">{producto?.precio}</td>
      <td className="px-6 py-2 border border-slate-300 w-[1px]">
        {cantidad}/{max}
      </td>
      <td className="px-6 py-2 border border-slate-300 w-[120px]">
        {action === "ADD" ? (
          <button
            type="button"
            onClick={() => {
              if (cantidad < max) {
                setDetalle({
                  ...detalle,
                  cantidad: cantidad + 1,
                  subtotal: precio * (cantidad + 1),
                });
                setCantidad(cantidad + 1);
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
              if (cantidad > 0) {
                setDetalle({
                  ...detalle,
                  cantidad: cantidad - 1,
                  subtotal: precio * (cantidad - 1),
                });
                setCantidad(cantidad - 1);
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

  useEffect(() => {
    if (typeof products === "undefined" && searchTerm === "") {
      ProductService.getAll(page!, 6).then((data) => {
        if (data === false) {
          setNotFound(true);
          setProductos([]);
          setLoading(false);
        } else {
          setProductos(data.rows);
          setPages?.(data.pages);
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
    onChange(detalles);
  }, [detalles, page, products]);

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
                    Precio
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos?.map((product) => {
                  return (
                    <EmbeddedDataRow
                      producto={product}
                      key={product.id}
                      onChange={secondOnChange}
                      detalle_venta={detalles.find(
                        (detalle) => detalle.producto_id === product.id
                      )}
                      action={action}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      {notFound === true && (
        <div className="grid w-fit h-4/5 self-center mt-14 ml-12">
          <div className="place-self-center flex flex-col items-center justify-center">
            <Face className="fill-[#2096ed] h-20 w-20" />
            <p className="font-bold text-xl text-center mt-1">
              Ningún producto encontrado
            </p>
          </div>
        </div>
      )}
      {loading === true && (
        <div className="grid w-fit h-4/5 mt-20 ml-40">
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
    if (selectedSearchType.value === "CLIENTE") {
      console.log("AQUI");
      if (clients.length === 0) {
        setLoading(true);
        ClientService.getAll(1, 100).then((data) => {
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
      className="w-1/3 min-h-[200px] h-fit rounded-md shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar venta</h1>
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
                <Select
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre} ${client.apellido}, ${client.documento}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                  onChange={() => {
                    setSearchId(selectedClient.value as number);
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
                  <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
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
            />
          </>
        ) : null}
        <div className="flex gap-2 justify-end">
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
      </form>
    </dialog>
  );
}

function ReportModal({ isOpen, closeModal }: ModalProps) {
  const [param, setParam] = useState("");
  const [secondParam, setSecondParam] = useState("");
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
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
        ClientService.getAll(1, 100).then((data) => {
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
      className="w-1/3 min-h-[200px] h-fit rounded-md shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Generar reporte</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSearchType.value !== "") {
            if (param === "FECHA") {
              const loadingToast = toast.loading("Generando reporte...");
              if (secondParam === "HOY") {
                SaleService.getToday(1, 10000).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else if (secondParam === "RECIENTEMENTE") {
                SaleService.getRecent(1, 10000).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else if (secondParam === "ESTA_SEMANA") {
                SaleService.getThisWeek(1, 10000).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else if (secondParam === "ESTE_MES") {
                SaleService.getThisMonth(1, 10000).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else if (secondParam === "ESTE_AÑO") {
                SaleService.getThisYear(1, 10000).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              } else if (secondParam === "ENTRE") {
                SaleService.getBetween(
                  new Date(input).toISOString().split("T")[0],
                  new Date(secondInput).toISOString().split("T")[0],
                  1,
                  10000
                ).then((data) => {
                  if (data === false) {
                    toast.dismiss(loadingToast);
                    toast.error("Error obteniendo datos.");
                  } else {
                    ExportCSV.handleDownload(
                      data.rows.map((venta) => {
                        return {
                          Fecha: venta?.fecha,
                          Impuesto: venta?.impuesto,
                          Subtotal: venta?.subtotal,
                          Total: venta?.total,
                          "Nombre de cliente":
                            venta?.cliente?.nombre +
                            " " +
                            venta?.cliente?.apellido,
                          "Documento de cliente": venta?.cliente?.documento,
                        };
                      }),
                      "reporte-de-ventas-" + new Date().toISOString()
                    );
                    toast.dismiss(loadingToast);
                  }
                  closeModal();
                });
              }
            } else if (param === "CLIENTE") {
              const loadingToast = toast.loading("Buscando...");
              SaleService.getByClient(
                selectedClient.value as number,
                1,
                10000
              ).then((data) => {
                if (data === false) {
                  toast.dismiss(loadingToast);
                  toast.error("Error obteniendo datos.");
                } else {
                  ExportCSV.handleDownload(
                    data.rows.map((venta) => {
                      return {
                        Fecha: venta?.fecha,
                        Impuesto: venta?.impuesto,
                        Subtotal: venta?.subtotal,
                        Total: venta?.total,
                        "Nombre de cliente":
                          venta?.cliente?.nombre +
                          " " +
                          venta?.cliente?.apellido,
                        "Documento de cliente": venta?.cliente?.documento,
                      };
                    }),
                    "reporte-de-ventas-" + new Date().toISOString()
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
                <Select
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre} ${client.apellido}, ${client.documento}`,
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
              {clients.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar cliente</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
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
              value={input}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setInput(e.target.value);
              }}
            />
            <input
              type="date"
              placeholder="Fecha final"
              value={secondInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setSecondInput(e.target.value);
              }}
            />
          </>
        ) : null}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
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
  openAddModal,
  toAdd,
  toEdit,
  selectSecondAction,
  openSearchModal,
  openReportModal,
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
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.editar.venta) && (
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
            Editar venta
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.eliminar.venta) && (
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
            Eliminar venta
          </div>
        </li>
      )}
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
          Mostrar PDF
        </div>
      </li>
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        (permissions.find()?.editar.venta &&
          permissions.find()?.eliminar.venta)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.crear.venta) && (
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
            Registrar venta
          </div>
        </li>
      )}
      <li>
        <div
          onClick={() => {
            openSearchModal?.();
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
            openReportModal?.();
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

export default function SalesDataDisplay() {
  const [sales, setSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");
  const [secondAction, setSecondAction] = useState<`${Action}`>("ADD");
  const [sale, setSale] = useState<Venta>();
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
    if (searchCount === 0 || isOperationCompleted) {
      SaleService.getAll(page, 8).then((data) => {
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
        const loadingToast = toast.loading("Buscando...");
        if (secondParam === "HOY") {
          SaleService.getToday(page, 8).then((data) => {
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
          SaleService.getRecent(page, 8).then((data) => {
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
          SaleService.getThisWeek(page, 8).then((data) => {
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
          SaleService.getThisMonth(page, 8).then((data) => {
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
          SaleService.getThisYear(page, 8).then((data) => {
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
            8
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
        const loadingToast = toast.loading("Buscando...");
        SaleService.getByClient(searchId, page, 8).then((data) => {
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
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]" onClick={resetSearchCount}>
              Ventas
            </span>{" "}
            {toAdd ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Registrar venta</span>
              </>
            ) : toEdit ? (
              <>
                <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar ventas</span>
              </>
            ) : null}
          </div>
          <div>
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                selectSecondAction={selectSecondAction}
                openAddModal={openAddModal}
                openSearchModal={() => {
                  setIsSearch(true);
                }}
                openReportModal={() => {
                  setIsReport(true);
                }}
                toAdd={toAdd}
                toEdit={toEdit}
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
        ) : toEdit ? (
          <EditSection
            isOpen={toEdit}
            close={() => {
              setToEdit(false);
              setSale(undefined);
            }}
            setOperationAsCompleted={setAsCompleted}
            action={secondAction}
            venta={sale}
          />
        ) : (
          <>
            {sales.length > 0 && loading == false && (
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
                        Fecha
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
                        Impuesto
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
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => {
                      return (
                        <DataRow
                          action={action}
                          venta={sale}
                          setOperationAsCompleted={setAsCompleted}
                          key={sale.id}
                          onClick={() => {
                            setToEdit(true), setSale(sale);
                          }}
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
