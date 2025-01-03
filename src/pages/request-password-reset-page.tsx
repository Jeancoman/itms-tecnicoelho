import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import UserService from "../services/user-service";
import { useNavigate } from "react-router-dom";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onForgotPasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    toast.loading("Enviando enlace de recuperación...");

    const success = await UserService.requestPasswordReset(email);

    setEmail("");

    if (success) {
      toast.dismiss();
      toast.success("Enlace de recuperación enviado a su correo.");
    } else {
      toast.dismiss();
      toast.error("Error al enviar el enlace de recuperación.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4 overflow-hidden">
      <img src="/assets/logo-sin-eslogan.png" className="w-96" />
      <div className="bg-white w-96 h-fit rounded-md shadow border">
        <form
          className="flex flex-col gap-4 p-8"
          onSubmit={onForgotPasswordSubmit}
        >
          <h1 className="self-start text-xl font-bold">Recuperar contraseña</h1>
          <input
            type="email"
            placeholder="Correo electrónico"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full"
            required
          />
          <button className="bg-[#2096ed] w-full text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Enviar enlace de recuperación
          </button>
          <p
            className="text-sm text-blue-500 cursor-pointer hover:underline mt-2 text-left"
            onClick={() => navigate("/entrar")}
          >
            Volver al inicio de sesión
          </p>
        </form>
      </div>
      <div>
        <p>
          Copyright © 2014-{new Date().getFullYear()}{" "}
          <strong>TecniCoelho</strong>
        </p>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
