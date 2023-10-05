import { useNavigate } from "react-router-dom";
import ProblemsDataDisplay from "../components/data-display/problems-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";

export default function ProblemsPage() {

  const navigate = useNavigate();

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

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ProblemsDataDisplay />
        </main>
      </div>
    </>
  );
}