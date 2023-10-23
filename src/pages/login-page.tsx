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
  });

  if (session.find()) {
    return null;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationToast = toast.loading("Validando credenciales...");
    const token = await UserService.signIn(nombreUsuario, contraseña);
    setContraseña("");
    setNombreUsuario("");
    if (token !== false) {
      toast.dismiss(validationToast);
      toast.success("Credenciales validas.");
      const usuario = TokenDecoder.decodeAndReturnUser(token);

      if (usuario.rol === "EMPLEADO") {
        const permissionsToast = toast.loading("Validando permisos...");
        const permisos = await UserService.getPermissionsById(usuario.id!);
        const userSession = {
          usuario,
          token,
        };
        console.log(userSession);
        if (permisos === false) {
          toast.dismiss(permissionsToast);
          toast.error("Error validando los permisos.");
        } else {
          toast.dismiss(permissionsToast);
          session.set(userSession);
          console.log(permisos);
          permissions.set(permisos);
          toast.success("Permisos validados.");
          toast.success("Sesión iniciada exitosamente.");
          return navigate("/");
        }
      } else {
        const userSession = {
          usuario,
          token,
        };
        console.log(userSession);
        session.set(userSession);
        toast.success("Sesión iniciada exitosamente.");
        return navigate("/");
      }
    } else {
      toast.dismiss(validationToast);
      toast.error("Credenciales invalidas.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4 scrollbar-none overflow-hidden">
        <div className="bg-white w-96 h-fit rounded-md shadow border">
          <form
            className="flex flex-col place-items-center gap-4 p-8"
            onSubmit={onSubmit}
          >
            <h1 className="self-start text-xl font-bold">Inicio de sesión</h1>
            <input
              type="text"
              placeholder="Nombre de usuario"
              onChange={(e) => setNombreUsuario(e.target.value)}
              value={nombreUsuario}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
              required
              minLength={1}
            />
            <div className="relative w-full">
              <input
                type={visible ? "text" : "password"}
                placeholder="Contraseña"
                onChange={(e) => setContraseña(e.target.value)}
                value={contraseña}
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
                required
                minLength={1}
              />
              {visible ? (
                <On
                  onClick={() => setVisible(false)}
                  className="absolute top-2 right-4 fill-[#2096ed]"
                />
              ) : (
                <Off
                  onClick={() => setVisible(true)}
                  className="absolute top-2 right-4 fill-[#2096ed]"
                />
              )}
            </div>
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
