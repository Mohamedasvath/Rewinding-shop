import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { 
  Users, Layers, ShieldCheck, Plus, Trash2, 
  Settings as SettingsIcon, UserPlus, Zap, 
  Activity, CheckCircle2, Copy, ChevronDown, ChevronUp, Hash, X
} from "lucide-react";
import { toast } from "react-toastify";

export default function Settings() {
  const [technicians, setTechnicians] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState({ tech: "", status: "" });

  /* ─── TRACKING LIST STATE ─── */
  const [services, setServices] = useState([]);
  const [showTracking, setShowTracking] = useState(false); // collapsed by default
  const [copiedId, setCopiedId] = useState(null);          // per-row green flash

  /* ─── TRACKING MODAL STATE ─── */
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [modalCopiedId, setModalCopiedId] = useState(null);

  const handleModalCopy = (id, value) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setModalCopiedId(id);
      toast.success("Copied ✓");
      setTimeout(() => setModalCopiedId(null), 2000);
    }).catch(() => toast.error("Copy failed"));
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get("/service");
      setServices(res.data || []);
    } catch {
      /* fail silently — tracking list is non-critical */
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        api.get("/technicians"),
        api.get("/status")
      ]);
      setTechnicians(t.data);
      setStatuses(s.data);
    } catch (err) {
      toast.error("Failed to sync settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); fetchServices(); }, [fetchData, fetchServices]);

  const handleAdd = async (type) => {
    const value = type === 'tech' ? newName.tech : newName.status;
    const endpoint = type === 'tech' ? '/technicians' : '/status';
    if (!value.trim()) return toast.warn("Please enter a name");
    try {
      await api.post(endpoint, { name: value });
      setNewName({ ...newName, [type]: "" });
      fetchData();
      toast.success("Updated successfully");
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Remove this ${type === 'tech' ? 'technician' : 'stage'}?`)) return;
    const endpoint = type === 'tech' ? '/technicians' : '/status';
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ─── copy with per-row green flash ─── */
  const handleCopy = (id, value, label) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      toast.success(`${label} copied ✓`);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => toast.error("Copy failed"));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Loading System Config...</p>
      </div>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl">
                <SettingsIcon className="text-white" size={20} />
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">SYSTEM SETTINGS</h1>
            </div>

            {/* Tracking Codes button — mirrors Tech/Status style */}
            <button
              onClick={() => setShowTrackingModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm transition-all text-sm font-bold whitespace-nowrap shrink-0"
            >
              <Hash size={15} />
              <span className="hidden sm:inline">Tracking Codes</span>
              <span className="sm:hidden">Tracking</span>
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">
                {services.length}
              </span>
            </button>
          </div>
          <p className="text-slate-500 text-sm font-medium">Manage workshop workforce and workflow stages.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technicians</p>
              <p className="text-xl font-black text-slate-900">{technicians.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><Activity size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stages</p>
              <p className="text-xl font-black text-slate-900">{statuses.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><ShieldCheck size={22}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</p>
              <p className="text-sm font-black text-slate-900 uppercase">Master Admin</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Workforce Management */}
          <section className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <UserPlus className="text-blue-600" size={18}/>
              <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">Technician Roster</h2>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-6">
                <input 
                  value={newName.tech}
                  onChange={e => setNewName({...newName, tech: e.target.value})}
                  placeholder="Enter Name" 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all w-full"
                />
                <button onClick={() => handleAdd('tech')} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center">
                  <Plus size={20}/>
                </button>
              </div>
              <div className="space-y-2">
                {technicians.map((t) => (
                  <div key={t._id} className="flex justify-between items-center p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-sm truncate">{t.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(t._id, 'tech')} 
                      className="ml-2 p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Workflow Management */}
          <section className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Layers className="text-emerald-600" size={18}/>
              <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">Workflow Stages</h2>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-6">
                <input 
                  value={newName.status}
                  onChange={e => setNewName({...newName, status: e.target.value})}
                  placeholder="Enter Stage" 
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm transition-all w-full"
                />
                <button onClick={() => handleAdd('status')} className="bg-emerald-600 text-white px-5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center">
                  <Plus size={20}/>
                </button>
              </div>
              <div className="space-y-2">
                {statuses.map((s) => (
                  <div key={s._id} className="flex justify-between items-center p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <CheckCircle2 size={16} className={s.name === 'Completed' ? 'text-emerald-500' : 'text-slate-300'}/>
                      <span className="font-bold text-slate-700 text-sm truncate">{s.name}</span>
                    </div>
                    {s.name !== 'Completed' && (
                      <button 
                        onClick={() => handleDelete(s._id, 'status')} 
                        className="ml-2 p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* ══════════════════════════════════════════
            TRACKING CODES SECTION — collapsible
        ══════════════════════════════════════════ */}
        <div className="mt-6">

          {/* ── Toggle button ── */}
          <button
            onClick={() => setShowTracking(prev => !prev)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all shadow-sm
              ${showTracking
                ? "bg-blue-700 border-blue-800 text-white"
                : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${showTracking ? "bg-blue-600" : "bg-blue-50"}`}>
                <Hash size={15} className={showTracking ? "text-white" : "text-blue-600"} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-wider text-sm ${showTracking ? "text-white" : "text-slate-900"}`}>
                  Track Codes
                </p>
                <p className={`text-[10px] font-medium mt-0.5 ${showTracking ? "text-blue-200" : "text-slate-400"}`}>
                  {services.length} service records · SRF &amp; tracking identifiers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest hidden sm:inline-block
                ${showTracking
                  ? "bg-blue-600 border-blue-500 text-blue-100"
                  : "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                {services.length} Records
              </span>
              {showTracking
                ? <ChevronUp size={16} className="text-blue-200" />
                : <ChevronDown size={16} className="text-slate-400" />
              }
            </div>
          </button>

          {/* ── Collapsible content ── */}
          {showTracking && (
            <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Column headers */}
              <div className="grid grid-cols-12 items-center px-5 py-2.5 bg-slate-800">
                <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-400">#</div>
                <div className="col-span-4 text-[9px] font-black uppercase tracking-widest text-slate-300">Customer</div>
                <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300">SRF No.</div>
                <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300">Tracking Code</div>
                <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">Copy</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {services.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No tracking data found</p>
                  </div>
                ) : (
                  services.map((svc, idx) => {
                    const isCopied = copiedId === svc._id;
                    return (
                      <div
                        key={svc._id}
                        className="grid grid-cols-12 items-center px-5 py-3 hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Row number */}
                        <div className="col-span-1">
                          <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>
                        </div>

                        {/* Customer name + phone */}
                        <div className="col-span-4 min-w-0 pr-2">
                          <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                            {svc.customerName || "—"}
                          </p>
                          {svc.phone && (
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5 truncate">
                              {svc.phone}
                            </p>
                          )}
                        </div>

                        {/* SRF Number */}
                        <div className="col-span-3 pr-2">
                          <span className="font-mono font-bold text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg inline-block max-w-full truncate">
                            {svc.srfNumber || "—"}
                          </span>
                        </div>

                        {/* Tracking Code */}
                        <div className="col-span-3 pr-2">
                          <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg inline-block max-w-full truncate
                            ${svc.trackingCode
                              ? "text-blue-700 bg-blue-50 border border-blue-100"
                              : "text-slate-300 bg-slate-50"
                            }`}>
                            {svc.trackingCode || "—"}
                          </span>
                        </div>

                        {/* Copy button */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => handleCopy(svc._id, svc.trackingCode, "Tracking code")}
                            disabled={!svc.trackingCode}
                            title="Copy tracking code"
                            className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed
                              ${isCopied
                                ? "bg-emerald-500 text-white scale-110"
                                : "text-slate-300 hover:text-blue-600 hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                              }`}
                          >
                            {isCopied
                              ? <CheckCircle2 size={14} />
                              : <Copy size={14} />
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer note */}
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Hover any row · Click copy icon to copy tracking code to clipboard
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center pb-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Workshop Core v2.4 Active</span>
          </div>
          <p className="max-w-md text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
            Changes affect live service tracking. <br/> Use with authorization.
          </p>
        </div>

      </div>
    </div>

    {/* ══════════════════════════════════════════
        TRACKING CODES MODAL
    ══════════════════════════════════════════ */}
    {showTrackingModal && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-start sm:items-center z-[110] p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl border border-slate-100 flex flex-col my-4 sm:my-0 max-h-[90vh]">

          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Hash className="text-white" size={16} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  Tracking Codes
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Click copy to copy any tracking code · {services.length} records
                </p>
              </div>
            </div>
            <button
              onClick={() => { setShowTrackingModal(false); setModalCopiedId(null); }}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Column header bar */}
          <div className="grid grid-cols-12 items-center px-5 py-2.5 bg-slate-800 shrink-0">
            <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-400">#</div>
            <div className="col-span-4 text-[9px] font-black uppercase tracking-widest text-slate-300">Customer</div>
            <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300">SRF No.</div>
            <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300">Tracking Code</div>
            <div className="col-span-1 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">Copy</div>
          </div>

          {/* Scrollable rows */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {services.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Hash size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No tracking data found
                </p>
              </div>
            ) : (
              services.map((svc, idx) => {
                const isMCopied = modalCopiedId === svc._id;
                return (
                  <div
                    key={svc._id}
                    className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="col-span-1">
                      <span className="text-[10px] font-black text-slate-300">{idx + 1}</span>
                    </div>
                    <div className="col-span-4 min-w-0 pr-3">
                      <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                        {svc.customerName || "—"}
                      </p>
                    </div>
                    <div className="col-span-3 pr-2">
                      <span className="font-mono font-bold text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg inline-block max-w-full truncate">
                        {svc.srfNumber || "—"}
                      </span>
                    </div>
                    <div className="col-span-3 pr-2">
                      <span className={`font-mono font-bold text-xs px-2 py-1 rounded-lg inline-block max-w-full truncate
                        ${svc.trackingCode
                          ? "text-blue-700 bg-blue-50 border border-blue-100"
                          : "text-slate-300 bg-slate-50"
                        }`}>
                        {svc.trackingCode || "—"}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleModalCopy(svc._id, svc.trackingCode)}
                        disabled={!svc.trackingCode}
                        title="Copy tracking code"
                        className={`p-1.5 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed
                          ${isMCopied
                            ? "bg-emerald-500 text-white scale-110 shadow-md shadow-emerald-100"
                            : "text-slate-300 hover:text-blue-600 hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                          }`}
                      >
                        {isMCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl shrink-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Hover any row · Click copy icon · Code copied to clipboard instantly
            </p>
          </div>

        </div>
      </div>
    )}
    </>
  );
}