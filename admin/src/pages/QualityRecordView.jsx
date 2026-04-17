import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Search, Trash2, Printer, Download, FileText, X,
  Loader2, FileDown, Eye, ChevronDown, ChevronUp,
  Calendar, Edit3, ShieldCheck, Wrench, Zap,
  ClipboardList, Settings2, BarChart2, Package,
  CheckSquare, AlertTriangle, Image as ImageIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const fv = (v) => (v && String(v).trim() !== "" ? String(v) : "-");

const fd = (d) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (isNaN(dt)) return "N/A";
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ── Section title bar ── */
const SecTitle = ({ icon: Icon, label, color = "blue" }) => {
  const colors = {
    blue:   "bg-blue-700 text-white",
    slate:  "bg-slate-700 text-white",
    green:  "bg-emerald-700 text-white",
    amber:  "bg-amber-600 text-white",
    purple: "bg-purple-700 text-white",
    red:    "bg-red-700 text-white",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${colors[color] || colors.blue}`}>
      {Icon && <Icon size={11} />}
      {label}
    </div>
  );
};

/* ── Field row in a 2-col table ── */
const FR = ({ label, value }) => (
  <div className="flex border-b border-slate-100 min-h-[24px]">
    <span className="text-[10px] font-bold text-slate-500 uppercase w-[110px] shrink-0 px-2 py-1 bg-slate-50 border-r border-slate-100">
      {label}
    </span>
    <span className="text-[11px] text-slate-800 font-semibold px-2 py-1 flex-1">{fv(value)}</span>
  </div>
);

/* ══════════════════════════════════════════════
   FULL REPORT (expand view inside page)
══════════════════════════════════════════════ */
const FullReport = ({ rec }) => {
  const it  = rec.inspectionTesting  || {};
  const cd  = rec.coreDetails        || {};
  const cnd = rec.conditionDetails   || {};
  const pd  = rec.paperDetails       || {};
  const wd  = rec.windingDetails     || {};
  const prd = rec.processDetails     || {};
  const at  = rec.assemblingTesting  || {};
  const ef  = rec.efficiencyDetails  || {};
  const lt  = rec.loadTesting        || [];

  return (
    <div className="text-[11px] border border-slate-200 bg-white print-section" id={`report-${rec._id}`}>

      {/* ── REPORT HEADER ── */}
      <div className="bg-blue-800 text-white text-center py-3 px-4">
        <p className="text-sm font-black uppercase tracking-widest">SENTHIL REWINDING WORKSHOP</p>
        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-0.5">Quality Inspection Report</p>
      </div>

      {/* ── SECTION 1: HEADER INFO ── */}
      <SecTitle icon={FileText} label="Section 1 — Header Information" color="slate" />
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
        <div className="border-b md:border-b-0 md:border-r border-slate-200">
          <FR label="Company"       value={rec.companyName} />
          <FR label="Address"       value={rec.address} />
          <FR label="SRF Number"    value={rec.srfNumber} />
          <FR label="Date"          value={fd(rec.date)} />
          <FR label="Technician"    value={rec.technician} />
        </div>
        <div>
          <FR label="Party GP No."  value={rec.partyGPNumber} />
          <FR label="Party GP Date" value={fd(rec.partyGPDate)} />
          <FR label="D-Note No."    value={rec.dNoteNumber} />
          <FR label="D-Note Date"   value={fd(rec.dNoteDate)} />
          <FR label="Bill No."      value={rec.billNo} />
          <FR label="Bill Date"     value={fd(rec.billDate)} />
        </div>
      </div>

      {/* ── SECTION 2: INSPECTION & TESTING ── */}
      <SecTitle icon={Settings2} label="Section 2 — Inspection & Testing" color="blue" />
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200">
        {[
          ["Make",        it.make],
          ["HP",          it.hp],
          ["KW",          it.kw],
          ["Amps",        it.amps],
          ["Volts",       it.volts],
          ["Phase",       it.phase],
          ["RPM",         it.rpm],
          ["Insulation",  it.insulation],
          ["Connection",  it.connection],
          ["Frame",       it.frame],
          ["Type",        it.type],
          ["Sl. No.",     it.slNo],
          ["Ex. Volts",   it.exV],
          ["Ex. Amps",    it.exA],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[72px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: CORE DETAILS ── */}
      <SecTitle icon={Package} label="Section 3 — Core Details" color="slate" />
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200">
        {[
          ["Core Length",     cd.coreLength],
          ["Core Dia",        cd.coreDia],
          ["Rotor Length",    cd.rotorLength],
          ["Rotor Perimeter", cd.rotorPerimeter],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[90px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100 leading-tight">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 4: CONDITION DETAILS ── */}
      <SecTitle icon={AlertTriangle} label="Section 4 — Condition Details" color="amber" />
      <div className="grid grid-cols-2 md:grid-cols-3 border-b border-slate-200">
        {[
          ["Brg - Drive End",     cnd.driveEndBearing],
          ["Brg - Non-Drive",     cnd.nonDriveEndBearing],
          ["Shield - Drive End",  cnd.driveEndCondition],
          ["Shield - Non-Drive",  cnd.nonDriveEndCondition],
          ["Shaft - Drive End",   cnd.shaftDriveEnd],
          ["Shaft - Non-Drive",   cnd.shaftNonDriveEnd],
          ["Growler - Rotor",     cnd.rotor],
          ["Growler - Stator",    cnd.statorCoil],
          ["Rotor Position",      cnd.rotorPosition],
          ["Air Gap",             cnd.airGap],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[100px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100 leading-tight">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 5: PAPER DETAILS ── */}
      <SecTitle icon={ClipboardList} label="Section 5 — Paper Details" color="slate" />
      <div className="grid grid-cols-2 md:grid-cols-5 border-b border-slate-200">
        {[
          ["Slot L",   pd.slotL],
          ["Slot B",   pd.slotB],
          ["Centre",   pd.centre],
          ["Top",      pd.top],
          ["Separate", pd.separate],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[56px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 6: WINDING DETAILS ── */}
      <SecTitle icon={Wrench} label="Section 6 — Winding Details" color="blue" />
      <div className="grid grid-cols-1 border-b border-slate-200">
        {[
          ["SWG",           `Existing: ${fv(wd.swg?.existing)}  |  Alteration: ${fv(wd.swg?.alteration)}`],
          ["Slot",          `Existing: ${fv(wd.slot?.existing)}  |  Alteration: ${fv(wd.slot?.alteration)}`],
          ["Winding",       `Existing: ${fv(wd.winding?.existing)}  |  Alteration: ${fv(wd.winding?.alteration)}`],
          ["Pitch",         `Existing: ${fv(wd.pitch?.existing)}  |  Alteration: ${fv(wd.pitch?.alteration)}`],
          ["Turns/Slot",    `Existing: ${fv(wd.turns?.existing)}  |  Alteration: ${fv(wd.turns?.alteration)}`],
          ["Total Coils",   `Existing: ${fv(wd.totalCoils?.existing)}  |  Alteration: ${fv(wd.totalCoils?.alteration)}`],
          ["Total Meter",   `Existing: ${fv(wd.totalMeter?.existing)}  |  Alteration: ${fv(wd.totalMeter?.alteration)}`],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[72px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100 leading-tight">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>
      {wd.materialEstimate && (
        <div className="flex border-b border-slate-200">
          <span className="text-[9px] font-bold text-slate-500 uppercase w-[110px] shrink-0 px-2 py-1.5 bg-slate-50 border-r border-slate-200">Material Est.</span>
          <span className="text-[11px] text-slate-800 font-semibold px-2 py-1.5 flex-1 whitespace-pre-wrap">{wd.materialEstimate}</span>
        </div>
      )}

      {/* ── SECTION 7 & 8: WORK + FAILURE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
        <div className="border-b md:border-b-0 md:border-r border-slate-200">
          <SecTitle icon={Wrench} label="Section 7 — Mechanical Work Done" color="slate" />
          <div className="px-3 py-2 text-xs text-slate-800 min-h-[40px] whitespace-pre-wrap">{fv(rec.mechanicalWorkDone)}</div>
        </div>
        <div>
          <SecTitle icon={AlertTriangle} label="Section 8 — Cause of Failure" color="red" />
          <div className="px-3 py-2 text-xs text-slate-800 min-h-[40px] whitespace-pre-wrap">{fv(rec.causeOfFailure)}</div>
        </div>
      </div>

      {/* ── SECTION 9: PROCESS DETAILS ── */}
      <SecTitle icon={CheckSquare} label="Section 9 — Process Details" color="green" />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 border-b border-slate-200">
        {[
          ["Dismantled",   prd.dismantled],
          ["Wire Removed", prd.wireRemoved],
          ["Rewound",      prd.rewound],
          ["Assembled",    prd.assembled],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-r border-slate-100 min-h-[28px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[80px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 10: ASSEMBLING & TESTING ── */}
      <SecTitle icon={Zap} label="Section 10 — Assembling & Testing" color="blue" />
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200">
        {[
          ["HV Test",      at.hvTest],
          ["Running Time", at.runningTime],
          ["Temperature",  at.temperature],
          ["Drum Size",    at.drumSize],
          ["RPM",          at.rpm],
          ["NL Volt L1",   at.noLoadVoltageL1],
          ["NL Volt L2",   at.noLoadVoltageL2],
          ["NL Volt L3",   at.noLoadVoltageL3],
          ["NL Amps L1",   at.noLoadAmpsL1],
          ["NL Amps L2",   at.noLoadAmpsL2],
          ["NL Amps L3",   at.noLoadAmpsL3],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-b border-r border-slate-100 min-h-[24px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[72px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100 leading-tight">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 11: LOAD TESTING TABLE ── */}
      <SecTitle icon={BarChart2} label="Section 11 — Load Testing Table" color="slate" />
      <div className="border-b border-slate-200 overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-slate-200 px-3 py-1.5 text-center font-black text-blue-700 text-[10px] w-8">#</th>
              {["WT", "AMPS", "RPM", "KW"].map(h => (
                <th key={h} className="border border-slate-200 px-4 py-1.5 text-center font-black text-blue-700 text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(lt.length > 0 ? lt : Array(5).fill({})).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                <td className="border border-slate-100 text-center text-slate-400 font-bold py-1">{i + 1}</td>
                {["wt", "amps", "rpm", "kw"].map(col => (
                  <td key={col} className="border border-slate-100 text-center py-1 px-2 font-semibold">{fv(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── SECTION 12: EFFICIENCY ── */}
      <SecTitle icon={Zap} label="Section 12 — Efficiency Details" color="purple" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border-b border-slate-200">
        {[
          ["KWH",          ef.kwh],
          ["PF",           ef.pf],
          ["Hz",           ef.hz],
          ["Efficiency",   ef.efficiency],
          ["% Efficiency", ef.percentageEfficiency],
          ["Load %",       ef.loadPercentage],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center border-r border-slate-100 min-h-[28px]">
            <span className="text-[9px] font-bold text-slate-500 uppercase w-[68px] shrink-0 px-1.5 py-1 bg-slate-50 border-r border-slate-100 leading-tight">{label}</span>
            <span className="text-[11px] text-slate-800 font-semibold px-2 py-1">{fv(val)}</span>
          </div>
        ))}
      </div>

      {/* ── SECTION 13: CONNECTION DETAILS ── */}
      <SecTitle icon={Settings2} label="Section 13 — Connection Details" color="slate" />
      <div className="border-b border-slate-200 px-3 py-2 text-xs text-slate-800 min-h-[32px] whitespace-pre-wrap">
        {fv(rec.connectionDetails)}
      </div>

      {/* ── SECTION 14: IMAGE PROOF ── */}
      {rec.assembledProof?.imageUrl && (
        <>
          <SecTitle icon={ImageIcon} label="Section 14 — Assembled Proof" color="green" />
          <div className="p-3 sm:p-4 border-b border-slate-200 flex justify-center">
            <img
              src={rec.assembledProof.imageUrl}
              alt="Assembled Proof"
              className="max-h-40 md:max-h-48 w-full max-w-sm border-2 border-blue-300 object-contain"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        </>
      )}

      {/* ── SIGNATURE ── */}
      <div className="grid grid-cols-2 border-t border-slate-200">
        <div className="px-3 sm:px-4 py-3 border-r border-slate-200">
          <p className="text-[9px] font-black text-slate-400 uppercase">Technician Signature</p>
          <div className="mt-4 border-t border-slate-400 w-24 sm:w-32"></div>
        </div>
        <div className="px-3 sm:px-4 py-3">
          <p className="text-[9px] font-black text-slate-400 uppercase">Authorized Signature</p>
          <p className="text-xs font-bold text-slate-700 mt-1">{fv(rec.authorizedSignature)}</p>
          <div className="mt-2 border-t border-slate-400 w-24 sm:w-32"></div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   PDF GENERATOR
══════════════════════════════════════════════ */
const buildPDFPage = (doc, record) => {
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
  if (record.technician) {
    doc.text(`Tech: ${record.technician}`, 110, y + 18);
  }
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
    head: [["Details", "Existing", "Alteration"]],
    body: [
      ["SWG", wd.swg?.existing||"", wd.swg?.alteration||""],
      ["Slot", wd.slot?.existing||"", wd.slot?.alteration||""],
      ["Winding", wd.winding?.existing||"", wd.winding?.alteration||""],
      ["Pitch", wd.pitch?.existing||"", wd.pitch?.alteration||""],
      ["Turns", wd.turns?.existing||"", wd.turns?.alteration||""],
      ["Total Coils", wd.totalCoils?.existing||"", wd.totalCoils?.alteration||""],
      ["Total Meter", wd.totalMeter?.existing||"", wd.totalMeter?.alteration||""],
    ],
    margin: { left: 10, right: 10 },
  });
  y = doc.lastAutoTable.finalY + 4;
  doc.setFont("helvetica", "bold");
  doc.text("MATERIALS ESTIMATE", 12, y); y += 3;
  doc.rect(10, y, 190, 16); doc.setFont("helvetica","normal");
  doc.text(wd.materialEstimate || "", 12, y + 6, { maxWidth: 186 });
  y += 20;

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

  /* Signature */
  y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Technician Signature: _________________________", 10, y + 5);
  doc.text("Authorized Signature: _________________________", pw - 10 - 75, y + 5);
  if (record.authorizedSignature) {
    doc.setFont("helvetica", "bold");
    doc.text(record.authorizedSignature, pw - 10 - 75, y + 11);
  }
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function QualityRecordView() {
  const navigate = useNavigate();
  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [searchCoreDia, setSearchCoreDia]       = useState("");
  const [searchCoreLength, setSearchCoreLength] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [expandedId, setExpandedId]     = useState(null);

  /* ══════════════════════════════════════════════
     PASSWORD LOCK
  ══════════════════════════════════════════════ */
  const ADMIN_PASSWORD = "admin123";
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pwInput, setPwInput]         = useState("");
  const [pwError, setPwError]         = useState("");

  const handleUnlock = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setPwError("");
    try { localStorage.setItem("qc_unlock", "true"); } catch {}
    } else {
      setPwError("Incorrect password. Please try again.");
      setPwInput("");
    }
  };

  /* ── fetch ── */
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/quality-record");
      setRecords(data || []);
    } catch {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── delete ── */
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/quality-record/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
      if (expandedId === id) setExpandedId(null);
      toast.success("Record deleted");
    } catch {
      toast.error("Delete failed");
    }
  }, [expandedId]);

  /* ── year options ── */
  const years = useMemo(() => {
    const ys = [...new Set(records.map(r => {
      const d = new Date(r.date || r.createdAt);
      return isNaN(d) ? null : d.getFullYear();
    }).filter(Boolean))].sort((a, b) => b - a);
    return ["All", ...ys];
  }, [records]);

  /* ── universal search + year filter ── */
  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    const tCD = searchCoreDia.trim().toLowerCase();
    const tCL = searchCoreLength.trim().toLowerCase();
    const safe = (v) => (v ? String(v).toLowerCase() : "");
    return records.filter(r => {
      /* year filter */
      if (selectedYear !== "All") {
        const d = new Date(r.date || r.createdAt);
        if (isNaN(d) || d.getFullYear().toString() !== selectedYear.toString()) return false;
      }
      
      const it  = r.inspectionTesting  || {};
      const wd  = r.windingDetails     || {};
      const at  = r.assemblingTesting  || {};
      const ef  = r.efficiencyDetails  || {};
      const cd  = r.coreDetails        || {};
      const cnd = r.conditionDetails   || {};
      const prd = r.processDetails     || {};

      if (tCD && !safe(cd.coreDia).includes(tCD)) return false;
      if (tCL && !safe(cd.coreLength).includes(tCL)) return false;

      if (!t) return true;

      return (
        safe(r.companyName).includes(t)       ||
        safe(r.srfNumber).includes(t)         ||
        safe(r.address).includes(t)           ||
        safe(r.partyGPNumber).includes(t)     ||
        safe(r.dNoteNumber).includes(t)       ||
        safe(r.billNo).includes(t)            ||
        safe(r.serialNumber).includes(t)      ||
        safe(r.mechanicalWorkDone).includes(t)||
        safe(r.causeOfFailure).includes(t)    ||
        safe(r.connectionDetails).includes(t) ||
        safe(r.authorizedSignature).includes(t)||
        safe(it.make).includes(t)             ||
        safe(it.type).includes(t)             ||
        safe(it.slNo).includes(t)             ||
        safe(wd.swg).includes(t)              ||
        safe(wd.windingType).includes(t)      ||
        safe(wd.materialEstimate).includes(t) ||
        safe(at.hvTest).includes(t)           ||
        safe(ef.efficiency).includes(t)       ||
        safe(cnd.bearingNo).includes(t)       ||
        safe(prd.dismantled).includes(t)
      );
    });
  }, [records, searchTerm, searchCoreDia, searchCoreLength, selectedYear]);

  /* ── PDF: single ── */
  const generateSinglePDF = useCallback((rec) => {
    const doc = new jsPDF("p", "mm", "a4");
    buildPDFPage(doc, rec);
    doc.save(`QC_Report_${rec.srfNumber || rec._id}.pdf`);
    toast.success("PDF downloaded");
  }, []);

  /* ── PDF: year-wise bulk ── */
  const generateBulkPDF = useCallback(() => {
    if (filtered.length === 0) return toast.info("No records to export");
    if (filtered.length > 50) {
      toast.warn(`⚠️ ${filtered.length} records selected. This may take a moment — please wait.`);
    }
    const doc = new jsPDF("p", "mm", "a4");
    filtered.forEach((rec, i) => {
      if (i > 0) doc.addPage();
      buildPDFPage(doc, rec);
    });
    doc.save(`QC_Bulk_${selectedYear}_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.pdf`);
    toast.success(`${filtered.length} records exported`);
  }, [filtered, selectedYear]);

  /* ── Print ── */
  const handlePrint = useCallback((rec = null) => {
    const toPrint = rec ? [rec] : filtered;
    if (toPrint.length === 0) return toast.info("No records to print");

    const rows = (lt) =>
      (lt?.length ? lt : Array(5).fill({}))
        .map((r, i) => `<tr><td>${i+1}</td><td>${fv(r.wt)}</td><td>${fv(r.amps)}</td><td>${fv(r.rpm)}</td><td>${fv(r.kw)}</td></tr>`)
        .join("");

    const pageHTML = (r) => {
      const it  = r.inspectionTesting  || {};
      const cd  = r.coreDetails        || {};
      const cnd = r.conditionDetails   || {};
      const pd  = r.paperDetails       || {};
      const wd  = r.windingDetails     || {};
      const prd = r.processDetails     || {};
      const at  = r.assemblingTesting  || {};
      const ef  = r.efficiencyDetails  || {};
      return `
      <div class="page">
        <div class="hd"><h1>SENTHIL REWINDING WORKSHOP</h1><p>QUALITY INSPECTION REPORT</p></div>
        <div class="st slate">SECTION 1 — HEADER INFORMATION</div>
        <table class="d"><tr><th>Company</th><td>${fv(r.companyName)}</td><th>SRF No.</th><td>${fv(r.srfNumber)}</td></tr>
        <tr><th>Date</th><td>${fd(r.date)}</td><th>Technician</th><td>${fv(r.technician)}</td></tr>
        <tr><th>Party GP No.</th><td>${fv(r.partyGPNumber)}</td><th>Party GP Date</th><td>${fd(r.partyGPDate)}</td></tr>
        <tr><th>D-Note No.</th><td>${fv(r.dNoteNumber)}</td><th>D-Note Date</th><td>${fd(r.dNoteDate)}</td></tr>
        <tr><th>Bill No.</th><td>${fv(r.billNo)}</td><th>Bill Date</th><td>${fd(r.billDate)}</td></tr>
        <tr><th>Address</th><td colspan="3">${fv(r.address)}</td></tr></table>

        <div class="st blue">SECTION 2 — INSPECTION & TESTING</div>
        <table class="d"><tr><th>Make</th><td>${fv(it.make)}</td><th>HP</th><td>${fv(it.hp)}</td></tr>
        <tr><th>KW</th><td>${fv(it.kw)}</td><th>Amps</th><td>${fv(it.amps)}</td></tr>
        <tr><th>Volts</th><td>${fv(it.volts)}</td><th>Phase</th><td>${fv(it.phase)}</td></tr>
        <tr><th>RPM</th><td>${fv(it.rpm)}</td><th>Insulation</th><td>${fv(it.insulation)}</td></tr>
        <tr><th>Connection</th><td>${fv(it.connection)}</td><th>Frame</th><td>${fv(it.frame)}</td></tr>
        <tr><th>Type</th><td>${fv(it.type)}</td><th>Sl. No.</th><td>${fv(it.slNo)}</td></tr>
        <tr><th>Ex. Volts</th><td>${fv(it.exV)}</td><th>Ex. Amps</th><td>${fv(it.exA)}</td></tr></table>

        <div class="st slate">SECTION 3 & 5 — CORE / PAPER DETAILS</div>
        <table class="d"><tr><th>Core Length</th><td>${fv(cd.coreLength)}</td><th>Core Dia</th><td>${fv(cd.coreDia)}</td></tr>
        <tr><th>Rotor Length</th><td>${fv(cd.rotorLength)}</td><th>Rotor Perim.</th><td>${fv(cd.rotorPerimeter)}</td></tr>
        <tr><th>Slot L</th><td>${fv(pd.slotL)}</td><th>Slot B</th><td>${fv(pd.slotB)}</td></tr>
        <tr><th>Centre</th><td>${fv(pd.centre)}</td><th>Top / Sep.</th><td>${fv(pd.top)} / ${fv(pd.separate)}</td></tr></table>

        <div class="st amber">SECTION 4 — CONDITION DETAILS</div>
        <table class="d">
        <tr><th>Brg - Drive End</th><td>${fv(cnd.driveEndBearing)}</td><th>Brg - Non-Drive</th><td>${fv(cnd.nonDriveEndBearing)}</td></tr>
        <tr><th>Shield - Drive End</th><td>${fv(cnd.driveEndCondition)}</td><th>Shield - Non-Drive</th><td>${fv(cnd.nonDriveEndCondition)}</td></tr>
        <tr><th>Shaft - Drive End</th><td>${fv(cnd.shaftDriveEnd)}</td><th>Shaft - Non-Drive</th><td>${fv(cnd.shaftNonDriveEnd)}</td></tr>
        <tr><th>Growler - Rotor</th><td>${fv(cnd.rotor)}</td><th>Growler - Stator</th><td>${fv(cnd.statorCoil)}</td></tr>
        <tr><th>Rotor Position</th><td>${fv(cnd.rotorPosition)}</td><th>Air Gap</th><td>${fv(cnd.airGap)}</td></tr></table>

        <div class="st blue">SECTION 6 — WINDING DETAILS</div>
        <table class="d"><tr><th>Details</th><th>Existing</th><th>Alteration</th></tr>
        <tr><td>SWG</td><td>${fv(wd.swg?.existing)}</td><td>${fv(wd.swg?.alteration)}</td></tr>
        <tr><td>Slot</td><td>${fv(wd.slot?.existing)}</td><td>${fv(wd.slot?.alteration)}</td></tr>
        <tr><td>Winding</td><td>${fv(wd.winding?.existing)}</td><td>${fv(wd.winding?.alteration)}</td></tr>
        <tr><td>Pitch</td><td>${fv(wd.pitch?.existing)}</td><td>${fv(wd.pitch?.alteration)}</td></tr>
        <tr><td>Turns</td><td>${fv(wd.turns?.existing)}</td><td>${fv(wd.turns?.alteration)}</td></tr>
        <tr><td>Total Coils</td><td>${fv(wd.totalCoils?.existing)}</td><td>${fv(wd.totalCoils?.alteration)}</td></tr>
        <tr><td>Total Meter</td><td>${fv(wd.totalMeter?.existing)}</td><td>${fv(wd.totalMeter?.alteration)}</td></tr>
        <tr><td>Material Est.</td><td colspan="2">${fv(wd.materialEstimate)}</td></tr></table>

        <div class="st slate">SECTION 7 & 8 — WORK DONE / CAUSE</div>
        <table class="d"><tr><th>Mechanical Work</th><td colspan="3">${fv(r.mechanicalWorkDone)}</td></tr>
        <tr><th>Cause of Failure</th><td colspan="3">${fv(r.causeOfFailure)}</td></tr></table>

        <div class="st green">SECTION 9 — PROCESS DETAILS</div>
        <table class="d"><tr><th>Dismantled</th><td>${fv(prd.dismantled)}</td><th>Wire Removed</th><td>${fv(prd.wireRemoved)}</td></tr>
        <tr><th>Rewound</th><td>${fv(prd.rewound)}</td><th>Assembled</th><td>${fv(prd.assembled)}</td></tr></table>

        <div class="st blue">SECTION 10 — ASSEMBLING & TESTING</div>
        <table class="d"><tr><th>HV Test</th><td>${fv(at.hvTest)}</td><th>Running Time</th><td>${fv(at.runningTime)}</td></tr>
        <tr><th>Temperature</th><td>${fv(at.temperature)}</td><th>Drum Size</th><td>${fv(at.drumSize)}</td></tr>
        <tr><th>RPM</th><td>${fv(at.rpm)}</td><th></th><td></td></tr>
        <tr><th>NL Volt L1/L2/L3</th><td colspan="3">${fv(at.noLoadVoltageL1)} / ${fv(at.noLoadVoltageL2)} / ${fv(at.noLoadVoltageL3)}</td></tr>
        <tr><th>NL Amps L1/L2/L3</th><td colspan="3">${fv(at.noLoadAmpsL1)} / ${fv(at.noLoadAmpsL2)} / ${fv(at.noLoadAmpsL3)}</td></tr></table>

        <div class="st slate">SECTION 11 — LOAD TESTING</div>
        <table class="d center"><tr><th>#</th><th>WT</th><th>AMPS</th><th>RPM</th><th>KW</th></tr>${rows(r.loadTesting)}</table>

        <div class="st purple">SECTION 12 — EFFICIENCY</div>
        <table class="d"><tr><th>KWH</th><td>${fv(ef.kwh)}</td><th>PF</th><td>${fv(ef.pf)}</td></tr>
        <tr><th>Hz</th><td>${fv(ef.hz)}</td><th>Efficiency</th><td>${fv(ef.efficiency)}</td></tr>
        <tr><th>% Efficiency</th><td>${fv(ef.percentageEfficiency)}</td><th>Load %</th><td>${fv(ef.loadPercentage)}</td></tr></table>

        <div class="st slate">SECTION 13 — CONNECTION DETAILS</div>
        <table class="d"><tr><td colspan="4">${fv(r.connectionDetails)}</td></tr></table>

        ${r?.assembledProof?.imageUrl ? `
        <div class="st green">SECTION 14 — ASSEMBLED PROOF</div>
        <div style="text-align:center;padding:6px 0;">
          <img src="${r.assembledProof.imageUrl}" class="proof-img" alt="Assembled Proof" onerror="this.style.display='none'" />
        </div>` : ""}

        <div class="sigs">
          <div class="sig">Technician Signature</div>
          <div class="sig">Authorized: ${fv(r.authorizedSignature)}</div>
        </div>
        <div class="footer">Senthil Rewinding Workshop &nbsp;|&nbsp; Generated: ${new Date().toLocaleString("en-IN")}</div>
      </div>`;
    };

    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>QC Print</title><style>
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #000; margin: 0; }
      @media print {
        body { font-size: 11px; }
        table { font-size: 10px; }
        .st { font-size: 11px; font-weight: 900; }
        .page { page-break-after: always; }
      }
      .page { padding: 3mm; margin-bottom: 5mm; }
      .hd { text-align: center; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 8px; }
      .hd h1 { margin: 0; font-size: 15px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; }
      .hd p  { margin: 3px 0 0; font-weight: bold; font-size: 11px; color: #444; }
      .st { padding: 4px 8px; font-weight: 900; font-size: 11px; text-transform: uppercase;
            margin: 7px 0 3px; letter-spacing: 0.04em; }
      .blue   { background: #1e3a8a; color: #fff; }
      .slate  { background: #475569; color: #fff; }
      .amber  { background: #92400e; color: #fff; }
      .green  { background: #064e3b; color: #fff; }
      .purple { background: #581c87; color: #fff; }
      table.d { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
      table.d th,
      table.d td { border: 1px solid #94a3b8; padding: 4px 6px; font-size: 10px; line-height: 1.4; }
      table.d th { background: #f1f5f9; font-weight: 700; width: 16%; text-align: left; color: #334155; }
      table.d.center th,
      table.d.center td { text-align: center; }
      .proof-img { display: block; max-width: 200px; max-height: 140px; margin: 6px auto; border: 2px solid #93c5fd; }
      .sigs { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 4px; }
      .sig { border-top: 1.5px solid #000; width: 200px; text-align: center;
             padding-top: 5px; font-weight: bold; font-size: 10px; color: #1e3a8a; }
      .footer { text-align: center; font-size: 8px; color: #94a3b8; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
    </style></head><body>${toPrint.map(pageHTML).join("")}
    <script>window.onload=()=>{window.print();window.close()}<\/script>
    </body></html>`);
    w.document.close();
  }, [filtered]);

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
   <div className="relative min-h-[calc(90vh-64px)] bg-slate-100 pb-10 font-sans flex flex-col">

      {/* ══════════════════════════════════════════════
          PASSWORD LOCK OVERLAY
          — covers ONLY this content area, not sidebar
      ══════════════════════════════════════════════ */}
      {!isUnlocked && (
        <div className="absolute pt-5 inset-0 z-50 bg-slate-100/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-8 flex flex-col items-center gap-6">

            {/* ICON */}
            <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-200">
              <ShieldCheck size={28} className="text-white" />
            </div>

            {/* TITLE + SUBTITLE */}
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Senthil Rewinding
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Enter password to access quality records
              </p>
            </div>

            {/* INPUT FIELD + ERROR + BUTTON */}
            <div className="w-full flex flex-col gap-3">
              <input
                type="password"
                placeholder="Enter password"
                value={pwInput}
                autoFocus
                onChange={(e) => { setPwInput(e.target.value); setPwError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all
                  ${pwError
                    ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  }`}
              />

              {/* ERROR MESSAGE */}
              {pwError && (
                <p className="text-xs text-red-500 font-semibold text-center">
                  {pwError}
                </p>
              )}

              {/* UNLOCK BUTTON */}
              <button
                onClick={handleUnlock}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md shadow-blue-100 text-sm"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 px-3 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700 rounded-lg shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-widest">Quality Record View</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                {filtered.length} of {records.length} records
                {selectedYear !== "All" && ` · ${selectedYear}`}
              </p>
            </div>
          </div>

          {/* Fix 3 — Controls: flex-wrap, full-width on mobile */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Universal Search */}
            <div className="relative flex-1 min-w-[140px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Core Dia Search */}
            <div className="relative shrink-0 w-24 sm:w-28">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Core Dia"
                value={searchCoreDia}
                onChange={e => setSearchCoreDia(e.target.value)}
                className="pl-8 pr-6 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs w-full outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all font-semibold text-amber-900 placeholder:text-amber-700/50"
              />
              {searchCoreDia && (
                <button onClick={() => setSearchCoreDia("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Core Length Search */}
            <div className="relative shrink-0 w-24 sm:w-28">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Core Len"
                value={searchCoreLength}
                onChange={e => setSearchCoreLength(e.target.value)}
                className="pl-8 pr-6 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs w-full outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all font-semibold text-amber-900 placeholder:text-amber-700/50"
              />
              {searchCoreLength && (
                <button onClick={() => setSearchCoreLength("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-700">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Year Filter */}
            <div className="relative shrink-0">
              <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Fix 8 — Bigger tap targets */}
            {/* Bulk PDF */}
            <button
              onClick={generateBulkPDF}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-sm flex-1 sm:flex-none min-w-[90px]"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span> {selectedYear === "All" ? "All" : selectedYear}
            </button>

            {/* Bulk Print */}
            <button
              onClick={() => handlePrint()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex-1 sm:flex-none min-w-[90px]"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span> {selectedYear === "All" ? "All" : selectedYear}
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 space-y-3">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={36} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
            <FileText size={52} className="text-slate-200" />
            <p className="font-bold text-sm">No records found</p>
            {searchTerm && <p className="text-xs">Try clearing the search term</p>}
          </div>
        ) : (
          filtered.map((rec) => {
            const isOpen = expandedId === rec._id;
            return (
              <div key={rec._id} className="bg-white border border-slate-200 shadow-sm overflow-hidden transition-all">

                {/* ── CARD HEADER ── */}
                <div
                  className="flex items-start sm:items-center justify-between px-3 sm:px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none gap-2"
                  onClick={() => setExpandedId(isOpen ? null : rec._id)}
                >
                  <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    {/* SRF Badge */}
                    <div className="bg-blue-700 text-white text-[10px] font-black uppercase px-2 py-1 rounded shrink-0 mt-0.5 sm:mt-0">
                      #{rec.srfNumber || "N/A"}
                    </div>
                    {/* Company */}
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 text-xs sm:text-sm uppercase truncate">{rec.companyName || "—"}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 leading-snug">
                        <span className="inline-block">Date: {fd(rec?.date)}</span>
                        <span className="hidden sm:inline"> &nbsp;|&nbsp; GP: {fv(rec?.partyGPNumber)} &nbsp;|&nbsp; Make: {fv(rec?.inspectionTesting?.make)} &nbsp;|&nbsp; HP: {fv(rec?.inspectionTesting?.hp)}</span>
                      </p>
                      {/* Mobile-only second line */}
                      <p className="text-[10px] text-slate-400 font-semibold sm:hidden mt-0.5">
                        Make: {fv(rec?.inspectionTesting?.make)} | HP: {fv(rec?.inspectionTesting?.hp)}
                      </p>
                    </div>
                  </div>

                  {/* Fix 8 — Larger tap targets for action buttons */}
                  <div className="flex items-center gap-0.5 sm:gap-1 ml-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => generateSinglePDF(rec)}
                      title="Download PDF"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                    >
                      <FileDown size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(rec)}
                      title="Print Record"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => navigate("/admin/quality-records", { state: { editData: rec } })}
                      title="Edit Record"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all hidden sm:block"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(rec._id)}
                      title="Delete Record"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="ml-1 text-slate-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* ── EXPANDED FULL REPORT ── */}
                {isOpen && (
                  <div className="border-t border-slate-200">
                    {/* Expand action bar */}
                    <div className="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Inspection Report</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => generateSinglePDF(rec)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-all"
                        >
                          <FileDown size={13} /> <span className="hidden sm:inline">Download</span> PDF
                        </button>
                        <button
                          onClick={() => handlePrint(rec)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 transition-all"
                        >
                          <Printer size={13} /> Print
                        </button>
                        <button
                          onClick={() => navigate("/admin/quality-records", { state: { editData: rec } })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-all sm:hidden"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </div>
                    </div>
                    {/* Fix 6 — overflow-x-auto on full report */}
                    <div className="overflow-x-auto">
                      <FullReport rec={rec} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}