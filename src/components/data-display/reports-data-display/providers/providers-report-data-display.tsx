import { useEffect, useState } from "react";
import { ReactComponent as Truck } from "/src/assets/local_shipping.svg";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Add } from "/src/assets/add.svg";
import { ReactComponent as Trophy } from "/src/assets/trophy.svg";
import { useNavigate } from "react-router-dom";
import ProvidersReportService from "../../../../services/reports/providers-report-service";

export default function ProvidersReportDataDisplay() {
  const [proveedoresTotales, setProveedoresTotales] = useState(0);
  const [proveedoresNuevos, setProveedoresNuevos] = useState(0);
  const [topPorCantidad, setTopPorCantidad] = useState<any[]>([]);
  const [topPorTotal, setTopPorTotal] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    ProvidersReportService.getTotalAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setProveedoresTotales(Number(data));
      }
    });
    ProvidersReportService.getNewAsCount().then((data) => {
      if (!isNaN(Number(data))) {
        setProveedoresNuevos(Number(data));
      }
    });
    ProvidersReportService.getTopBySalesQuantity(1, 50).then((data) => {
      if (data === false) {
        return;
      } else {
        setTopPorCantidad(data.rows);
      }
    });
    ProvidersReportService.getTopBySalesAmount(1, 50).then((data) => {
        if (data === false) {
          return;
        } else {
          setTopPorTotal(data.rows);
        }
      });
  }, []);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Reportes
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Proveedores</span>
          </div>
          <div className="h-9"></div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        <div className="grid lg:grid-cols-4 grid-cols-3 gap-10 max-w-fit">
          <div
            onClick={() => {
              navigate("/reportes/proveedores/totales");
            }}
            className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow"
          >
            <div>
              <p className="text-white text-lg font-medium">
                {proveedoresTotales}
              </p>
              <p className="text-white text-lg font-medium">Totales</p>
            </div>
            <Truck className="h-10 w-10 fill-white" />
          </div>
          <div
            onClick={() => {
              navigate("/reportes/proveedores/nuevos");
            }}
            className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow"
          >
            <div>
              <p className="text-white text-lg font-medium">
                {proveedoresNuevos}
              </p>
              <p className="text-white text-lg font-medium">Nuevos</p>
            </div>
            <Add className="h-10 w-10 fill-white" />
          </div>
          <div
            onClick={() => {
              navigate("/reportes/proveedores/top-por-cantidad");
            }}
            className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow"
          >
            <div>
              <p className="text-white text-lg font-medium">
                {topPorCantidad.length}
              </p>
              <p className="text-white text-lg font-medium">Top por cantidad</p>
            </div>
            <Trophy className="h-10 w-10 fill-white" />
          </div>
          <div
            onClick={() => {
              navigate("/reportes/proveedores/top-por-total");
            }}
            className="bg-[#2096ed] hover:bg-[#1182d5] cursor-pointer h-28 w-60 rounded flex justify-between py-5 px-6 items-center shadow"
          >
            <div>
              <p className="text-white text-lg font-medium">
                {topPorTotal.length}
              </p>
              <p className="text-white text-lg font-medium">Top por total</p>
            </div>
            <Trophy className="h-10 w-10 fill-white" />
          </div>
        </div>
      </div>
    </>
  );
}
