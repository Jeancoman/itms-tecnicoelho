import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import UserService from "../services/user-service";
import TokenDecoder from "../utils/decoder";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { ReactComponent as On } from "/src/assets/visibility.svg";
import { ReactComponent as Off } from "/src/assets/visibility_off.svg";

export default function LoginPage() {
  const [contraseña, setContraseña] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session.find()) {
      navigate("/");
    }
  }, [navigate]);

  if (session.find()) {
    return null;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationToast = toast.loading("Validando credenciales...");

    const token = await UserService.signIn(nombreUsuario, contraseña);

    setContraseña("");
    setNombreUsuario("");

    if (token !== false && token !== "429") {
      toast.dismiss(validationToast);
      toast.success("Credenciales válidas.");

      const usuario = TokenDecoder.decodeAndReturnUser(token);
      const userSession = { usuario, token };
      console.log(userSession);
      session.set(userSession);

      if (usuario.rol === "EMPLEADO") {
        await handleEmployeeLogin(usuario.id!, token);
      } else {
        toast.success("Sesión iniciada exitosamente.");
        navigate("/");
      }
    } else if(token === "429"){
      toast.dismiss(validationToast);
      toast.error("Demasiados intentos fallidos. Intente de nuevo dentro de 5 minutos.");
    } else {
      toast.dismiss(validationToast);
      toast.error("Credenciales inválidas.");
    }
  };

  const handleEmployeeLogin = async (userId: number, token: string) => {
    const permissionsToast = toast.loading("Validando permisos...");

    const permisos = await UserService.getPermissionsById(userId, token);
    toast.dismiss(permissionsToast);

    if (permisos === false) {
      toast.error("Error validando los permisos.");
    } else {
      permissions.set(permisos);
      toast.success("Permisos validados.");
      toast.success("Sesión iniciada exitosamente.");
      navigate("/");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4 scrollbar-none overflow-hidden">
        <img src="/assets/logo-sin-eslogan.png" className="w-96" />
        <div className="bg-white w-96 h-fit rounded-md shadow border">
          <form className="flex flex-col gap-4 p-8" onSubmit={onSubmit}>
            <h1 className="self-start text-xl font-bold">Inicio de sesión</h1>
            <input
              type="text"
              placeholder="Nombre de usuario"
              onChange={(e) => setNombreUsuario(e.target.value)}
              value={nombreUsuario}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
              required
            />
            <div className="relative w-full">
              <input
                type={visible ? "text" : "password"}
                placeholder="Contraseña"
                onChange={(e) => setContraseña(e.target.value)}
                value={contraseña}
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
                required
              />
              {visible ? (
                <On
                  onClick={() => setVisible(false)}
                  className="absolute top-2 right-4 fill-[#2096ed] cursor-pointer"
                />
              ) : (
                <Off
                  onClick={() => setVisible(true)}
                  className="absolute top-2 right-4 fill-[#2096ed] cursor-pointer"
                />
              )}
            </div>
            <p
              className="text-sm text-blue-500 cursor-pointer hover:underline mt-2 text-left"
              onClick={() => navigate("/solicitar-restablecimiento-contraseña")}
            >
              Recuperar contraseña
            </p>
            <button className="bg-[#2096ed] w-full text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Entrar
            </button>
          </form>
        </div>
        <div>
          <p>
            Copyright © 2014-{new Date().getFullYear()}{" "}
            <strong>TecniCoelho</strong>
          </p>
        </div>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}
