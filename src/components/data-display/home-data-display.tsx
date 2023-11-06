import { useEffect, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Work } from "/src/assets/work.svg";
import { ReactComponent as Ticket } from "/src/assets/ticket-solid.svg";
import { ReactComponent as Article } from "/src/assets/article.svg";
import { ReactComponent as Category } from "/src/assets/reorder.svg";
import { ReactComponent as Store } from "/src/assets/store.svg";
import { ReactComponent as Truck } from "/src/assets/local_shipping.svg";
import { ReactComponent as Register } from "/src/assets/sale.svg";
import { ReactComponent as Cart } from "/src/assets/trolley.svg";
import { ReactComponent as Warning } from "/src/assets/warning.svg";
import { ReactComponent as Today } from "/src/assets/today.svg";
import ClientsReportService from "../../services/reports/clients-report-service";
import TicketsReportService from "../../services/reports/tickets-report-service";
import CategoriesReportService from "../../services/reports/categories-report-service";
import PublicationsReportService from "../../services/reports/publications-report-service";
import ProductsReportService from "../../services/reports/products-report-service";
import SalesReportService from "../../services/reports/sales-report-service";
import PurchasesReportService from "../../services/reports/purchases-report-service";
import ProvidersReportService from "../../services/reports/providers-report-service";
import { ReactComponent as Tag } from "/src/assets/tag.svg";
import { useNavigate } from "react-router-dom";
import MessagingOptionsService from "../../services/messaging-options-service";
import options from "../../utils/options";
import session from "../../utils/session";
import permissions from "../../utils/permissions";

export default function HomeDataDisplay() {
  const [clientes, setClientes] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [categorias, setCategorias] = useState(0);
  const [publicaciones, setPublicaciones] = useState(0);
  const [productos, setProductos] = useState(0);
  const [proveedores, setProveedores] = useState(0);
  const [ventas, setVentas] = useState(0);
  const [compras, setCompras] = useState(0);
  const [stockBajo, setStockBajo] = useState(0);
  const [sinStock, setSinStock] = useState(0);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [comprasHoy, setComprasHoy] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    ClientsReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setClientes(Number(data));
      }
    });
    TicketsReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setTickets(Number(data));
      }
    });
    CategoriesReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setCategorias(Number(data));
      }
    });
    PublicationsReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setPublicaciones(Number(data));
      }
    });
    ProductsReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setProductos(Number(data));
      }
    });
    SalesReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setVentas(Number(data));
      }
    });
    ProvidersReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setProveedores(Number(data));
      }
    });
    PurchasesReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setCompras(Number(data));
      }
    });
    SalesReportService.getTodayAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setVentasHoy(Number(data));
      }
    });
    PurchasesReportService.getTodayAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setComprasHoy(Number(data));
      }
    });
    ProductsReportService.getLowStockAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setStockBajo(Number(data));
      }
    });
    ProductsReportService.getZeroStockAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setSinStock(Number(data));
      }
    });
    MessagingOptionsService.get().then((data) => {
      if (data) {
        options.set(data.opciones);
      }
    });
  }, []);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Inicio</span>
          </div>
          <div className="h-9"></div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        <div className="mb-10 text-xl font-medium text-slate-600 text-end">
          Bienvenido al sistema,{" "}
          <span className="text-[#2096ed]">
            {session.find()?.usuario.rol.toLocaleLowerCase()}
          </span>{" "}
          {session.find()?.usuario.nombre +
            " " +
            session.find()?.usuario.apellido}
          !
        </div>
        <div className="grid lg:grid-cols-4 grid-cols-3 gap-10 max-w-fit mb-10">
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.venta ? (
            <div
              onClick={() => {}}
              className="bg-green-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{ventasHoy}</p>
                <p className="text-white text-lg font-medium">Ventas hoy</p>
              </div>
              <Today className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.compra ? (
            <div
              onClick={() => {}}
              className="bg-violet-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{comprasHoy}</p>
                <p className="text-white text-lg font-medium">Compras hoy </p>
              </div>
              <Today className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.producto ? (
            <div
              onClick={() => {}}
              className="bg-orange-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{stockBajo}</p>
                <p className="text-white text-lg font-medium">Stock bajo</p>
              </div>
              <Warning className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.producto ? (
            <div
              onClick={() => {}}
              className="bg-red-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{sinStock}</p>
                <p className="text-white text-lg font-medium">Cero stock</p>
              </div>
              <Warning className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
        </div>
        <div className="grid lg:grid-cols-4 grid-cols-3 gap-10 max-w-fit">
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.cliente ? (
            <div
              onClick={() => {
                navigate("/clientes");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{clientes}</p>
                <p className="text-white text-lg font-medium">Clientes</p>
              </div>
              <Work className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.ticket ? (
            <div
              onClick={() => {
                navigate("/tickets");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{tickets}</p>
                <p className="text-white text-lg font-medium">Tickets</p>
              </div>
              <Ticket className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.categoría ? (
            <div
              onClick={() => {
                navigate("/categorias");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{categorias}</p>
                <p className="text-white text-lg font-medium">Categorías</p>
              </div>
              <Category className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.publicación ? (
            <div
              onClick={() => {
                navigate("/publicaciones");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">
                  {publicaciones}
                </p>
                <p className="text-white text-lg font-medium">Publicaciones</p>
              </div>
              <Article className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.producto ? (
            <div
              onClick={() => {
                navigate("/productos");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{productos}</p>
                <p className="text-white text-lg font-medium">Productos</p>
              </div>
              <Store className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.proveedor ? (
            <div
              onClick={() => {
                navigate("/proveedores");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{proveedores}</p>
                <p className="text-white text-lg font-medium">Proveedores</p>
              </div>
              <Truck className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.venta ? (
            <div
              onClick={() => {
                navigate("/ventas");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{ventas}</p>
                <p className="text-white text-lg font-medium">Ventas</p>
              </div>
              <Register className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
          {session.find()?.usuario.rol === "ADMINISTRADOR" ||
          session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
          permissions.find()?.ver.compra ? (
            <div
              onClick={() => {
                navigate("/compras");
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <div>
                <p className="text-white text-lg font-medium">{compras}</p>
                <p className="text-white text-lg font-medium">Compras</p>
              </div>
              <Cart className="h-10 w-10 fill-white" />
            </div>
          ) : (
            <div
              onClick={() => {}}
              className="bg-gray-400 h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow transition ease-in-out delay-100 duration-300"
            >
              <Tag className="h-10 w-10 fill-white" />
              <div>
                <p className="text-white text-lg font-medium">No permitido</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
