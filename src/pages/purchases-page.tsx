import PurchasesDataDisplay from "../components/data-display/purchase-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function PurchasesPage() {

  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.compra
      ) {
        navigate("/");
      }
    }
  })

  if (!session.find()) {
    return null
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.compra
    ) {
      return null;
    }
  }

  return (
    <> 
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100">
          <PurchasesDataDisplay />
        </main>
      </div>
    </>
  );
}