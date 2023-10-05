import { useEffect } from "react";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import HomeDataDisplay from "../components/data-display/home-data-display";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    }
  });

  if (!session.find()) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-white grid grid-cols-[1fr,_5fr] scrollbar-none overflow-hidden">
        <NavPanel />
        <main className="bg-white relative max-h-[656px] flex justify-center flex-col">
          <HomeDataDisplay />
        </main>
      </div>
    </>
  );
}
