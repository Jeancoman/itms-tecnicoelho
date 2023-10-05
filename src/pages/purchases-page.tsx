import PurchasesDataDisplay from "../components/data-display/purchase-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import permissions from "../utils/permissions";

export default function PurchasesPage() {

  const navigate = useNavigate();

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

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <PurchasesDataDisplay />
        </main>
      </div>
    </>
  );
}