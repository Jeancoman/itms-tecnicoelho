import { useNavigate } from "react-router-dom";
import SalesDataDisplay from "../components/data-display/sales-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useEffect } from "react";
import session from "../utils/session";
import permissions from "../utils/permissions";

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
  });

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <SalesDataDisplay />
        </main>
      </div>
    </>
  );
}