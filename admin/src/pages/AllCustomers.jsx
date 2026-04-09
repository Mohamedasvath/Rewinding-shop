import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../api/axios";
import {
  Wrench,
  Search,
  Download,
  FileX,
  Printer,
  Calendar,
  FileDown,
  FileText,
  CheckCircle2,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User2,
  Zap,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─────────────── MOTOR FIELD (matches AdminServices style) ─────────────── */
const MotorField = ({ label, value }) => (
  <div className="flex flex-col gap-[2px]">
    <span className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">
      {label}
    </span>

    <span
      className={`text-[12px] leading-snug ${
        value
          ? "text-slate-700 font-medium"
          : "text-slate-300 italic"
      }`}
    >
      {value || "Not specified"}
    </span>
  </div>
);
/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function AllCustomers() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  /* ─── PASSWORD LOCK ─── */
  const CORRECT_PASSWORD = "admin123";
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  /* ─── FETCH ─── */
  const fetchServices = useCallback(async () => {
    try {
      const { data } = await api.get("/service");
      setServices(data);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  /* ─── HELPERS ─── */
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDateShort = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("complete") || s.includes("finish") || s.includes("delivered"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s.includes("pending") || s.includes("process"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (s.includes("cancel") || s.includes("rejected"))
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const isCompleted = (status) => status?.toLowerCase().includes("complete");

  /* ─── YEAR OPTIONS ─── */
  const years = useMemo(() => {
    const unique = [...new Set(
      services.map(s => new Date(s.updatedDate || s.createdAt).getFullYear().toString())
    )];
    return unique.sort((a, b) => b - a);
  }, [services]);

  /* ─── GLOBAL SEARCH + YEAR FILTER (useMemo) ─── */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const safe = (val) => (val != null ? val.toString().toLowerCase() : "");

    return services.filter((s) => {
      const date = new Date(s.updatedDate || s.createdAt);
      const yearOk = selectedYear === "All" || date.getFullYear().toString() === selectedYear;
      if (!yearOk) return false;
      if (!term) return true;

      const md = s.motorDetails || {};
      return (
        safe(s.srfNumber).includes(term) ||
        safe(s.trackingCode).includes(term) ||
        safe(s.customerName).includes(term) ||
        safe(s.phone).includes(term) ||
        safe(s.address).includes(term) ||
        safe(s.technician).includes(term) ||
        safe(s.stage).includes(term) ||
        safe(s.natureOfComplaint).includes(term) ||
        safe(s.sparesReceived).includes(term) ||
        safe(md.make).includes(term) ||
        safe(md.hp).includes(term) ||
        safe(md.rpm).includes(term) ||
        safe(md.kw).includes(term) ||
        safe(md.volts).includes(term) ||
        safe(md.amps).includes(term) ||
        safe(md.phase).includes(term) ||
        safe(md.type).includes(term) ||
        safe(md.ins).includes(term) ||
        safe(md.frame).includes(term) ||
        safe(md.serialNumber).includes(term) ||
        safe(md.gatePassNumber).includes(term) ||
        safe(s.deliveryChallan?.receiverName).includes(term)
      );
    });
  }, [services, search, selectedYear]);

  const completedServices = useMemo(
    () => services.filter(s => isCompleted(s.stage)),
    [services]
  );

  /* ─── CHALLAN API ─── */
  const handleChallanAction = async (id, action = "view") => {
    const toastId = toast.loading("Preparing Challan...");
    try {
      const response = await api.get(`/service/challan/${id}`, { responseType: "blob" });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      if (action === "view") {
        window.open(fileURL, "_blank");
        toast.update(toastId, { render: "Challan opened", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        const printFrame = document.createElement("iframe");
        printFrame.style.display = "none";
        printFrame.src = fileURL;
        document.body.appendChild(printFrame);
        printFrame.onload = () => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          setTimeout(() => { document.body.removeChild(printFrame); URL.revokeObjectURL(fileURL); }, 1000);
        };
        toast.update(toastId, { render: "Sending to printer...", type: "success", isLoading: false, autoClose: 2000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Could not retrieve Challan PDF", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  /* ══════════════════════════════════════════════
     PDF UTILITIES
  ══════════════════════════════════════════════ */
  const addHeader = (doc, subTitle, isLandscape = false) => {
    const pw = isLandscape ? 297 : 210;

    // Background band
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pw, 38, "F");

    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("SENTHIL REWINDING WORKSHOP", pw / 2, 14, { align: "center" });

    // Sub-title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(subTitle.toUpperCase(), pw / 2, 22, { align: "center" });

    // Contact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    

    // Accent line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.2);
    doc.line(14, 38, pw - 14, 38);
  };

  const addFooter = (doc, isLandscape = false) => {
    const count = doc.internal.getNumberOfPages();
    const pw = isLandscape ? 297 : 210;
    const ph = isLandscape ? 210 : 297;

    for (let i = 1; i <= count; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, ph - 15, pw - 14, ph - 15);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const dateStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      doc.text(`Generated: ${dateStr}`, 14, ph - 9);
      doc.text(`Page ${i} of ${count}`, pw - 14, ph - 9, { align: "right" });
    }
  };

  /* ─── INDIVIDUAL SERVICE PDF (Portrait, section-based) ─── */
  const printIndividual = (s) => {
    const doc = new jsPDF("p", "mm", "a4");
    const md = s.motorDetails || {};

    addHeader(doc, "Service Request Detail", false);

    // ── Section builder
    const section = (title, color, startY) => {
      doc.setFillColor(...color);
      doc.rect(14, startY, 182, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(title, 18, startY + 5);
      return startY + 7;
    };

    let y = 46;

    // ── Customer Info
    y = section("  CUSTOMER INFORMATION", [30, 41, 59], y);
    autoTable(doc, {
      startY: y,
      body: [
        ["SRF Number", s.srfNumber || "-", "Tracking Code", s.trackingCode || "-"],
        ["Customer Name", s.customerName || "-", "Phone", s.phone || "-"],
        ["Address", { content: s.address || "-", colSpan: 3 }],
        ["Date", formatDateShort(s.updatedDate || s.createdAt), "Status", (s.stage || "Pending").toUpperCase()],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, valign: "middle", lineColor: [226, 232, 240] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 38 },
        1: { cellWidth: 52 },
        2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 38 },
        3: { cellWidth: 52 },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // ── Motor Details
    y = section("  MOTOR DETAILS", [37, 99, 235], y);
    autoTable(doc, {
      startY: y,
      body: [
        ["Make", md.make || "-", "HP", md.hp || "-"],
        ["RPM", md.rpm || "-", "KW", md.kw || "-"],
        ["Volts", md.volts || "-", "Amps", md.amps || "-"],
        ["Phase", md.phase || "-", "Type", md.type || "-"],
        ["Insulation", md.ins || "-", "Frame", md.frame || "-"],
        ["Serial Number", md.serialNumber || "-", "Gate Pass No.", md.gatePassNumber || "-"],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, valign: "middle", lineColor: [226, 232, 240] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [239, 246, 255], cellWidth: 38 },
        1: { cellWidth: 52 },
        2: { fontStyle: "bold", fillColor: [239, 246, 255], cellWidth: 38 },
        3: { cellWidth: 52 },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // ── Complaint & Spares
    y = section("  COMPLAINT & SPARES", [245, 158, 11], y);
    autoTable(doc, {
      startY: y,
      body: [
        ["Nature of Complaint", s.natureOfComplaint || "-"],
        ["Spares Received", s.sparesReceived || "-"],
        ["Assigned Technician", s.technician || "Unassigned"],
      ],
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3.5, valign: "middle", lineColor: [226, 232, 240] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [255, 251, 235], cellWidth: 55 },
        1: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;

    // ── Delivery (if completed)
    if (isCompleted(s.stage) && s.deliveryChallan) {
      y = section("  DELIVERY CHALLAN", [5, 150, 105], y);
      autoTable(doc, {
        startY: y,
        body: [
          ["Receiver Name", s.deliveryChallan?.receiverName || "-", "Delivered At",
            s.deliveryChallan?.deliveredAt ? formatDateShort(s.deliveryChallan.deliveredAt) : "-"],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3.5, valign: "middle", lineColor: [226, 232, 240] },
        columnStyles: {
          0: { fontStyle: "bold", fillColor: [236, 253, 245], cellWidth: 38 },
          1: { cellWidth: 52 },
          2: { fontStyle: "bold", fillColor: [236, 253, 245], cellWidth: 38 },
          3: { cellWidth: 52 },
        },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    // ── Signature
    const sigY = Math.max(y + 20, 250);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Customer Signature", 14, sigY + 6);
    doc.setDrawColor(200);
    doc.line(14, sigY, 70, sigY);

    doc.text("Authorized Signature", 148, sigY + 6);
    doc.line(140, sigY, 196, sigY);

    addFooter(doc, false);
    doc.save(`SRF_${s.srfNumber || "Record"}_Service_Report.pdf`);
    toast.success(`PDF saved for SRF #${s.srfNumber}`);
  };

  /* ─── YEAR-WISE REPORT PDF (Landscape table) ─── */
  const generateReportPDF = (data, title, fileName) => {
    if (!data.length) return toast.error("No records to export");
    const doc = new jsPDF("l", "mm", "a4");
    addHeader(doc, title, true);

    const head = [[
      "SRF", "Tracking", "Date", "Customer", "Phone",
      "Make", "HP", "RPM", "KW", "Volts", "Amps",
      "Phase", "Type", "S/N", "GP No.",
      "Complaint", "Spares", "Technician", "Status",
      "Receiver", "Delivered",
    ]];

    const body = data.map(s => {
      const md = s.motorDetails || {};
      return [
        s.srfNumber || "-",
        s.trackingCode || "-",
        formatDateShort(s.updatedDate || s.createdAt),
        `${s.customerName || "-"}\n${s.phone || ""}`,
        s.phone || "-",
        md.make || "-",
        md.hp || "-",
        md.rpm || "-",
        md.kw || "-",
        md.volts || "-",
        md.amps || "-",
        md.phase || "-",
        md.type || "-",
        md.serialNumber || "-",
        md.gatePassNumber || "-",
        s.natureOfComplaint || "-",
        s.sparesReceived || "-",
        s.technician || "-",
        (s.stage || "Pending").toUpperCase(),
        s.deliveryChallan?.receiverName || "-",
        s.deliveryChallan?.deliveredAt ? formatDateShort(s.deliveryChallan.deliveredAt) : "-",
      ];
    });

    autoTable(doc, {
      startY: 44,
      head,
      body,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 6,
        valign: "middle",
        cellPadding: 2,
      },
      styles: {
        fontSize: 6,
        cellPadding: 1.8,
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 13 },
        1: { cellWidth: 14 },
        2: { halign: "center", cellWidth: 16 },
        3: { cellWidth: 22 },
        4: { cellWidth: 16 },
        5: { cellWidth: 14 },
        6: { halign: "center", cellWidth: 9 },
        7: { halign: "center", cellWidth: 10 },
        8: { halign: "center", cellWidth: 9 },
        9: { halign: "center", cellWidth: 10 },
        10: { halign: "center", cellWidth: 10 },
        11: { halign: "center", cellWidth: 10 },
        12: { cellWidth: 12 },
        13: { cellWidth: 18 },
        14: { cellWidth: 13 },
        15: { cellWidth: 22 },
        16: { cellWidth: 18 },
        17: { cellWidth: 16 },
        18: { halign: "center", cellWidth: 18 },
        19: { cellWidth: 18 },
        20: { halign: "center", cellWidth: 16 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 44, left: 4, right: 4 },
    });

    addFooter(doc, true);
    doc.save(fileName);
    toast.success("Report exported successfully");
  };

  /* ─── MONTHLY CHALLANS ─── */
  const downloadMonthlyChallans = () => {
    if (selectedMonth === "All") return toast.info("Please select a month first");
    const monthIdx = months.indexOf(selectedMonth);
    const mData = completedServices.filter(s => {
      const d = new Date(s.deliveryChallan?.deliveredAt || s.updatedDate || s.createdAt);
      return d.getMonth() === monthIdx &&
        (selectedYear === "All" || d.getFullYear().toString() === selectedYear);
    });
    if (!mData.length) return toast.error("No records found for selection");
    generateReportPDF(
      mData,
      `Monthly Delivery Report — ${selectedMonth}${selectedYear !== "All" ? " " + selectedYear : ""}`,
      `Monthly_Challan_${selectedMonth}_Report.pdf`
    );
  };

  const downloadAllCompleted = () => {
    if (!completedServices.length) return toast.error("No completed records");
    generateReportPDF(completedServices, "All Completed Delivery Challans Summary", "Completed_Challans_Full_Report.pdf");
  };

  /* ─── PASSWORD SCREEN ─── */
  if (!isUnlocked) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-sm p-8 flex flex-col items-center gap-6">
        <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
          <Wrench size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Senthil Rewinding</h2>
          <p className="text-slate-400 text-sm mt-1">Enter password to access customer records</p>
        </div>
        <div className="w-full flex flex-col gap-3">
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (passwordInput === CORRECT_PASSWORD) {
                  setIsUnlocked(true);
                } else {
                  setPasswordError("Incorrect password. Please try again.");
                  setPasswordInput("");
                }
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
              ${passwordError
                ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              }`}
          />
          {passwordError && (
            <p className="text-xs text-red-500 font-semibold text-center">{passwordError}</p>
          )}
          <button
            onClick={() => {
              if (passwordInput === CORRECT_PASSWORD) {
                setIsUnlocked(true);
              } else {
                setPasswordError("Incorrect password. Please try again.");
                setPasswordInput("");
              }
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md shadow-blue-100 text-sm"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── LOADING ─── */
  if (loading) return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Wrench className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-500 font-medium tracking-wide">Loading workshop data…</p>
    </div>
  );

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="p-4 md:p-6">

        {/* ── HEADER ── */}
        <div className="max-w-[1400px] mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
                  <Wrench size={20} className="text-white" />
                </div>
                ALL CUSTOMERS
              </h1>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-0.5">
                {filtered.length} of {services.length} records
                {selectedYear !== "All" && ` · ${selectedYear}`}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter */}
              <div className="relative">
                <Calendar size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                >
                  <option value="All">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Global Search */}
              <div className="relative">
                <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search everything…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-64 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Export Buttons */}
              <button
                onClick={() =>
                  generateReportPDF(
                    filtered,
                    selectedYear === "All"
                      ? "Full Service Report"
                      : `Service Report — ${selectedYear}`,
                    selectedYear === "All"
                      ? "Full_Service_Report.pdf"
                      : `Service_Report_${selectedYear}.pdf`
                  )
                }
                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-slate-200 transition-all"
              >
                <Download size={16} />
                {selectedYear === "All" ? "Export All" : `Export ${selectedYear}`}
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN TABLE ── */}
        <div className="max-w-[1400px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <FileX size={48} className="text-slate-200" />
              <p className="font-semibold text-sm">No records found</p>
              {search && (
                <p className="text-xs">Try clearing your search or changing the year filter</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[900px] border-collapse table-fixed text-xs"
              >
                <colgroup>
                  <col style={{ width: "9%" }} />   {/* SRF */}
                  <col style={{ width: "18%" }} />  {/* Customer */}
                  <col style={{ width: "15%" }} />  {/* Date */}
                  <col style={{ width: "27%" }} />  {/* Motor */}
                  <col style={{ width: "20%" }} />  {/* Complaint */}
                  <col style={{ width: "20%" }} />  {/* Tech */}
                  <col style={{ width: "20%" }} />  {/* Status */}
                  <col style={{ width: "20%" }} />  {/* Actions */}
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      "SRF / Job", "Customer", "Date", "Motor Details",
                      "Complaint ", "Technician", "Status", "Actions",
                    ].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => {
                    const md = s.motorDetails || {};
                    return (
                      <tr
                        key={s._id}
                        className="hover:bg-slate-50/80 transition-colors align-top"
                      >
                        {/* SRF / Tracking */}
                        <td className="px-4 py-3">
                          <p className="font-black text-slate-900 text-sm leading-tight">
                            {s.srfNumber || "—"}
                          </p>
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
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                            {s.customerName || "—"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone size={9} /> {s.phone || "—"}
                          </p>
                          {s.address && (
                            <p className="text-[10px] text-slate-400 flex items-start gap-1 mt-0.5 leading-tight">
                              <MapPin size={9} className="mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{s.address}</span>
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-600">
                            {s.updatedDate
                              ? new Date(s.updatedDate).toLocaleDateString("en-IN")
                              : s.createdAt
                              ? new Date(s.createdAt).toLocaleDateString("en-IN")
                              : "—"}
                          </p>
                        </td>

                        {/* Motor Details — 2-col grid matching AdminServices */}
                        <td className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            <MotorField label="Make"  value={md.make}  />
                            <MotorField label="HP"    value={md.hp}    />
                            <MotorField label="RPM"   value={md.rpm}   />
                            <MotorField label="KW"    value={md.kw}    />
                            <MotorField label="Volts" value={md.volts} />
                            <MotorField label="Amps"  value={md.amps}  />
                            <MotorField label="Phase" value={md.phase} />
                            <MotorField label="Type"  value={md.type}  />
                            <MotorField label="Ins"   value={md.ins}   />
                            <MotorField label="Frame" value={md.frame} />
                            <MotorField label="S/N"   value={md.serialNumber}   />
                            <MotorField label="G.P."  value={md.gatePassNumber} />
                          </div>
                        </td>

                        {/* Complaint & Spares */}
                        <td className="px-4 py-3">
                          <div className="space-y-2">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                                Complaint
                              </p>
                              <p className="text-[11px] text-slate-700 leading-snug line-clamp-3">
                                {s.natureOfComplaint || (
                                  <span className="text-slate-300 italic">None</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                                Spares
                              </p>
                              <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">
                                {s.sparesReceived || (
                                  <span className="text-slate-300 italic">None</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-700">
                            {s.technician || (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-tight ${getStatusColor(s.stage)}`}
                          >
                            {s.stage || "Pending"}
                          </span>
                          {isCompleted(s.stage) && s.deliveryChallan?.receiverName && (
                            <p className="text-[9px] text-slate-400 mt-1">
                              → {s.deliveryChallan.receiverName}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => printIndividual(s)}
                            title="Download Service PDF"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <FileDown size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── COMPLETED / CHALLAN TOGGLE ── */}
        {completedServices.length > 0 && (
          <div className="max-w-[1400px] mx-auto flex justify-center pb-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm text-sm"
            >
              {showCompleted ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showCompleted ? "Hide Delivery Challans" : `View Delivery Challans (${completedServices.length})`}
            </button>
          </div>
        )}

        {/* ── COMPLETED CHALLANS SECTION ── */}
        {showCompleted && completedServices.length > 0 && (
          <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">

            {/* Challan Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Delivery Challans Summary</h2>
                  <p className="text-slate-400 text-xs font-semibold">
                    {completedServices.length} completed service records
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                  {completedServices.length} Total
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={downloadAllCompleted}
                  className="bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-all flex items-center gap-2"
                >
                  <Download size={13} /> Download All
                </button>
                <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-none text-xs py-1 px-2 outline-none font-bold text-slate-600 cursor-pointer"
                  >
                    <option value="All">Select Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button
                    onClick={downloadMonthlyChallans}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                  >
                    <Printer size={12} /> Print Monthly
                  </button>
                </div>
              </div>
            </div>

            {/* Challan Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left">
                  <thead className="bg-emerald-50/50 border-b border-slate-200">
                    <tr>
                      {["SRF / Tracking", "Customer", "Motor", "Receiver", "Delivered", "Challan"].map(h => (
                        <th
                          key={h}
                          className="px-5 py-3.5 font-black text-slate-500 uppercase tracking-widest text-[10px]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedServices.map((s) => {
                      const md = s.motorDetails || {};
                      return (
                        <tr key={s._id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-black text-slate-900 text-sm">#{s.srfNumber}</p>
                            <p
                              className="text-[10px] font-bold text-blue-500 cursor-pointer hover:text-blue-700 hover:underline transition-colors"
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
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-800 text-sm">{s.customerName}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone size={9} /> {s.phone || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs font-semibold text-slate-700">{md.make || "—"}</p>
                            <p className="text-[10px] text-slate-400">
                              {[md.hp && `${md.hp}HP`, md.rpm && `${md.rpm}RPM`].filter(Boolean).join(" / ") || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700 text-sm">
                            {s.deliveryChallan?.receiverName || "N/A"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-sm">
                            {s.deliveryChallan?.deliveredAt
                              ? new Date(s.deliveryChallan.deliveredAt).toLocaleDateString("en-IN")
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleChallanAction(s._id, "view")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-bold text-[10px] uppercase"
                              >
                                <FileText size={13} /> View
                              </button>
                              <button
                                onClick={() => handleChallanAction(s._id, "print")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all font-bold text-[10px] uppercase"
                              >
                                <Printer size={13} /> Print
                              </button>
                              <button
                                onClick={() => printIndividual(s)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all font-bold text-[10px] uppercase"
                              >
                                <FileDown size={13} /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}