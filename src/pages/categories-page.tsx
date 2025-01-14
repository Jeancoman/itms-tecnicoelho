import { useNavigate } from "react-router-dom";
import CategoriesDataDisplay from "../components/data-display/categories-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function CategoriesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.categoría) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.categoría) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white md:grid md:grid-cols-[1fr,_6.5fr]">
        <NavPanel />
        <main className="flex-grow bg-white md:relative max-h-screen">
          <CategoriesDataDisplay />
        </main>
      </div>
    </>
  );
}
