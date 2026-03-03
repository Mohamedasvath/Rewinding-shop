// src/pages/AdminRegister.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, Mail, Lock, User, Loader2, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/admin/auth/register", form);
      toast.success("Account Created! You can login now. 🔧");
      navigate("/admin/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-blue-600">
      
      {/* LEFT SIDE: BRANDING (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center p-16 border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="relative z-10 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-16 h-16 bg-blue-600 flex items-center justify-center rounded-2xl mb-8 shadow-xl shadow-blue-600/20"
          >
            <ShieldCheck size={32} className="text-white" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white leading-tight mb-6 uppercase tracking-tighter"
          >
            JOIN THE <br /> <span className="text-blue-600 text-6xl">SRW TEAM.</span>
          </motion.h1>
          
          <p className="text-gray-400 text-lg font-medium leading-relaxed">
            Create an administrator account to start managing workshop jobs, 
            tracking parts, and generating reports.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: REGISTER FORM (Full Width on Mobile) */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-[#080808]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Logo Only (Visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
             <div className="p-3 bg-blue-600 rounded-2xl mb-4">
                <Wrench size={28} className="text-white" />
             </div>
             <h2 className="text-2xl font-black text-white tracking-tighter uppercase">SRW Admin</h2>
          </div>

          <div className="bg-[#111] rounded-[2rem] shadow-2xl border border-white/5 p-8 sm:p-12">
            
            <div className="mb-8 text-left">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight italic">Register</h2>
              <p className="text-gray-500 text-sm font-medium">
                Create your shop manager profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    required
                    onChange={handleChange}
                    placeholder="Ex: Senthil Kumar"
                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all text-white font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    required
                    onChange={handleChange}
                    placeholder="name@workshop.com"
                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all text-white font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    required
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all text-white font-medium placeholder:text-gray-700"
                  />
                </div>
              </div>

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm">
                Already have account?{" "}
                <Link to="/admin/login" className="text-blue-500 hover:underline font-bold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
          
          <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-widest">
            Authorized Personnel Access Only
          </p>
        </motion.div>
      </div>

    </div>
  );
}