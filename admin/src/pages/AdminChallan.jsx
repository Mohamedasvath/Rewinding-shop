import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  Plus, Trash2, Printer, Save, Edit3,
  FilePlus2, X, Loader2, FileText, Calendar,
  ChevronDown, ChevronUp,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const EMPTY_ITEM = { particulars: "", quantity: "", remarks: "" };

const INITIAL_FORM = {
  challanNumber: "",
  date: "",
  to: "",
  thru: "",
  workOrderNumber: "",
  gatePassNumber: "",
  items: [{ ...EMPTY_ITEM }],
  receivedBy: "",
};

/* ─────────────────────────────────────────────
   PRINT STYLES (injected once)
───────────────────────────────────────────── */
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #dchallan-print-area, #dchallan-print-area * { visibility: visible !important; }
  #dchallan-print-area { position: fixed; inset: 0; padding: 12mm; background: #fff; }
  .no-print { display: none !important; }
  @page { size: A4; margin: 10mm; }
}
`;

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AdminDChallan() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [challans, setChallans]   = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const printRef = useRef(null);

  /* ── inject print styles once ── */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* ── fetch list ── */
  const fetchChallans = async () => {
  setFetching(true);
  try {
    const res = await api.get("/dchallan");

    console.log("API RESPONSE:", res.data); // debug

    // ✅ FULL SAFE FIX
    const data = res.data;

    if (Array.isArray(data)) {
      setChallans(data);
    } else if (Array.isArray(data.data)) {
      setChallans(data.data);
    } else {
      setChallans([]);
    }

  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch challans");
  } finally {
    setFetching(false);
  }
};

  useEffect(() => { fetchChallans(); }, []);

  /* ── form field handlers ── */
  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setItem = (idx, key, val) =>
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...prev, items };
    });

  const addRow = () =>
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));

  const removeRow = (idx) =>
    setForm(prev => ({
      ...prev,
      items: prev.items.length > 1
        ? prev.items.filter((_, i) => i !== idx)
        : prev.items,
    }));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.challanNumber || !form.date || !form.to) {
      toast.error("Challan No, Date, and To are required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        challanNumber: Number(form.challanNumber),
      };
      if (editingId) {
        await api.put(`/dchallan/${editingId}`, payload);
        toast.success("Challan updated ✓");
      } else {
        await api.post("/dchallan", payload);
        toast.success("Challan created ✓");
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      setIsFormOpen(false);
      fetchChallans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── edit ── */
  const handleEdit = (challan) => {
    setForm({
      challanNumber: challan.challanNumber ?? "",
      date: challan.date ? new Date(challan.date).toISOString().split("T")[0] : "",
      to: challan.to ?? "",
      thru: challan.thru ?? "",
      workOrderNumber: challan.workOrderNumber ?? "",
      gatePassNumber: challan.gatePassNumber ?? "",
      items: challan.items?.length ? challan.items : [{ ...EMPTY_ITEM }],
      receivedBy: challan.receivedBy ?? "",
    });
    setEditingId(challan._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this challan permanently?")) return;
    try {
      await api.delete(`/dchallan/${id}`);
      toast.success("Deleted");
      fetchChallans();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ── print current form ── */
  const handlePrint = () => window.print();

  /* ── format date ── */
  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm sticky top-0 z-50 no-print">
        <h1 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
          <FileText className="text-blue-700" size={20} />
          <span>D-Challan Management</span>
        </h1>
        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (isFormOpen) { setForm(INITIAL_FORM); setEditingId(null); }
          }}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-5 py-2 rounded font-bold text-sm transition-all shadow-sm
            ${isFormOpen
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-700 hover:bg-blue-800 text-white"}`}
        >
          {isFormOpen
            ? <><X size={16} /> Close Form</>
            : <><FilePlus2 size={16} /> New Challan</>}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-6">

        {/* ══════════ CHALLAN FORM ══════════ */}
        {isFormOpen && (
          <div className="no-print">
            {/* Form top bar */}
            <div className="bg-blue-700 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">
                  {editingId ? `Edit Challan #${form.challanNumber}` : "New Delivery Challan"}
                </h2>
                <p className="text-blue-200 text-[10px] uppercase tracking-widest mt-0.5">
                  Senthil Rewinding Works
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-white text-blue-700 px-4 py-1.5 rounded font-black flex items-center gap-2 hover:bg-blue-50 transition-all text-sm shadow-md disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>

            {/* ── CHALLAN DOCUMENT AREA ── */}
            <form
              id="dchallan-print-area"
              onSubmit={handleSubmit}
              ref={printRef}
              className="bg-white border border-slate-300 text-[11px]"
            >

              {/* ══ HEADER ══ */}
              <div className="border-b-2 border-slate-800">
                <div className="grid grid-cols-3 items-stretch">

                  {/* Left — company branding */}
                  <div className="col-span-2 px-4 py-3 border-r border-slate-300">
                    <p className="text-lg font-black uppercase tracking-widest text-slate-900 leading-tight">
                      SENTHIL REWINDING WORKS
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-0.5">
                      Delivery Challan
                    </p>
                  </div>

                  {/* Right — challan no + date */}
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider w-[72px] shrink-0">
                        Challan No.
                      </span>
                      <input
                        type="number"
                        value={form.challanNumber}
                        onChange={e => setField("challanNumber", e.target.value)}
                        placeholder="001"
                        className="flex-1 text-[11px] font-black text-slate-800 outline-none border-b border-transparent focus:border-blue-500 bg-transparent min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider w-[72px] shrink-0">
                        Date
                      </span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => setField("date", e.target.value)}
                        className="flex-1 text-[11px] text-slate-800 outline-none border-b border-transparent focus:border-blue-500 bg-transparent min-w-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ DETAILS SECTION ══ */}
              <div className="border-b border-slate-300">
                {[
                  ["To",                    "to",              "Recipient / Company name"],
                  ["Thru",                  "thru",            "Transporter / Person"],
                  ["Your Work Order No.",   "workOrderNumber", "Work order reference"],
                  ["Your Gate Pass No.",    "gatePassNumber",  "Gate pass reference"],
                ].map(([label, key, ph]) => (
                  <div
                    key={key}
                    className="flex items-center border-b border-slate-200 last:border-b-0 min-h-[28px]"
                  >
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider w-[130px] shrink-0 px-3 py-1.5 bg-slate-50 border-r border-slate-200">
                      {label}
                    </span>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => setField(key, e.target.value)}
                      placeholder={ph}
                      className="flex-1 px-3 py-1.5 text-[11px] text-slate-800 outline-none focus:bg-blue-50/40 transition-colors bg-transparent placeholder-slate-300"
                    />
                  </div>
                ))}
              </div>

              {/* ══ ITEMS TABLE ══ */}
              <div className="border-b border-slate-300">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px] w-10">S.No</th>
                        <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px]">Particulars</th>
                        <th className="px-3 py-2 text-center font-black uppercase tracking-wider text-[9px] w-24">Quantity</th>
                        <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px] w-36">Remarks</th>
                        <th className="px-2 py-2 w-8 no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-slate-200 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                        >
                          {/* S.No */}
                          <td className="px-3 py-1 text-center font-bold text-slate-400 border-r border-slate-200">
                            {idx + 1}
                          </td>
                          {/* Particulars */}
                          <td className="px-0 py-0 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.particulars}
                              onChange={e => setItem(idx, "particulars", e.target.value)}
                              placeholder="Item description..."
                              className="w-full px-3 py-1.5 text-[11px] text-slate-800 outline-none focus:bg-blue-50/60 bg-transparent placeholder-slate-300 transition-colors"
                            />
                          </td>
                          {/* Quantity */}
                          <td className="px-0 py-0 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={e => setItem(idx, "quantity", e.target.value)}
                              placeholder="Qty"
                              className="w-full px-3 py-1.5 text-[11px] text-center text-slate-800 outline-none focus:bg-blue-50/60 bg-transparent placeholder-slate-300 transition-colors"
                            />
                          </td>
                          {/* Remarks */}
                          <td className="px-0 py-0 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={e => setItem(idx, "remarks", e.target.value)}
                              placeholder="Remarks"
                              className="w-full px-3 py-1.5 text-[11px] text-slate-800 outline-none focus:bg-blue-50/60 bg-transparent placeholder-slate-300 transition-colors"
                            />
                          </td>
                          {/* Remove */}
                          <td className="px-2 py-1 text-center no-print">
                            <button
                              type="button"
                              onClick={() => removeRow(idx)}
                              disabled={form.items.length === 1}
                              className="text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors"
                              title="Remove row"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add row */}
                <div className="px-3 py-2 border-t border-slate-200 no-print">
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors"
                  >
                    <Plus size={13} /> Add Row
                  </button>
                </div>
              </div>

              {/* ══ FOOTER ══ */}
              <div className="grid grid-cols-2">
                {/* Received By */}
                <div className="px-4 py-4 border-r border-slate-300">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">
                    Received By
                  </p>
                  <input
                    type="text"
                    value={form.receivedBy}
                    onChange={e => setField("receivedBy", e.target.value)}
                    placeholder="Receiver's name / signature"
                    className="w-full text-[11px] text-slate-800 outline-none border-b border-slate-300 focus:border-blue-500 pb-1 bg-transparent placeholder-slate-300 transition-colors"
                  />
                  <div className="mt-6 border-t border-slate-400 w-32 pt-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Signature</p>
                  </div>
                </div>

                {/* Authorized Signature */}
                <div className="px-4 py-4 flex flex-col justify-end items-end">
                  <div className="mt-6 border-t border-slate-400 w-36 pt-1 text-right">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      Authorized Signature
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Senthil Rewinding Works</p>
                  </div>
                </div>
              </div>

            </form>
            {/* end form */}
          </div>
        )}

        {/* ══════════ CHALLANS LIST ══════════ */}
        <div className="no-print space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-700" /> Previous Challans
            </h2>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded uppercase tracking-widest">
              {challans.length} Records
            </span>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : challans.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-bold border-2 border-dashed border-slate-300 rounded-lg uppercase tracking-widest text-xs">
              No challans yet. Click "New Challan" to create one.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 overflow-hidden">
              {/* List header */}
              <div className="grid grid-cols-12 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2">
                <div className="col-span-2">Challan No.</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-4">To</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {challans.map((c, i) => {
                const isExpanded = expandedId === c._id;
                return (
                  <div key={c._id} className={`border-b border-slate-100 last:border-b-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>

                    {/* Row */}
                    <div
                      className="grid grid-cols-12 px-3 py-2.5 items-center cursor-pointer hover:bg-blue-50/30 transition-colors select-none"
                      onClick={() => setExpandedId(isExpanded ? null : c._id)}
                    >
                      <div className="col-span-2">
                        <span className="text-xs font-black text-blue-700">#{c.challanNumber}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs text-slate-600 font-semibold">{fmtDate(c.date)}</span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-xs text-slate-700 font-bold truncate block">{c.to || "—"}</span>
                      </div>
                      <div className="col-span-3 flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="text-slate-300 ml-1">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-white px-4 py-3 text-[11px] space-y-2">
                        <div className="grid grid-cols-2 gap-3 text-slate-600">
                          {c.thru && (
                            <div><span className="font-black text-slate-400 uppercase text-[9px] tracking-wider">Thru: </span>{c.thru}</div>
                          )}
                          {c.workOrderNumber && (
                            <div><span className="font-black text-slate-400 uppercase text-[9px] tracking-wider">Work Order: </span>{c.workOrderNumber}</div>
                          )}
                          {c.gatePassNumber && (
                            <div><span className="font-black text-slate-400 uppercase text-[9px] tracking-wider">Gate Pass: </span>{c.gatePassNumber}</div>
                          )}
                          {c.receivedBy && (
                            <div><span className="font-black text-slate-400 uppercase text-[9px] tracking-wider">Received By: </span>{c.receivedBy}</div>
                          )}
                        </div>

                        {c.items?.length > 0 && (
                          <div className="mt-2 overflow-x-auto">
                            <table className="w-full min-w-[400px] border-collapse border border-slate-200 text-[10px]">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-200 px-2 py-1 text-left font-black text-slate-500 uppercase tracking-wider w-8">#</th>
                                  <th className="border border-slate-200 px-2 py-1 text-left font-black text-slate-500 uppercase tracking-wider">Particulars</th>
                                  <th className="border border-slate-200 px-2 py-1 text-center font-black text-slate-500 uppercase tracking-wider w-20">Qty</th>
                                  <th className="border border-slate-200 px-2 py-1 text-left font-black text-slate-500 uppercase tracking-wider w-32">Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.items.map((item, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                    <td className="border border-slate-200 px-2 py-1 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="border border-slate-200 px-2 py-1 text-slate-700">{item.particulars || "—"}</td>
                                    <td className="border border-slate-200 px-2 py-1 text-center text-slate-700">{item.quantity || "—"}</td>
                                    <td className="border border-slate-200 px-2 py-1 text-slate-500">{item.remarks || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}