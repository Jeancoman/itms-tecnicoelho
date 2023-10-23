import SeguimientosDataDisplay from "../components/data-display/seguimiento-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function SeguimientosPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.cliente
      ) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.cliente
    ) {
      return null;
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <SeguimientosDataDisplay />
        </main>
      </div>
    </>
  );
}
