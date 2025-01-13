import { useEffect } from "react";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";
import BitacoraDataDisplay from "../components/data-display/bitacora-data-display";

export default function BitacoraPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.bitacora) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.bitacora) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_6.5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <BitacoraDataDisplay />
        </main>
      </div>
    </>
  );
}