import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../api/axios";
import { 
  Trash2, Search, User, ClipboardCheck, X,
  Plus, Layers, Copy, Check, AlertTriangle, FileDown, 
  ChevronRight, Pencil, Hash, Phone, User2, Settings, Calendar, MapPin
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals & Selection State
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedService, setSelectedService] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null); 

  // Form State
  const [formData, setFormData] = useState({
    srfNumber: "",
    trackingCode: "",
    customerName: "",
    phone: "",
    address: "",
    date: "",
    make: "",
    hp: "",
    serialNumber: "",
    gatePassNumber: "",
    technician: "",
    stage: ""
  });

  const fetchAll = useCallback(async () => {
    try {
      const [s, t, st] = await Promise.all([
        api.get("/service"),
        api.get("/technicians"),
        api.get("/status")
      ]);
      setServices(s.data);
      setTechnicians(t.data);
      setStatuses(st.data);
    } catch (error) {
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const isDuplicateSRF = useMemo(() => {
    if (editingId) return false;
    const currentSRF = formData.srfNumber.trim().toLowerCase();
    if (!currentSRF) return false;
    return services.some(s => s.srfNumber?.trim().toLowerCase() === currentSRF);
  }, [formData.srfNumber, services, editingId]);

  const getFieldSuggestions = (field, value) => {
    if (!value || value.length < 2) return [];
    const val = value.toLowerCase();
    
    const allValues = services.map(s => {
      if (['make', 'hp', 'serialNumber', 'gatePassNumber'].includes(field)) {
        return s.motorDetails?.[field];
      }
      return s[field];
    }).filter(Boolean);

    return [...new Set(allValues)]
      .filter(item => item.toString().toLowerCase().includes(val))
      .slice(0, 5);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setActiveField(field); 
    
    if (field === 'srfNumber' && value.length > 1) {
      const val = value.toLowerCase();
      const matches = services.filter(s => 
        s.srfNumber?.toLowerCase().includes(val) || 
        s.customerName?.toLowerCase().includes(val) || 
        s.phone?.includes(val)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s) => {
    setFormData({
      srfNumber: s.srfNumber || "",
      trackingCode: s.trackingCode || "",
      customerName: s.customerName || "",
      phone: s.phone || "",
      address: s.address || "",
      date: s.updatedDate ? new Date(s.updatedDate).toISOString().split("T")[0] : "",
      make: s.motorDetails?.make || "",
      hp: s.motorDetails?.hp || "",
      serialNumber: s.motorDetails?.serialNumber || "",
      gatePassNumber: s.motorDetails?.gatePassNumber || "",
      technician: s.technician || "",
      stage: s.stage || ""
    });
    setShowSuggestions(false);
    setActiveField(null);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!editingId && isDuplicateSRF) {
      toast.error("Error: This SRF Number already exists!");
      return;
    }
    setIsSubmitting(true);
    try {
      // Backend expects flat fields and maps 'date' to 'updatedDate'
      const payload = { 
        srfNumber: formData.srfNumber,
        trackingCode: formData.trackingCode,
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        date: formData.date,
        make: formData.make,
        hp: formData.hp,
        serialNumber: formData.serialNumber,
        gatePassNumber: formData.gatePassNumber,
        technician: formData.technician,
        stage: formData.stage
      };

      if (editingId) {
        await api.put(`/service/${editingId}`, payload);
        toast.success("Updated");
      } else {
        await api.post("/service", payload);
        toast.success("Created");
      }
      setActiveModal(null);
      setEditingId(null);
      setFormData({ srfNumber: "", trackingCode: "", customerName: "", phone: "", address: "", date: "", make: "", hp: "", serialNumber: "", gatePassNumber: "", technician: "", stage: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally { setIsSubmitting(false); }
  };

  const handleEditClick = (s) => {
    setEditingId(s._id);
    setFormData({
      srfNumber: s.srfNumber || "", 
      trackingCode: s.trackingCode || "",
      customerName: s.customerName || "", 
      phone: s.phone || "",
      address: s.address || "", 
      date: s.updatedDate ? new Date(s.updatedDate).toISOString().split("T")[0] : "",
      make: s.motorDetails?.make || "",
      hp: s.motorDetails?.hp || "", 
      serialNumber: s.motorDetails?.serialNumber || "",
      gatePassNumber: s.motorDetails?.gatePassNumber || "",
      technician: s.technician || "", 
      stage: s.stage || ""
    });
    setActiveModal('addService');
  };

  const handleStatusChange = async (service, value) => {
    if (value === "Completed") {
      setSelectedService(service);
      setActiveModal('challan');
      return;
    }
    try {
      await api.put(`/service/${service._id}`, { stage: value });
      toast.success("Status Updated");
      fetchAll();
    } catch { toast.error("Update failed"); }
  };

  const handleTechnicianChange = async (serviceId, techName) => {
    try {
      await api.put(`/service/${serviceId}`, { technician: techName });
      toast.success(`Assigned to ${techName}`);
      fetchAll();
    } catch { toast.error("Failed to update"); }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const filteredServices = useMemo(() => {
    const t = search.toLowerCase();
    return services.filter(s => 
      [s.srfNumber, s.trackingCode, s.customerName, s.phone, s.technician, s.stage, s.motorDetails?.serialNumber]
      .some(field => field?.toLowerCase().includes(t))
    );
  }, [services, search]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans text-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" size={28}/> WORKSHOP OS
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Service Management System v2.4</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => { setEditingId(null); setFormData({ srfNumber: "", trackingCode: "", customerName: "", phone: "", address: "", date: "", make: "", hp: "", serialNumber: "", gatePassNumber: "", technician: "", stage: "" }); setActiveModal('addService'); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by SRF, Customer, Phone, or Technician..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveModal('tech')} className="bg-white border border-slate-200 px-4 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 text-sm font-bold"><User size={18}/> Techs</button>
          <button onClick={() => setActiveModal('status')} className="bg-white border border-slate-200 px-4 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 text-sm font-bold"><Layers size={18}/> Stages</button>
        </div>
      </div>

      {/* Main Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-300 border-b border-slate-200">
                {/* <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification</th> */}
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest">Customer & Address</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest">Technical Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest">Technician</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest">Current Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((s) => (
                <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash size={14} className="text-blue-500"/>
                      <span className="font-black text-slate-900">{s.srfNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${s.trackingCode ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                        {s.trackingCode || 'No Job Code'}
                      </span>
                      {s.trackingCode && (
                        <button onClick={() => copyToClipboard(s.trackingCode)} className="text-slate-300 hover:text-blue-500 transition-colors">
                          {copiedCode === s.trackingCode ? <Check size={12}/> : <Copy size={12}/>}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <User2 size={14} className="text-slate-400"/>
                      <span className="font-bold text-slate-800 text-sm">{s.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 ml-5 mb-1">
                      <Phone size={12}/> {s.phone || '---'}
                    </div>
                    <div className="flex items-start gap-2 text-[11px] font-medium text-slate-400 ml-5">
                      <MapPin size={12} className="mt-0.5 shrink-0"/> 
                      <span className="line-clamp-1">{s.address || 'No Address'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Calendar size={14} className="text-blue-400"/>
                      {s.updatedDate ? new Date(s.updatedDate).toLocaleDateString("en-IN") : '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-medium grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <p><span className="text-slate-400">Make:</span> <span className="text-slate-700">{s.motorDetails?.make || '-'}</span></p>
                      <p><span className="text-slate-400">HP:</span> <span className="text-slate-700">{s.motorDetails?.hp || '-'}</span></p>
                      <p><span className="text-slate-400">S/N:</span> <span className="text-slate-700 font-mono">{s.motorDetails?.serialNumber || '-'}</span></p>
                      <p><span className="text-slate-400">GP:</span> <span className="text-slate-700 font-bold">{s.motorDetails?.gatePassNumber || '-'}</span></p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={s.technician || ""} 
                      onChange={e => handleTechnicianChange(s._id, e.target.value)} 
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer w-full"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={s.stage}
                      onChange={e => handleStatusChange(s, e.target.value)}
                      className={`w-full text-[10px] font-black uppercase px-3 py-2 rounded-lg border outline-none cursor-pointer transition-all
                        ${s.stage === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {statuses.map(st => <option key={st._id} value={st.name}>{st.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEditClick(s)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Pencil size={18}/></button>
                      <button onClick={() => { setSelectedService(s); setActiveModal('confirmDelete'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {activeModal === 'addService' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">{editingId ? "Edit Record" : "New Service Entry"}</h2>
              <button onClick={() => { setActiveModal(null); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            
            <form onSubmit={handleAddService} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* SRF Number */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">SRF Number *</label>
                    <input required 
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all ${isDuplicateSRF ? 'border-red-500 ring-red-50' : 'border-slate-200 focus:ring-blue-500'}`} 
                      value={formData.srfNumber} onChange={e => handleFormChange('srfNumber', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {isDuplicateSRF && <span className="text-[10px] font-bold text-red-500 ml-1">SRF already exists</span>}
                    {showSuggestions && suggestions.length > 0 && activeField === 'srfNumber' && (
                      <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-xl z-[150] overflow-hidden">
                        {suggestions.map(match => (
                          <div key={match._id} onClick={() => selectSuggestion(match)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0">
                            <div>
                              <p className="text-sm font-black text-slate-900">{match.srfNumber}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{match.customerName}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300"/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tracking Code */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Job Code (Tracking)</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                      value={formData.trackingCode} onChange={(e) => handleFormChange('trackingCode', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {activeField === 'trackingCode' && (
                      <FieldSuggestionDropdown 
                        items={getFieldSuggestions('trackingCode', formData.trackingCode)} 
                        onSelect={(val) => { setFormData(prev => ({ ...prev, trackingCode: val })); setActiveField(null); }} 
                        onClose={() => setActiveField(null)} 
                      />
                    )}
                  </div>

                  {/* Customer Name */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Customer Name *</label>
                    <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.customerName} onChange={e => handleFormChange('customerName', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {activeField === 'customerName' && (
                      <FieldSuggestionDropdown 
                        items={getFieldSuggestions('customerName', formData.customerName)} 
                        onSelect={(val) => { setFormData(prev => ({ ...prev, customerName: val })); setActiveField(null); }} 
                        onClose={() => setActiveField(null)} 
                      />
                    )}
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {activeField === 'phone' && (
                      <FieldSuggestionDropdown 
                        items={getFieldSuggestions('phone', formData.phone)} 
                        onSelect={(val) => { setFormData(prev => ({ ...prev, phone: val })); setActiveField(null); }} 
                        onClose={() => setActiveField(null)} 
                      />
                    )}
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Address</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.address} onChange={e => handleFormChange('address', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Date Input */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                    <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.date} onChange={e => handleFormChange('date', e.target.value)} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Make */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Make</label>
                      <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.make} onChange={e => handleFormChange('make', e.target.value)} 
                        onBlur={() => setTimeout(() => setActiveField(null), 200)}
                      />
                      {activeField === 'make' && (
                        <FieldSuggestionDropdown 
                          items={getFieldSuggestions('make', formData.make)} 
                          onSelect={(val) => { setFormData(prev => ({ ...prev, make: val })); setActiveField(null); }} 
                          onClose={() => setActiveField(null)} 
                        />
                      )}
                    </div>
                    {/* HP */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">HP / RPM</label>
                      <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.hp} onChange={e => handleFormChange('hp', e.target.value)} 
                        onBlur={() => setTimeout(() => setActiveField(null), 200)}
                      />
                      {activeField === 'hp' && (
                        <FieldSuggestionDropdown 
                          items={getFieldSuggestions('hp', formData.hp)} 
                          onSelect={(val) => { setFormData(prev => ({ ...prev, hp: val })); setActiveField(null); }} 
                          onClose={() => setActiveField(null)} 
                        />
                      )}
                    </div>
                  </div>
                  {/* Serial Number */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Serial Number</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.serialNumber} onChange={e => handleFormChange('serialNumber', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {activeField === 'serialNumber' && (
                      <FieldSuggestionDropdown 
                        items={getFieldSuggestions('serialNumber', formData.serialNumber)} 
                        onSelect={(val) => { setFormData(prev => ({ ...prev, serialNumber: val })); setActiveField(null); }} 
                        onClose={() => setActiveField(null)} 
                      />
                    )}
                  </div>
                  {/* Gate Pass */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gate Pass Number</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                      value={formData.gatePassNumber} onChange={e => handleFormChange('gatePassNumber', e.target.value)} 
                      onBlur={() => setTimeout(() => setActiveField(null), 200)}
                    />
                    {activeField === 'gatePassNumber' && (
                      <FieldSuggestionDropdown 
                        items={getFieldSuggestions('gatePassNumber', formData.gatePassNumber)} 
                        onSelect={(val) => { setFormData(prev => ({ ...prev, gatePassNumber: val })); setActiveField(null); }} 
                        onClose={() => setActiveField(null)} 
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Initial Workflow Stage</label>
                    <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none" 
                      value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                      <option value="">Select Stage</option>
                      {statuses.map(st => <option key={st._id} value={st.name}>{st.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSubmitting || (!editingId && isDuplicateSRF)} 
                type="submit" 
                className={`w-full py-4 font-black rounded-xl transition-all shadow-lg 
                  ${(!editingId && isDuplicateSRF) 
                    ? 'bg-red-100 text-red-500 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}
              >
                {isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Create Service Record"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {activeModal === 'confirmDelete' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
          <div className="bg-white rounded-3xl w-full max-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32}/></div>
              <h3 className="text-xl font-black">Permanent Delete?</h3>
              <p className="text-slate-500 text-sm mt-2">Deleting <span className="font-bold text-slate-900">{selectedService?.srfNumber}</span> is irreversible.</p>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl">Back</button>
                <button onClick={() => { api.delete(`/service/${selectedService._id}`).then(() => { fetchAll(); setActiveModal(null); toast.success("Deleted"); }); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100">Confirm Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technician/Stage Manage Modal */}
      {(activeModal === 'tech' || activeModal === 'status') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{activeModal === 'tech' ? 'Technicians' : 'Stages'}</h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Name..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium" />
                <button onClick={async () => {
                    const ep = activeModal === 'tech' ? '/technicians' : '/status';
                    await api.post(ep, { name: newItemName });
                    setNewItemName(""); fetchAll();
                  }} className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-black transition-all"><Plus size={20}/></button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {(activeModal === 'tech' ? technicians : statuses).map(item => (
                  <div key={item._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl group transition-colors">
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    <button onClick={async () => {
                        const ep = activeModal === 'tech' ? '/technicians' : '/status';
                        await api.delete(`${ep}/${item._id}`); fetchAll();
                      }} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Challan Modal */}
      {activeModal === 'challan' && selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 p-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><ClipboardCheck size={40}/></div>
            <h2 className="text-2xl font-black text-slate-900">Finalize Delivery</h2>
            <div className="mt-8 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receiver Name</label>
              <input autoFocus value={receiverName} onChange={e => setReceiverName(e.target.value)} placeholder="Who received the motor?" className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <button disabled={isSubmitting} onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await api.put(`/service/${selectedService._id}`, { stage: "Completed", deliveryChallan: { generated: true, receiverName, date: new Date() } });
                    toast.success("Finalized"); setActiveModal(null); setReceiverName(""); fetchAll();
                  } catch { toast.error("Failed"); } finally { setIsSubmitting(false); }
                }} className="py-3 bg-emerald-600 text-white font-black rounded-xl text-sm shadow-lg shadow-emerald-50">{isSubmitting ? "Wait..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Dropdown Component
function FieldSuggestionDropdown({ items, onSelect, onClose }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 mt-1 rounded-xl shadow-xl z-[160] overflow-hidden border-t-0">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(item);
            onClose();
          }}
          className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0"
        >
          {item}
        </div>
      ))}
    </div>
  );
}