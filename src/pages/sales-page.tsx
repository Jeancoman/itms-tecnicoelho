import { useNavigate } from "react-router-dom";
import SalesDataDisplay from "../components/data-display/sales-data-display";
import NavPanel from "../components/misc/nav-panel";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";
import { useConfirmationScreenStore } from "../store/confirmationStore";

export default function SalesPage() {
  const navigate = useNavigate();
  const isConfirmationScreen = useConfirmationScreenStore(
    (state) => state.isConfirmationScreen
  );

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.venta) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.venta) {
      return null;
    }
  }

  return (
    <>
      <div
        className={`h-screen bg-white grid md:grid-cols-[1fr,_6.5fr] ${
          isConfirmationScreen ? "filter blur-sm" : ""
        }`}
      >
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen overflow-auto scrollbar-thin">
          <SalesDataDisplay />
        </main>
      </div>
    </>
  );
}
