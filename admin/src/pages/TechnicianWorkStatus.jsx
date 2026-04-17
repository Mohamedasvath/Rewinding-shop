import { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserCog, Search, X, ChevronDown, ChevronUp, RefreshCw,
  CheckCircle2, Clock, Wrench, Truck, AlertCircle, User,
  Calendar, Hash, ArrowUpDown, Save, Edit2, Filter, Plus,
  History, MapPin, ArrowRight, Layers, Lock, Eye, EyeOff
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

/* ─── Stage config ─────────────────────────────────────── */
const STAGES = [
  { value: "Received",    label: "Received",    color: "bg-slate-100 text-slate-700",   dot: "bg-slate-400",  border: "border-slate-300" },
  { value: "Inspection",  label: "Inspection",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500",   border: "border-blue-300"  },
  { value: "Dismantling", label: "Dismantling", color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500",  border: "border-amber-300" },
  { value: "Rewinding",   label: "Rewinding",   color: "bg-purple-100 text-purple-700", dot: "bg-purple-500", border: "border-purple-300"},
  { value: "Assembling",  label: "Assembling",  color: "bg-cyan-100 text-cyan-700",     dot: "bg-cyan-600",   border: "border-cyan-300"  },
  { value: "Testing",     label: "Testing",     color: "bg-orange-100 text-orange-700", dot: "bg-orange-500", border: "border-orange-300"},
  { value: "Completed",   label: "Completed",   color: "bg-green-100 text-green-700",   dot: "bg-green-500",  border: "border-green-300" },
  { value: "Delivered",   label: "Delivered",   color: "bg-teal-100 text-teal-700",     dot: "bg-teal-500",   border: "border-teal-300"  },
];
const stageMap = Object.fromEntries(STAGES.map(s => [s.value, s]));

function StagePill({ stage }) {
  const cfg = stageMap[stage] || stageMap["Received"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

/* ─── Work History Timeline ─────────────────────────────── */
function WorkHistoryPanel({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-[11px] text-slate-400 italic px-1">No history recorded yet.</p>;
  }
  const sorted = [...history].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  return (
    <div className="relative pl-5">
      {/* vertical line */}
      <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />
      {sorted.map((h, i) => {
        const cfg = stageMap[h.stage] || stageMap["Received"];
        const isLast = i === sorted.length - 1;
        return (
          <div key={h._id || i} className="relative mb-3 last:mb-0">
            {/* dot */}
            <span className={`absolute -left-3 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
            <div className={`ml-1 p-2.5 rounded-xl border ${isLast && !h.endedAt ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.color}`}>{h.stage}</span>
                {h.technician && (
                  <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                    <User size={9} /> {h.technician}
                  </span>
                )}
                {isLast && !h.endedAt && (
                  <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-semibold">
                <span>{fmtTime(h.startedAt)}</span>
                {h.endedAt && (
                  <>
                    <ArrowRight size={9} />
                    <span>{fmtTime(h.endedAt)}</span>
                  </>
                )}
                {!h.endedAt && <span className="text-blue-500">→ ongoing</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Single job row ────────────────────────────────────── */
function WorkRow({ rec, technicianNames, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tech, setTech]       = useState(rec.technician || "");
  const [stage, setStage]     = useState(rec.stage || "Received");
  const [saving, setSaving]   = useState(false);
  const [open, setOpen]       = useState(false);

  const dirty = tech !== (rec.technician || "") || stage !== (rec.stage || "Received");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(rec._id, { technician: tech, stage });
      setEditing(false);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="bg-blue-600 rounded-lg p-1.5"><Hash size={12} className="text-white" /></div>
          <span className="text-sm font-black text-slate-900">{rec.srfNumber}</span>
        </div>

        <div className="flex-1 min-w-[120px]">
          <p className="text-xs font-bold text-slate-700 truncate">{rec.customerName || "—"}</p>
          <p className="text-[10px] text-slate-400 truncate">
            {rec.motorDetails?.make || "Motor"} · {rec.motorDetails?.hp || "—"} HP
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
          <Calendar size={11} />{fmt(rec.updatedDate || rec.createdAt)}
        </div>

        {!editing && <StagePill stage={rec.stage} />}

        {!editing && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
              ${rec.technician ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
              {rec.technician ? rec.technician[0].toUpperCase() : <User size={11} />}
            </div>
            <span className={`text-xs font-semibold ${rec.technician ? "text-slate-800" : "text-slate-400"}`}>
              {rec.technician || "Unassigned"}
            </span>
          </div>
        )}

        {/* history badge */}
        {rec.workHistory?.length > 0 && !editing && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full shrink-0">
            <History size={10} />{rec.workHistory.length}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors">
                <Edit2 size={12}/> Edit
              </button>
              <button onClick={() => setOpen(o => !o)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                {open ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setTech(rec.technician||""); setStage(rec.stage||"Received"); setEditing(false); }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button disabled={saving || !dirty} onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors">
                {saving ? <RefreshCw size={12} className="animate-spin"/> : <Save size={12}/>} Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit controls */}
      {editing && (
        <div className="border-t border-slate-100 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Assign Technician</label>
            <div className="relative">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <select value={tech} onChange={e => setTech(e.target.value)}
                className="pl-8 pr-3 py-2 w-full border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-300 appearance-none">
                <option value="">— Unassigned —</option>
                {technicianNames.map(t => <option key={t} value={t}>{t}</option>)}
                {tech && !technicianNames.includes(tech) && <option value={tech}>{tech}</option>}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Work Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}
              className="px-3 py-2 w-full border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-300">
              {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Expanded: motor details + work history */}
      {open && !editing && (
        <div className="border-t border-slate-100 rounded-b-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-3 bg-slate-50/60">
            {[
              ["Make",      rec.motorDetails?.make],
              ["HP",        rec.motorDetails?.hp],
              ["KW",        rec.motorDetails?.kw],
              ["RPM",       rec.motorDetails?.rpm],
              ["Volts",     rec.motorDetails?.volts],
              ["Phase",     rec.motorDetails?.phase],
              ["Frame",     rec.motorDetails?.frame],
              ["Complaint", rec.natureOfComplaint],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lbl}</p>
                <p className="text-xs font-semibold text-slate-700">{val || "—"}</p>
              </div>
            ))}
          </div>

          {/* Work History Timeline */}
          <div className="px-4 pb-4 pt-2">
            <p className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              <History size={11}/> Work History
            </p>
            <WorkHistoryPanel history={rec.workHistory} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Per-Technician Card (in Technician View tab) ──────── */
function TechnicianCard({ name, services }) {
  const active    = services.filter(s => !["Completed","Delivered"].includes(s.stage));
  const completed = services.filter(s => ["Completed","Delivered"].includes(s.stage));

  const initial = name ? name[0].toUpperCase() : "?";
  const colors  = ["bg-blue-600","bg-purple-600","bg-amber-600","bg-green-600","bg-rose-600","bg-cyan-600"];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-100">
        <div className={`w-10 h-10 rounded-2xl ${colors[colorIdx]} flex items-center justify-center text-white font-black text-lg shrink-0`}>
          {initial}
        </div>
        <div>
          <p className="font-black text-slate-900 text-sm">{name}</p>
          <p className="text-[10px] text-slate-400 font-semibold">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
            {active.length} Active
          </span>
          <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
            {completed.length} Done
          </span>
        </div>
      </div>

      {/* Active jobs */}
      {active.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
            <MapPin size={9}/> Currently Working On
          </p>
          <div className="space-y-1.5">
            {active.map(s => (
              <div key={s._id} className="flex items-center gap-2 bg-amber-50/50 border border-amber-100 rounded-xl px-3 py-2">
                <Hash size={10} className="text-blue-600 shrink-0"/>
                <span className="text-xs font-black text-slate-800">{s.srfNumber}</span>
                <span className="text-[10px] text-slate-500 truncate flex-1">{s.customerName}</span>
                <StagePill stage={s.stage}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed jobs */}
      {completed.length > 0 && (
        <div className="px-4 pt-3 pb-4">
          <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1">
            <CheckCircle2 size={9}/> Completed Jobs
          </p>
          <div className="space-y-1.5">
            {completed.slice(0, 4).map(s => (
              <div key={s._id} className="flex items-center gap-2 bg-green-50/40 border border-green-100 rounded-xl px-3 py-2">
                <Hash size={10} className="text-green-600 shrink-0"/>
                <span className="text-xs font-bold text-slate-700">{s.srfNumber}</span>
                <span className="text-[10px] text-slate-500 truncate flex-1">{s.customerName}</span>
                <span className="text-[10px] text-slate-400">{fmt(s.completedAt || s.lastUpdatedAt)}</span>
              </div>
            ))}
            {completed.length > 4 && (
              <p className="text-[10px] text-slate-400 font-semibold pl-1">+{completed.length - 4} more jobs</p>
            )}
          </div>
        </div>
      )}

      {(active.length === 0 && completed.length === 0) && (
        <p className="px-4 py-4 text-[11px] text-slate-400 italic">No jobs assigned yet.</p>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function TechnicianWorkStatus() {
  const [services,    setServices]    = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("jobs");
  const [search,      setSearch]      = useState("");
  const [filterTech,  setFilterTech]  = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [sortOrder,   setSortOrder]   = useState("newest");
  const [newTech,     setNewTech]     = useState("");
  const [addingTech,  setAddingTech]  = useState(false);

  /* ── Password Lock ── */
  const ADMIN_PASSWORD = "admin123";
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try { return localStorage.getItem("tech_status_unlock") === "true"; } catch { return false; }
  });
  const [pwInput,  setPwInput]  = useState("");
  const [pwError,  setPwError]  = useState("");
  const [showPw,   setShowPw]   = useState(false);

  const handleUnlock = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setPwError("");
      try { localStorage.setItem("tech_status_unlock", "true"); } catch {}
    } else {
      setPwError("Incorrect password. Please try again.");
      setPwInput("");
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [svc, tech] = await Promise.all([
        api.get("/service"),
        api.get("/technicians"),
      ]);
      setServices(svc.data || []);
      setTechnicians(tech.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const technicianNames = useMemo(() => technicians.map(t => t.name), [technicians]);

  const handleAddTech = async () => {
    const name = newTech.trim();
    if (!name) return;
    setAddingTech(true);
    try {
      const { data } = await api.post("/technicians", { name });
      setTechnicians(prev => [data, ...prev]);
      setNewTech("");
      toast.success(`"${name}" added`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add");
    } finally {
      setAddingTech(false);
    }
  };

  const handleDeleteTech = async (id, name) => {
    try {
      await api.delete(`/technicians/${id}`);
      setTechnicians(prev => prev.filter(t => t._id !== id));
      toast.success(`"${name}" removed`);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSave = useCallback(async (id, payload) => {
    await api.put(`/service/${id}`, payload);
    // optimistic update + re-fetch for fresh workHistory
    const { data } = await api.get("/service");
    setServices(data || []);
    toast.success("Updated!");
  }, []);

  /* filtered jobs list */
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    return services
      .filter(s => {
        if (filterTech === "")       { if (s.technician)              return false; }
        else if (filterTech !== "All") { if (s.technician !== filterTech) return false; }
        if (filterStage !== "All" && s.stage !== filterStage) return false;
        if (!t) return true;
        return (
          (s.srfNumber     || "").toLowerCase().includes(t) ||
          (s.customerName  || "").toLowerCase().includes(t) ||
          (s.technician    || "").toLowerCase().includes(t) ||
          (s.motorDetails?.make || "").toLowerCase().includes(t)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.updatedDate || a.createdAt);
        const db = new Date(b.updatedDate || b.createdAt);
        return sortOrder === "newest" ? db - da : da - db;
      });
  }, [services, search, filterTech, filterStage, sortOrder]);

  /* per-technician grouping for "Technician" tab */
  const byTechnician = useMemo(() => {
    const map = {};
    // include all known technicians even if 0 jobs
    technicianNames.forEach(n => { if (!map[n]) map[n] = []; });
    services.forEach(s => {
      if (s.technician) {
        if (!map[s.technician]) map[s.technician] = [];
        map[s.technician].push(s);
      }
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [services, technicianNames]);

  const stats = useMemo(() => ({
    total:      services.length,
    active:     services.filter(s => !["Completed","Delivered"].includes(s.stage)).length,
    completed:  services.filter(s => ["Completed","Delivered"].includes(s.stage)).length,
    unassigned: services.filter(s => !s.technician).length,
  }), [services]);

  /* ═══════════════ RENDER ════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-10">

      {/* ── PASSWORD LOCK OVERLAY ── */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-5">
            {/* Icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Lock size={28} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Restricted Access</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Technician Work Status is password protected</p>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter admin password"
                value={pwInput}
                onChange={e => setPwInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                autoFocus
                className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm font-semibold outline-none transition-all
                  ${ pwError
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  }`}
              />
              <button
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {pwError && (
              <p className="text-xs text-red-500 font-semibold text-center -mt-2">{pwError}</p>
            )}

            {/* Unlock Button */}
            <button
              onClick={handleUnlock}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md shadow-blue-100 text-sm"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 px-4 md:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-xl shrink-0"><UserCog size={20} className="text-white"/></div>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">Technician Work Status</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">{filtered.length} of {services.length} jobs</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Tab toggle */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden shrink-0">
              {[["jobs","Jobs / SRF"],["technicians","By Technician"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors
                    ${tab === key ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "jobs" && (
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="text" placeholder="SRF / customer / motor..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full outline-none focus:ring-2 focus:ring-blue-300 transition-all"/>
                {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={13}/></button>}
              </div>
            )}
            <button onClick={fetchAll} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Jobs",  value: stats.total,      color: "border-blue-200 bg-blue-50",   tc: "text-blue-700"  },
            { label: "Active",      value: stats.active,     color: "border-amber-200 bg-amber-50",  tc: "text-amber-700" },
            { label: "Completed",   value: stats.completed,  color: "border-green-200 bg-green-50",  tc: "text-green-700" },
            { label: "Unassigned",  value: stats.unassigned, color: "border-red-200 bg-red-50",      tc: "text-red-700"   },
          ].map(({ label, value, color, tc }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
              <p className={`text-3xl font-black mt-1 ${tc}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── JOBS TAB ─────────────────────────────────────── */}
        {tab === "jobs" && (
          <>
            {/* Technician manager + filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Add technician */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Manage Technicians</p>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Name..." value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddTech()}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300 font-semibold"/>
                  <button onClick={handleAddTech} disabled={addingTech || !newTech.trim()}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-xs font-bold rounded-xl transition-colors">
                    {addingTech ? <RefreshCw size={12} className="animate-spin"/> : <Plus size={12}/>} Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {technicians.length === 0 && <p className="text-[11px] text-slate-400 italic">No technicians yet.</p>}
                  {technicians.map(t => (
                    <span key={t._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold rounded-full">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">{t.name[0].toUpperCase()}</span>
                      {t.name}
                      <button onClick={() => handleDeleteTech(t._id, t.name)} className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"><X size={10}/></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><Filter size={11}/> Filters</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Technician</label>
                    <select value={filterTech} onChange={e => setFilterTech(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="All">All</option>
                      <option value="">Unassigned</option>
                      {technicianNames.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Stage</label>
                    <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="All">All Stages</option>
                      {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Sort</label>
                    <button onClick={() => setSortOrder(o => o === "newest" ? "oldest" : "newest")}
                      className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 transition-colors">
                      <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                      <ArrowUpDown size={13} className="text-slate-400"/>
                    </button>
                  </div>
                </div>
                {/* Quick stage pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STAGES.map(s => {
                    const count = services.filter(srv => srv.stage === s.value).length;
                    if (!count) return null;
                    return (
                      <button key={s.value}
                        onClick={() => setFilterStage(filterStage === s.value ? "All" : s.value)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${filterStage === s.value ? "ring-2 ring-blue-400 border-blue-300" : "border-transparent"} ${s.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>{s.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Jobs list */}
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <RefreshCw size={28} className="animate-spin text-blue-500"/>
                <p className="text-xs text-slate-400 font-semibold">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <UserCog size={36} className="text-slate-300"/>
                <p className="text-sm text-slate-400 font-semibold">No records match</p>
                <button onClick={() => { setSearch(""); setFilterTech("All"); setFilterStage("All"); }}
                  className="text-xs text-blue-600 font-bold hover:underline">Clear filters</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(rec => (
                  <WorkRow key={rec._id} rec={rec} technicianNames={technicianNames} onSave={handleSave}/>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TECHNICIAN TAB ───────────────────────────────── */}
        {tab === "technicians" && (
          <>
            {byTechnician.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3">
                <User size={36} className="text-slate-300"/>
                <p className="text-sm text-slate-400 font-semibold">No technicians added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {byTechnician.map(([name, svcList]) => (
                  <TechnicianCard key={name} name={name} services={svcList}/>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
