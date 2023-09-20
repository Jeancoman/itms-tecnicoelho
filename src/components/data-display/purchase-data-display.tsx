import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/public/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/public/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/public/assets/thinking.svg";
import { ReactComponent as Warning } from "/public/assets/circle-exclamation-solid.svg";
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
  DetalleVenta,
  Selected,
  Proveedor,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import ProductService from "../../services/producto-service";
import Provider from "../../services/provider-service";
import Select from "../misc/select";
import PurchaseService from "../../services/purchases-service";

function AddSection({ close, setOperationAsCompleted, action }: SectionProps) {
  const [loading, setLoading] = useState(true);
  const [providers, setClients] = useState<Proveedor[]>([]);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar proveedor",
  });
  const [formData, setFormData] = useState<Compra>({
    impuesto: 0,
    subtotal: 0,
    total: 0,
    proveedor_id: -1,
    estado: "CONFIRMADA",
    detalles: [],
  });

  console.log(formData);

  const resetFormData = () => {
    setFormData({
      impuesto: 0,
      subtotal: 0,
      total: 0,
      proveedor_id: -1,
      estado: "CONFIRMADA",
      detalles: [],
    });
  };

  useEffect(() => {
    if (providers.length === 0) {
      setLoading(true);
      Provider.getAll().then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setClients(data);
          setLoading(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    let subtotal = 0;

    if (formData.detalles) {
      for (let detalle of formData.detalles) {
        subtotal += detalle.subtotal;
      }
    }

    setFormData({
      ...formData,
      subtotal: subtotal,
      total: subtotal * (1 + formData.impuesto / 100),
    });
  }, [formData.detalles]);

  return (
    <form
      className="grid grid-cols-2 gap-5 py-4 h-fit"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        const loadingToast = toast.loading("Registrando compra...");
        PurchaseService.create(formData).then((data) => {
          toast.dismiss(loadingToast);
          setOperationAsCompleted();
          close();
          resetFormData();
          if (data === false) {
            toast.error("Compra no pudo ser registrada.");
          } else {
            toast.success("Compra registrada con exito.");
            formData.detalles?.forEach(async detalle => {
              //@ts-ignore
             await ProductService.update(detalle.producto_id!, {
              id: detalle.producto_id!,
              stock: detalle?.producto?.stock! + detalle.cantidad,
             })
            })
          }
        });
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Impuesto*"
            onChange={(e) => {
              setFormData({
                ...formData,
                impuesto: Number(e.target.value),
              });
            }}
            value={formData.impuesto <= 0 ? "" : formData.impuesto}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/5"
            min={0}
            required
            name="tax"
          />
          <div className="relative w-2/4">
            {providers.length > 0 && (
              <Select
                options={providers.map((provider) => ({
                  value: provider.id,
                  label: provider.nombre,
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
                    proveedor_id: Number(selectedClient.value),
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
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
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
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Subtotal*"
            value={formData.subtotal <= 0 ? "" : formData.subtotal}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/5"
            min={0}
            required
            disabled
            name="subtotal"
          />
          <input
            type="number"
            placeholder="Total*"
            value={formData.total <= 0 ? "" : formData.total}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
            min={0}
            required
            disabled
            name="total"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <EmbeddedTable
          onChange={(detalles) => {
            setFormData({
              ...formData,
              detalles: detalles,
            });
          }}
          action={action}
        />
        <div className="flex h-full items-start justify-end">
          <div className="flex gap-2 justify-end">
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
}: SectionProps) {
  const [formData, setFormData] = useState({});

  return (
    <form
      className="h-fit grid grid-cols-2 gap-5 py-4"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        close();
        setOperationAsCompleted()
        console.log(formData)
      }
    }
    >
      <div className="h-full"></div>
      <div className="flex flex-col gap-4">
        <EmbeddedTable
          onChange={function (detalles): void {
            console.log(detalles);
            setFormData({})
          }}
        />
        <div className="flex h-full items-end">
          <div className="flex gap-2 justify-end">
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
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando compra...");
          PurchaseService.delete(compra?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Compra eliminada con exito.");
            } else {
              toast.error("Compra no pudo ser eliminada.");
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
  compra,
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
        {compra?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {format(new Date(compra?.fecha!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {compra?.proveedor?.nombre!}
      </td>
      <td className="px-6 py-4 border border-slate-300">{compra?.impuesto}</td>
      <td className="px-6 py-2 border border-slate-300">{compra?.subtotal}</td>
      <td className="px-6 py-2 border border-slate-300">{compra?.total}</td>
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
              Editar compra
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
              Eliminar compra
            </button>
            <DeleteModal
              compra={compra}
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

function EmbeddedDataRow({ producto, action, onChange }: EmbeddedDataRowProps) {
  const precio = producto?.precio!;
  const subtotal = 0;
  const [cantidad, setCantidad] = useState(0);
  const [detalle, setDetalle] = useState<DetalleVenta>({
    cantidad: cantidad,
    subtotal: subtotal,
    precioUnitario: precio,
    producto_id: producto?.id,
    producto: producto,
  });

  useEffect(() => {
    setDetalle({
      ...detalle,
      cantidad: cantidad,
      subtotal: precio * cantidad,
    });

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
        {producto?.nombre}
      </td>
      <td className="px-6 py-2 border border-slate-300">{producto?.precio}</td>
      <td className="px-6 py-2 border border-slate-300">
        {cantidad}
      </td>
      <td className="px-6 py-4 border border-slate-300 w-[100px]">
        {action === "ADD" ? (
          <button
            type="button"
            onClick={() => {
                setCantidad(cantidad + 1);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
          >
            Añadir
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (cantidad > 0) {
                setCantidad(cantidad - 1);
              }
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:underline"
          >
            Quitar
          </button>
        )}
      </td>
    </tr>
  );
}

function EmbeddedTable({ onChange, action }: EmbeddedTableProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);

  useEffect(() => {
    if (products.length === 0) {
      ProductService.getAll().then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
        } else {
          setProducts(data);
          setLoading(false);
          setNotFound(false);
        }
      });
    }

    onChange(detalles);
  }, [detalles]);

  const secondOnChange = (detalle: DetalleVenta) => {
    setDetalles((prevDetalles) => {
      // Check if the object is already in the array
      const existingObjectIndex = prevDetalles.findIndex(
        (obj) => obj.producto_id === detalle.producto_id
      );

      if (existingObjectIndex >= 0) {
        // If it exists, create a new array where we replace the existing object with our new one
        return prevDetalles.map((item, index) =>
          index === existingObjectIndex ? detalle : item
        );
      } else {
        // If it doesn't exist, add our new object to the end of our array
        return [...prevDetalles, detalle];
      }
    });
  };

  return (
    <div>
      {products.length > 0 && loading == false && (
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
              {products.map((product) => {
                return (
                  <EmbeddedDataRow
                    producto={product}
                    key={product.id}
                    onChange={secondOnChange}
                    action={action}
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
              Ningún producto encontrado
            </p>
            <p className="font-medium text text-center mt-1">
              Esto puede deberse a un error del servidor, o a que simplemente no
              hay ningún producto registrado.
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
  );
}

function Dropup({
  close,
  selectAction,
  openAddModal,
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
            Quitar
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
          Editar compra
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
          Eliminar compra
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
          Registrar compra
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
          Buscar compra
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
  const [action, setAction] = useState<`${Action}`>("NONE");
  const [secondAction, setSecondAction] = useState<`${Action}`>("ADD");
  //@ts-ignore
  const [sale, setSale] = useState<Compra>({});
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

  const selectSecondAction = (action: `${Action}`) => {
    setSecondAction(action);
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

    PurchaseService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
        setPurchases([])
      } else {
        setPurchases(data);
        setLoading(false);
        setNotFound(false);
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
                Compras <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Registrar compra</span>
              </>
            ) : toEdit ? (
              <>
                Compras <Right className="w-3 h-3 inline fill-slate-600" />{" "}
                <span className="text-[#2096ed]">Editar compras</span>
              </>
            ) : (
              <span className="text-[#2096ed]">Compras</span>
            )}
          </div>
          <div>
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                selectSecondAction={selectSecondAction}
                openAddModal={openAddModal}
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
        <hr className="border-1 border-slate-200 my-5" />
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
              //@ts-ignore
              setPublication({});
            }}
            setOperationAsCompleted={setAsCompleted}
            compra={sale}
          />
        ) : (
          <>
            {purchases.length > 0 && loading == false && (
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
                        Proveedor
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
                    {purchases.map((purchase) => {
                      return (
                        <DataRow
                          action={action}
                          compra={purchase}
                          setOperationAsCompleted={setAsCompleted}
                          key={purchase.id}
                          onClick={() => {
                            setToEdit(true), setSale(purchase);
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
                    Nínguna compra encontrada
                  </p>
                  <p className="font-medium text text-center mt-1">
                    Esto puede deberse a un error del servidor, o a que
                    simplemente no hay ningúna compra registrada.
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
      {purchases.length > 0 && loading == false && !toAdd && !toEdit && (
        <Pagination />
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}
