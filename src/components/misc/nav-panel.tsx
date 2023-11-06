import { ReactComponent as Users } from "/src/assets/group.svg";
import { ReactComponent as Work } from "/src/assets/work.svg";
import { ReactComponent as Ticket } from "/src/assets/ticket-solid.svg";
import { ReactComponent as Article } from "/src/assets/article.svg";
import { ReactComponent as Category } from "/src/assets/list_alt.svg";
import { ReactComponent as Store } from "/src/assets/store.svg";
import { ReactComponent as Truck } from "/src/assets/local_shipping.svg";
import { ReactComponent as Register } from "/src/assets/sale.svg";
import { ReactComponent as Cart } from "/src/assets/trolley.svg";
import { ReactComponent as Inventory } from "/src/assets/inventory.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Up } from "/src/assets/chevron-up-solid.svg";
import { ReactComponent as Logout } from "/src/assets/logout.svg";
import { ReactComponent as Envelopes } from "/src/assets/envelopes-bulk-solid.svg";
import { ReactComponent as House } from "/src/assets/home.svg";
import { ReactComponent as Tag } from "/src/assets/tag.svg";
import { ReactComponent as Library } from "/src/assets/library.svg";
import { ReactComponent as Backup } from "/src/assets/backup.svg";
import { ReactComponent as Check } from "/src/assets/check_circle.svg";
import { ReactComponent as Error } from "/src/assets/error.svg";
import { ReactComponent as Help } from "/src/assets/help.svg";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import { useColapsableInventoryStore } from "../../store/colapsableStore";
import {
  useCategorySearchParamStore,
  useClientSearchParamStore,
  useElementSearchParamStore,
  useMessageSearchParamStore,
  useOperationSearchParamStore,
  useProblemSearchParamStore,
  useProductSearchParamStore,
  useProviderSearchParamStore,
  usePublicationSearchParamStore,
  usePurchaseSearchParamStore,
  useSaleSearchParamStore,
  useServiceSearchParamStore,
  useTicketSearchParamStore,
  useUserSearchParamStore,
} from "../../store/searchParamStore";
import options from "../../utils/options";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ModalProps } from "../../types";
import toast from "react-hot-toast";
import { useFunctionStore } from "../../store/functionStore";

function RestaurationModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      reset();
    }
  }, [isOpen]);

  const reset = () => {
    if (isSuccess || isError) {
      setIsError(false);
      setIsSuccess(false);
      setIsImporting(false);
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const toastId = toast.loading("Exportando datos...");
      closeModal();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/backup/exportar`
      );
      const blob = await response.blob();

      toast.dismiss(toastId);

      let fileName = "copia-de-seguridad-" + new Date().toISOString() + ".json";

      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch?.length === 2) fileName = fileNameMatch?.[1];
      }

      let urlBlob = window.URL.createObjectURL(blob);
      let linkTempDownload = document.createElement("a");
      linkTempDownload.href = urlBlob;
      linkTempDownload.download = fileName;
      document.body.appendChild(linkTempDownload);
      linkTempDownload.click();
      document.body.removeChild(linkTempDownload);
    } catch (error) {
      console.error("Hubo un error al descargar el archivo: ", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const input = event?.target as HTMLInputElement;
      const file = input?.files?.[0];
      const formData = new FormData();

      formData.append("file", file!);

      setIsImporting(true);
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/backup/importar`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setIsLoading(false);
        setIsSuccess(true);
      } else {
        setIsLoading(false);
        setIsError(true);
      }
    } catch {
      console.error("");
    }
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
      className="w-96 h-fit rounded-xl shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Restauración</h1>
      </div>
      <div className="flex flex-col p-8 pt-6 justify-center">
        {isImporting === true ? (
          <>
            {isLoading === true ? (
              <div className="flex flex-col items-center gap-2">
                <div className="grid w-full h-4/5">
                  <div className="place-self-center">
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="inline w-20 h-20 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
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
                <p className="font-medium">Importando datos...</p>
              </div>
            ) : null}
            {isError === true ? (
              <div className="flex flex-col items-center gap-2">
                <div className="grid w-full h-4/5">
                  <Error className="place-self-center h-24 w-24 fill-red-400" />
                </div>
                <p className="font-medium">Error importando datos</p>
              </div>
            ) : null}
            {isSuccess === true ? (
              <div className="flex flex-col items-center gap-2">
                <div className="grid w-full h-4/5">
                  <Check className="place-self-center h-24 w-24 fill-green-400" />
                </div>
                <p className="font-medium">
                  Los datos fueron importados exitosamente
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col gap-4 justify-center items-center">
            <div>
              <button
                type="button"
                onClick={handleExport}
                className="outline-none bg-red-400 font-semibold rounded-lg py-2 px-4 hover:bg-red-500 text-white transition ease-in-out delay-100 duration-300 w-full"
              >
                Exportar copia de seguridad
              </button>
            </div>
            <div className="items-center justify-center bg-grey-lighter cursor-pointer">
              <label className="outline-none bg-green-400 font-semibold rounded-lg py-2 px-4 hover:bg-green-500 text-white transition ease-in-out delay-100 duration-300 w-full">
                <span className="mt-2 text-base leading-normal">
                  Importar copia de seguridad
                </span>
                <input type="file" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-center mt-6">
          <button
            type="button"
            onClick={() => {
              closeModal();
              reset();
            }}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function NavPanel() {
  const isInventoryColapsed = useColapsableInventoryStore(
    (state) => state.isColapsed
  );
  const toggleInventory = useColapsableInventoryStore((state) => state.toggle);
  const navigate = useNavigate();
  let location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const resetTicketSearchCount = useTicketSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetProductSearchCount = useProductSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetClientSearchCount = useClientSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetUserSearchCount = useUserSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetProviderSearchCount = useProviderSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetCategorySearchCount = useCategorySearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetPublicationSearchCount = usePublicationSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetSaleSearchCount = useSaleSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetPurchaseSearchCount = usePurchaseSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetProblemSearchCount = useProblemSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetServiceSearchCount = useServiceSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetOperationSearchCount = useOperationSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetElementSearchCount = useElementSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetMessageSearchCount = useMessageSearchParamStore(
    (state) => state.resetSearchCount
  );
  const setFunction = useFunctionStore((state) => state.setFunction)

  const resetAllSearchs = () => {
    resetProductSearchCount();
    resetProblemSearchCount();
    resetServiceSearchCount();
    resetClientSearchCount();
    resetTicketSearchCount();
    resetOperationSearchCount();
    resetSaleSearchCount();
    resetPurchaseSearchCount();
    resetCategorySearchCount();
    resetProviderSearchCount();
    resetPublicationSearchCount();
    resetUserSearchCount();
    resetMessageSearchCount();
    resetElementSearchCount();
  };

  useEffect(() => {
    setFunction(resetAllSearchs)
  })

  useEffect(() => {
    if (
      (location.pathname.includes("ventas") ||
        location.pathname.includes("compras")) &&
      isInventoryColapsed === false
    ) {
      toggleInventory();
    }
  }, [location]);

  return (
    <aside className="pt-7 h-full shadow-md bg-[#2096ed] select-none">
      <div className="font-bold text-white text-lg pl-6 flex gap-2 items-center -mt-1">
        <img
          className="h-8 w-8 object-cover"
          src="/assets/logo.png"
          alt="Logo de TecniCoelho"
          draggable="false"
        />
        <p className="cursor-default uppercase">Tecnicoelho</p>
      </div>
      <hr className="my-5 mx-5" />
      <div className="max-h-[568px] scrollbar-none overflow-auto pb-5">
        <div className="text-white font-semibold flex flex-col gap-0.5 px-5">
          <NavLink
            to="/"
            onClick={resetAllSearchs}
            className={clsx({
              ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                location.pathname !== "/",
              ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                location.pathname === "/",
            })}
          >
            <House
              className={clsx({
                ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                  location.pathname !== "/",
                ["h-6 w-6 fill-[#2096ed]"]: location.pathname === "/",
              })}
            />
            <p>Inicio</p>
          </NavLink>
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ? (
            <NavLink
              to="/usuarios"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("usuarios"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("usuarios"),
              })}
            >
              <Users
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("usuarios"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("usuarios"),
                })}
              />
              <p>Usuarios</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.cliente ? (
            <NavLink
              to="/clientes"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("clientes"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("clientes"),
              })}
            >
              <Work
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("clientes"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("clientes"),
                })}
              />
              <p>Clientes</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.ticket ? (
            <NavLink
              to="/tickets"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("tickets"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("tickets"),
              })}
            >
              <Ticket
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("tickets"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("tickets"),
                })}
              />
              <p>Tickets</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.producto ? (
            <NavLink
              to="/productos"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("productos"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("productos"),
              })}
            >
              <Store
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("productos"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("productos"),
                })}
              />
              <p>Productos</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.proveedor ? (
            <NavLink
              to="/proveedores"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("proveedores"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("proveedores"),
              })}
            >
              <Truck
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("proveedores"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("proveedores"),
                })}
              />
              <p>Proveedores</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.imagen ? (
            <NavLink
              to="/galeria"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("galeria"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("galeria"),
              })}
            >
              <Library
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("galeria"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("galeria"),
                })}
              />
              <p>Galería</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.venta ||
          permissions.find()?.ver.compra ? (
            <div
              onClick={toggleInventory}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Inventory className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p className="mr-8">Inventario</p>
              {isInventoryColapsed ? (
                <Up className="h-3 w-3 fill-white group-hover/parent:fill-[#2096ed]" />
              ) : (
                <Down className="h-3 w-3 fill-white group-hover/parent:fill-[#2096ed]" />
              )}
            </div>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {isInventoryColapsed ? (
            <div className="pl-3">
              {session.find()?.usuario.rol === "ADMINISTRADOR" ||
              session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
              permissions.find()?.ver.venta ? (
                <NavLink
                  to="/ventas"
                  onClick={resetAllSearchs}
                  className={clsx({
                    ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                      !location.pathname.includes("ventas"),
                    ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                      location.pathname.includes("ventas"),
                  })}
                >
                  <Register
                    className={clsx({
                      ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                        !location.pathname.includes("ventas"),
                      ["h-6 w-6 fill-[#2096ed]"]:
                        location.pathname.includes("ventas"),
                    })}
                  />
                  <p>Ventas</p>
                </NavLink>
              ) : (
                <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
                  <Tag className="h-6 w-6 fill-white " />
                  <p>No permitido</p>
                </div>
              )}
              {session.find()?.usuario.rol === "ADMINISTRADOR" ||
              session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
              permissions.find()?.ver.compra ? (
                <NavLink
                  to="/compras"
                  onClick={resetAllSearchs}
                  className={clsx({
                    ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                      !location.pathname.includes("compras"),
                    ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                      location.pathname.includes("compras"),
                  })}
                >
                  <Cart
                    className={clsx({
                      ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                        !location.pathname.includes("compras"),
                      ["h-6 w-6 fill-[#2096ed]"]:
                        location.pathname.includes("compras"),
                    })}
                  />
                  <p>Compras</p>
                </NavLink>
              ) : (
                <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
                  <Tag className="h-6 w-6 fill-white " />
                  <p>No permitido</p>
                </div>
              )}
            </div>
          ) : null}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.publicación ? (
            <NavLink
              to="/publicaciones"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("publicaciones"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("publicaciones"),
              })}
            >
              <Article
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("publicaciones"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("publicaciones"),
                })}
              />
              <p>Publicaciones</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.categoría ? (
            <NavLink
              to="/categorias"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("categorias"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("categorias"),
              })}
            >
              <Category
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("categorias"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("categorias"),
                })}
              />
              <p>Categorías</p>
            </NavLink>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
            permissions.find()?.ver.mensajería) && (
            <NavLink
              to="/mensajeria"
              onClick={resetAllSearchs}
              className={clsx({
                ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"]:
                  !location.pathname.includes("mensajeria"),
                ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg"]:
                  location.pathname.includes("mensajeria"),
              })}
            >
              <Envelopes
                className={clsx({
                  ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                    !location.pathname.includes("mensajeria"),
                  ["h-6 w-6 fill-[#2096ed]"]:
                    location.pathname.includes("mensajeria"),
                })}
              />
              <p>Mensajería</p>
            </NavLink>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ? (
            <div
              onClick={() => setIsOpen(true)}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Backup className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p className="mr-8">Restauración</p>
            </div>
          ) : (
            <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
              <Tag className="h-6 w-6 fill-white " />
              <p>No permitido</p>
            </div>
          )}
          <div
            onClick={() =>
              window.open(`${window.location.origin}/manual_de_usuario.pdf`)
            }
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Help className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Ayuda</p>
          </div>
          <div
            onClick={() => {
              session.revoke();
              permissions.revoke();
              options.revoke();
              navigate("/entrar");
            }}
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Logout className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Cerrar sesión</p>
          </div>
        </div>
      </div>
      <RestaurationModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        setOperationAsCompleted={() => {}}
      />
    </aside>
  );
}
