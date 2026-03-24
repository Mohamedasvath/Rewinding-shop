import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import api from "../api/axios";
import {
  Trash2, Search, User, ClipboardCheck, X,
  Plus, Layers, AlertTriangle,
  Pencil, User2, Settings, ClipboardList,
  CheckCircle2, AlertCircle, Loader2, Wrench, Calendar
} from "lucide-react";
import { toast } from "react-toastify";

/* ─────────────── HELPERS ─────────────── */
const MotorField = ({ label, value }) =>
  value ? (
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
      <span className="text-[11px] font-bold text-slate-700 leading-tight">{value}</span>
    </div>
  ) : (
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">{label}</span>
      <span className="text-[11px] text-slate-300">—</span>
    </div>
  );

/* ─────────────── FORM INPUT ─────────────── */
const FormInput = ({ label, placeholder, value, onChange, onBlur, error, touched: t, type = "text", required: req, mono }) => {
  const hasError = t && error;
  const isValid = t && !error && value;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}{req && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all
            ${mono ? "font-mono" : ""}
            ${hasError
              ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
              : isValid
                ? "border-emerald-300 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-200"
                : "border-slate-200 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            }`}
        />
        {isValid && <CheckCircle2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />}
        {hasError && <AlertCircle size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400" />}
      </div>
      {hasError && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};

const FormTextarea = ({ label, placeholder, value, onChange, rows = 2 }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
    />
  </div>
);

const FormSelect = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all appearance-none cursor-pointer"
    >
      {children}
    </select>
  </div>
);

/* ─────────────── SECTION HEADER ─────────────── */
const SectionHeader = ({ icon: Icon, label, color }) => (
  <div className={`flex items-center gap-2 pb-2 border-b ${color === 'blue' ? 'border-blue-100' : color === 'amber' ? 'border-amber-100' : color === 'emerald' ? 'border-emerald-100' : 'border-purple-100'}`}>
    <div className={`p-1.5 rounded-md ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'amber' ? 'bg-amber-50 text-amber-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'}`}>
      <Icon size={12} />
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest ${color === 'blue' ? 'text-blue-600' : color === 'amber' ? 'text-amber-600' : color === 'emerald' ? 'text-emerald-600' : 'text-purple-600'}`}>
      {label}
    </span>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const suggBoxRef = useRef(null);

  const [touched, setTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const EMPTY = {
    srfNumber: "", trackingCode: "", customerName: "", phone: "",
    address: "", date: "",
    make: "", hp: "", rpm: "", kw: "", volts: "", amps: "",
    phase: "", type: "", ins: "", frame: "",
    serialNumber: "", gatePassNumber: "",
    technician: "", stage: "",
    natureOfComplaint: "", sparesReceived: ""
  };

  const [form, setForm] = useState(EMPTY);

  /* fetch */
  const fetchAll = useCallback(async () => {
    try {
      const [s, t, st] = await Promise.all([
        api.get("/service"), api.get("/technicians"), api.get("/status")
      ]);
      setServices(s.data); setTechnicians(t.data); setStatuses(st.data);
    } catch { toast.error("Database sync failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* close suggestions on outside click */
  useEffect(() => {
    const h = (e) => { if (suggBoxRef.current && !suggBoxRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* duplicate check */
  const isDuplicate = useMemo(() => {
    if (editingId) return false;
    const v = form.srfNumber.trim().toLowerCase();
    return v ? services.some(s => s.srfNumber?.trim().toLowerCase() === v) : false;
  }, [form.srfNumber, services, editingId]);

  /* validate */
  const validate = useCallback((data, dup) => {
    const e = {};
    if (!data.srfNumber.trim()) e.srfNumber = "SRF Number is required";
    if (dup) e.srfNumber = "⚠ SRF already exists";
    if (!data.customerName.trim()) e.customerName = "Customer name is required";
    if (data.phone && !/^\d{7,15}$/.test(data.phone.trim())) e.phone = "Invalid phone number";
    return e;
  }, []);

  /* form change */
  const setField = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setActiveField(field);
    if (touched[field]) setFormErrors(validate(updated, field === "srfNumber" ? false : isDuplicate));

    if ((field === "srfNumber" || field === "customerName") && value.length > 1) {
      const v = value.toLowerCase();
      const m = services.filter(s =>
        String(s.srfNumber || "").toLowerCase().includes(v) ||
        String(s.customerName || "").toLowerCase().includes(v) ||
        String(s.phone || "").includes(v)
      ).slice(0, 6);
      setSuggestions(m);
      setShowSuggestions(m.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const blur = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    setFormErrors(validate(form, isDuplicate));
  };

  /* autofill */
  const pick = (s) => {
    setForm({
      srfNumber: s.srfNumber || "", trackingCode: s.trackingCode || "",
      customerName: s.customerName || "", phone: s.phone || "",
      address: s.address || "",
      date: s.updatedDate ? new Date(s.updatedDate).toISOString().split("T")[0] : "",
      make: s.motorDetails?.make || "", hp: s.motorDetails?.hp || "",
      rpm: s.motorDetails?.rpm || "", kw: s.motorDetails?.kw || "",
      volts: s.motorDetails?.volts || "", amps: s.motorDetails?.amps || "",
      phase: s.motorDetails?.phase || "", type: s.motorDetails?.type || "",
      ins: s.motorDetails?.ins || "", frame: s.motorDetails?.frame || "",
      serialNumber: s.motorDetails?.serialNumber || "",
      gatePassNumber: s.motorDetails?.gatePassNumber || "",
      technician: s.technician || "", stage: s.stage || "",
      natureOfComplaint: s.natureOfComplaint || "",
      sparesReceived: s.sparesReceived || "",
    });
    setShowSuggestions(false); setActiveField(null);
    setFormErrors({}); setTouched({});
  };

  const reset = () => { setForm(EMPTY); setEditingId(null); setTouched({}); setFormErrors({}); setShowSuggestions(false); };

  /* submit */
  const submit = async (e) => {
    e.preventDefault();
    setTouched({ srfNumber: true, customerName: true, phone: true });
    const errs = validate(form, isDuplicate);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        srfNumber: form.srfNumber, trackingCode: form.trackingCode,
        customerName: form.customerName, phone: form.phone, address: form.address,
        date: form.date ? new Date(form.date) : new Date(),
        technician: form.technician, stage: form.stage,
        motorDetails: {
          make: form.make, hp: form.hp, rpm: form.rpm, kw: form.kw,
          volts: form.volts, amps: form.amps, phase: form.phase,
          type: form.type, ins: form.ins, frame: form.frame,
          serialNumber: form.serialNumber, gatePassNumber: form.gatePassNumber,
        },
        natureOfComplaint: form.natureOfComplaint,
        sparesReceived: form.sparesReceived,
      };
      if (editingId) {
        await api.put(`/service/${editingId}`, payload);
        toast.success("Record updated ✓");
      } else {
        await api.post("/service", payload);
        toast.success("Service created ✓");
      }
      setActiveModal(null); reset(); fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally { setIsSubmitting(false); }
  };

  /* edit */
  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      srfNumber: s.srfNumber || "", trackingCode: s.trackingCode || "",
      customerName: s.customerName || "", phone: s.phone || "",
      address: s.address || "",
      date: s.updatedDate ? new Date(s.updatedDate).toISOString().split("T")[0] : "",
      make: s.motorDetails?.make || "", hp: s.motorDetails?.hp || "",
      rpm: s.motorDetails?.rpm || "", kw: s.motorDetails?.kw || "",
      volts: s.motorDetails?.volts || "", amps: s.motorDetails?.amps || "",
      phase: s.motorDetails?.phase || "", type: s.motorDetails?.type || "",
      ins: s.motorDetails?.ins || "", frame: s.motorDetails?.frame || "",
      serialNumber: s.motorDetails?.serialNumber || "",
      gatePassNumber: s.motorDetails?.gatePassNumber || "",
      technician: s.technician || "", stage: s.stage || "",
      natureOfComplaint: s.natureOfComplaint || "",
      sparesReceived: s.sparesReceived || "",
    });
    setTouched({}); setFormErrors({});
    setActiveModal("addService");
  };

  const handleStatusChange = async (service, value) => {
    if (value === "Completed") { setSelectedService(service); setActiveModal("challan"); return; }
    try { await api.put(`/service/${service._id}`, { stage: value }); toast.success("Status updated"); fetchAll(); }
    catch { toast.error("Update failed"); }
  };

  const handleTechChange = async (id, name) => {
    try { await api.put(`/service/${id}`, { technician: name }); toast.success(`Assigned to ${name}`); fetchAll(); }
    catch { toast.error("Failed"); }
  };

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return services.filter(s =>
      [s.srfNumber, s.trackingCode, s.customerName, s.phone, s.technician, s.stage, s.motorDetails?.serialNumber, s.address]
        .some(f => String(f || "").toLowerCase().includes(t))
    );
  }, [services, search]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="p-4 md:p-6">

        {/* Header */}
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Settings className="text-blue-600" size={26} /> SERVICE MANAGEMENT
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-0.5">Workshop Admin Panel</p>
          </div>
          <button
            onClick={() => { reset(); setActiveModal("addService"); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>

        {/* Search + buttons */}
        <div className="max-w-[1400px] mx-auto mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by SRF, name, phone, tracking..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setActiveModal("tech")}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 text-sm font-bold whitespace-nowrap">
            <User size={15} /> Techs
          </button>
          <button onClick={() => setActiveModal("status")}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 text-sm font-bold whitespace-nowrap">
            <Layers size={15} /> Stages
          </button>
        </div>

        {/* ── TABLE WRAPPER: overflow-x-auto enables horizontal scroll on mobile ── */}
        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse table-fixed text-xs">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />   {/* Motor ↑ */}
                <col style={{ width: "20%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />    {/* Status ↓ */}
                <col style={{ width: "11%" }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["SRF /T-code", "Customer", "Date", "Motor Details", "Spares", "Technician", "Status", "Actions"].map(h => (
                    <th key={h} className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">No records found</td>
                  </tr>
                )}
                {filtered.map(s => (
                  <tr key={s._id} className="border-b border-slate-200 hover:bg-slate-50 align-top">

                    {/* SRF */}
                    <td className="px-3 py-3">
                      <p className="font-black text-slate-900 text-sm leading-tight">{s.srfNumber}</p>
                      <p
                        className="text-[10px] font-bold text-blue-500 mt-0.5 cursor-pointer hover:text-blue-700 hover:underline transition-colors"
                        title="Click to copy tracking code"
                        onClick={() => {
                          if (s.trackingCode) {
                            navigator.clipboard.writeText(s.trackingCode);
                            toast.success("Tracking code copied");
                          }
                        }}
                      >
                        {s.trackingCode || "—"}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-3 py-3">
                      <p className="font-bold text-slate-800 text-sm leading-tight truncate">{s.customerName}</p>
                      {s.phone && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <span className="text-slate-400 shrink-0">📞</span>
                          <span className="truncate">{s.phone}</span>
                        </p>
                      )}
                      {s.address && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-start gap-1 leading-tight">
                          <span className="text-slate-300 shrink-0 mt-px">📍</span>
                          <span className="line-clamp-2 break-words">{s.address}</span>
                        </p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-600">
                        {s.updatedDate ? new Date(s.updatedDate).toLocaleDateString("en-IN") : "—"}
                      </p>
                    </td>

                    {/* Motor Details — 2 col grid */}
                    <td className="px-2 py-2">
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <MotorField label="Make" value={s.motorDetails?.make} />
                        <MotorField label="HP" value={s.motorDetails?.hp} />
                        <MotorField label="RPM" value={s.motorDetails?.rpm} />
                        <MotorField label="KW" value={s.motorDetails?.kw} />
                        <MotorField label="Volts" value={s.motorDetails?.volts} />
                        <MotorField label="Amps" value={s.motorDetails?.amps} />
                        <MotorField label="Phase" value={s.motorDetails?.phase} />
                        <MotorField label="Type" value={s.motorDetails?.type} />
                        <MotorField label="Ins" value={s.motorDetails?.ins} />
                        <MotorField label="Frame" value={s.motorDetails?.frame} />
                        <MotorField label="S/N" value={s.motorDetails?.serialNumber} />
                        <MotorField label="G.P." value={s.motorDetails?.gatePassNumber} />
                      </div>
                    </td>

                    {/* Complaint & Spares — always render cell */}
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Complaint</p>
                          <p className="text-[11px] text-slate-700 leading-snug">
                            {s.natureOfComplaint || <span className="text-slate-300 italic">None</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Spares</p>
                          <p className="text-[11px] text-slate-700 leading-snug">
                            {s.sparesReceived || <span className="text-slate-300 italic">None</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Technician */}
                    <td className="px-3 py-3">
                      <select
                        value={s.technician || ""}
                        onChange={e => handleTechChange(s._id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer"
                      >
                        <option value="">Assign</option>
                        {technicians.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <select
                        value={s.stage}
                        onChange={e => handleStatusChange(s, e.target.value)}
                        className={`w-full text-[10px] font-black uppercase px-2 py-1.5 rounded-lg border outline-none cursor-pointer
                          ${s.stage === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {statuses.map(st => <option key={st._id} value={st.name}>{st.name}</option>)}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => { setSelectedService(s); setActiveModal("confirmDelete"); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════ ADD / EDIT MODAL ══════════ */}
      {activeModal === "addService" && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] border border-slate-100">

            {/* Modal header */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50 rounded-t-2xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Settings size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">{editingId ? "Edit Service Record" : "New Service Entry"}</h2>
                  <p className="text-[10px] text-slate-400">Fields marked <span className="text-red-400 font-bold">*</span> are required</p>
                </div>
              </div>
              <button onClick={() => { setActiveModal(null); reset(); }}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto">
              <form onSubmit={submit} className="p-6 space-y-6">

                {/* ── ROW 1: SRF + Job Code + Date ── */}
                <div ref={suggBoxRef} className="space-y-4">
                  <SectionHeader icon={User2} label="Client Information" color="blue" />
                  <div className="grid grid-cols-3 gap-4">

                    {/* SRF with autocomplete */}
                    <div className="relative">
                      <FormInput
                        label="SRF Number" required placeholder="e.g. SRF-001"
                        value={form.srfNumber}
                        onChange={e => setField("srfNumber", e.target.value)}
                        onBlur={() => { blur("srfNumber"); setTimeout(() => setShowSuggestions(false), 180); }}
                        error={formErrors.srfNumber} touched={touched.srfNumber}
                      />
                      {isDuplicate && !touched.srfNumber && (
                        <p className="text-[10px] text-red-500 font-medium mt-0.5 flex items-center gap-1">
                          <AlertCircle size={9} /> Already exists
                        </p>
                      )}
                      {showSuggestions && activeField === "srfNumber" && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-[280px] bg-white border border-slate-200 mt-1 rounded-xl shadow-2xl z-[200] overflow-hidden">
                          <p className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b">Existing Records</p>
                          {suggestions.map(s => (
                            <div key={s._id} onMouseDown={() => pick(s)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0">
                              <p className="text-xs font-bold text-slate-800">{s.srfNumber} — {s.customerName}</p>
                              <p className="text-[10px] text-slate-400">{s.phone}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <FormInput label="Job / Tracking Code" placeholder="e.g. TRK-123"
                      value={form.trackingCode} onChange={e => setField("trackingCode", e.target.value)}
                      error={formErrors.trackingCode} touched={touched.trackingCode}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                      <input type="date" value={form.date} onChange={e => setField("date", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Customer Name + Phone + Address */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <FormInput label="Customer Name" required placeholder="Full name"
                        value={form.customerName}
                        onChange={e => setField("customerName", e.target.value)}
                        onBlur={() => { blur("customerName"); setTimeout(() => setShowSuggestions(false), 180); }}
                        error={formErrors.customerName} touched={touched.customerName}
                      />
                      {showSuggestions && activeField === "customerName" && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-[280px] bg-white border border-slate-200 mt-1 rounded-xl shadow-2xl z-[200] overflow-hidden">
                          <p className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border-b">Existing Customers</p>
                          {suggestions.map(s => (
                            <div key={s._id} onMouseDown={() => pick(s)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0">
                              <p className="text-xs font-bold text-slate-800">{s.customerName}</p>
                              <p className="text-[10px] text-slate-400">{s.srfNumber} · {s.phone}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormInput label="Phone" placeholder="10-digit number"
                      value={form.phone} onChange={e => setField("phone", e.target.value)}
                      onBlur={() => blur("phone")}
                      error={formErrors.phone} touched={touched.phone}
                    />
                    <FormInput label="Address" placeholder="City / Area"
                      value={form.address} onChange={e => setField("address", e.target.value)}
                    />
                  </div>
                </div>

                {/* ── ROW 2: Complaints ── */}
                <div className="space-y-3">
                  <SectionHeader icon={ClipboardList} label="Complaints & Spares" color="amber" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormTextarea label="Nature of Complaint" placeholder="Describe the problem..."
                      value={form.natureOfComplaint} onChange={e => setField("natureOfComplaint", e.target.value)}
                    />
                    <FormTextarea label="Spares Received" placeholder="List spares received..."
                      value={form.sparesReceived} onChange={e => setField("sparesReceived", e.target.value)}
                    />
                  </div>
                </div>

                {/* ── ROW 3: Motor Details ── */}
                <div className="space-y-3">
                  <SectionHeader icon={Wrench} label="Motor / Technical Details" color="emerald" />
                  <div className="grid grid-cols-4 gap-3">
                    <FormInput label="Make" placeholder="e.g. Siemens" value={form.make} onChange={e => setField("make", e.target.value)} />
                    <FormInput label="HP" placeholder="e.g. 5" value={form.hp} onChange={e => setField("hp", e.target.value)} />
                    <FormInput label="RPM" placeholder="e.g. 1440" value={form.rpm} onChange={e => setField("rpm", e.target.value)} />
                    <FormInput label="KW" placeholder="e.g. 3.7" value={form.kw} onChange={e => setField("kw", e.target.value)} />
                    <FormInput label="Volts" placeholder="e.g. 415" value={form.volts} onChange={e => setField("volts", e.target.value)} />
                    <FormInput label="Amps" placeholder="e.g. 8.5" value={form.amps} onChange={e => setField("amps", e.target.value)} />
                    <FormInput label="Phase" placeholder="e.g. 3" value={form.phase} onChange={e => setField("phase", e.target.value)} />
                    <FormInput label="Type" placeholder="e.g. TEFC" value={form.type} onChange={e => setField("type", e.target.value)} />
                    <FormInput label="Insulation" placeholder="e.g. F" value={form.ins} onChange={e => setField("ins", e.target.value)} />
                    <FormInput label="Frame" placeholder="e.g. 132M" value={form.frame} onChange={e => setField("frame", e.target.value)} />
                    <FormInput label="Serial Number" placeholder="S/N" value={form.serialNumber} mono onChange={e => setField("serialNumber", e.target.value)} />
                    <FormInput label="Gate Pass No." placeholder="G.P." value={form.gatePassNumber} mono onChange={e => setField("gatePassNumber", e.target.value)} />
                  </div>
                </div>

                {/* ── ROW 4: Assignment ── */}
                <div className="space-y-3">
                  <SectionHeader icon={User} label="Assignment" color="purple" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormSelect label="Assign Technician" value={form.technician} onChange={e => setField("technician", e.target.value)}>
                      <option value="">— Select Technician —</option>
                      {technicians.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                    </FormSelect>
                    <FormSelect label="Initial Stage" value={form.stage} onChange={e => setField("stage", e.target.value)}>
                      <option value="">— Select Stage —</option>
                      {statuses.map(st => <option key={st._id} value={st.name}>{st.name}</option>)}
                    </FormSelect>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || (!editingId && isDuplicate)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : editingId ? "💾 Save Changes" : "✓ Create Service Record"
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ DELETE CONFIRM ══════════ */}
      {activeModal === "confirmDelete" && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-7 text-center border border-slate-100">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Delete Record?</h3>
            <p className="text-slate-500 text-sm mt-1">
              <span className="font-bold text-slate-800">{selectedService?.srfNumber}</span> will be permanently removed.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => {
                api.delete(`/service/${selectedService._id}`)
                  .then(() => { fetchAll(); setActiveModal(null); toast.success("Deleted"); });
              }}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TECH / STAGE MODAL ══════════ */}
      {(activeModal === "tech" || activeModal === "status") && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                {activeModal === "tech" ? "Manage Technicians" : "Manage Stages"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-4">
                <input
                  value={newItemName} onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && newItemName.trim()) {
                      await api.post(activeModal === "tech" ? "/technicians" : "/status", { name: newItemName });
                      setNewItemName(""); fetchAll();
                    }
                  }}
                  placeholder="Enter name..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-200"
                />
                <button onClick={async () => {
                  if (!newItemName.trim()) return;
                  await api.post(activeModal === "tech" ? "/technicians" : "/status", { name: newItemName });
                  setNewItemName(""); fetchAll();
                }}
                  className="bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {(activeModal === "tech" ? technicians : statuses).map(item => (
                  <div key={item._id} className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 rounded-lg group">
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    <button onClick={async () => {
                      await api.delete(`${activeModal === "tech" ? "/technicians" : "/status"}/${item._id}`); fetchAll();
                    }}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ CHALLAN MODAL ══════════ */}
      {activeModal === "challan" && selectedService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-7 border border-slate-100">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-600">
              <ClipboardCheck size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 text-center mb-1">Finalize Delivery</h2>
            <p className="text-slate-400 text-xs text-center mb-6">SRF: {selectedService.srfNumber}</p>
            <div className="space-y-1 mb-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Receiver Name</label>
              <input autoFocus value={receiverName} onChange={e => setReceiverName(e.target.value)}
                placeholder="Who received the motor?"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-slate-100 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button disabled={isSubmitting} onClick={async () => {
                setIsSubmitting(true);
                try {
                  await api.put(`/service/${selectedService._id}`, {
                    stage: "Completed",
                    deliveryChallan: { generated: true, receiverName, date: new Date() }
                  });
                  toast.success("Delivery finalized ✓");
                  setActiveModal(null); setReceiverName(""); fetchAll();
                } catch { toast.error("Failed"); }
                finally { setIsSubmitting(false); }
              }}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Wait...</> : "✓ Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}