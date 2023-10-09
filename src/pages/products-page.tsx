import ProductsDataDisplay from "../components/data-display/products-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";

export default function ProductsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.producto
      ) {
        navigate("/");
      }
    }
  })

  if (!session.find()) {
    return null
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.producto
    ) {
      return null
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ProductsDataDisplay />
        </main>
      </div>
    </>
  );
}
