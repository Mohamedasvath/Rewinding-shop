import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Save, Upload, Loader2, Edit3, Trash2, FileText,
  Download, X, LayoutGrid, FilePlus2, ChevronDown, ChevronUp
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation, useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <div className="bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 border border-blue-800">
    {children}
  </div>
);

const FieldRow = ({ label, children, half }) => (
  <div className={`flex items-center border-b border-blue-100 min-h-[28px] ${half ? "" : ""}`}>
    <span className="text-[10px] font-bold text-slate-600 uppercase w-[120px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100 leading-tight">
      {label}
    </span>
    <div className="flex-1 px-2 py-0.5">{children}</div>
  </div>
);

const FInput = ({ value, onChange, type = "text", placeholder = "" }) => (
  <input
    type={type}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full text-[11px] bg-transparent outline-none border-b border-transparent focus:border-blue-500 py-0.5 text-slate-800 placeholder-slate-300"
  />
);

const FTextarea = ({ value, onChange, rows = 3, placeholder = "" }) => (
  <textarea
    value={value || ""}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full text-[11px] bg-transparent outline-none resize-none text-slate-800 placeholder-slate-300 py-0.5"
  />
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AdminQualityRecordForm() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ─── INITIAL STATE — exact schema keys ─── */
  const initialState = {
    companyName: "",
    address: "",
    srfNumber: "",
    date: "",
    partyGPNumber: "",
    partyGPDate: "",
    dNoteNumber: "",
    dNoteDate: "",
    billNo: "",
    billDate: "",
    serialNumber: "",

    inspectionTesting: {
      make: "", hp: "", kw: "", amps: "", volts: "", phase: "", rpm: "",
      insulation: "", connection: "", frame: "", type: "", slNo: "",
      exV: "", exA: "",
    },

    coreDetails: {
      coreLength: "", coreDia: "", rotorLength: "", rotorPerimeter: "",
    },

    conditionDetails: {
      bearingNo: "", driveEndBearing: "", nonDriveEndBearing: "",
      endShieldCondition: "", driveEndCondition: "", nonDriveEndCondition: "",
      shaftDriveEnd: "", shaftNonDriveEnd: "",
      growlerTest: "", rotor: "", statorCoil: "", rotorPosition: "", airGap: "",
    },

    paperDetails: {
      slotL: "", slotB: "", centre: "", top: "", separate: "",
    },

    windingDetails: {
      swg: "", slot: "", winding: "", pitch: "", turns: "",
      totalCoils: "", totalMeter: "", materialEstimate: "", windingType: "",
    },

    mechanicalWorkDone: "",
    causeOfFailure: "",

    processDetails: {
      dismantled: "", wireRemoved: "", rewound: "", assembled: "",
    },

    assemblingTesting: {
      hvTest: "", runningTime: "", temperature: "",
      noLoadVoltageL1: "", noLoadVoltageL2: "", noLoadVoltageL3: "",
      noLoadAmpsL1: "", noLoadAmpsL2: "", noLoadAmpsL3: "",
      drumSize: "", rpm: "",
    },

    loadTesting: Array.from({ length: 5 }, () => ({ wt: "", amps: "", rpm: "", kw: "" })),

    efficiencyDetails: {
      kwh: "", pf: "", hz: "", efficiency: "",
      percentageEfficiency: "", loadPercentage: "",
    },

    connectionDetails: "",

    assembledProof: { imageUrl: "", driveLink: "" },
    authorizedSignature: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  /* ─── SERVICE LIST FOR SRF DROPDOWN ─── */
  const [serviceList, setServiceList] = useState([]);

  /* ─── FETCH ─── */
  const fetchRecords = async () => {
    try {
      const { data } = await api.get("/quality-record");
      setRecords(data);
    } catch {
      toast.error("Failed to fetch records");
    }
  };

  /* ─── FETCH SERVICE LIST FOR SRF DROPDOWN ─── */
  const fetchServiceList = async () => {
    try {
      const { data } = await api.get("/service");
      // Deduplicate by srfNumber
      const seen = new Set();
      const unique = (data || []).filter(s => {
        if (!s.srfNumber || seen.has(s.srfNumber)) return false;
        seen.add(s.srfNumber);
        return true;
      });
      setServiceList(unique);
    } catch {
      /* Fail silently — SRF dropdown is optional enhancement */
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchServiceList();
    if (location.state?.editData) {
      handleEdit(location.state.editData);
      setIsFormOpen(true);
    }
  }, [location.state]);

  /* ─── CHANGE HANDLERS ─── */
  const top = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const nested = (section, field, value) =>
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const loadChange = (index, field, value) => {
    const updated = [...formData.loadTesting];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, loadTesting: updated }));
  };

  /* ─── SRF AUTOFILL HANDLER ─── */
  const handleSRFSelect = (srfNumber) => {
    const svc = serviceList.find(s => s.srfNumber === srfNumber);
    if (!svc) {
      // Manual entry — just update srfNumber, leave everything else
      top("srfNumber", srfNumber);
      return;
    }
    const md = svc.motorDetails || {};
    setFormData(prev => ({
      ...prev,
      srfNumber:    svc.srfNumber   || prev.srfNumber,
      companyName:  svc.customerName || prev.companyName,
      address:      svc.address      || prev.address,
      date:         svc.updatedDate
                      ? new Date(svc.updatedDate).toISOString().split("T")[0]
                      : prev.date,
      serialNumber: md.serialNumber  || prev.serialNumber,
      inspectionTesting: {
        ...prev.inspectionTesting,
        make:       md.make   || "",
        hp:         md.hp     || "",
        kw:         md.kw     || "",
        amps:       md.amps   || "",
        volts:      md.volts  || "",
        phase:      md.phase  || "",
        rpm:        md.rpm    || "",
        insulation: md.ins    || "",
        frame:      md.frame  || "",
        type:       md.type   || "",
      },
    }));
  };

  /* ─── IMAGE UPLOAD ─── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "motor_upload");
    setImageUploading(true);
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dnwvgphk9/image/upload", {
        method: "POST", body: data,
      });
      const fileData = await res.json();
      setFormData(prev => ({
        ...prev,
        assembledProof: { ...prev.assembledProof, imageUrl: fileData.secure_url },
      }));
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  /* ─── SUBMIT ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log("SENDING DATA:", formData);

    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/quality-record/${editingId}`, formData);
        toast.success("Record Updated ✓");
      } else {
        await api.post("/quality-record", formData);
        toast.success("Record Saved ✓");
      }
      setFormData(initialState);
      setEditingId(null);
      setIsFormOpen(false);
      fetchRecords();
      if (location.state?.editData) navigate("/admin/quality-view");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
      
    }
  };

  /* ─── EDIT ─── */
  const handleEdit = (record) => {
    setFormData({
      ...initialState,
      ...record,
      inspectionTesting: { ...initialState.inspectionTesting, ...(record.inspectionTesting || {}) },
      coreDetails:        { ...initialState.coreDetails,        ...(record.coreDetails        || {}) },
      conditionDetails:   { ...initialState.conditionDetails,   ...(record.conditionDetails   || {}) },
      paperDetails:       { ...initialState.paperDetails,       ...(record.paperDetails       || {}) },
      windingDetails:     { ...initialState.windingDetails,     ...(record.windingDetails     || {}) },
      processDetails:     { ...initialState.processDetails,     ...(record.processDetails     || {}) },
      assemblingTesting:  { ...initialState.assemblingTesting,  ...(record.assemblingTesting  || {}) },
      efficiencyDetails:  { ...initialState.efficiencyDetails,  ...(record.efficiencyDetails  || {}) },
      assembledProof:     { ...initialState.assembledProof,     ...(record.assembledProof     || {}) },
      loadTesting: record.loadTesting?.length ? record.loadTesting : initialState.loadTesting,
    });
    setEditingId(record._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── DELETE ─── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/quality-record/${id}`);
      toast.success("Deleted");
      fetchRecords();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ─── PDF GENERATION ─── */
  const generatePDF = (record) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    let y = 10;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SENTHIL REWINDING WORKSHOP", pw / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(11);
    doc.text("QUALITY INSPECTION RECORD", pw / 2, y, { align: "center" });
    y += 8;

    // Company / SRF block
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.rect(10, y, 190, 20);
    doc.text(`Company: ${record.companyName || ""}`, 12, y + 5);
    doc.text(`SRF No: ${record.srfNumber || ""}`, 110, y + 5);
    doc.text(`Date: ${record.date ? new Date(record.date).toLocaleDateString("en-IN") : ""}`, 12, y + 12);
    doc.text(`Party GP No: ${record.partyGPNumber || ""}`, 110, y + 12);
    y += 25;

    // Inspection & Testing
    doc.setFont("helvetica", "bold");
    doc.text("INSPECTION & TESTING", 12, y); y += 3;
    const it = record.inspectionTesting || {};
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      head: [["Make", "HP", "KW", "Amps", "Volts", "Phase", "RPM", "Ins", "Frame"]],
      body: [[it.make||"", it.hp||"", it.kw||"", it.amps||"", it.volts||"", it.phase||"", it.rpm||"", it.insulation||"", it.frame||""]],
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // Winding Details
    doc.setFont("helvetica", "bold");
    doc.text("WINDING DETAILS", 12, y); y += 3;
    const wd = record.windingDetails || {};
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      head: [["SWG", "Slot", "Winding", "Pitch", "Turns", "Total Coils", "Total Meter", "Type"]],
      body: [[wd.swg||"", wd.slot||"", wd.winding||"", wd.pitch||"", wd.turns||"", wd.totalCoils||"", wd.totalMeter||"", wd.windingType||""]],
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // Load Testing
    doc.setFont("helvetica", "bold");
    doc.text("LOAD TESTING", 12, y); y += 3;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, halign: "center" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      head: [["WT", "AMPS", "RPM", "KW"]],
      body: (record.loadTesting || []).map(r => [r.wt||"", r.amps||"", r.rpm||"", r.kw||""]),
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // Mechanical Work + Cause
    doc.setFont("helvetica", "bold");
    doc.text("MECHANICAL WORK DONE", 12, y); y += 3;
    doc.rect(10, y, 190, 16); doc.setFont("helvetica","normal");
    doc.text(record.mechanicalWorkDone || "", 12, y + 6, { maxWidth: 186 });
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.text("CAUSE OF FAILURE", 12, y); y += 3;
    doc.rect(10, y, 190, 16); doc.setFont("helvetica","normal");
    doc.text(record.causeOfFailure || "", 12, y + 6, { maxWidth: 186 });
    y += 20;

    // Assembling & Testing
    doc.setFont("helvetica", "bold");
    doc.text("ASSEMBLING & TESTING", 12, y); y += 3;
    const at = record.assemblingTesting || {};
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      head: [["HV Test", "Run Time", "Temp", "V-L1", "V-L2", "V-L3", "A-L1", "A-L2", "A-L3", "RPM", "Drum"]],
      body: [[at.hvTest||"", at.runningTime||"", at.temperature||"", at.noLoadVoltageL1||"", at.noLoadVoltageL2||"", at.noLoadVoltageL3||"", at.noLoadAmpsL1||"", at.noLoadAmpsL2||"", at.noLoadAmpsL3||"", at.rpm||"", at.drumSize||""]],
      margin: { left: 10, right: 10 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // Efficiency
    const ef = record.efficiencyDetails || {};
    doc.setFont("helvetica", "bold");
    doc.text("EFFICIENCY", 12, y); y += 3;
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 8 },
      head: [["KWH", "PF", "Hz", "Efficiency", "% Efficiency", "Load %"]],
      body: [[ef.kwh||"", ef.pf||"", ef.hz||"", ef.efficiency||"", ef.percentageEfficiency||"", ef.loadPercentage||""]],
      margin: { left: 10, right: 10 },
    });

    doc.save(`QualityRecord_${record.srfNumber || "export"}.pdf`);
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
   <div className="min-h-screen bg-slate-100 pb-20 font-sans w-full overflow-x-hidden">

      {/* ── TOP BAR ── */}
     <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm top-0 z-50">

  <h1 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
    <LayoutGrid className="text-blue-700" size={20} /> 
    <span className="truncate">Quality Management</span>
  </h1>

  <button
    onClick={() => {
      setIsFormOpen(!isFormOpen);
      if (isFormOpen) { setEditingId(null); setFormData(initialState); }
    }}
    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 rounded font-bold text-sm transition-all shadow-sm whitespace-nowrap
      ${isFormOpen ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-700 hover:bg-blue-800 text-white"}`}
  >
    {isFormOpen ? (
      <>
        <X size={16}/> 
        <span className="hidden sm:inline">CLOSE FORM</span>
        <span className="sm:hidden">CLOSE</span>
      </>
    ) : (
      <>
        <FilePlus2 size={16}/> 
        <span className="hidden sm:inline">ADD NEW RECORD</span>
        <span className="sm:hidden">ADD</span>
      </>
    )}
  </button>

</div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">

        {/* ══════════ FORM ══════════ */}
        {isFormOpen && (
          <div className="bg-white border-2 border-blue-700 shadow-xl overflow-hidden">

            {/* Form header bar */}
            <div className="bg-blue-700 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">
                  {editingId ? `Editing: #${formData.srfNumber}` : "New Quality Inspection Entry"}
                </h2>
                <p className="text-blue-200 text-[10px] uppercase tracking-widest mt-0.5">
                  Senthil Rewinding Workshop — Industrial Inspection Form
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-white text-blue-700 px-5 py-2 rounded font-black flex items-center gap-2 hover:bg-blue-50 transition-all text-sm shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                {editingId ? "UPDATE RECORD" : "SAVE RECORD"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="text-[11px]">

              {/* ══ SECTION 1: HEADER ══ */}
              <SectionTitle>Section 1 — Header Information</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-blue-200">
                <div className="border-r border-blue-200">
                  <FieldRow label="Company Name">
                    <FInput value={formData.companyName} onChange={e => top("companyName", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Address">
                    <FInput value={formData.address} onChange={e => top("address", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="SRF Number">
                    <select
                      value={formData.srfNumber}
                      onChange={e => handleSRFSelect(e.target.value)}
                      className="w-full text-[11px] bg-transparent outline-none border-b border-transparent focus:border-blue-500 py-0.5 text-slate-800 appearance-none cursor-pointer"
                    >
                      <option value="">— Select SRF —</option>
                      {serviceList.map(s => (
                        <option key={s._id} value={s.srfNumber}>
                          {s.srfNumber} — {s.customerName || ""}
                        </option>
                      ))}
                    </select>
                  </FieldRow>
                  <FieldRow label="Date">
                    <FInput type="date" value={formData.date ? formData.date.split("T")[0] : ""} onChange={e => top("date", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Serial Number">
                    <FInput value={formData.serialNumber} onChange={e => top("serialNumber", e.target.value)} />
                  </FieldRow>
                </div>
                <div>
                  <FieldRow label="Party GP No.">
                    <FInput value={formData.partyGPNumber} onChange={e => top("partyGPNumber", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Party GP Date">
                    <FInput type="date" value={formData.partyGPDate ? formData.partyGPDate.split("T")[0] : ""} onChange={e => top("partyGPDate", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="D-Note No.">
                    <FInput value={formData.dNoteNumber} onChange={e => top("dNoteNumber", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="D-Note Date">
                    <FInput type="date" value={formData.dNoteDate ? formData.dNoteDate.split("T")[0] : ""} onChange={e => top("dNoteDate", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Bill No.">
                    <FInput value={formData.billNo} onChange={e => top("billNo", e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Bill Date">
                    <FInput type="date" value={formData.billDate ? formData.billDate.split("T")[0] : ""} onChange={e => top("billDate", e.target.value)} />
                  </FieldRow>
                </div>
              </div>

              {/* ══ SECTION 2: INSPECTION & TESTING ══ */}
              <SectionTitle>Section 2 — Inspection &amp; Testing (inspectionTesting)</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-blue-200">
                {[
                  ["Make",       "make"],
                  ["HP",         "hp"],
                  ["KW",         "kw"],
                  ["Amps",       "amps"],
                  ["Volts",      "volts"],
                  ["Phase",      "phase"],
                  ["RPM",        "rpm"],
                  ["Insulation", "insulation"],
                  ["Connection", "connection"],
                  ["Frame",      "frame"],
                  ["Type",       "type"],
                  ["Sl. No.",    "slNo"],
                  ["Ex. Volts",  "exV"],
                  ["Ex. Amps",   "exA"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-b border-r border-blue-100 flex items-center min-h-[28px] ${i % 4 === 3 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[80px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.inspectionTesting[field]} onChange={e => nested("inspectionTesting", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 3: CORE DETAILS ══ */}
              <SectionTitle>Section 3 — Core Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-blue-200">
                {[
                  ["Core Length",      "coreLength"],
                  ["Core Dia",         "coreDia"],
                  ["Rotor Length",     "rotorLength"],
                  ["Rotor Perimeter",  "rotorPerimeter"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-b border-r border-blue-100 flex items-center min-h-[28px] ${i === 3 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[90px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.coreDetails[field]} onChange={e => nested("coreDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 4: CONDITION DETAILS ══ */}
              <SectionTitle>Section 4 — Condition Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 border-b border-blue-200">
                {[
                  ["Bearing No.",         "bearingNo"],
                  ["Drive End Bearing",   "driveEndBearing"],
                  ["Non-Drive End Brg",   "nonDriveEndBearing"],
                  ["End Shield Cond.",    "endShieldCondition"],
                  ["Drive End Cond.",     "driveEndCondition"],
                  ["Non-Drive End Cond.", "nonDriveEndCondition"],
                  ["Shaft Drive End",     "shaftDriveEnd"],
                  ["Shaft Non-Drive",     "shaftNonDriveEnd"],
                  ["Growler Test",        "growlerTest"],
                  ["Rotor",               "rotor"],
                  ["Stator Coil",         "statorCoil"],
                  ["Rotor Position",      "rotorPosition"],
                  ["Air Gap",             "airGap"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-b border-r border-blue-100 flex items-center min-h-[28px] ${i % 3 === 2 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[100px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100 leading-tight">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.conditionDetails[field]} onChange={e => nested("conditionDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 5: PAPER DETAILS ══ */}
              <SectionTitle>Section 5 — Paper Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-5 border-b border-blue-200">
                {[
                  ["Slot L",    "slotL"],
                  ["Slot B",    "slotB"],
                  ["Centre",    "centre"],
                  ["Top",       "top"],
                  ["Separate",  "separate"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-b border-r border-blue-100 flex items-center min-h-[28px] ${i === 4 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[60px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.paperDetails[field]} onChange={e => nested("paperDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 6: WINDING DETAILS ══ */}
              <SectionTitle>Section 6 — Winding Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 border-b border-blue-200">
                {[
                  ["SWG",              "swg"],
                  ["Slot",             "slot"],
                  ["Winding",          "winding"],
                  ["Pitch",            "pitch"],
                  ["Turns",            "turns"],
                  ["Total Coils",      "totalCoils"],
                  ["Total Meter",      "totalMeter"],
                  ["Winding Type",     "windingType"],
                ].map(([label, field]) => (
                  <div key={field} className="border-b border-r border-blue-100 flex items-center min-h-[28px]">
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[75px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100 leading-tight">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.windingDetails[field]} onChange={e => nested("windingDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Material Estimate — full width */}
              <div className="border-b border-blue-200 flex">
                <span className="text-[9px] font-black text-slate-500 uppercase w-[120px] shrink-0 px-2 py-2 bg-slate-50 border-r border-blue-100">Material Estimate</span>
                <div className="flex-1 px-3 py-2">
                  <FTextarea rows={3} value={formData.windingDetails.materialEstimate} onChange={e => nested("windingDetails", "materialEstimate", e.target.value)} placeholder="List materials, quantities..." />
                </div>
              </div>

              {/* ══ SECTIONS 7 & 8: MECHANICAL WORK + CAUSE OF FAILURE ══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-blue-200">
                <div className="border-r border-blue-200">
                  <SectionTitle>Section 7 — Mechanical Work Done</SectionTitle>
                  <div className="px-3 py-2">
                    <FTextarea rows={3} value={formData.mechanicalWorkDone} onChange={e => top("mechanicalWorkDone", e.target.value)} placeholder="Describe mechanical work performed..." />
                  </div>
                </div>
                <div>
                  <SectionTitle>Section 8 — Cause of Failure</SectionTitle>
                  <div className="px-3 py-2">
                    <FTextarea rows={3} value={formData.causeOfFailure} onChange={e => top("causeOfFailure", e.target.value)} placeholder="Describe cause of failure..." />
                  </div>
                </div>
              </div>

              {/* ══ SECTION 9: PROCESS ROW ══ */}
              <SectionTitle>Section 9 — Process Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-blue-200">
                {[
                  ["Dismantled",    "dismantled"],
                  ["Wire Removed",  "wireRemoved"],
                  ["Rewound",       "rewound"],
                  ["Assembled",     "assembled"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-r border-blue-100 flex items-center min-h-[28px] ${i === 3 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[80px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.processDetails[field]} onChange={e => nested("processDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 10: ASSEMBLING & TESTING ══ */}
              <SectionTitle>Section 10 — Assembling &amp; Testing</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-blue-200">
                {[
                  ["HV Test",      "hvTest"],
                  ["Running Time", "runningTime"],
                  ["Temperature",  "temperature"],
                  ["Drum Size",    "drumSize"],
                  ["RPM",          "rpm"],
                  ["NL Volt L1",   "noLoadVoltageL1"],
                  ["NL Volt L2",   "noLoadVoltageL2"],
                  ["NL Volt L3",   "noLoadVoltageL3"],
                  ["NL Amps L1",   "noLoadAmpsL1"],
                  ["NL Amps L2",   "noLoadAmpsL2"],
                  ["NL Amps L3",   "noLoadAmpsL3"],
                ].map(([label, field]) => (
                  <div key={field} className="border-b border-r border-blue-100 flex items-center min-h-[28px]">
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[80px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100 leading-tight">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.assemblingTesting[field]} onChange={e => nested("assemblingTesting", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 11: LOAD TESTING TABLE ══ */}
              <SectionTitle>Section 11 — Load Testing Table</SectionTitle>
              <div className="border-b border-blue-200 overflow-x-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-blue-200 px-3 py-2 text-center font-black text-blue-700 uppercase w-8">#</th>
                      {["WT", "AMPS", "RPM", "KW"].map(h => (
                        <th key={h} className="border border-blue-200 px-4 py-2 text-center font-black text-blue-700 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.loadTesting.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                        <td className="border border-blue-100 text-center text-slate-400 font-bold py-1">{i + 1}</td>
                        {["wt", "amps", "rpm", "kw"].map(col => (
                          <td key={col} className="border border-blue-100 p-0">
                            <input
                              value={row[col] || ""}
                              onChange={e => loadChange(i, col, e.target.value)}
                              className="w-full text-center py-1.5 px-2 text-[11px] outline-none bg-transparent focus:bg-blue-50 transition-colors"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ══ SECTION 12: EFFICIENCY ══ */}
              <SectionTitle>Section 12 — Efficiency Details</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-b border-blue-200">
                {[
                  ["KWH",          "kwh"],
                  ["PF",           "pf"],
                  ["Hz",           "hz"],
                  ["Efficiency",   "efficiency"],
                  ["% Efficiency", "percentageEfficiency"],
                  ["Load %",       "loadPercentage"],
                ].map(([label, field], i) => (
                  <div key={field} className={`border-r border-blue-100 flex items-center min-h-[28px] ${i === 5 ? "border-r-0" : ""}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase w-[72px] shrink-0 px-2 py-1 bg-slate-50 border-r border-blue-100 leading-tight">{label}</span>
                    <div className="flex-1 px-2 py-0.5">
                      <FInput value={formData.efficiencyDetails[field]} onChange={e => nested("efficiencyDetails", field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ SECTION 13: CONNECTION DETAILS ══ */}
              <SectionTitle>Section 13 — Connection Details</SectionTitle>
              <div className="border-b border-blue-200 px-3 py-2">
                <FTextarea rows={2} value={formData.connectionDetails} onChange={e => top("connectionDetails", e.target.value)} placeholder="Describe connection configuration..." />
              </div>

              {/* ══ SECTION 14: IMAGE PROOF ══ */}
              <SectionTitle>Section 14 — Assembled Proof Image</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-blue-200">
                <div className="border-r border-blue-200 p-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Upload Image (Cloudinary)</p>
                  <label className="flex items-center gap-2 cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 px-4 py-3 rounded hover:bg-blue-100 transition-colors w-fit">
                    {imageUploading
                      ? <><Loader2 size={16} className="animate-spin text-blue-600"/> <span className="text-blue-600 font-bold text-xs">Uploading...</span></>
                      : <><Upload size={16} className="text-blue-600"/> <span className="text-blue-600 font-bold text-xs">Choose Image</span></>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
                  </label>
                  {formData.assembledProof.imageUrl && (
                    <div className="border-2 border-blue-400 inline-block">
                      <img src={formData.assembledProof.imageUrl} alt="Assembled Proof" className="h-32 w-auto object-cover" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Drive Link (optional)</p>
                  <FieldRow label="Drive Link">
                    <FInput value={formData.assembledProof.driveLink} onChange={e => nested("assembledProof", "driveLink", e.target.value)} placeholder="https://drive.google.com/..." />
                  </FieldRow>
                  <FieldRow label="Auth. Signature">
                    <FInput value={formData.authorizedSignature} onChange={e => top("authorizedSignature", e.target.value)} placeholder="Authorized by..." />
                  </FieldRow>
                </div>
              </div>

              {/* Bottom Save */}
              <div className="p-4 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setEditingId(null); setFormData(initialState); }}
                  className="px-5 py-2 border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-700 text-white rounded font-black flex items-center gap-2 hover:bg-blue-800 transition-all text-sm shadow-md disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                  {editingId ? "UPDATE RECORD" : "SAVE RECORD"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════ RECORDS LIST ══════════ */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileText size={18} className="text-blue-700" /> Recent Inspections
            </h2>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded uppercase tracking-widest">
              {records.length} Records
            </span>
          </div>

          {records.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-lg uppercase tracking-widest text-sm">
              No records found. Click "Add New Record" to begin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {records.map(rec => (
                <div
                  key={rec._id}
                  className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group overflow-hidden"
                >
                  {/* Card header stripe */}
                  <div className="bg-blue-700 px-3 py-2 flex justify-between items-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                      #{rec.srfNumber || "N/A"}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => generatePDF(rec)} title="Download PDF"
                        className="p-1 bg-blue-600 hover:bg-green-600 rounded text-white transition-colors">
                        <Download size={13}/>
                      </button>
                      <button onClick={() => handleEdit(rec)} title="Edit"
                        className="p-1 bg-blue-600 hover:bg-yellow-500 rounded text-white transition-colors">
                        <Edit3 size={13}/>
                      </button>
                      <button onClick={() => handleDelete(rec._id)} title="Delete"
                        className="p-1 bg-blue-600 hover:bg-red-600 rounded text-white transition-colors">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3 py-3 space-y-1.5">
                    <p className="font-black text-slate-800 text-sm uppercase truncate">{rec.companyName || "—"}</p>
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <p><span className="font-bold text-slate-400 uppercase">Date:</span> {rec.date ? new Date(rec.date).toLocaleDateString("en-IN") : "N/A"}</p>
                      <p><span className="font-bold text-slate-400 uppercase">Make:</span> {rec.inspectionTesting?.make || "—"}</p>
                      <p><span className="font-bold text-slate-400 uppercase">HP:</span> {rec.inspectionTesting?.hp || "—"} &nbsp;|&nbsp; <span className="font-bold text-slate-400 uppercase">RPM:</span> {rec.inspectionTesting?.rpm || "—"}</p>
                    </div>
                    {rec.assembledProof?.imageUrl && (
                      <img src={rec.assembledProof.imageUrl} alt="" className="w-full h-20 object-cover mt-1 border border-blue-100" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}