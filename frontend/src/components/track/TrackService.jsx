import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, User, Wrench, Clock, Hash, Cpu, Loader2, Cog, 
  ShieldCheck, Activity, CheckCircle2, PhoneCall, FileText, 
  ArrowRight, Timer, Truck, Award, Zap, HardHat
} from "lucide-react";
import api from "../../api/api";

export default function UserTrackStatus() {
  const [trackId, setTrackId] = useState("");
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setLoading(true);
    setError("");
    setStatusData([]);

    try {
      const response = await api.get(`/service/track/${trackId.trim()}`);
      const data = Array.isArray(response.data) ? response.data : [response.data];
      if (data.length > 0 && data[0]) {
        setStatusData(data);
      } else {
        setError("Protocol ID not found in system.");
      }
    } catch (err) {
      setError("Invalid ID. Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600 overflow-x-hidden relative">
      
      {/* Background Animated Gear - Optimized for mobile */}
      <div className="fixed opacity-[0.03] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Cog size={window.innerWidth < 768 ? 400 : 800} strokeWidth={1} className="animate-[spin_30s_linear_infinite]" />
      </div>

      <nav className="relative z-10 border-b border-white/5 py-6 px-4 md:px-6 text-center backdrop-blur-xl bg-black/40 sticky top-0">
        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">
           <span className="text-blue-600"></span> 
        </h1>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto p-4 md:p-12 pb-24">
        
        {/* Search Section */}
        <section className="text-center mb-10 md:mb-16 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8] mb-4">
              Track <br/> <span className="text-blue-600 text-glow">Motor.</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Real-time Component Lifecycle Tracking</p>
          </motion.div>

          <form onSubmit={handleTrack} className="relative max-w-lg mx-auto mt-8 md:mt-10 px-2">
            <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-2xl focus-within:border-blue-600 transition-all p-1.5 shadow-2xl">
              <input
                type="text"
                placeholder="TRACKING CODE"
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-transparent outline-none font-black text-base md:text-xl placeholder:opacity-20 uppercase tracking-widest"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="p-3 md:p-4 md:px-8 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-mono text-[10px] uppercase tracking-widest bg-red-500/10 py-2 rounded-lg inline-block px-4">
              {error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {statusData.length > 0 ? (
            statusData.map((motor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 md:space-y-8 mb-12"
              >
                {/* 1. STATUS BANNER */}
                <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl flex flex-col justify-between items-center gap-6 md:gap-8 overflow-hidden relative ${
                  motor.stage === "Completed" ? "bg-emerald-600" : "bg-blue-600"
                }`}>
                  <Activity className="absolute -right-10 -top-10 opacity-10 w-48 md:w-64 h-48 md:h-64" />
                  
                  <div className="text-center md:text-left z-10 w-full">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                       <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Live Feed</span>
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-4xl md:text-7xl font-black italic uppercase leading-none mb-4 tracking-tighter">
                      {motor.stage || "In Analysis"}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold opacity-90 uppercase bg-black/20 w-full md:w-fit px-5 py-3 rounded-xl">
                      <User size={16} className="text-blue-200" /> {motor.customerName || "No Name"}
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 text-center w-full md:min-w-[220px] md:w-auto z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50 text-blue-200">Protocol Registry</p>
                    <h4 className="text-3xl md:text-4xl font-black italic tracking-tighter">
                      #{motor.srfNumber || motor.trackingCode || "N/A"}
                    </h4>
                  </div>
                </div>

                {/* 2. CORE SPECS GRID (Mobile: 1 col, Tablet: 2 col) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <SpecCard icon={<Wrench/>} label="Lead Engineer" value={motor.technician || "Allocating..."} />
                  <SpecCard icon={<Cpu/>} label="Specifications" value={`${motor.motorDetails?.make || "GENERIC"} - ${motor.motorDetails?.hp || "0"} HP`} />
                  <SpecCard icon={<Hash/>} label="Serial Number" value={motor.motorDetails?.serialNumber || "NOT FOUND"} />
                  <SpecCard icon={<Clock/>} label="In-Date" value={motor.createdAt ? new Date(motor.createdAt).toLocaleDateString() : "N/A"} />
                </div>

                {/* 3. QUALITY CHECKLIST (Horizontal Scroll on Mobile) */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <StatusBadge icon={<CheckCircle2 size={14}/>} text="Insulation: OK" active />
                    <StatusBadge icon={<Zap size={14}/>} text="Winding: Active" active />
                    <StatusBadge icon={<Activity size={14}/>} text="Balancing: QC" />
                </div>

                {/* 4. ACTION FOOTER */}
                <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none text-center">
                            Identity Secured by <span className="text-white italic">Workshop OS</span>
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                            <FileText size={16}/> Report
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                            <PhoneCall size={16}/> Support
                        </button>
                    </div>
                </div>
              </motion.div>
            ))
          ) : (
            /* 🔥 EXTRA CONTENT - Visible when NO results or below results */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 space-y-12">
                {/* Why Track Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <Truck size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Average 24hr turnaround on all standard repairs.</p>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <Award size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Certified QC</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Every motor undergoes 5-stage precision testing.</p>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <HardHat size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Expert Care</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Work handled by engineers with 20+ years exp.</p>
                    </div>
                </div>

                {/* Industrial Banner */}
                <div className="relative h-40 rounded-[2rem] overflow-hidden group">
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" 
                      alt="Industry"
                    />
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center text-center p-6">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Maximum Torque. <br/> Minimum Downtime.</h3>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

// Reusable Spec Card for Grid
function SpecCard({ icon, label, value }) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 md:p-8 flex items-center gap-4 md:gap-6 group transition-all">
            <div className="p-3 md:p-4 bg-white/5 rounded-xl text-blue-500">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-lg md:text-2xl font-black italic uppercase text-white truncate leading-none">{value}</p>
            </div>
        </div>
    );
}

// Sub-component for Checklist Badges
function StatusBadge({ icon, text, active = false }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-full border whitespace-nowrap transition-colors ${
            active ? "bg-blue-600/10 border-blue-600/50 text-blue-400" : "bg-white/5 border-white/5 text-gray-500"
        }`}>
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{text}</span>
        </div>
    );
}