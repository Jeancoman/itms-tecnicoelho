import PublicationsDataDisplay from "../components/data-display/publications-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";

export default function PublicationsPage() {

  const navigate = useNavigate();

  if (!session.find()) {
    navigate("/entrar");
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.publicación
    ) {
      navigate("/");
    }
  }

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <PublicationsDataDisplay />
        </main>
      </div>
    </>
  );
}