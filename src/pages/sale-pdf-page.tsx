import { useParams } from "react-router-dom";
import { Venta } from "../types";
import SaleService from "../services/sales-service";
import { useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";

export default function SalePDFPage() {
  const { id } = useParams();
  const [venta, setVenta] = useState<Venta>();
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });

  useEffect(() => {
    SaleService.getById(Number(id)).then((data) => {
      if (data) {
        setVenta(data);
      }
    });
  }, []);
  return (
    <>
      <button
        onClick={() => toPDF()}
        className="absolute left-1/2 top-10 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
      >
        Descargar PDF
      </button>
      <main
        ref={targetRef}
        className="bg-white w-[11in] h-[8.5in] mx-auto p-[1.25in]"
      >
        <div className="mb-12">
          <h1 className="text-3xl font-serif tracking-wider">
            FACTURA #{venta?.id}
          </h1>
          <h5 className="font-mono text-gray-600">
            NOMBRE: {venta?.cliente?.nombre} {venta?.cliente?.apellido}
          </h5>
          <h5 className="font-mono text-gray-600">
            DOCUMENTO: {venta?.cliente?.documento}
          </h5>
          <h5 className="font-mono text-gray-600">
            TEF: {venta?.cliente?.telefono} DIR: {venta?.cliente?.dirección}
          </h5>
        </div>
        <div className="mb-12 font-mono">
          <h3 className="font-bold">TecniCoelho</h3>
          <address>
            Calle Retumbo
            <br />
            Valle de la Pascua 2350, Guárico
          </address>
        </div>
        <table className="w-full mb-12 font-mono">
          <tr>
            <td className="font-bold">Código</td>
            <td className="font-bold">Cantidad</td>
            <td className="font-bold">Descripción</td>
            <td className="font-bold text-right">Precio Unitario</td>
            <td className="font-bold text-right">Subtotal</td>
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
                  <td className="text-right">${detalle.precioUnitario}</td>
                  <td className="text-right">${detalle.subtotal}</td>
                </tr>
              );
            })}
        </table>
        <dl className="flex flex-col items-end font-mono">
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">Subtotal</dt>
            <dd className="w-28 text-right">${venta?.subtotal}</dd>
          </div>
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">Impuesto</dt>
            <dd className="w-28 text-right">{venta?.impuesto}%</dd>
          </div>
          <div className="inline-grid grid-cols-2 justify-end">
            <dt className="font-bold">Total</dt>
            <dd className="w-28 text-right font-bold">${venta?.total}</dd>
          </div>
        </dl>
      </main>
    </>
  );
}
