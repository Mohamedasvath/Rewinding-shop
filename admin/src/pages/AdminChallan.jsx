import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, Trash2, Printer, Save, Edit3,
  FilePlus2, X, Loader2, FileText, Calendar,
  ChevronDown, ChevronUp, Search, Download, Hash,
  RefreshCw, Package
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────── */
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

/* ─── Helpers ────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─── PDF Generator ──────────────────────────────────────── */
function generateChallanPDF(c, save = true) {
  const doc = new jsPDF("p", "mm", "a4");
  const pw  = doc.internal.pageSize.getWidth();
  const m   = 12;

  /* Header bar */
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pw, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("SENTHIL REWINDING WORKS", pw / 2, 9, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 255);
  doc.text("DELIVERY CHALLAN", pw / 2, 16, { align: "center" });
  doc.setTextColor(0, 0, 0);

  let y = 25;

  /* Challan No + Date box */
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(200, 200, 200);
  doc.rect(m, y, pw - m * 2, 12);
  doc.setFont("helvetica", "bold");
  doc.text(`Challan No: #${c.challanNumber}`, m + 3, y + 5);
  doc.text(`Date: ${fmtDate(c.date)}`, m + 3, y + 10);
  doc.text(`Work Order: ${c.workOrderNumber || "—"}`, pw / 2, y + 5);
  doc.text(`Gate Pass: ${c.gatePassNumber || "—"}`, pw / 2, y + 10);
  y += 18;

  /* To / Thru */
  autoTable(doc, {
    startY: y, theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [241, 245, 249], cellWidth: 28 } },
    body: [
      ["To",   c.to   || "—"],
      ["Thru", c.thru || "—"],
    ],
    margin: { left: m, right: m },
  });
  y = doc.lastAutoTable.finalY + 5;

  /* Items table */
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("ITEMS / PARTICULARS", m, y); y += 3;
  autoTable(doc, {
    startY: y, theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    head: [["S.No", "Particulars", "Quantity", "Remarks"]],
    body: (c.items || []).map((item, i) => [
      i + 1, item.particulars || "—", item.quantity || "—", item.remarks || "—"
    ]),
    margin: { left: m, right: m },
    columnStyles: { 0: { cellWidth: 12, halign: "center" }, 2: { cellWidth: 20, halign: "center" } },
  });
  y = doc.lastAutoTable.finalY + 12;

  /* Signatures */
  const colW = (pw - m * 2) / 2;
  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("Received By:", m, y);
  doc.setFont("helvetica", "normal");
  doc.text(c.receivedBy || "____________________________", m, y + 5);
  doc.line(m, y + 14, m + colW - 6, y + 14);
  doc.setFontSize(7);
  doc.text("Signature", m, y + 17);

  doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("Authorized Signature:", m + colW, y);
  doc.line(m + colW, y + 14, pw - m, y + 14);
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("Senthil Rewinding Works", m + colW, y + 17);

  /* Footer */
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(6); doc.setTextColor(160);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")} | Senthil Rewinding Works`, pw / 2, ph - 5, { align: "center" });

  if (save) {
    doc.save(`DChallan_${c.challanNumber || "export"}.pdf`);
  } else {
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }
}

/* ─── Form Input helpers ─────────────────────────────────── */
function FInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

/* ─── Challan Card (in list) ─────────────────────────────── */
function ChallanCard({ c, onEdit, onDelete, onPDF, onPrint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Card row */}
      <div className="flex items-center gap-3 px-4 py-3.5 flex-wrap">
        {/* Challan badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-blue-700 rounded-xl p-2">
            <Package size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-blue-700">#{c.challanNumber}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar size={9} />{fmtDate(c.date)}
            </p>
          </div>
        </div>

        {/* To */}
        <div className="flex-1 min-w-[120px]">
          <p className="text-xs font-bold text-slate-800 truncate">{c.to || "—"}</p>
          <p className="text-[10px] text-slate-400 truncate">
            {c.workOrderNumber ? `WO: ${c.workOrderNumber}` : ""}
            {c.workOrderNumber && c.gatePassNumber ? " · " : ""}
            {c.gatePassNumber  ? `GP: ${c.gatePassNumber}` : ""}
          </p>
        </div>

        {/* Items count */}
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
          {c.items?.length || 0} items
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <button onClick={() => onPrint(c)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors"
            title="Print">
            <Printer size={12} /> Print
          </button>
          <button onClick={() => onPDF(c)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition-colors"
            title="Download PDF">
            <Download size={12} /> PDF
          </button>
          <button onClick={() => onEdit(c)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit">
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(c._id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen(o => !o)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 space-y-3">
          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["To",         c.to],
              ["Thru",       c.thru],
              ["Work Order", c.workOrderNumber],
              ["Gate Pass",  c.gatePassNumber],
              ["Received By",c.receivedBy],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lbl}</p>
                <p className="text-xs font-semibold text-slate-700">{val || "—"}</p>
              </div>
            ))}
          </div>

          {/* Items table */}
          {c.items?.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[400px] text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px] w-8">#</th>
                    <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px]">Particulars</th>
                    <th className="px-3 py-2 text-center font-black uppercase tracking-wider text-[9px] w-20">Qty</th>
                    <th className="px-3 py-2 text-left font-black uppercase tracking-wider text-[9px] w-32">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {c.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 text-center text-slate-400 font-bold border-b border-slate-100">{i + 1}</td>
                      <td className="px-3 py-2 text-slate-700 border-b border-slate-100">{item.particulars || "—"}</td>
                      <td className="px-3 py-2 text-center text-slate-700 border-b border-slate-100">{item.quantity || "—"}</td>
                      <td className="px-3 py-2 text-slate-500 border-b border-slate-100">{item.remarks || "—"}</td>
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
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function AdminDChallan() {
  const [form,       setForm]       = useState(INITIAL_FORM);
  const [challans,   setChallans]   = useState([]);
  const [editingId,  setEditingId]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search,     setSearch]     = useState("");

  /* ── fetch ── */
  const fetchChallans = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await api.get("/dchallan");
      const data = res.data;
      setChallans(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error("Failed to fetch challans");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchChallans(); }, [fetchChallans]);

  /* ── form helpers ── */
  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setItem  = (idx, key, val) => setForm(prev => {
    const items = [...prev.items];
    items[idx] = { ...items[idx], [key]: val };
    return { ...prev, items };
  });
  const addRow    = () => setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  const removeRow = (idx) => setForm(prev => ({
    ...prev,
    items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== idx) : prev.items,
  }));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!form.challanNumber || !form.date || !form.to) {
      toast.error("Challan No, Date, and To are required");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, challanNumber: Number(form.challanNumber) };
      if (editingId) {
        await api.put(`/dchallan/${editingId}`, payload);
        toast.success("Challan updated ✓");
      } else {
        await api.post("/dchallan", payload);
        toast.success("Challan created ✓");
      }
      setForm(INITIAL_FORM); setEditingId(null); setIsFormOpen(false);
      fetchChallans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── edit ── */
  const handleEdit = (c) => {
    setForm({
      challanNumber:   c.challanNumber ?? "",
      date:            c.date ? new Date(c.date).toISOString().split("T")[0] : "",
      to:              c.to ?? "",
      thru:            c.thru ?? "",
      workOrderNumber: c.workOrderNumber ?? "",
      gatePassNumber:  c.gatePassNumber ?? "",
      items:           c.items?.length ? c.items : [{ ...EMPTY_ITEM }],
      receivedBy:      c.receivedBy ?? "",
    });
    setEditingId(c._id);
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

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return challans;
    return challans.filter(c =>
      String(c.challanNumber).includes(t) ||
      (c.to              || "").toLowerCase().includes(t) ||
      (c.workOrderNumber || "").toLowerCase().includes(t) ||
      (c.gatePassNumber  || "").toLowerCase().includes(t) ||
      (c.receivedBy      || "").toLowerCase().includes(t) ||
      (c.items || []).some(item => (item.particulars || "").toLowerCase().includes(t))
    );
  }, [challans, search]);

  /* ═════════════════════ RENDER ═════════════════════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-10">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 px-4 md:px-6 py-3">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-xl shrink-0">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">
                D-Challan Management
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                {filtered.length} of {challans.length} records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search challan, party, WO..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Refresh */}
            <button onClick={fetchChallans}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0">
              <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
            </button>

            {/* New Challan */}
            <button
              onClick={() => {
                if (isFormOpen) { setForm(INITIAL_FORM); setEditingId(null); }
                setIsFormOpen(o => !o);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0
                ${isFormOpen ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-700 hover:bg-blue-800 text-white"}`}
            >
              {isFormOpen ? <><X size={15} /> Close</> : <><FilePlus2 size={15} /> New Challan</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-5 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Total Challans", value: challans.length,  color: "border-blue-200 bg-blue-50",  tc: "text-blue-700"  },
            { label: "This Month",     value: challans.filter(c => { const d = new Date(c.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length, color: "border-purple-200 bg-purple-50", tc: "text-purple-700"},
            { label: "Showing",        value: filtered.length,  color: "border-green-200 bg-green-50", tc: "text-green-700"  },
          ].map(({ label, value, color, tc }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
              <p className={`text-3xl font-black mt-1 ${tc}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ══ CHALLAN FORM ══ */}
        {isFormOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Form header */}
            <div className="bg-blue-700 px-5 py-3.5 flex justify-between items-center">
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">
                  {editingId ? `Edit Challan #${form.challanNumber}` : "New Delivery Challan"}
                </h2>
                <p className="text-blue-200 text-[10px] uppercase tracking-widest mt-0.5">Senthil Rewinding Works</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!form.challanNumber || !form.to) { toast.error("Fill Challan No and To before printing"); return; }
                    const preview = {
                      challanNumber: form.challanNumber, date: form.date,
                      to: form.to, thru: form.thru,
                      workOrderNumber: form.workOrderNumber, gatePassNumber: form.gatePassNumber,
                      items: form.items, receivedBy: form.receivedBy,
                    };
                    generateChallanPDF(preview, false);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
                >
                  <Printer size={13} /> Print Preview
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-white text-blue-700 px-4 py-1.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-50 transition-all text-sm shadow-md disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="p-5 space-y-4">
              {/* Row 1 — Challan no + Date */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FInput label="Challan No. *" value={form.challanNumber} type="number"
                  onChange={e => setField("challanNumber", e.target.value)} placeholder="001" />
                <FInput label="Date *" value={form.date} type="date"
                  onChange={e => setField("date", e.target.value)} />
                <FInput label="Work Order No." value={form.workOrderNumber}
                  onChange={e => setField("workOrderNumber", e.target.value)} placeholder="WO-001" />
                <FInput label="Gate Pass No." value={form.gatePassNumber}
                  onChange={e => setField("gatePassNumber", e.target.value)} placeholder="GP-001" />
              </div>

              {/* Row 2 — To + Thru */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FInput label="To (Recipient) *" value={form.to}
                  onChange={e => setField("to", e.target.value)} placeholder="Company / Party name" />
                <FInput label="Thru" value={form.thru}
                  onChange={e => setField("thru", e.target.value)} placeholder="Transporter / Person" />
              </div>

              {/* Items table */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Items / Particulars</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider w-10 text-center">#</th>
                        <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider text-left">Particulars</th>
                        <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider w-24 text-center">Qty</th>
                        <th className="px-3 py-2 text-[9px] font-black uppercase tracking-wider w-36 text-left">Remarks</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, idx) => (
                        <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                          <td className="px-3 py-1.5 text-center text-slate-400 font-bold border-r border-slate-100">{idx + 1}</td>
                          <td className="px-0 border-r border-slate-100">
                            <input type="text" value={item.particulars}
                              onChange={e => setItem(idx, "particulars", e.target.value)}
                              placeholder="Item description..."
                              className="w-full px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-blue-50/40 bg-transparent placeholder:text-slate-300 transition-colors" />
                          </td>
                          <td className="px-0 border-r border-slate-100">
                            <input type="text" value={item.quantity}
                              onChange={e => setItem(idx, "quantity", e.target.value)}
                              placeholder="Qty"
                              className="w-full px-3 py-1.5 text-xs text-center text-slate-800 outline-none focus:bg-blue-50/40 bg-transparent placeholder:text-slate-300 transition-colors" />
                          </td>
                          <td className="px-0 border-r border-slate-100">
                            <input type="text" value={item.remarks}
                              onChange={e => setItem(idx, "remarks", e.target.value)}
                              placeholder="Remarks"
                              className="w-full px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-blue-50/40 bg-transparent placeholder:text-slate-300 transition-colors" />
                          </td>
                          <td className="px-2 text-center">
                            <button type="button" onClick={() => removeRow(idx)}
                              disabled={form.items.length === 1}
                              className="text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors">
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40">
                    <button type="button" onClick={addRow}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                      <Plus size={12} /> Add Row
                    </button>
                  </div>
                </div>
              </div>

              {/* Received By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FInput label="Received By" value={form.receivedBy}
                  onChange={e => setField("receivedBy", e.target.value)} placeholder="Receiver's name / signature" />
              </div>
            </div>
          </div>
        )}

        {/* ══ CHALLANS LIST ══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-blue-700" /> Previous Challans
            </h2>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest">
              {challans.length} Records
            </span>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl uppercase tracking-widest text-xs">
              {challans.length === 0 ? 'No challans yet. Click "New Challan" to create one.' : "No results match your search."}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(c => (
                <ChallanCard
                  key={c._id}
                  c={c}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPDF={(ch) => { generateChallanPDF(ch, true); toast.success(`PDF downloaded for #${ch.challanNumber}`); }}
                  onPrint={(ch) => generateChallanPDF(ch, false)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}