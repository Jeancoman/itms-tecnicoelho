import UsersDataDisplay from "../components/data-display/users-data-display";
import NavPanel from "../components/misc/nav-panel";

export default function UsersPage() {

  return (
    <> 
      <div className="h-screen bg-white grid grid-cols-[1fr_5fr]">
        <NavPanel />
        <main className="bg-white relative max-h-[656px]">
          <UsersDataDisplay /> 
        </main>
      </div>
    </>
  );
}