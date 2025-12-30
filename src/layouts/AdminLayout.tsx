import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/Sidebar";


export default function AdminLayout() {
  return (
    <div className="fixed inset-0 flex w-full bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
