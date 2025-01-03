import { useNavigate } from "react-router-dom";
import NavPanel from "../components/misc/nav-panel";
import permissions from "../utils/permissions";
import session from "../utils/session";
import { useEffect } from "react";
import HistoricoDataDisplay from "../components/data-display/historico-data-display";

export default function HistoricoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.producto) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.producto) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <HistoricoDataDisplay />
        </main>
      </div>
    </>
  );
}
