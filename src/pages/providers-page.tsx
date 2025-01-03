import ProvidersDataDisplay from "../components/data-display/providers-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function ProvidersPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.proveedor) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.proveedor) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <ProvidersDataDisplay />
        </main>
      </div>
    </>
  );
}
