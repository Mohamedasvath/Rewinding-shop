import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/service");
      setServices(data || []);
      setError(null);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to sync with workshop database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Advanced Data Calculations
  const stats = useMemo(() => {
    const total = services.length;
    const completed = services.filter(s => s.stage === "Completed").length;
    const pending = total - completed;
    
    // Logic for "Today's" entries
    const todayStr = new Date().toDateString();
    const todayCount = services.filter(s => 
      new Date(s.createdAt).toDateString() === todayStr
    ).length;

    // Efficiency Rate (Completed / Total)
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, todayCount, efficiency };
  }, [services]);

  const recentOperations = useMemo(() => {
    return [...services]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [services]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <Activity className="animate-spin text-blue-600" size={50} />
            <Wrench className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={20} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booting Workshop Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 space-y-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
           <Wrench size={240} color="white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 text-blue-500 mb-4">
              <TrendingUp size={20}/>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Workshop Operations Hub
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
              COMMAND <span className="text-blue-600">CENTER.</span>
            </h1>
            <p className="text-slate-400 mt-4 max-w-lg font-medium text-sm leading-relaxed">
              Monitoring <span className="text-white font-bold">{stats.total} total units</span> in the service lifecycle with real-time analytics.
            </p>
          </div>
          
          <button 
            onClick={fetchServices}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Activity size={16} /> Refresh Data
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Inventory" value={stats.total} icon={<Activity size={24} />} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Active Queue" value={stats.pending} icon={<Clock size={24} />} color="text-orange-600" bg="bg-orange-50" />
        {/* <StatCard title="Success Rate" value={stats.completed} icon={<CheckCircle size={24} />} color="text-emerald-600" bg="bg-emerald-50" /> */}
        <StatCard title="Daily Signals" value={stats.todayCount} icon={<Calendar size={24} />} color="text-purple-600" bg="bg-purple-50" />
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* RECENT JOBS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 flex items-center gap-3">
              <BarChart3 size={22} className="text-blue-600" /> Recent Operations
            </h2>
            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500">LATEST 6 ENTRIES</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-8 py-5">SRF ID</th>
                  <th className="px-6 py-5">Customer Entity</th>
                  <th className="px-6 py-5 text-center">Stage</th>
                  <th className="px-8 py-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOperations.length > 0 ? (
                  recentOperations.map((s) => (
                    <tr key={s._id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <span className="font-black text-blue-600 italic text-lg tracking-tighter group-hover:scale-110 transition-transform inline-block">
                          #{s.srfNumber}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-gray-800 text-sm">{s.customerName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Tracking: {s.trackingCode || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                          s.stage === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                        }`}>
                          {s.stage}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                        {new Date(s.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-bold italic">
                      No recent operations found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANALYTICS PANEL */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 mb-8">
            Operational Flux
          </h2>

          <div className="flex-1 space-y-2">
            <ProgressBar
              label="Efficiency Rating"
              value={stats.efficiency}
              total={100}
              color="bg-blue-600"
              textColor="text-blue-600"
            />
            <ProgressBar
              label="Pending Workload"
              value={stats.pending}
              total={stats.total}
              color="bg-orange-500"
              textColor="text-orange-600"
            />
          </div>

          <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:rotate-12 transition-transform duration-500">
                <Wrench size={80}/>
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                Priority Notification
                </p>
                <p className="text-sm text-slate-100 leading-relaxed font-bold">
                Attention: <span className="text-orange-500">{stats.pending} units</span> are currently in the workshop pipeline. Increase output to improve efficiency.
                </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* STAT CARD COMPONENT */
function StatCard({ title, value, icon, color, bg }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-start transition-all"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
          {title}
        </p>
        <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter ${color}`}>
          {value}
        </h2>
      </div>
      <div className={`${bg} ${color} p-4 rounded-2xl shadow-inner`}>
        {icon}
      </div>
    </motion.div>
  );
}

/* PROGRESS BAR COMPONENT */
function ProgressBar({ label, value, total, color, textColor }) {
  const percentage = total === 0 ? 0 : (value / total) * 100;

  return (
    <div className="space-y-3 mb-8">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <span className={`text-xl font-black italic ${textColor}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-5 p-1.5 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`${color} h-2 rounded-full shadow-lg`}
        />
      </div>
    </div>
  );
}