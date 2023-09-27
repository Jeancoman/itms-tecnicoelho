import { ReactComponent as Users } from "/src/assets/group.svg";
import { ReactComponent as Work } from "/src/assets/work.svg";
import { ReactComponent as Ticket } from "/src/assets/ticket-solid.svg";
import { ReactComponent as Article } from "/src/assets/article.svg";
import { ReactComponent as Category } from "/src/assets/category.svg";
import { ReactComponent as Store } from "/src/assets/store.svg";
import { ReactComponent as Truck } from "/src/assets/local_shipping.svg";
import { ReactComponent as Register } from "/src/assets/sale.svg";
import { ReactComponent as Cart } from "/src/assets/trolley.svg";
import { ReactComponent as Inventory } from "/src/assets/inventory.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Up } from "/src/assets/chevron-up-solid.svg";
import { ReactComponent as Logout } from "/src/assets/logout.svg";
import { ReactComponent as Envelopes } from "/src/assets/envelopes-bulk-solid.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import session from "../../utils/session";
import permissions from "../../utils/permissions";

export default function NavPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

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
          {/*
          <NavLink
            to="/"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <House className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Inicio</p>
          </NavLink>
          */}
          {session.find()?.usuario.rol === "ADMINISTRADOR" && (
            <NavLink
              to="/usuarios"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Users className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Usuarios</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.cliente) && (
            <NavLink
              to="/clientes"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Work className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Clientes</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.ticket) && (
            <NavLink
              to="/tickets"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Ticket className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Tickets</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.publicación) && (
            <NavLink
              to="/publicaciones"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Article className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Publicaciones</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.producto) && (
            <NavLink
              to="/productos"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Store className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Productos</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.proveedor) && (
            <NavLink
              to="/proveedores"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Truck className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Proveedores</p>
            </NavLink>
          )}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.venta ||
            permissions.find()?.ver.compra) && (
            <div
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Inventory className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p className="mr-8">Inventario</p>
              {isCollapsed ? (
                <Up className="h-3 w-3 fill-white group-hover/parent:fill-[#2096ed]" />
              ) : (
                <Down className="h-3 w-3 fill-white group-hover/parent:fill-[#2096ed]" />
              )}
            </div>
          )}
          {isCollapsed ? (
            <div className="pl-3">
              {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
                permissions.find()?.ver.venta) && (
                <NavLink
                  to="/ventas"
                  className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
                >
                  <Register className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                  <p>Ventas</p>
                </NavLink>
              )}
              {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
                permissions.find()?.ver.compra) && (
                <NavLink
                  to="/compras"
                  className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
                >
                  <Cart className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                  <p>Compras</p>
                </NavLink>
              )}
            </div>
          ) : null}
          {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
            permissions.find()?.ver.categoría) && (
            <NavLink
              to="/categorias"
              className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Category className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Categorías</p>
            </NavLink>
          )}
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
            permissions.find()?.ver.mensajería) && (
            <NavLink
              to="/mensajeria"
              className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
            >
              <Envelopes className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
              <p>Mensajería</p>
            </NavLink>
          )}
          <div
            onClick={() => {
              session.revoke();
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
