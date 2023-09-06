import { ReactComponent as Users } from "../../assets/users-solid.svg";
import { ReactComponent as User } from "../../assets/user-tie-solid.svg";
import { ReactComponent as Ticket } from "../../assets/ticket-solid.svg";
import { ReactComponent as Newspaper } from "../../assets/newspaper-solid.svg";
import { ReactComponent as Images } from "../../assets/images-solid.svg";
import { ReactComponent as List } from "../../assets/clipboard-list-solid.svg";
import { ReactComponent as Envelopes } from "../../assets/envelopes-bulk-solid.svg";
import { ReactComponent as House } from "../../assets/house-solid.svg";
import { ReactComponent as Gifts } from "../../assets/gifts-solid.svg";
import { ReactComponent as Truck } from "../../assets/truck-solid.svg";
import { ReactComponent as Register } from "../../assets/cash-register-solid.svg";
import { ReactComponent as Cart } from "../../assets/cart-shopping-solid.svg";
import { NavLink } from "react-router-dom";

export default function NavPanel() {
  return (
    <aside className="pl-5 pt-5">
      <div className="text-white font-semibold flex flex-col gap-1">
        <NavLink
          to="/"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <House className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Inicio</p>
        </NavLink>
        <NavLink
          to="/clientes"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <User className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p className="group-hover/parent:font-bold">Clientes</p>
        </NavLink>
        <NavLink
          to="/usuarios"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Users className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Usuarios</p>
        </NavLink>
        <NavLink
          to="/tickets"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Ticket className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Tickets</p>
        </NavLink>
        <NavLink
          to="/productos"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Gifts className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
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
        <NavLink
          to="/categorias"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <List className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Categorías</p>
        </NavLink>
        <NavLink
          to="/publicaciones"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Newspaper className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Publicaciones</p>
        </NavLink>
        <NavLink
          to="/imagenes"
          className="group/parent flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Images className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Imagenes</p>
        </NavLink>
        <NavLink
          to="/mensajero"
          className="group/parent justify-self-end	flex gap-3 items-center cursor-pointer hover:bg-white hover:text-[#2096ed] p-2 rounded-l-lg"
        >
          <Envelopes className="h-6 w-6 fill-white group-hover/parent:fill-[#2096ed]" />
          <p>Mensajero</p>
        </NavLink>
      </div>
    </aside>
  );
}
