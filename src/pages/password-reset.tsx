import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ReactComponent as On } from "/src/assets/visibility.svg";
import { ReactComponent as Off } from "/src/assets/visibility_off.svg";
import UserService from "../services/user-service";

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");
  const [visible, setVisible] = useState(false);

  const onResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !userId) {
      toast.error("Token o ID de usuario faltante.");
      return;
    }

    toast.loading("Restableciendo contraseña...");

    const success = await UserService.resetPassword(userId, token, newPassword);
    setNewPassword("");

    toast.dismiss();

    if (success) {
      toast.success("Contraseña restablecida con éxito.");
      navigate("/entrar");
    } else {
      toast.error("Error al restablecer la contraseña.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4 overflow-hidden">
      <img src="/assets/logo-sin-eslogan.png" className="w-96" />
      <div className="bg-white w-96 h-fit rounded-md shadow border">
        <form
          className="flex flex-col gap-4 p-8"
          onSubmit={onResetPasswordSubmit}
        >
          <h1 className="self-start text-xl font-bold">
            Restablecer contraseña
          </h1>
          <div className="relative w-full">
            <input
              type={visible ? "text" : "password"}
              placeholder="Nueva contraseña"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              name="password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              autoComplete="new-password"
              maxLength={32}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              La contraseña debe tener mínimo 8 caracteres y máximo 32, contener una letra
              mayúscula, una letra minúscula, un número y un carácter especial
            </span>
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
            Restablecer contraseña
          </button>
        </form>
      </div>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}
