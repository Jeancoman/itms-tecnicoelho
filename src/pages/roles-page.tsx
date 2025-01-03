import { useNavigate } from "react-router-dom";
import RolesDataDisplay from "../components/data-display/roles-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function RolesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.rol) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.rol) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white md:grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <RolesDataDisplay />
        </main>
      </div>
    </>
  );
}
