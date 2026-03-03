import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, Mail, Lock, Loader2 } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/admin/auth/login", form);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      toast.success("Login Successful!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-sans selection:bg-blue-600 overflow-x-hidden">
      
      {/* LEFT SIDE: BRANDING (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 min-h-screen relative overflow-hidden bg-black items-center justify-center p-16 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
            <div className="w-20 h-20 bg-blue-600 flex items-center justify-center rounded-3xl shadow-2xl">
              <Wrench size={40} className="text-white" />
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
            SENTHIL <br /> <span className="text-blue-600">REWINDING WORKS</span>
          </motion.h1>
          <p className="text-gray-400 text-lg font-medium border-l-4 border-blue-600 pl-4 italic">
            Workshop Management Portal.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM (Full width on Mobile) */}
      <div className="flex-1 w-full max-w-lg px-4 sm:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#111] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-white/5 p-6 sm:p-10 md:p-12"
        >
          {/* Mobile Logo (Visible only on Mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Wrench size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">SRW Admin</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-gray-500 text-sm font-medium">Please enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  required
                  onChange={handleChange}
                  placeholder="name@email.com"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl outline-none focus:border-blue-600 transition-all text-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  required
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl outline-none focus:border-blue-600 transition-all text-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> <span className="text-sm sm:text-base">Logging in...</span></>
              ) : (
                <span className="text-sm sm:text-base">Login to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              New here? <Link to="/admin/register" className="text-blue-500 hover:underline font-bold">Register Account</Link>
            </p>
          </div>
        </motion.div>
        
        <p className="text-center text-gray-600 text-[10px] sm:text-xs mt-8">
          © {new Date().getFullYear()} Senthil Rewind Works • Admin Portal
        </p>
      </div>
    </div>
  );
}