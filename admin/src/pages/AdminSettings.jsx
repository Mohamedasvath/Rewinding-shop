import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import {
  Users, Layers, ShieldCheck, Plus, Trash2,
  Settings as SettingsIcon, UserPlus, Zap,
  Activity, CheckCircle2, Copy, Hash, X,
  Search, RefreshCw, Server, Lock
} from "lucide-react";
import { toast } from "react-toastify";

/* ─── Stat card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-4">
      <div className={`${iconBg} p-3 rounded-xl shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Technician roster card ─────────────────────────────── */
function TechnicianSection({ technicians, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return toast.warn("Enter a name");
    setBusy(true);
    await onAdd(name.trim());
    setName("");
    setBusy(false);
  };

  const avatarColors = [
    "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700", "bg-green-100 text-green-700",
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-100 px-5 py-3.5 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <UserPlus size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Technician Roster</h2>
          <p className="text-[10px] text-slate-400 font-semibold">{technicians.length} technicians</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Add input */}
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Enter technician name..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder:text-slate-300"
          />
          <button
            onClick={handleAdd}
            disabled={busy || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-4 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1.5 text-xs font-bold"
          >
            {busy ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>

        {/* List */}
        {technicians.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No technicians added yet.</p>
        ) : (
          <div className="space-y-2">
            {technicians.map((t, i) => (
              <div key={t._id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0
                    ${avatarColors[i % avatarColors.length]}`}>
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{t.name}</span>
                </div>
                <button
                  onClick={() => onDelete(t._id, "tech")}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Workflow stages card ───────────────────────────────── */
function WorkflowSection({ statuses, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return toast.warn("Enter a stage name");
    setBusy(true);
    await onAdd(name.trim());
    setName("");
    setBusy(false);
  };

  const stageColors = [
    "bg-slate-100 text-slate-600", "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700",
    "bg-cyan-100 text-cyan-700", "bg-orange-100 text-orange-700",
    "bg-green-100 text-green-700", "bg-teal-100 text-teal-700",
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3.5 flex items-center gap-3">
        <div className="bg-emerald-600 p-2 rounded-xl">
          <Layers size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Workflow Stages</h2>
          <p className="text-[10px] text-slate-400 font-semibold">{statuses.length} stages defined</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Add input */}
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="New stage name..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all placeholder:text-slate-300"
          />
          <button
            onClick={handleAdd}
            disabled={busy || !name.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white px-4 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 text-xs font-bold"
          >
            {busy ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={16} />}
          </button>
        </div>

        {/* Flow visualization */}
        {statuses.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No stages defined yet.</p>
        ) : (
          <div className="space-y-1.5">
            {statuses.map((s, i) => (
              <div key={s._id}
                className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${stageColors[i % stageColors.length]}`}>
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                    {s.name === "Completed" && (
                      <span className="text-[9px] font-black text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full uppercase">Final</span>
                    )}
                  </div>
                </div>
                {s.name !== "Completed" && (
                  <button
                    onClick={() => onDelete(s._id, "status")}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Tracking Codes section ─────────────────────────────── */
function TrackingSection({ services }) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return services;
    return services.filter(s =>
      (s.customerName  || "").toLowerCase().includes(t) ||
      (s.srfNumber     || "").toLowerCase().includes(t) ||
      (s.trackingCode  || "").toLowerCase().includes(t)
    );
  }, [services, search]);

  const handleCopy = (id, code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      toast.success("Tracking code copied ✓");
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => toast.error("Copy failed"));
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Hash size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-black text-white text-sm uppercase tracking-wider">Tracking Codes</h2>
            <p className="text-[10px] text-slate-400 font-semibold">{filtered.length} of {services.length} records</p>
          </div>
        </div>
        <div className="relative min-w-[160px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 w-full font-semibold"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 items-center px-5 py-2 bg-slate-100 border-b border-slate-200">
        <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-400">#</div>
        <div className="col-span-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Customer</div>
        <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-500">SRF No.</div>
        <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Tracking Code</div>
        <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Copy</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Hash size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No records found</p>
          </div>
        ) : (
          filtered.map((svc, idx) => {
            const isCopied = copiedId === svc._id;
            return (
              <div
                key={svc._id}
                className="grid grid-cols-12 items-center px-5 py-3 hover:bg-blue-50/40 transition-colors group"
              >
                <div className="col-span-1">
                  <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>
                </div>
                <div className="col-span-4 min-w-0 pr-2">
                  <p className="font-bold text-slate-800 text-sm truncate">{svc.customerName || "—"}</p>
                  {svc.phone && <p className="text-[9px] text-slate-400 truncate">{svc.phone}</p>}
                </div>
                <div className="col-span-3 pr-2">
                  <span className="font-mono font-bold text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg inline-block max-w-full truncate">
                    {svc.srfNumber || "—"}
                  </span>
                </div>
                <div className="col-span-3 pr-2">
                  <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg inline-block max-w-full truncate
                    ${svc.trackingCode ? "text-blue-700 bg-blue-50 border border-blue-100" : "text-slate-300 bg-slate-50"}`}>
                    {svc.trackingCode || "—"}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleCopy(svc._id, svc.trackingCode)}
                    disabled={!svc.trackingCode}
                    title="Copy tracking code"
                    className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed
                      ${isCopied
                        ? "bg-emerald-500 text-white scale-110 shadow-sm"
                        : "text-slate-300 hover:text-blue-600 hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                      }`}
                  >
                    {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          Hover any row → click copy icon to copy tracking code to clipboard
        </p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const [technicians, setTechnicians] = useState([]);
  const [statuses,    setStatuses]    = useState([]);
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s, svc] = await Promise.all([
        api.get("/technicians"),
        api.get("/status"),
        api.get("/service"),
      ]);
      setTechnicians(t.data || []);
      setStatuses(s.data || []);
      setServices(svc.data || []);
    } catch {
      toast.error("Failed to sync settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Add handlers ── */
  const handleAdd = async (type, name) => {
    const endpoint = type === "tech" ? "/technicians" : "/status";
    try {
      await api.post(endpoint, { name });
      await fetchAll();
      toast.success(`"${name}" added`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  /* ── Delete handlers ── */
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Remove this ${type === "tech" ? "technician" : "stage"}?`)) return;
    const endpoint = type === "tech" ? "/technicians" : "/status";
    try {
      await api.delete(`${endpoint}/${id}`);
      await fetchAll();
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Settings...</p>
      </div>
    </div>
  );

  /* ════════════════ RENDER ══════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 pb-12">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <SettingsIcon size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">System Settings</h1>
              <p className="text-[10px] text-slate-400 font-semibold">Manage workforce, workflow & tracking</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-5 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={Users}       iconBg="bg-blue-50"   iconColor="text-blue-600"   label="Technicians"  value={technicians.length} />
          <StatCard icon={Activity}    iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Workflow Stages" value={statuses.length} />
          <StatCard icon={ShieldCheck} iconBg="bg-amber-50"  iconColor="text-amber-600"  label="Access Level" value={<span className="text-xs">Master Admin</span>} />
        </div>

        {/* ── Technicians + Workflow side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TechnicianSection
            technicians={technicians}
            onAdd={(name) => handleAdd("tech", name)}
            onDelete={handleDelete}
          />
          <WorkflowSection
            statuses={statuses}
            onAdd={(name) => handleAdd("status", name)}
            onDelete={handleDelete}
          />
        </div>

        {/* ── Tracking codes (full width) ── */}
        <TrackingSection services={services} />

        {/* ── System info footer ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: Server,  label: "System Version", value: "v2.4.0",       color: "text-blue-600",  bg: "bg-blue-50"  },
            { icon: Zap,     label: "Status",          value: "Live & Active", color: "text-green-600", bg: "bg-green-50" },
            { icon: Lock,    label: "Auth",            value: "JWT Secured",  color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-black text-slate-800">{value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}