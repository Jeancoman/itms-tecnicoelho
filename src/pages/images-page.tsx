import { useNavigate } from "react-router-dom";
import ImagesDataDisplay from "../components/data-display/images-data-display";
import NavPanel from "../components/misc/nav-panel";
import permissions from "../utils/permissions";
import session from "../utils/session";
import { useEffect } from "react";

export default function ImagesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (
        session.find()?.usuario.rol !== "ADMINISTRADOR" &&
        !permissions.find()?.ver.imagen
      ) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.imagen
    ) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ImagesDataDisplay />
        </main>
      </div>
    </>
  );
}
