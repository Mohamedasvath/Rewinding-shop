import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../layout/AdminSidebar";
import AdminNavbar from "../layout/AdminNavbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col w-full lg:ml-64">

        {/* NAVBAR */}
        <AdminNavbar toggleSidebar={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="flex-1 pt-16 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
