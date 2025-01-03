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
import { ReactComponent as Bank } from "/src/assets/bank.svg";
import { ReactComponent as Help } from "/src/assets/help.svg";
import { ReactComponent as Roles } from "/src/assets/roles.svg";
import { ReactComponent as Settings } from "/src/assets/settings.svg";
import { ReactComponent as Timeline } from "/src/assets/timeline.svg";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import {
  useColapsableInventoryStore,
  useColapsableSettingsStore,
} from "../../store/colapsableStore";
import {
  useCategorySearchParamStore,
  useClientSearchParamStore,
  useMessageSearchParamStore,
  useProductSearchParamStore,
  useProviderSearchParamStore,
  usePublicationSearchParamStore,
  usePurchaseSearchParamStore,
  useSaleSearchParamStore,
  useTicketSearchParamStore,
  useUserSearchParamStore,
} from "../../store/searchParamStore";
import options from "../../utils/options";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Asset, ModalProps } from "../../types";
import { useFunctionStore } from "../../store/functionStore";
import Pagination from "./pagination";
import RespaldoService from "../../services/respaldo-service";

function RestaurationModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [backups, setBackups] = useState<Asset[]>([]);
  const [fetched, setFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBackups, setFilteredBackups] = useState(backups);
  const [currentPage, setCurrentPage] = useState(1);
  const backupsPerPage = 5;

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
    } else {
      closeModal();
      ref.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = backups.filter((backup) =>
      backup.public_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBackups(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchTerm, backups]);

  useEffect(() => {
    if (!fetched) {
      RespaldoService.getAll().then((data) => {
        setBackups(data);
      });
      setFetched(true);
    }
  });

  const handleCreateBackup = async () => {
    await RespaldoService.create();
    setFetched(false);
  };

  const handleRestoreBackup = async (id: string) => {
    await RespaldoService.restore(id);
  };

  const handleDeleteBackup = async (id: string) => {
    await RespaldoService.delete(id);
    setFetched(false);
  };

  const paginatedBackups = filteredBackups.slice(
    (currentPage - 1) * backupsPerPage,
    currentPage * backupsPerPage
  );

  const totalPages = Math.ceil(filteredBackups.length / backupsPerPage);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (
          e.clientX < dialogDimensions!.left ||
          e.clientX > dialogDimensions!.right ||
          e.clientY < dialogDimensions!.top ||
          e.clientY > dialogDimensions!.bottom
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-full max-w-lg rounded-xl shadow-lg text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8 text-white">
        <h1 className="text-xl font-bold">Restauración</h1>
      </div>
      <div className="p-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar respaldo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="button"
            onClick={handleCreateBackup}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Crear
          </button>
        </div>
        <ul className="divide-y divide-gray-200 mb-4">
          {paginatedBackups.map((backup) => (
            <li
              key={backup.asset_id}
              className="flex justify-between items-center py-2"
            >
              <span>{backup.public_id.substring(9)}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRestoreBackup(backup.public_id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBackup(backup.public_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          current={currentPage}
          pages={totalPages}
          next={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          prev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function NavPanel() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navPanelRef = useRef<HTMLBaseElement>(null);

  const isInventoryColapsed = useColapsableInventoryStore(
    (state) => state.isColapsed
  );
  const toggleInventory = useColapsableInventoryStore((state) => state.toggle);

  const isSettingsColapsed = useColapsableSettingsStore(
    (state) => state.isColapsed
  );
  const toggleSettings = useColapsableSettingsStore((state) => state.toggle);

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
  const resetTicketSearchCount = useTicketSearchParamStore(
    (state) => state.resetSearchCount
  );
  const resetMessageSearchCount = useMessageSearchParamStore(
    (state) => state.resetSearchCount
  );
  const setFunction = useFunctionStore((state) => state.setFunction);

  const resetAllSearchs = () => {
    resetProductSearchCount();
    resetTicketSearchCount();
    resetClientSearchCount();
    resetSaleSearchCount();
    resetPurchaseSearchCount();
    resetCategorySearchCount();
    resetProviderSearchCount();
    resetPublicationSearchCount();
    resetUserSearchCount();
    resetMessageSearchCount();
  };

  useEffect(() => {
    setFunction(resetAllSearchs);
  });

  useEffect(() => {
    if (
      (location.pathname.includes("ventas") ||
        location.pathname.includes("compras") ||
        location.pathname.includes("productos") ||
        location.pathname.includes("historico")) &&
      isInventoryColapsed === false
    ) {
      toggleInventory();
    }
    if (
      (location.pathname.includes("roles") ||
        location.pathname.includes("impuestos") ||
        location.pathname.includes("mensajeria")) &&
      isSettingsColapsed === false
    ) {
      toggleSettings();
    }
  }, [location]);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    // Verificar si el toque inicial está en los primeros 20px del borde izquierdo
    if (touch.clientX < 20) {
      //@ts-ignore
      navPanelRef.current = { startX: touch.clientX };
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    //@ts-ignore
    const deltaX = touch.clientX - navPanelRef?.current?.startX;
    if (deltaX > 50) {
      setIsNavOpen(true);
    }
  };

  const handleTouchEnd = () => {
    //@ts-ignore
    navPanelRef.current = null;
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Overlay for small screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${
          isNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={() => setIsNavOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 shadow-md bg-[#2096ed] select-none z-40 transform transition-transform ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:w-64 flex flex-col`}
        ref={navPanelRef}
      >
        <div className="px-5 pt-7">
          <div className="font-bold text-white text-lg flex gap-2 items-center -mt-1">
            <img
              className="h-8 w-8 object-cover"
              src="/assets/logo.png"
              alt="Logo de TecniCoelho"
              draggable="false"
            />
            <p className="cursor-default uppercase">Tecnicoelho</p>
          </div>
        </div>

        <hr className="my-5 mx-5" />
        <div className="flex-1 overflow-y-auto">
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
            {permissions.find()?.ver.usuario ? (
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
            {permissions.find()?.ver.cliente ? (
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
            {permissions.find()?.ver.proveedor ? (
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
            {permissions.find()?.ver.ticket ? (
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
            {permissions.find()?.ver.venta ||
            permissions.find()?.ver.compra ||
            permissions.find()?.ver.producto ? (
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
                {permissions.find()?.ver.producto ? (
                  <NavLink
                    to="/productos"
                    onClick={resetAllSearchs}
                    className={clsx({
                      ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        !location.pathname.includes("productos"),
                      ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
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
                {permissions.find()?.ver.producto ? (
                  <NavLink
                    to="/historico"
                    onClick={resetAllSearchs}
                    className={clsx({
                      ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        !location.pathname.includes("historico"),
                      ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        location.pathname.includes("historico"),
                    })}
                  >
                    <Timeline
                      className={clsx({
                        ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                          !location.pathname.includes("historico"),
                        ["h-6 w-6 fill-[#2096ed]"]:
                          location.pathname.includes("historico"),
                      })}
                    />
                    <p>Historico</p>
                  </NavLink>
                ) : (
                  <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
                    <Tag className="h-6 w-6 fill-white " />
                    <p>No permitido</p>
                  </div>
                )}
                {permissions.find()?.ver.venta ? (
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
                {permissions.find()?.ver.compra ? (
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
            {permissions.find()?.ver.categoría ? (
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
            {permissions.find()?.ver.imagen ? (
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
            {permissions.find()?.ver.publicación ? (
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
            {permissions.find()?.ver.restauracion ||
            permissions.find()?.ver.impuesto ||
            permissions.find()?.ver.rol ||
            permissions.find()?.ver.mensajería ? (
              <div
                onClick={toggleSettings}
                className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
              >
                <Settings className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                <p className="mr-1">Configuración</p>
                {isSettingsColapsed ? (
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
            {isSettingsColapsed ? (
              <div className="pl-3">
                {permissions.find()?.ver.mensajería && (
                  <NavLink
                    to="/mensajeria"
                    onClick={resetAllSearchs}
                    className={clsx({
                      ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        !location.pathname.includes("mensajeria"),
                      ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
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
                {permissions.find()?.ver.rol ? (
                  <NavLink
                    to="/roles"
                    onClick={resetAllSearchs}
                    className={clsx({
                      ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        !location.pathname.includes("roles"),
                      ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        location.pathname.includes("roles"),
                    })}
                  >
                    <Roles
                      className={clsx({
                        ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                          !location.pathname.includes("roles"),
                        ["h-6 w-6 fill-[#2096ed]"]:
                          location.pathname.includes("roles"),
                      })}
                    />
                    <p>Roles</p>
                  </NavLink>
                ) : (
                  <div className="group/parent flex gap-3 items-center  p-2 rounded-lg">
                    <Tag className="h-6 w-6 fill-white " />
                    <p>No permitido</p>
                  </div>
                )}
                {permissions.find()?.ver.impuesto ? (
                  <NavLink
                    to="/impuestos"
                    onClick={resetAllSearchs}
                    className={clsx({
                      ["group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        !location.pathname.includes("impuestos"),
                      ["flex gap-3 items-center cursor-pointer bg-white text-[#2096ed] p-2 rounded-lg mb-0.5"]:
                        location.pathname.includes("impuestos"),
                    })}
                  >
                    <Bank
                      className={clsx({
                        ["h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]"]:
                          !location.pathname.includes("impuestos"),
                        ["h-6 w-6 fill-[#2096ed]"]:
                          location.pathname.includes("impuestos"),
                      })}
                    />
                    <p>Impuestos</p>
                  </NavLink>
                ) : (
                  <div className="group/parent flex gap-3 items-center p-2 rounded-lg">
                    <Tag className="h-6 w-6 fill-white " />
                    <p>No permitido</p>
                  </div>
                )}
                {permissions.find()?.crear.restauracion ? (
                  <div
                    onClick={() => setIsOpen(true)}
                    className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg mb-0.5"
                  >
                    <Backup className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                    <p className="mr-8">Restauración</p>
                  </div>
                ) : (
                  <div className="group/parent flex gap-3 items-center p-2 rounded-lg">
                    <Tag className="h-6 w-6 fill-white " />
                    <p>No permitido</p>
                  </div>
                )}
              </div>
            ) : null}
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
    </>
  );
}
