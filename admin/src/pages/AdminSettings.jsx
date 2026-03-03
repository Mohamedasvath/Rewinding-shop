import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { 
  Users, Layers, ShieldCheck, Plus, Trash2, 
  Settings as SettingsIcon, UserPlus, Zap, 
  Activity, CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";

export default function Settings() {
  const [technicians, setTechnicians] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState({ tech: "", status: "" });

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

  useEffect(() => { fetchData(); }, [fetchData]);

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center">Loading System Config...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <SettingsIcon className="text-white" size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">SYSTEM SETTINGS</h1>
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
  );
}