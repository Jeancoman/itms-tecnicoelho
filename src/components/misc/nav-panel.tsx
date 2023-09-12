import { ReactComponent as Users } from "../../assets/group.svg";
import { ReactComponent as Work } from "../../assets/work.svg";
import { ReactComponent as Ticket } from "../../assets/ticket-solid.svg";
import { ReactComponent as Article } from "../../assets/article.svg";
import { ReactComponent as Library } from "../../assets/library.svg";
import { ReactComponent as Category } from "../../assets/category.svg";
import { ReactComponent as Envelopes } from "../../assets/send.svg";
import { ReactComponent as House } from "../../assets/home.svg";
import { ReactComponent as Store } from "../../assets/store.svg";
import { ReactComponent as Truck } from "../../assets/local_shipping.svg";
import { ReactComponent as Register } from "../../assets/sale.svg";
import { ReactComponent as Cart } from "../../assets/trolley.svg";
import { ReactComponent as Inventory } from "../../assets/inventory.svg";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Up } from "../../assets/chevron-up-solid.svg";
import { ReactComponent as Account } from "../../assets/account.svg";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function NavPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className="pt-7 h-full shadow-md bg-[#2096ed]">
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
        <div className="text-white font-semibold flex flex-col gap-0.5 pl-5">
          <NavLink
            to="/"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <House className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Inicio</p>
          </NavLink>
          <NavLink
            to="/usuarios"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Users className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Usuarios</p>
          </NavLink>
          <NavLink
            to="/clientes"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Work className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Clientes</p>
          </NavLink>
          <NavLink
            to="/tickets"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Ticket className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Tickets</p>
          </NavLink>
          <NavLink
            to="/publicaciones"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Article className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Publicaciones</p>
          </NavLink>
          <NavLink
            to="/productos"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Store className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Productos</p>
          </NavLink>
          <NavLink
            to="/proveedores"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Truck className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Proveedores</p>
          </NavLink>
          <NavLink
            to="/categorias"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Category className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Categorías</p>
          </NavLink>
          <div
            onClick={() => {
              setIsCollapsed(!isCollapsed);
            }}
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
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
                className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
              >
                <Register className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                <p>Ventas</p>
              </NavLink>
              <NavLink
                to="/compras"
                className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
              >
                <Cart className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
                <p>Compras</p>
              </NavLink>
            </div>
          ) : null}
          <NavLink
            to="/imagenes"
            className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Library className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Galería</p>
          </NavLink>
          <NavLink
            to="/mensajero"
            className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
          >
            <Envelopes className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Mensajero</p>
          </NavLink>
          <div className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg">
            <Account className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
            <p>Esta cuenta</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
