import { useEffect } from "react";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";
import AccesoDataDisplay from "../components/data-display/acceso-data-display";

export default function AccesoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.usuario) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.usuario) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <AccesoDataDisplay />
        </main>
      </div>
    </>
  );
}