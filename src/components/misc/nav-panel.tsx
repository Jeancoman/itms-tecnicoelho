import { ReactComponent as Users } from "/public/assets/group.svg";
import { ReactComponent as Work } from "/public//assets/work.svg";
import { ReactComponent as Ticket } from "/public//assets/ticket-solid.svg";
import { ReactComponent as Article } from "/public//assets/article.svg";
import { ReactComponent as Library } from "/public//assets/library.svg";
import { ReactComponent as Category } from "/public//assets/category.svg";
import { ReactComponent as Envelopes } from "/public//assets/send.svg";
import { ReactComponent as House } from "/public//assets/home.svg";
import { ReactComponent as Store } from "/public//assets/store.svg";
import { ReactComponent as Truck } from "/public//assets/local_shipping.svg";
import { ReactComponent as Register } from "/public//assets/sale.svg";
import { ReactComponent as Cart } from "/public//assets/trolley.svg";
import { ReactComponent as Inventory } from "/public//assets/inventory.svg";
import { ReactComponent as Down } from "/public//assets/chevron-down-solid.svg";
import { ReactComponent as Up } from "/public//assets/chevron-up-solid.svg";
import { ReactComponent as Account } from "/public/assets/account.svg";
import { ReactComponent as Logout } from "/public/assets/logout.svg";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function NavPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className="pt-7 h-full shadow-md bg-[#2096ed] select-none">
      <div className="font-bold text-white text-2xl pl-6 flex gap-2 items-center">
        <img
          className="h-9 w-9 object-cover"
          src="/assets/logo.png"
          alt="Logo de TecniCoelho"
          draggable="false"
        />
        <p className="cursor-default">ITMS</p>
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
          <NavLink
            to="/usuarios"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Users className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Usuarios</p>
          </NavLink>
          <NavLink
            to="/clientes"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Work className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Clientes</p>
          </NavLink>
          <NavLink
            to="/tickets"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Ticket className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Tickets</p>
          </NavLink>
          <NavLink
            to="/publicaciones"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Article className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Publicaciones</p>
          </NavLink>
          <NavLink
            to="/productos"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Store className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Productos</p>
          </NavLink>
          <NavLink
            to="/proveedores"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Truck className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Proveedores</p>
          </NavLink>
          <NavLink
            to="/categorias"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
          >
            <Category className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Categorías</p>
          </NavLink>
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
          {isCollapsed ? (
            <div className="pl-3">
              <NavLink
                to="/ventas"
                className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
              >
                <Register className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                <p>Ventas</p>
              </NavLink>
              <NavLink
                to="/compras"
                className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg"
              >
                <Cart className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                <p>Compras</p>
              </NavLink>
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
          <div className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-lg">
            <Logout className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Cerrar sesión</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
