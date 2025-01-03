import PurchasesDataDisplay from "../components/data-display/purchase-data-display";
import NavPanel from "../components/misc/nav-panel";
import { useNavigate } from "react-router-dom";
import session from "../utils/session";
import permissions from "../utils/permissions";
import { useEffect } from "react";
import { useConfirmationScreenStore } from "../store/confirmationStore";

export default function PurchasesPage() {
  const navigate = useNavigate();
  const isConfirmationScreen = useConfirmationScreenStore(
    (state) => state.isConfirmationScreen
  );

  useEffect(() => {
    if (!session.find()) {
      navigate("/entrar");
    } else {
      if (!permissions.find()?.ver.compra) {
        navigate("/");
      }
    }
  });

  if (!session.find()) {
    return null;
  } else {
    if (!permissions.find()?.ver.compra) {
      return null;
    }
  }

  return (
    <>
      <div
        className={`h-screen bg-white grid md:grid-cols-[1fr,_5fr] ${
          isConfirmationScreen ? "filter blur-sm" : ""
        }`}
      >
        <NavPanel />
        <main className="flex-grow bg-white relative max-h-screen overflow-auto scrollbar-thin">
          <PurchasesDataDisplay />
        </main>
      </div>
    </>
  );
}
