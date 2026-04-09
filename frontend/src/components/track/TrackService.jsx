import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, User, Wrench, Clock, Hash, Cpu, Loader2, Cog, 
  ShieldCheck, Activity, CheckCircle2, PhoneCall, FileText, 
  Truck, Award, Zap, HardHat, Download
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function UserTrackStatus() {
  const [trackId, setTrackId] = useState("");
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleTrack = async (e) => {
  e.preventDefault();
  if (!trackId.trim()) return;

  setLoading(true);
  setError("");
  setStatusData([]);

  try {
    const response = await axios.get(
      `${BACKEND}/service/track/${trackId.trim()}`
    );

    const raw = response.data;

    // ✅ FIX: handle multiple motors (same tracking code)
    let records = [];

    if (Array.isArray(raw)) {
      records = raw;
    }
    else if (Array.isArray(raw?.data)) {
      records = raw.data;
    }
    else if (raw?.data && raw.data._id) {
      records = [raw.data];
    }
    else if (raw?._id) {
      records = [raw];
    }

    if (!records.length) {
      setError("No record found for this tracking ID.");
      return;
    }

    // ✅ IMPORTANT: set all records (not just first one)
    setStatusData(records);

  } catch (err) {
    if (err?.response?.status === 404) {
      setError("No record found for this tracking ID.");
    } else {
      setError("Server error. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  /* ── PDF REPORT ── */
  const generateReport = (motor) => {
    const doc  = new jsPDF("p", "mm", "a4");
    const pw   = doc.internal.pageSize.getWidth();
    const md   = motor.motorDetails || {};

    /* Header band */
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pw, 36, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SENTHIL REWINDING WORKS", pw / 2, 13, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(99, 179, 237);
    doc.text("SERVICE TRACKING REPORT", pw / 2, 21, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pw / 2, 28, { align: "center" });

    /* Blue accent line */
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1.2);
    doc.line(14, 36, pw - 14, 36);

    let y = 44;

    /* ── Customer & Service Info ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("SERVICE INFORMATION", 14, y); y += 3;

    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, valign: "middle", lineColor: [226, 232, 240] },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 45 },
        2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 45 },
      },
      body: [
        ["SRF Number",    motor.srfNumber    || "—",  "Tracking Code", motor.trackingCode || "—"],
        ["Customer",      motor.customerName || "—",  "Phone",         motor.phone        || "—"],
        ["Address",       { content: motor.address || "—", colSpan: 3 }],
        ["Status",        motor.stage        || "—",  "Technician",    motor.technician   || "Allocating..."],
        ["Date",          motor.updatedDate
                            ? new Date(motor.updatedDate).toLocaleDateString("en-IN")
                            : motor.createdAt
                            ? new Date(motor.createdAt).toLocaleDateString("en-IN")
                            : "—",             "SRF / Work Order", motor.srfNumber || "—"],
      ],
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;

    /* ── Motor Details ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("MOTOR SPECIFICATIONS", 14, y); y += 3;

    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, valign: "middle", lineColor: [226, 232, 240] },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8 },
      head: [["Make", "HP", "KW", "RPM", "Volts", "Amps", "Phase", "Type", "Ins.", "Frame"]],
      body: [[
        md.make  || "—", md.hp    || "—", md.kw    || "—", md.rpm   || "—",
        md.volts || "—", md.amps  || "—", md.phase || "—", md.type  || "—",
        md.ins   || "—", md.frame || "—",
      ]],
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;

    /* Serial + Gate Pass */
    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240] },
      columnStyles: {
        0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 45 },
        2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 45 },
      },
      body: [
        ["Serial Number", md.serialNumber || "—", "Gate Pass No.", md.gatePassNumber || "—"],
      ],
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;

    /* ── Complaint & Spares ── */
    if (motor.natureOfComplaint || motor.sparesReceived) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("COMPLAINT & SPARES", 14, y); y += 3;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240] },
        columnStyles: { 0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 45 } },
        body: [
          ["Nature of Complaint", motor.natureOfComplaint || "—"],
          ["Spares Received",     motor.sparesReceived    || "—"],
        ],
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 6;
    }

    /* ── Signature block ── */
    const sigY = Math.max(y + 16, 255);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14,  sigY, 75,  sigY);
    doc.line(135, sigY, 196, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Customer Signature",     14,  sigY + 5);
    doc.text("Authorized Signature",   135, sigY + 5);

    /* ── Footer ── */
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, ph - 12, pw - 14, ph - 12);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Senthil Rewinding Works — Official Service Report", 14, ph - 7);
    doc.text(`Tracking: ${motor.trackingCode || "—"}`, pw - 14, ph - 7, { align: "right" });

    doc.save(`SRW_Report_${motor.srfNumber || motor.trackingCode || "export"}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600 overflow-x-hidden relative">
      
      {/* Background Animated Gear - Optimized for mobile */}
      <div className="fixed opacity-[0.03] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Cog size={window.innerWidth < 768 ? 400 : 800} strokeWidth={1} className="animate-[spin_30s_linear_infinite]" />
      </div>

      <nav className="relative z-10 border-b border-white/5 py-6 px-4 md:px-6 text-center backdrop-blur-xl bg-black/40 sticky top-0">
        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white">
           <span className="text-blue-600"></span> 
        </h1>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto p-4 md:p-12 pb-24">
        
        {/* Search Section */}
        <section className="text-center mb-10 md:mb-16 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.8] mb-4">
              Track <br/> <span className="text-blue-600 text-glow">Motor.</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Real-time Component Lifecycle Tracking</p>
          </motion.div>

          <form onSubmit={handleTrack} className="relative max-w-lg mx-auto mt-8 md:mt-10 px-2">
            <div className="relative flex text-w items-center bg-[#0A0A0A] border border-white/10 rounded-2xl focus-within:border-blue-600 transition-all p-1.5 shadow-2xl">
              <input
                type="text"
                placeholder="TRACKING CODE"
                className="placeholder-white w-full px-4 md:px-6 py-3 md:py-4 bg-transparent outline-none font-black text-base md:text-xl placeholder:opacity-50 uppercase tracking-widest"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="p-3 md:p-4 md:px-8 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-mono text-[10px] uppercase tracking-widest bg-red-500/10 py-2 rounded-lg inline-block px-4">
              {error}
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {statusData.length > 0 ? (
            statusData.map((motor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 md:space-y-8 mb-12"
              >
                {/* 1. STATUS BANNER */}
                <div className={`rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl flex flex-col justify-between items-center gap-6 md:gap-8 overflow-hidden relative ${
                  motor.stage === "Completed" ? "bg-emerald-600" : "bg-blue-600"
                }`}>
                  <Activity className="absolute -right-10 -top-10 opacity-10 w-48 md:w-64 h-48 md:h-64" />
                  
                  <div className="text-center md:text-left z-10 w-full">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                       <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Work Status</span>
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-4xl md:text-7xl font-black italic uppercase leading-none mb-4 tracking-tighter">
                      {motor.stage || "In Analysis"}
                    </h3>
                    <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold opacity-90 uppercase bg-black/20 w-full md:w-fit px-5 py-3 rounded-xl">
                      <User size={16} className="text-white" /> {motor.customerName || "No Name"}
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 md:p-8 text-center w-full md:min-w-[220px] md:w-auto z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50 text-blue-200">SRF Number</p>
                    <h4 className="text-3xl md:text-4xl font-black italic tracking-tighter">
                      #{motor.srfNumber || motor.trackingCode || "N/A"}
                    </h4>
                  </div>
                </div>

                {/* 2. CORE SPECS GRID (Mobile: 1 col, Tablet: 2 col) */}
                <div className="grid grid-cols-1  sm:grid-cols-2 gap-4 md:gap-6">
                  <SpecCard  icon={<Wrench/>} label="Technician" value={motor.technician || "Allocating..."} />
                  <SpecCard icon={<Cpu/>} label="Specifications" value={`${motor.motorDetails?.make || "GENERIC"} - ${motor.motorDetails?.hp || "0"} HP`} />
                  <SpecCard icon={<Hash/>} label="Serial Number" value={motor.motorDetails?.serialNumber || "NOT FOUND"} />
                  <SpecCard icon={<Clock/>} label="In-Date" value={motor.createdAt ? new Date(motor.createdAt).toLocaleDateString() : "N/A"} />
                </div>

                {/* 3. ACTION FOOTER */}
                <div className="flex flex-col gap-4 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none text-center">
                            Identity Secured by <span className="text-white italic">Senthil Rewinding </span>
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                          onClick={() => generateReport(motor)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            <Download size={16}/> Download Report
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                            <PhoneCall size={16}/> Support
                        </button>
                    </div>
                </div>
              </motion.div>
            ))
          ) : (
            /* 🔥 EXTRA CONTENT - Visible when NO results or below results */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 space-y-12">
                {/* Why Track Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <Truck size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Fast Delivery</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Average 24hr turnaround on all standard repairs.</p>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <Award size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Certified QC</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Every motor undergoes 5-stage precision testing.</p>
                    </div>
                    <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/5 text-center space-y-3">
                        <HardHat size={24} className="text-blue-500 mx-auto" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Expert Care</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">Work handled by engineers with 20+ years exp.</p>
                    </div>
                </div>

                {/* Industrial Banner */}
                <div className="relative h-40 rounded-[2rem] overflow-hidden group">
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-110 transition-transform duration-700" 
                      alt="Industry"
                    />
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center text-center p-6">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Maximum Torque. <br/> Minimum Downtime.</h3>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

// Reusable Spec Card for Grid
function SpecCard({ icon, label, value }) {
    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 md:p-8 flex items-center gap-4 md:gap-6 group transition-all">
            <div className="p-3 md:p-4 bg-white/5 rounded-xl text-blue-500">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-lg md:text-2xl font-black italic uppercase text-white truncate leading-none">{value}</p>
            </div>
        </div>
    );
}