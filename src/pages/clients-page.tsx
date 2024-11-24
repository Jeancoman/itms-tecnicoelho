import ClientsDataDisplay from "../components/data-display/clients-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";
import { useEffect } from "react";

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

  if (!session.find()) {
    return null;
  } else {
    if (
      session.find()?.usuario.rol !== "ADMINISTRADOR" &&
      !permissions.find()?.ver.cliente
    ) {
      return null;
    }
  }
  
  return (
    <> 
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <ClientsDataDisplay />
        </main>
      </div>
    </>
  );
}