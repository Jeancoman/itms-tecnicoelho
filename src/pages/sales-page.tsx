import { useNavigate } from "react-router-dom";
import SalesDataDisplay from "../components/data-display/sales-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function SalesPage() {

  const navigate = useNavigate();

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
  })

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
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px] overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
          <SalesDataDisplay />
        </main>
      </div>
    </>
  );
}