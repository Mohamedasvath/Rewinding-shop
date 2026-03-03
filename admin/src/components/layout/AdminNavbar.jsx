import { LogOut, Wrench, ShieldCheck, Menu, User, Zap, Cog } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminNavbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    toast.success("System Override: SRW Terminal Logged Out");
    navigate("/admin/login", { replace: true });
  };

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

  return (
    <div
      className="
        sticky top-0 z-40
        h-20
        bg-white/90 backdrop-blur-xl
        border-b border-gray-100
        flex items-center justify-between
        px-6 sm:px-10
      "
    >
      {/* Ambient Top Glow - SRW Blue */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-40" />

      {/* LEFT SECTION - BRANDING */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-gray-50 rounded-xl"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-4">
          {/* Animated Gear Logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="bg-blue-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hidden sm:block"
          >
            <Cog size={20} className="text-white" />
          </motion.div>

          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-black uppercase">
              S<span className="text-blue-600 underline decoration-2">RW.</span>
            </h1>
            <p className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">
              <ShieldCheck size={10} className="text-emerald-500" />
              Workshop Admin Terminal
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - PROFILE & ACTION */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Admin Profile Display */}
        <div className="hidden md:flex items-center gap-4 bg-gray-50 border border-gray-200 pl-2 pr-5 py-1.5 rounded-2xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 
                         flex items-center justify-center text-white text-sm font-black shadow-md">
            {adminInfo?.name?.charAt(0) || "S"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-black uppercase tracking-wider">
              {adminInfo?.name || "SRW Manager"}
            </span>
            <span className="text-[8px] text-blue-600 font-bold uppercase tracking-widest">
              Master Access
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="
            flex items-center gap-3
            px-5 py-3
            bg-red-50 hover:bg-red-600
            border border-red-100 hover:border-red-600
            text-red-600 hover:text-white
            rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]
            transition-all duration-300
          "
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}