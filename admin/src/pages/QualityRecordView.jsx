import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Printer, Download, FileText, X, Loader2, FileDown, Eye, ShieldCheck, Settings, Wrench, ClipboardCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function QualityRecordView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quality-record");
      setRecords(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete record permanently?")) return;
    try {
      await api.delete(`/quality-record/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
      toast.success("Record deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const years = ["All", ...new Set(records.map(r => new Date(r.createdAt).getFullYear()))].sort((a, b) => b - a);

  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (r.companyName || "").toLowerCase().includes(term) ||
      (r.srfNumber || "").toLowerCase().includes(term) ||
      (r.motorDetails?.serialNumber || "").toLowerCase().includes(term) ||
      (r.partyGPNumber || "").toLowerCase().includes(term);
    const matchesYear = selectedYear === "All" || new Date(r.createdAt).getFullYear().toString() === selectedYear.toString();
    return matchesSearch && matchesYear;
  });

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "-";

  // ================= QC OFFICIAL PDF LOGIC (SINGLE PAGE PER RECORD) =================
  const drawQCPage = (doc, rec, isBulk = false) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    const fontSizeBase = 8;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("QUALITY CONTROL INSPECTION REPORT", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(10);
    doc.text("SENTHIL REWINDING WORKSHOP", pageWidth / 2, 17, { align: "center" });
    doc.setLineWidth(0.3);
    doc.line(margin, 20, pageWidth - margin, 20);

    // Basic Info
    autoTable(doc, {
      startY: 22,
      theme: "plain",
      styles: { fontSize: fontSizeBase, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 30 }, 2: { fontStyle: "bold", cellWidth: 30 } },
      body: [
        ["Company Name:", rec.companyName || "-", "Date:", formatDate(rec.createdAt)],
        ["SRF Number:", rec.srfNumber || "-", "Technician:", rec.technician || "-"],
        ["Party GP No:", rec.partyGPNumber || rec.motorDetails?.gatePassNumber || "-", "Status:", (rec.status || "PASSED").toUpperCase()],
        ["Serial Number:", rec.motorDetails?.serialNumber || "-", "", ""]
      ],
      margin: { left: margin, right: margin }
    });

    // Motor Specs
    doc.setFontSize(9);
    doc.text("SECTION 1: MOTOR SPECIFICATIONS", margin, doc.lastAutoTable.finalY + 5);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 7,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      body: [
        ["Make", rec.motorDetails?.make || "-", "HP / KW", `${rec.motorDetails?.hp || "-"} / ${rec.motorDetails?.kw || "-"}`],
        ["Volts / Phase", `${rec.motorDetails?.volts || "-"}V / ${rec.motorDetails?.phase || "-"} Ph`, "RPM", rec.motorDetails?.rpm || "-"],
        ["Serial No", rec.motorDetails?.serialNumber || "-", "Frame", rec.motorDetails?.frameSize || "-"]
      ],
      margin: { left: margin, right: margin }
    });

    // Winding Details
    doc.text("SECTION 2: WINDING & CORE DETAILS", margin, doc.lastAutoTable.finalY + 5);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 7,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      body: [
        ["SWG", rec.windingDetails?.swg || "-", "Slots", rec.windingDetails?.slots || "-"],
        ["Type", rec.windingDetails?.windingType || "-", "Pitch", rec.windingDetails?.pitch || "-"],
        ["Turns", rec.windingDetails?.turns || "-", "Coils", rec.windingDetails?.totalCoils || "-"],
        ["Meter", rec.windingDetails?.totalMeter || "-", "Material", rec.windingDetails?.materialEstimate || "-"]
      ],
      margin: { left: margin, right: margin }
    });

    // Load Test
    doc.text("SECTION 3: LOAD TESTING DATA", margin, doc.lastAutoTable.finalY + 5);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 7,
      theme: "grid",
      head: [["WT", "AMPS", "RPM", "KW"]],
      headStyles: { fillColor: [40, 40, 40], halign: 'center' },
      styles: { fontSize: 7.5, halign: 'center', cellPadding: 1 },
      body: (rec.loadTesting && rec.loadTesting.length > 0) 
        ? rec.loadTesting.slice(0, 3).map(row => [row.wt || "-", row.amps || "-", row.rpm || "-", row.kw || "-"])
        : [["-", "-", "-", "-"]],
      margin: { left: margin, right: margin }
    });

    // Remarks
    doc.text("SECTION 4: ANALYSIS", margin, doc.lastAutoTable.finalY + 5);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 7,
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 35 } },
      body: [
        ["Mech Work", (rec.mechanicalWorkDone || "-").substring(0, 150)],
        ["Failure Cause", (rec.causeOfFailure || "-").substring(0, 150)]
      ],
      margin: { left: margin, right: margin }
    });

    // Final Testing
    doc.text("SECTION 5: FINAL TESTING", margin, doc.lastAutoTable.finalY + 5);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 7,
      theme: "grid",
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      body: [
        ["HV Test", rec.assemblingTesting?.hvTest || "-", "Running Time", rec.assemblingTesting?.runningTime || "-"],
        ["Temperature", rec.assemblingTesting?.temperature || "-", "", ""]
      ],
      margin: { left: margin, right: margin }
    });

    // Signatures (Fixed Position at bottom)
    const sigY = 275;
    doc.setFontSize(8);
    doc.text("Technician Signature: __________________", margin, sigY);
    doc.text("QC Manager Signature: __________________", pageWidth - margin - 55, sigY);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated on: ${dateStr} | Senthil Rewinding Workshop QC Division`, pageWidth / 2, 288, { align: "center" });
  };

  const generateSinglePDF = (rec) => {
    const doc = new jsPDF("p", "mm", "a4");
    drawQCPage(doc, rec);
    doc.save(`QC_Report_${rec.srfNumber}.pdf`);
  };

  const generateBulkPDF = () => {
    if (filteredRecords.length === 0) return toast.info("No records to export");
    const doc = new jsPDF("p", "mm", "a4");
    filteredRecords.forEach((rec, index) => {
      if (index > 0) doc.addPage();
      drawQCPage(doc, rec, true);
    });
    doc.save(`QC_Bulk_Report_${selectedYear}.pdf`);
  };

  // ================= PROFESSIONAL PRINT LOGIC (SINGLE PAGE) =================
  const getRecordPrintHTML = (rec) => {
    const loadTestingRows = (rec.loadTesting && rec.loadTesting.length > 0)
      ? rec.loadTesting.slice(0, 4).map(row => `<tr><td>${row.wt || "-"}</td><td>${row.amps || "-"}</td><td>${row.rpm || "-"}</td><td>${row.kw || "-"}</td></tr>`).join("")
      : `<tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;

    return `
      <div class="qc-sheet">
        <div class="header">
          <h1>Quality Control Inspection Report</h1>
          <p>SENTHIL REWINDING WORKSHOP</p>
        </div>

        <table class="info-table">
          <tr><td><b>Company:</b> ${rec.companyName || "-"}</td><td><b>Date:</b> ${formatDate(rec.createdAt)}</td></tr>
          <tr><td><b>SRF No:</b> ${rec.srfNumber || "-"}</td><td><b>Technician:</b> ${rec.technician || "-"}</td></tr>
          <tr><td><b>GP No:</b> ${rec.partyGPNumber || rec.motorDetails?.gatePassNumber || "-"}</td><td><b>Status:</b> ${rec.status || "PASSED"}</td></tr>
        </table>

        <div class="section-title">1. Motor Specifications</div>
        <table class="data-table">
          <tr><th>Make</th><td>${rec.motorDetails?.make || "-"}</td><th>HP/KW</th><td>${rec.motorDetails?.hp || "-"}/${rec.motorDetails?.kw || "-"}</td></tr>
          <tr><th>V/Ph</th><td>${rec.motorDetails?.volts || "-"}V/${rec.motorDetails?.phase || "-"}Ph</td><th>RPM</th><td>${rec.motorDetails?.rpm || "-"}</td></tr>
          <tr><th>Serial</th><td>${rec.motorDetails?.serialNumber || "-"}</td><th>Frame</th><td>${rec.motorDetails?.frameSize || "-"}</td></tr>
        </table>

        <div class="section-title">2. Winding Details</div>
        <table class="data-table">
          <tr><th>SWG/Slots</th><td>${rec.windingDetails?.swg || "-"}/${rec.windingDetails?.slots || "-"}</td><th>Type/Pitch</th><td>${rec.windingDetails?.windingType || "-"}/${rec.windingDetails?.pitch || "-"}</td></tr>
          <tr><th>Turns</th><td>${rec.windingDetails?.turns || "-"}</td><th>Coils</th><td>${rec.windingDetails?.totalCoils || "-"}</td></tr>
          <tr><th>Meter/Mat.</th><td>${rec.windingDetails?.totalMeter || "-"}/${rec.windingDetails?.materialEstimate || "-"}</td><th></th><td></td></tr>
        </table>

        <div class="section-title">3. Load Testing</div>
        <table class="data-table center-text">
          <tr class="bg-gray"><th>WT</th><th>AMPS</th><th>RPM</th><th>KW</th></tr>
          ${loadTestingRows}
        </table>

        <div class="section-title">4. Remarks & Testing</div>
        <table class="data-table">
          <tr><th>Mech Work</th><td colspan="3">${(rec.mechanicalWorkDone || "N/A").substring(0, 200)}</td></tr>
          <tr><th>Failure</th><td colspan="3">${(rec.causeOfFailure || "N/A").substring(0, 200)}</td></tr>
          <tr><th>HV Test</th><td>${rec.assemblingTesting?.hvTest || "-"}</td><th>Run Time</th><td>${rec.assemblingTesting?.runningTime || "-"}</td></tr>
        </table>

        <div class="footer-sigs">
          <div class="sig">Technician Signature</div>
          <div class="sig">Authorized Signature</div>
        </div>
      </div>
    `;
  };

  const handlePrint = (rec = null) => {
    const printWindow = window.open("", "_blank");
    const recordsToPrint = rec ? [rec] : filteredRecords;
    
    const htmlContent = `
      <html>
        <head>
          <title>QC Print Job</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Arial', sans-serif; font-size: 11px; margin: 0; padding: 0; color: #000; }
            .qc-sheet { page-break-after: always; height: 270mm; position: relative; border: 1px solid #eee; padding: 5px; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-weight: bold; font-size: 12px; }
            .section-title { background: #eee; padding: 3px 8px; font-weight: bold; margin: 10px 0 5px; border-left: 4px solid #000; font-size: 11px; }
            .info-table { width: 100%; margin-bottom: 5px; }
            .info-table td { padding: 2px 0; width: 50%; }
            table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
            table.data-table th, table.data-table td { border: 1px solid #000; padding: 4px; text-align: left; font-size: 10px; }
            table.data-table th { background: #f9f9f9; width: 20%; }
            .center-text th, .center-text td { text-align: center; }
            .footer-sigs { position: absolute; bottom: 30px; width: 100%; display: flex; justify-content: space-between; }
            .sig { border-top: 1px solid #000; width: 180px; text-align: center; padding-top: 5px; font-weight: bold; }
            .bg-gray { background: #f2f2f2; }
          </style>
        </head>
        <body>
          ${recordsToPrint.map(r => getRecordPrintHTML(r)).join("")}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={32} />
              QUALITY CONTROL CENTER
            </h1>
            <p className="text-slate-500 text-sm font-medium">Official Workshop Inspection Records</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={generateBulkPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-md"
            >
              <Download size={16}/> Download Year Report
            </button>
            <button 
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md"
            >
              <Printer size={16}/> Print Year
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search SRF, Company, GP..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-56 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-slate-400 font-medium tracking-widest text-[10px] uppercase">Accessing Database...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No QC records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identification</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">GP Number</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Result</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => (
                    <tr key={rec._id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 leading-none mb-1">{rec.companyName}</div>
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">SRF: {rec.srfNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                          {rec.partyGPNumber || rec.motorDetails?.gatePassNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{formatDate(rec.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${rec.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                          {rec.status || "PASSED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedRecord(rec)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18}/></button>
                          <button onClick={() => generateSinglePDF(rec)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><FileDown size={18}/></button>
                          <button onClick={() => handlePrint(rec)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Printer size={18}/></button>
                          <button onClick={() => handleDelete(rec._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">QC Inspection Detail</h2>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">SRF: {selectedRecord.srfNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => generateSinglePDF(selectedRecord)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md"><FileDown size={16}/> PDF</button>
                   <button onClick={() => handlePrint(selectedRecord)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all shadow-md"><Printer size={16}/> Print</button>
                   <button onClick={() => setSelectedRecord(null)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition-all"><X size={20}/></button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Customer</p>
                    <p className="text-sm font-black text-slate-800 uppercase leading-tight">{selectedRecord.companyName || "-"}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase">GP: {selectedRecord.partyGPNumber || selectedRecord.motorDetails?.gatePassNumber || "-"}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Meta Data</p>
                    <p className="text-sm font-bold text-slate-700">Date: {formatDate(selectedRecord.createdAt)}</p>
                    <p className="text-sm font-bold text-slate-700">Tech: {selectedRecord.technician || "-"}</p>
                  </div>
                  <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-center items-center ${selectedRecord.status === 'Rejected' ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className={`text-[10px] font-black uppercase mb-1 ${selectedRecord.status === 'Rejected' ? 'text-red-600' : 'text-emerald-600'}`}>QC Verdict</p>
                    <p className={`text-2xl font-black uppercase tracking-tighter ${selectedRecord.status === 'Rejected' ? 'text-red-800' : 'text-emerald-800'}`}>{selectedRecord.status || "PASSED"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase"><Settings size={14} className="text-blue-500" /> Motor Specs</h4>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                       <table className="w-full text-xs">
                          <tbody className="divide-y divide-slate-100">
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">Make</th><td className="px-4 py-3 font-bold">{selectedRecord.motorDetails?.make || "-"}</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">HP / KW</th><td className="px-4 py-3 font-bold">{selectedRecord.motorDetails?.hp || "-"} / {selectedRecord.motorDetails?.kw || "-"}</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">RPM / V</th><td className="px-4 py-3 font-bold">{selectedRecord.motorDetails?.rpm || "-"} / {selectedRecord.motorDetails?.volts || "-"}V</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">Serial No</th><td className="px-4 py-3 font-bold">{selectedRecord.motorDetails?.serialNumber || "-"}</td></tr>
                          </tbody>
                       </table>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase"><Wrench size={14} className="text-blue-500" /> Winding Info</h4>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                       <table className="w-full text-xs">
                          <tbody className="divide-y divide-slate-100">
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">SWG / Slots</th><td className="px-4 py-3 font-bold">{selectedRecord.windingDetails?.swg || "-"} / {selectedRecord.windingDetails?.slots || "-"}</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">Turns</th><td className="px-4 py-3 font-bold">{selectedRecord.windingDetails?.turns || "-"}</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">Coils / Wt</th><td className="px-4 py-3 font-bold">{selectedRecord.windingDetails?.totalCoils || "-"} / {selectedRecord.windingDetails?.weight || "-"}</td></tr>
                             <tr><th className="bg-slate-50 px-4 py-3 text-left font-bold text-slate-500">Insulation</th><td className="px-4 py-3 font-bold">{selectedRecord.windingDetails?.insulationClass || "-"}</td></tr>
                          </tbody>
                       </table>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase mb-4"><ClipboardCheck size={14} className="text-blue-500" /> Load Testing</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                     <table className="w-full text-xs text-center">
                        <thead className="bg-slate-900 text-white uppercase tracking-widest text-[9px]">
                           <tr><th className="py-2">WT</th><th className="py-2">AMPS</th><th className="py-2">RPM</th><th className="py-2">KW</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                           {selectedRecord.loadTesting?.map((row, idx) => (
                             <tr key={idx}><td className="py-2">{row.wt || "-"}</td><td className="py-2">{row.amps || "-"}</td><td className="py-2">{row.rpm || "-"}</td><td className="py-2">{row.kw || "-"}</td></tr>
                           ))}
                           {(!selectedRecord.loadTesting || selectedRecord.loadTesting.length === 0) && (
                             <tr><td colSpan="4" className="py-4 text-slate-300 italic">No data logged</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white p-5 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Mechanical Work Done</p>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{selectedRecord.mechanicalWorkDone || "None"}</p>
                   </div>
                   <div className="bg-white p-5 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Failure Analysis</p>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{selectedRecord.causeOfFailure || "None"}</p>
                   </div>
                </div>

                {selectedRecord.assembledProof && (
                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Assembled Unit Proof</p>
                    {(() => {
                      let imgUrl = selectedRecord.assembledProof.imageUrl || selectedRecord.assembledProof.driveLink;
                      if (!imgUrl) return null;
                      if (imgUrl.includes("drive.google.com")) {
                        const id = imgUrl.split("/d/")[1]?.split("/")[0];
                        imgUrl = id ? `https://drive.google.com/uc?export=view&id=${id}` : imgUrl;
                      }
                      return (
                        <div className="max-w-md w-full"><img src={imgUrl} className="w-full h-auto rounded-3xl border shadow-xl" alt="Proof" /></div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}