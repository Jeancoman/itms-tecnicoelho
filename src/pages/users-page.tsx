import { useEffect } from "react";
import UsersDataDisplay from "../components/data-display/users-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (session.find()?.usuario.rol !== "ADMINISTRADOR") {
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
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <UsersDataDisplay />
        </main>
      </div>
    </>
  );
}
