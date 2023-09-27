import { useNavigate } from "react-router-dom";
import CategoriesDataDisplay from "../components/data-display/categories-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useEffect } from "react";
import session from "../utils/session";
import permissions from "../utils/permissions";

export default function CategoriesPage() {

  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.categoría
      ) {
        navigate("/");
      }
    }
  });

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <CategoriesDataDisplay />
        </main>
      </div>
    </>
  );
}