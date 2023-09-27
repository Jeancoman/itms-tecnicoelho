import { useEffect } from "react";
import ClientsDataDisplay from "../components/data-display/clients-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";

export default function ClientsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if(!session.find()){
      navigate("/entrar")
    } else {
      if(session.find()?.usuario.rol !== "ADMINISTRADOR" && !(permissions.find()?.ver.cliente)){
        navigate("/")
      } 
    }  
  })

  return (
    <> 
      <div className="min-h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <ClientsDataDisplay />
        </main>
      </div>
    </>
  );
}