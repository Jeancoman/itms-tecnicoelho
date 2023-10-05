import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavPanel from "../../../components/misc/nav-panel";
import session from "../../../utils/session";
import TotalProvidersReportDataDisplay from "../../../components/data-display/reports-data-display/providers/total-providers-data-display";

export default function TotalProvidersReportPage() {
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
          <TotalProvidersReportDataDisplay />
        </main>
      </div>
    </>
  );
}