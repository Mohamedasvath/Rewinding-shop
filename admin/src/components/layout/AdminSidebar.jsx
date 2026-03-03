import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Zap,
  X,
  ChevronRight,
  FileSearch,
  ClipboardCheck
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const closeMobile = () => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          w-72 h-screen
          bg-white border-r border-slate-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header - Workshop Branding */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-lg tracking-tight uppercase leading-none">
                S<span className="text-blue-600">RW</span>
              </span>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                Management Suite
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="ml-auto lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto font-medium">
          <p className="text-[30px] font-black text-slate-900 uppercase tracking-widest mb-4 ml-3">
            Main Menu
          </p>
          
          <SidebarItem to="/admin" icon={<LayoutDashboard size={20} />} text="Dashboard" onClick={closeMobile} />
          <SidebarItem to="/admin/services" icon={<ClipboardList size={20} />} text="Service Requests" onClick={closeMobile} />
          <SidebarItem to="/admin/customers" icon={<Users size={20} />} text="Customer Directory" onClick={closeMobile} />
          
          <div className="pt-6 pb-2">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 ml-3">
              Quality Assurance
            </p>
            <SidebarItem to="/admin/quality-records" icon={<ClipboardCheck size={20} />} text="Quality Records" onClick={closeMobile} />
            <SidebarItem to="/admin/quality-view" icon={<FileSearch size={20} />} text="Q-Record View" onClick={closeMobile} />
          </div>

          <div className="pt-6 ">
            <SidebarItem to="/admin/settings" icon={<Settings size={20} />} text="System Settings" onClick={closeMobile} />
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-red-500 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-3 bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 shadow-sm"
          >
            <LogOut size={16} />
            Logout Account
          </button>
          <p className="mt-4 text-[9px] text-center font-bold tracking-widest uppercase text-slate-300">
            System Version 2.4.0
          </p>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ to, icon, text, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-700 font-bold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <span className={`${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`}>
              {icon}
            </span>
            <span className="text-sm tracking-tight">
              {text}
            </span>
          </div>
          
          <ChevronRight 
            size={14} 
            className={`transition-all duration-200 
              ${isActive ? "text-blue-600 opacity-100 translate-x-0" : "text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}
            `} 
          />
        </>
      )}
    </NavLink>
  );
}