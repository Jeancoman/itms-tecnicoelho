import { useEffect } from "react";
import NavPanel from "../components/misc/nav-panel";
import { ReactComponent as Hello } from "/src/assets/waving_hand.svg";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    }
  }, []);
  return (
    <>
      <div className="min-h-screen bg-white grid grid-cols-[1fr,_5fr] scrollbar-none overflow-hidden">
        <NavPanel />
        <main className="bg-white relative max-h-[656px] flex justify-center flex-col">
          <div className="place-self-center flex flex-col items-center">
            <Hello className="fill-[#2096ed] h-24 w-24" />
            <p className="font-bold text-2xl text-center mt-1">
              ¡Bienvenido/a, {session.find()?.usuario.nombre} {session.find()?.usuario.apellido}!
            </p>
            <p className="font-medium text-lg text-center mt-1">
              Puedes pulsar cualquiera de los botones a tu izquierda para usar
              las funciones del sistema.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
