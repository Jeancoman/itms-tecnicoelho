import { useNavigate } from "react-router-dom";
import ImpuestoDataDisplay from "../components/data-display/impuestos-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function ImpuestoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.impuesto) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.impuesto) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white md:grid md:grid-cols-[1fr,_6.5fr]">
        <NavPanel />
        <main className="flex-grow bg-white md:relative max-h-screen">
          <ImpuestoDataDisplay />
        </main>
      </div>
    </>
  );
}
