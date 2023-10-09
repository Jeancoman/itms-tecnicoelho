import MessagingDataDisplay from "../components/data-display/messaging-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function MessagingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.mensajería
      ) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (session.find()?.usuario.rol !== "ADMINISTRADOR") {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <MessagingDataDisplay />
        </main>
      </div>
    </>
  );
}
