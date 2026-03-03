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
  Phone
} from "lucide-react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AllCustomers() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // ================= FETCH =================
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

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ================= HELPERS =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("complete") || s.includes("finish") || s.includes("delivered")) 
      return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("pending") || s.includes("process")) 
      return "bg-amber-100 text-amber-700 border-amber-200";
    if (s.includes("cancel") || s.includes("rejected")) 
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const isCompleted = (status) => status?.toLowerCase().includes("complete");

  const years = useMemo(() => {
    const uniqueYears = [...new Set(services.map(s => new Date(s.updatedDate || s.createdAt).getFullYear().toString()))];
    return uniqueYears.sort((a, b) => b - a);
  }, [services]);

  // ================= GLOBAL SEARCH & FILTER =================
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((s) => {
      const date = new Date(s.updatedDate || s.createdAt);
      const yearMatches = selectedYear === "All" || date.getFullYear().toString() === selectedYear;
      if (!yearMatches) return false;
      if (!term) return true;

      const safeString = (val) => (val != null ? val.toString().toLowerCase() : "");
      return (
        safeString(s.srfNumber).includes(term) ||
        safeString(s.trackingCode).includes(term) ||
        safeString(s.customerName).includes(term) ||
        safeString(s.phone).includes(term) ||
        safeString(s.address).includes(term) ||
        safeString(s.motorDetails?.make || s.make).includes(term) ||
        safeString(s.motorDetails?.hp || s.hp).includes(term) ||
        safeString(s.motorDetails?.rpm || s.rpm).includes(term) ||
        safeString(s.motorDetails?.serialNumber).includes(term) ||
        safeString(s.motorDetails?.gatePassNumber).includes(term) ||
        safeString(s.problemIdentity || s.problem).includes(term) ||
        safeString(s.technician).includes(term) ||
        safeString(s.stage).includes(term) ||
        safeString(s.deliveryChallan?.receiverName).includes(term)
      );
    });
  }, [services, search, selectedYear]);

  const completedServices = useMemo(() => {
    return services.filter(s => isCompleted(s.stage));
  }, [services]);

  // ================= CHALLAN API ACTIONS =================
  const handleChallanAction = async (id, action = 'view') => {
    const toastId = toast.loading("Preparing Challan...");
    try {
      const response = await api.get(`/service/challan/${id}`, { responseType: "blob" });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      
      if (action === 'view') {
        window.open(fileURL, "_blank");
        toast.update(toastId, { render: "Challan opened", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        const printFrame = document.createElement('iframe');
        printFrame.style.display = 'none';
        printFrame.src = fileURL;
        document.body.appendChild(printFrame);
        
        printFrame.onload = () => {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
            URL.revokeObjectURL(fileURL);
          }, 1000);
        };
        toast.update(toastId, { render: "Sending to printer...", type: "success", isLoading: false, autoClose: 2000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Could not retrieve Challan PDF", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // ================= PDF INDUSTRY ALIGNMENT UTILS =================
  const addProfessionalHeader = (doc, title, subTitle, isLandscape = false) => {
    const pageWidth = isLandscape ? 297 : 210;
    
    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("SENTHIL REWINDING WORKSHOP", pageWidth / 2, 18, { align: "center" });
    
    // Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(subTitle.toUpperCase(), pageWidth / 2, 26, { align: "center" });
    
    // GST Placeholder / Contact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("GSTIN: 33XXXXXXXXXXXXX  |  Ph: +91 XXXXX XXXXX", pageWidth / 2, 32, { align: "center" });
    
    // Separator Line
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.line(14, 36, pageWidth - 14, 36);
  };

  const addProfessionalFooter = (doc, isLandscape = false) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.text(`Generated on: ${dateStr}`, 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 35, pageHeight - 10);
    }
  };

  // ================= INDIVIDUAL SERVICE PRINT (PORTRAIT) =================
  const printIndividual = (s) => {
    const doc = new jsPDF("p", "mm", "a4");
    addProfessionalHeader(doc, "SENTHIL REWINDING WORKSHOP", "Service Request Detail Report", false);

    const bodyData = [
      ["SRF Number", s.srfNumber || "-"],
      ["Tracking Code", s.trackingCode || "-"],
      ["Date of Entry", formatDate(s.updatedDate || s.createdAt)],
      ["Customer Name", s.customerName || "-"],
      ["Phone", s.phone || "-"],
      ["Address", s.address || "-"],
      ["Motor Make", s.motorDetails?.make || s.make || "-"],
      ["Gate Pass No", s.motorDetails?.gatePassNumber || "-"],
      ["Serial Number", s.motorDetails?.serialNumber || "-"],
      ["HP / RPM", `${s.motorDetails?.hp || s.hp || "-"} HP / ${s.motorDetails?.rpm || s.rpm || "-"}`],
      ["Problem Reported", s.problemIdentity || s.problem || "-"],
      ["Technician", s.technician || "-"],
      ["Current Status", (s.stage || "Pending").toUpperCase()],
    ];

    if (isCompleted(s.stage)) {
      bodyData.push(
        ["Receiver Name", s.deliveryChallan?.receiverName || "-"],
        ["Delivery Date", s.deliveryChallan?.deliveredAt ? formatDate(s.deliveryChallan.deliveredAt) : "-"]
      );
    }

    autoTable(doc, {
      startY: 45,
      theme: "grid",
      head: [["FIELD DESCRIPTION", "INFORMATION DETAILS"]],
      body: bodyData,
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: [255, 255, 255], 
        fontStyle: "bold", 
        halign: "left",
        fontSize: 10,
        cellPadding: 4
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 5, 
        valign: "middle",
        lineColor: [226, 232, 240]
      },
      columnStyles: { 
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [248, 250, 252] },
        1: { cellWidth: "auto" }
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      margin: { left: 14, right: 14 }
    });

    // Signature Area
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signature", 150, finalY);
    doc.setDrawColor(200);
    doc.line(145, finalY - 5, 195, finalY - 5);

    addProfessionalFooter(doc, false);
    doc.save(`SRF_${s.srfNumber}_Report.pdf`);
  };

  // ================= REPORT GENERATION (LANDSCAPE) =================
  const generateReportPDF = (data, title, fileName) => {
    const doc = new jsPDF("l", "mm", "a4");
    addProfessionalHeader(doc, "SENTHIL REWINDING WORKSHOP", title, true);

    const head = [[
      "SRF", "Tracking", "Date", "Customer", "Phone", "Address", 
      "Make", "HP", "RPM", "GP No", "Serial", "Problem", "Tech", "Status", "Receiver", "Deliv. Date"
    ]];

    const body = data.map(s => [
      s.srfNumber || "-",
      s.trackingCode || "-",
      new Date(s.updatedDate || s.createdAt).toLocaleDateString('en-IN'),
      s.customerName || "-",
      s.phone || "-",
      s.address || "-",
      s.motorDetails?.make || s.make || "-",
      s.motorDetails?.hp || s.hp || "-",
      s.motorDetails?.rpm || s.rpm || "-",
      s.motorDetails?.gatePassNumber || "-",
      s.motorDetails?.serialNumber || "-",
      s.problemIdentity || s.problem || "-",
      s.technician || "-",
      (s.stage || "Pending").toUpperCase(),
      s.deliveryChallan?.receiverName || "-",
      s.deliveryChallan?.deliveredAt ? new Date(s.deliveryChallan.deliveredAt).toLocaleDateString('en-IN') : "-"
    ]);

    autoTable(doc, {
      startY: 45,
      theme: "grid",
      head: head,
      body: body,
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: [255, 255, 255], 
        fontStyle: "bold", 
        halign: "center",
        fontSize: 7,
        valign: "middle"
      },
      styles: { 
        fontSize: 6.5, 
        cellPadding: 2, 
        valign: "middle",
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { halign: "center" },   // SRF
        2: { halign: "center" },   // Date
        4: { halign: "center" },   // Phone
        13: { halign: "center" },  // Status
        15: { halign: "center" }   // Deliv Date
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45, left: 5, right: 5 }
    });

    addProfessionalFooter(doc, true);
    doc.save(fileName);
  };

  const downloadMonthlyChallans = () => {
    if (selectedMonth === "All") return toast.info("Please select a month");
    const monthIdx = months.indexOf(selectedMonth);
    const mData = completedServices.filter(s => {
      const d = new Date(s.deliveryChallan?.deliveredAt || s.updatedDate || s.createdAt);
      return d.getMonth() === monthIdx && (selectedYear === "All" || d.getFullYear().toString() === selectedYear);
    });
    if (mData.length === 0) return toast.error("No records found for selection");
    generateReportPDF(mData, `Monthly Delivery Report - ${selectedMonth}`, `Monthly_Challan_Report_${selectedMonth}.pdf`);
  };

  const downloadAllCompleted = () => {
    if (completedServices.length === 0) return toast.error("No completed records");
    generateReportPDF(completedServices, "All Completed Delivery Challans Summary", "Completed_Challans_Full_Report.pdf");
  };

  if (loading) return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Wrench className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-500 font-medium">Loading workshop data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg"><Wrench size={24} className="text-white" /></div>
              All Customers
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-1">Total Records: {services.length}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Calendar size={18} className="absolute top-3 left-3 text-slate-400" />
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none font-medium text-slate-700">
                <option value="All">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="relative group">
              <Search size={18} className="absolute top-3 left-3 text-slate-400" />
              <input type="text" placeholder="Global search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full sm:w-60 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none" />
            </div>
            <button onClick={() => generateReportPDF(filtered, "Global Service Report", "Full_Service_Report.pdf")}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 transition-all">
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["SRF", "Date", "Customer", "Motor Details", "GP / Serial", "Technician", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">#{s.srfNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                        {new Date(s.updatedDate || s.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{s.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1"><Phone size={10}/> {s.phone || "-"}</div>
                      <div className="text-[11px] text-slate-400 flex items-start gap-1 mt-0.5">
                        <MapPin size={10} className="mt-0.5 shrink-0"/> 
                        <span className="line-clamp-1">{s.address || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{s.motorDetails?.make || s.make || "-"}</div>
                      <div className="text-[10px] text-slate-400">{s.motorDetails?.hp || s.hp || "-"} HP / {s.motorDetails?.rpm || s.rpm || "-"} RPM</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-600">GP: {s.motorDetails?.gatePassNumber || "-"}</div>
                      <div className="text-[10px] text-slate-500 italic">SN: {s.motorDetails?.serialNumber || "-"}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{s.technician || "Unassigned"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusColor(s.stage)}`}>
                          {s.stage || "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => printIndividual(s)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><FileDown size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPLETED SECTION TOGGLE */}
        {completedServices.length > 0 && (
          <div className="flex justify-center pt-4">
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
            >
              {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              {showCompleted ? "Hide Completed Challans" : "View Completed Challans"}
            </button>
          </div>
        )}

        {/* COMPLETED SECTION */}
        {showCompleted && completedServices.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="text-green-600" size={28} />
                <h2 className="text-2xl font-black text-slate-900">Delivery Challans Summary</h2>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Total: {completedServices.length}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={downloadAllCompleted} className="bg-slate-800 text-white text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-all flex items-center gap-2">
                  <Download size={14} /> Download All (PDF)
                </button>
                <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border-none text-[11px] py-1 px-2 outline-none font-bold text-slate-600 rounded-lg">
                    <option value="All">Select Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button onClick={downloadMonthlyChallans} className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                    <Printer size={12} /> Print Monthly
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-green-50/50 border-b border-slate-200">
                    <tr>
                      {["SRF", "Customer Name", "Delivery Date", "Receiver Name", "Challan Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedServices.map((s) => (
                      <tr key={s._id} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">#{s.srfNumber}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{s.customerName}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {s.deliveryChallan?.deliveredAt ? new Date(s.deliveryChallan.deliveredAt).toLocaleDateString('en-IN') : "-"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{s.deliveryChallan?.receiverName || "N/A"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleChallanAction(s._id, 'view')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-bold text-[10px] uppercase">
                              <FileText size={14} /> View
                            </button>
                            <button onClick={() => handleChallanAction(s._id, 'print')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all font-bold text-[10px] uppercase">
                              <Printer size={14} /> Print
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
        )}
      </div>
    </div>
  );
}