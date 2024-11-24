import TicketsDataDisplay from "../components/data-display/tickets-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function TicketsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.ticket
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
      !permissions.find()?.ver.ticket
    ) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
      <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <TicketsDataDisplay />
        </main>
      </div>
    </>
  );
}
