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
      <div className="min-h-screen bg-white flex flex-col md:grid md:grid-cols-[1fr,_5fr] overflow-hidden">
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen flex justify-center flex-col">
          <HomeDataDisplay />
        </main>
      </div>
    </>
  );
}
