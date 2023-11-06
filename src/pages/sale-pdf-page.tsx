import { useNavigate, useParams } from "react-router-dom";
import { Venta } from "../types";
import SaleService from "../services/sales-service";
import { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { format } from "date-fns";
import { useFunctionStore } from "../store/functionStore";

export default function SalePDFPage() {
  const { id } = useParams();
  const [venta, setVenta] = useState<Venta>();
  const { toPDF, targetRef } = usePDF({ filename: `factura-${venta?.id}-${venta?.fecha ? format(new Date(venta?.fecha), "dd/MM/yyyy") : ""}.pdf` });
  const navigate = useNavigate();
  const resetAllSearchs = useFunctionStore((state) => state.resetAllSearchs);

  useEffect(() => {
    SaleService.getById(Number(id)).then((data) => {
      if (data) {
        setVenta(data);
      }
    });
  }, []);

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.venta
      ) {
        navigate("/");
      }
    }
  });

  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
  });

  if (!session.find()) {
    return null;
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.venta
    ) {
      return null;
    }
  }

  return (
    <>
      <div className="absolute left-[45%] top-10 flex gap-4 justify-items-center">
        <button
          type="button"
          onClick={() => {
            resetAllSearchs()
            navigate("/ventas")
          }}
          className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
        >
          Volver
        </button>
        <button
          onClick={() => toPDF()}
          className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
        >
          Descargar factura
        </button>
      </div>
      <main
        ref={targetRef}
        className="bg-white w-[11in] h-[8.5in] mx-auto p-[1.25in]"
      >
        <div className="mb-8">
          <div className="grid grid-cols-2">
            <div>
              <img
                src="/assets/logo-completo.png"
                className="w-72 mb-4 -ml-3"
              />
              <h5 className="font-mono text-gray-600">
                NOMBRE: {venta?.cliente?.nombre} {venta?.cliente?.apellido}
              </h5>
              <h5 className="font-mono text-gray-600">
                DOCUMENTO: {venta?.cliente?.documento}
              </h5>
              <h5 className="font-mono text-gray-600">
                TELF: {venta?.cliente?.telefono}
              </h5>
              <h5 className="font-mono text-gray-600">
                DIR: {venta?.cliente?.dirección}
              </h5>
            </div>
            <div className="font-mono text-right">
              <h3 className="font-bold capitalize text-xl">TECNICOELHO</h3>
              <h5 className="font-mono text-gray-600">J-80065323-0</h5>
              <h5 className="font-mono text-gray-600">
                TELF: +58 0426-2452374
              </h5>
              <h5 className="mt-8 font-mono text-gray-600">
                FACTURA: {venta?.id}
              </h5>
              <h5 className="font-mono text-gray-600">
                FECHA: {venta?.fecha ? format(new Date(venta?.fecha), "dd/MM/yyyy") : ""}
              </h5>
            </div>
          </div>
        </div>
        <table className="w-full mb-12 font-mono">
          <tr>
            <td className="font-bold">CÓDIGO</td>
            <td className="font-bold">CANTIDAD</td>
            <td className="font-bold">DESCRIPCIÓN</td>
            <td className="font-bold text-right">PRECIO UNITARIO</td>
            <td className="font-bold text-right">SUBTOTAL</td>
          </tr>
          {venta?.detalles
            ?.filter((detalle) => detalle.cantidad > 0)
            .map((detalle) => {
              return (
                <tr>
                  <td>
                    {
                      venta.productos?.find(
                        (producto) => producto.id === detalle.producto_id
                      )?.código
                    }
                  </td>
                  <td>{detalle.cantidad}</td>
                  <td>
                    {
                      venta.productos?.find(
                        (producto) => producto.id === detalle.producto_id
                      )?.nombre
                    }
                  </td>
                  <td className="text-right">{formatter.format(detalle.precioUnitario)}</td>
                  <td className="text-right">{formatter.format(detalle.subtotal)}</td>
                </tr>
              );
            })}
        </table>
        <dl className="flex flex-col items-end font-mono">
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">SUBTOTAL</dt>
            <dd className="w-28 text-right">{formatter.format(venta?.subtotal || 0)}</dd>
          </div>
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">IMPUESTO</dt>
            <dd className="w-28 text-right">{venta?.impuesto}%</dd>
          </div>
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">TOTAL</dt>
            <dd className="w-28 text-right">{formatter.format(venta?.total || 0)}</dd>
          </div>
        </dl>
      </main>
    </>
  );
}
