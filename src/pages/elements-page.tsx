import { useNavigate } from "react-router-dom";
import ElementsDataDisplay from "../components/data-display/elements-data-display";
import NavPanel from "../components/misc/nav-panel";
import permissions from "../utils/permissions";
import session from "../utils/session";
import { useEffect } from "react";

export default function ElementsPage() {
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
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ElementsDataDisplay />
        </main>
      </div>
    </>
  );
}
