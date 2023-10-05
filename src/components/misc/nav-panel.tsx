import { ReactComponent as Users } from "/src/assets/group.svg";
import { ReactComponent as Work } from "/src/assets/work.svg";
import { ReactComponent as Ticket } from "/src/assets/ticket-solid.svg";
import { ReactComponent as Article } from "/src/assets/article.svg";
import { ReactComponent as Category } from "/src/assets/reorder.svg";
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
import { NavLink, useNavigate } from "react-router-dom";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import { useColapsableInventoryStore } from "../../store/colapsableStore";
import { useCategorySearchParamStore, useClientSearchParamStore, useOperationSearchParamStore, useProblemSearchParamStore, useProductSearchParamStore, useProviderSearchParamStore, usePublicationSearchParamStore, usePurchaseSearchParamStore, useSaleSearchParamStore, useServiceSearchParamStore, useTicketSearchParamStore, useUserSearchParamStore } from "../../store/searchParamStore";
import options from "../../utils/options";

export default function NavPanel() {
  const isInventoryColapsed = useColapsableInventoryStore(
    (state) => state.isColapsed
  );
  const toggleInventory = useColapsableInventoryStore((state) => state.toggle);
  const navigate = useNavigate();
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

  const reset = () => {
    resetProductSearchCount()
    resetProblemSearchCount()
    resetServiceSearchCount()
    resetClientSearchCount()
    resetTicketSearchCount()
    resetOperationSearchCount()
    resetSaleSearchCount()
    resetPurchaseSearchCount()
    resetCategorySearchCount()
    resetProviderSearchCount()
    resetPublicationSearchCount()
    resetUserSearchCount()
  }

  return (
    <aside className="pt-7 h-full shadow-md bg-[#2096ed] select-none">
      <div className="font-bold text-white text-lg pl-6 flex gap-2 items-center">
        <img
          className="h-8 w-8 object-cover"
          src="/assets/logo.png"
          alt="Logo de TecniCoelho"
          draggable="false"
        />
        <p className="cursor-default uppercase">Tecnicoelho</p>
      </div>
      <hr className="my-4 mx-5" />
      <div className="max-h-[568px] scrollbar-none overflow-auto pb-5">
        <div className="text-white font-semibold flex flex-col gap-0.5 px-5">
          <NavLink
            to="/"
            onClick={reset}
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <House className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Inicio</p>
          </NavLink>
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ? (
            <NavLink
              to="/usuarios"
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Users className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Work className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Ticket className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Store className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Truck className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
          permissions.find()?.ver.publicación ? (
            <NavLink
              to="/publicaciones"
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Article className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
              onClick={reset}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Category className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Categorías</p>
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
                  onClick={reset}
                  className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
                >
                  <Register className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
                  onClick={reset}
                  className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
                >
                  <Cart className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
          {/*
          <NavLink
            to="/galeria"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Library className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Galería</p>
          </NavLink>
          <NavLink
            to="/mensajeria"
            className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Envelopes className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Mensajería</p>
          </NavLink>
          <div className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg">
            <Account className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Este usuario</p>
          </div>
          */}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
            permissions.find()?.ver.mensajería) && (
            <NavLink
              to="/mensajeria"
              onClick={reset}
              className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Envelopes className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Mensajería</p>
            </NavLink>
          )}
          <div
            onClick={() => {
              session.revoke();
              permissions.revoke();
              options.revoke()
              navigate("/entrar");
            }}
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Logout className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Cerrar sesión</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
