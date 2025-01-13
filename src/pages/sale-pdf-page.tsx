import { useNavigate, useParams } from "react-router-dom";
import { impuestoCalculado, Venta } from "../types";
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
  const { toPDF, targetRef } = usePDF({
    filename: `factura-${venta?.id}-${
      venta?.fecha ? format(new Date(venta?.fecha), "dd/MM/yyyy") : ""
    }.pdf`,
  });
  const navigate = useNavigate();
  const resetAllSearchs = useFunctionStore((state) => state.resetAllSearchs);
  const [impuestosCalculados, setImpuestosCalculados] = useState<
    impuestoCalculado[]
  >([]);

  useEffect(() => {
    SaleService.getById(Number(id)).then((data) => {
      if (data) {
        setVenta(data);
        setImpuestosCalculados(data.historico_ventum?.impuestos || []);
      }
    });
  }, []);

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.venta) {
        navigate("/");
      }
    }
  });

  const formatter = new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.venta) {
      return null;
    }
  }

  return (
    <>
      <div className="absolute left-[45%] top-10 flex gap-4 justify-items-center">
        <button
          type="button"
          onClick={() => {
            resetAllSearchs();
            navigate("/ventas");
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
              <h5 className="font-mono">
                NOMBRE: {venta?.historico_ventum?.cliente_nombre}{" "}
                {venta?.historico_ventum?.cliente_apellido}
              </h5>
              <h5 className="font-mono">
                DOCUMENTO: {venta?.historico_ventum?.cliente_documento}
              </h5>
              <h5 className="font-mono">
                DIRECCIÓN: {venta?.historico_ventum?.cliente_direccion}
              </h5>
            </div>
            <div className="font-mono text-right mt-8">
              <h3 className="font-bold capitalize text-xl">TECNICOELHO</h3>
              <h5 className="font-mono">J-80065323-2</h5>
              <h5 className="font-mono">TELF: +58 0426-2452374</h5>
              <h5 className="font-mono">Calle Retumbo, Valle de la Pascua</h5>
              <h5 className="mt-8 font-mono">
                <span className="font-bold">FACTURA NO.</span> {venta?.id || 0}
              </h5>
              <h5 className="font-mono">
                FECHA:{" "}
                {venta?.fecha
                  ? format(new Date(venta?.fecha), "dd/MM/yyyy")
                  : ""}
              </h5>
              <h5 className="font-mono">
                CONDICIÓN DE PAGO: {venta?.tipoPago}
              </h5>
            </div>
          </div>
        </div>
        <table className="w-full mb-12 font-mono">
          <tr>
            <td className="font-bold">CÓDIGO</td>
            <td className="font-bold">DESCRIPCIÓN</td>
            <td className="font-bold text-center">CANTIDAD</td>
            <td className="font-bold text-right">PRECIO UNITARIO</td>
            <td className="font-bold text-right">SUBTOTAL</td>
          </tr>
          {venta?.detalles
            ?.filter((detalle) => detalle.cantidad > 0)
            .map((detalle, index) => {
              return (
                <tr key={index}>
                  <td>{detalle.producto_codigo}</td>
                  <td>{detalle.producto_nombre}</td>
                  <td className="text-center">{detalle.cantidad}</td>
                  <td className="text-right">
                    {formatter.format(
                      detalle.precioUnitario *
                        (venta.historico_ventum?.tasa_cambio ?? 0)
                    )}
                  </td>
                  <td className="text-right">
                    {formatter.format(
                      detalle.subtotal *
                        (venta.historico_ventum?.tasa_cambio ?? 0)
                    )}
                  </td>
                </tr>
              );
            })}
        </table>
        <dl className="flex flex-col items-end font-mono">
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">SUBTOTAL</dt>
            <dd className="w-28 text-right">
              {formatter.format(
                (venta?.subtotal || 0) *
                  (venta?.historico_ventum?.tasa_cambio ?? 0)
              )}
            </dd>
          </div>
          {impuestosCalculados.length > 0 &&
            impuestosCalculados.some((impuesto) => impuesto.total > 0) && (
              <div className="inline-grid grid-cols-2 justify-end">
                {impuestosCalculados
                  .filter(({ total }) => total > 0)
                  .map(({ impuesto, total }, index) => (
                    <>
                      <dd key={index}>
                        {impuesto.codigo}({impuesto.porcentaje})%
                      </dd>
                      <dd className="w-28 text-right">
                        {formatter.format(
                          total * (venta?.historico_ventum?.tasa_cambio ?? 0)
                        )}
                      </dd>
                    </>
                  ))}
              </div>
            )}
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">TOTAL</dt>
            <dd className="w-28 text-right">
              {formatter.format(
                (venta?.total || 0) *
                  (venta?.historico_ventum?.tasa_cambio ?? 0)
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-4 font-mono text-sm text-right">
          Conversión a tasa de cambio del BCV,{" "}
          {formatter.format(venta?.historico_ventum?.tasa_cambio ?? 0)},
          actualizado el{" "}
          {venta?.historico_ventum?.fecha_tasa_cambio
            ? format(
                new Date(Number(venta?.historico_ventum?.fecha_tasa_cambio)),
                "dd/MM/yyyy 'a las' hh:mm a"
              )
            : ""}
        </p>
      </main>
    </>
  );
}
