import { useEffect } from "react";
import UsersDataDisplay from "../components/data-display/users-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import { useNavigate } from "react-router-dom";
import permissions from "../utils/permissions";

export default function UsersPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.usuario) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.usuario) {
      return null;
    }
  }

  return (
    <>
      <div className="h-screen bg-white grid md:grid-cols-[1fr,_6.5fr]">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen">
          <UsersDataDisplay />
        </main>
      </div>
    </>
  );
}
