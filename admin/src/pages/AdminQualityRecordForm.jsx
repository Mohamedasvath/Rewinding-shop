import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { 
  Save, Upload, Loader2, Edit3, Trash2, FileText, 
  Download, XCircle, Plus, X, LayoutGrid, FilePlus2 
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminQualityRecordForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialState = {
    companyName: "",
    srfNumber: "",
    date: "",
    partyGPNumber: "",
    serialNumber: "",
    motorDetails: { make: "", hp: "", kw: "", volts: "", phase: "", rpm: "", serialNumber: "" },
    windingDetails: { swg: "", slot: "", winding: "", pitch: "", turns: "", totalCoils: "", totalMeter: "" },
    mechanicalWorkDone: "",
    causeOfFailure: "",
    assemblingTesting: { hvTest: "", runningTime: "", temperature: "" },
    loadTesting: Array.from({ length: 5 }, () => ({ wt: "", amps: "", rpm: "", kw: "" })),
    windingDetailsMaterialEstimate: "",
    assembledProof: { imageUrl: "", driveLink: "" }
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // ✅ Admin friendly toggle state

  const fetchRecords = async () => {
    try {
      const { data } = await api.get("/quality-record");
      setRecords(data);
    } catch (err) {
      toast.error("Failed to fetch records");
    }
  };

  useEffect(() => {
    fetchRecords();
    if (location.state?.editData) {
      handleEdit(location.state.editData);
      setIsFormOpen(true); // Open form automatically when editing from view page
    }
  }, [location.state]);

  const handleTopLevelChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleLoadChange = (index, field, value) => {
    const updatedLoad = [...formData.loadTesting];
    updatedLoad[index] = { ...updatedLoad[index], [field]: value };
    setFormData((prev) => ({ ...prev, loadTesting: updatedLoad }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "motor_upload");

    setLoading(true);
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dnwvgphk9/image/upload", {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      setFormData((prev) => ({ 
        ...prev, 
        assembledProof: { ...prev.assembledProof, imageUrl: fileData.secure_url } 
      }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/quality-record/${editingId}`, formData);
        toast.success("Record Updated Successfully");
      } else {
        await api.post("/quality-record", formData);
        toast.success("Record Saved Successfully");
      }
      setFormData(initialState);
      setEditingId(null);
      setIsFormOpen(false); // Close form after success
      fetchRecords();
      
      if (location.state?.editData) {
        navigate("/admin/quality-view");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      ...initialState,
      ...record,
      motorDetails: { ...initialState.motorDetails, ...(record.motorDetails || {}) },
      windingDetails: { ...initialState.windingDetails, ...(record.windingDetails || {}) },
      assemblingTesting: { ...initialState.assemblingTesting, ...(record.assemblingTesting || {}) },
      assembledProof: { ...initialState.assembledProof, ...(record.assembledProof || {}) },
      loadTesting: record.loadTesting?.length ? record.loadTesting : initialState.loadTesting
    });
    setEditingId(record._id);
    setIsFormOpen(true); // Open form when edit clicked
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/quality-record/${id}`);
      toast.success("Record Deleted");
      fetchRecords();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ✅ Keep your exact same PDF logic
  const generatePDF = (record) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("QUALITY INSPECTION RECORD", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.rect(10, y, 190, 25);
    doc.text(`Company: ${record.companyName || ""}`, 12, y + 6);
    doc.text(`SRF No: ${record.srfNumber || ""}`, 110, y + 6);
    doc.text(`Party GP No: ${record.partyGPNumber || ""}`, 12, y + 14);
    doc.text(`Date: ${record.date ? new Date(record.date).toLocaleDateString() : ""}`, 110, y + 14);
    y += 30;
    doc.setFont("helvetica", "bold");
    doc.text("MOTOR DETAILS", 12, y);
    y += 2;
    doc.rect(10, y, 190, 35);
    doc.setFont("helvetica", "normal");
    let motorY = y + 6;
    Object.entries(record.motorDetails || {}).forEach(([key, value], i) => {
      const xPos = i % 2 === 0 ? 12 : 110;
      doc.text(`${key.toUpperCase()}: ${value || ""}`, xPos, motorY);
      if (i % 2 !== 0) motorY += 8;
    });
    y += 40;
    doc.setFont("helvetica", "bold");
    doc.text("WINDING DETAILS", 12, y);
    y += 2;
    doc.rect(10, y, 190, 35);
    doc.setFont("helvetica", "normal");
    let windingY = y + 6;
    Object.entries(record.windingDetails || {}).forEach(([key, value], i) => {
      const xPos = i % 2 === 0 ? 12 : 110;
      doc.text(`${key.toUpperCase()}: ${value || ""}`, xPos, windingY);
      if (i % 2 !== 0) windingY += 8;
    });
    y += 40;
    doc.setFont("helvetica", "bold");
    doc.text("LOAD TESTING DATA", 12, y);
    y += 4;
    const startX = 10;
    const colWidth = 47;
    const rowHeight = 8;
    ["WT", "AMPS", "RPM", "KW"].forEach((head, i) => {
      doc.rect(startX + i * colWidth, y, colWidth, rowHeight);
      doc.text(head, startX + i * colWidth + 15, y + 5);
    });
    y += rowHeight;
    (record.loadTesting || []).forEach((row) => {
      ["wt", "amps", "rpm", "kw"].forEach((col, i) => {
        doc.rect(startX + i * colWidth, y, colWidth, rowHeight);
        doc.text(row[col] || "", startX + i * colWidth + 15, y + 5);
      });
      y += rowHeight;
    });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("MECHANICAL WORK DONE", 12, y);
    y += 2;
    doc.rect(10, y, 190, 20);
    doc.setFont("helvetica", "normal");
    doc.text(record.mechanicalWorkDone || "", 12, y + 6, { maxWidth: 180 });
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.text("CAUSE OF FAILURE", 12, y);
    y += 2;
    doc.rect(10, y, 190, 20);
    doc.setFont("helvetica", "normal");
    doc.text(record.causeOfFailure || "", 12, y + 6, { maxWidth: 180 });
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.text("ASSEMBLING & TESTING", 12, y);
    y += 2;
    doc.rect(10, y, 190, 25);
    doc.setFont("helvetica", "normal");
    doc.text(`HV Test: ${record.assemblingTesting?.hvTest || ""}`, 12, y + 6);
    doc.text(`Running Time: ${record.assemblingTesting?.runningTime || ""}`, 12, y + 14);
    doc.text(`Temperature: ${record.assemblingTesting?.temperature || ""}`, 110, y + 6);
    y += 35;
    if (record.assembledProof?.imageUrl) {
      doc.setFont("helvetica", "bold");
      doc.text("ASSEMBLED PROOF", 12, y);
      y += 4;
      doc.addImage(record.assembledProof.imageUrl, "JPEG", 12, y, 60, 40);
    }
    doc.save(`Quality_Record_${record.srfNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* --- ADMIN DASHBOARD HEADER --- */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm sticky top-0 z-50">
        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <LayoutGrid className="text-blue-600" /> QUALITY MANAGEMENT
        </h1>
        <button 
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if(isFormOpen) { setEditingId(null); setFormData(initialState); }
          }}
          className={`${isFormOpen ? 'bg-red-500' : 'bg-blue-600'} text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md`}
        >
          {isFormOpen ? <X size={20} /> : <FilePlus2 size={20} />}
          {isFormOpen ? "CLOSE FORM" : "ADD NEW RECORD"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* --- DYNAMIC FORM SECTION --- */}
        {isFormOpen && (
          <div className="bg-white border-2 border-blue-600 shadow-xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold uppercase tracking-wider">
                {editingId ? `Editing Record: #${formData.srfNumber}` : "New Inspection Entry"}
              </h2>
              <button onClick={handleSubmit} disabled={loading} className="bg-white text-blue-600 px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-blue-50">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                {editingId ? "UPDATE" : "SAVE"}
              </button>
            </div>

            <form className="text-[12px] p-4" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-blue-50/30 p-4 border border-blue-100">
                  <div>
                    <label className="font-bold text-blue-800 uppercase">Company Name</label>
                    <input value={formData.companyName || ""} onChange={(e) => handleTopLevelChange('companyName', e.target.value)} className="w-full border p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-blue-800 uppercase">SRF Number</label>
                    <input value={formData.srfNumber || ""} onChange={(e) => handleTopLevelChange('srfNumber', e.target.value)} className="w-full border p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-blue-800 uppercase">Party GP Number</label>
                    <input value={formData.partyGPNumber || ""} onChange={(e) => handleTopLevelChange('partyGPNumber', e.target.value)} className="w-full border p-2" />
                  </div>
                  <div>
                    <label className="font-bold text-blue-800 uppercase">Date</label>
                    <input type="date" value={formData.date ? formData.date.split('T')[0] : ""} onChange={(e) => handleTopLevelChange('date', e.target.value)} className="w-full border p-2" />
                  </div>
              </div>

              {/* Your Technical Grid remains exactly the same */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-black text-blue-600 border-b-2 border-blue-600 uppercase">Motor Details</h3>
                  {['make', 'hp', 'kw', 'volts', 'phase', 'rpm', 'serialNumber'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="w-20 font-bold uppercase">{f}:</span>
                      <input value={formData.motorDetails[f] || ""} onChange={(e) => handleNestedChange('motorDetails', f, e.target.value)} className="flex-1 border-b p-1 outline-none focus:border-blue-600" />
                    </div>
                  ))}
                  <textarea placeholder="CAUSE OF FAILURE" value={formData.causeOfFailure || ""} onChange={(e) => handleTopLevelChange('causeOfFailure', e.target.value)} className="w-full border p-2 h-20 mt-4" />
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-blue-600 border-b-2 border-blue-600 uppercase">Winding Details</h3>
                  {['swg', 'slot', 'winding', 'pitch', 'turns', 'totalCoils', 'totalMeter'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="w-24 font-bold uppercase">{f}:</span>
                      <input value={formData.windingDetails[f] || ""} onChange={(e) => handleNestedChange('windingDetails', f, e.target.value)} className="flex-1 border-b p-1 outline-none focus:border-blue-600" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="font-black text-blue-600 border-b-2 border-blue-600 uppercase">Material Estimate</h3>
                  <textarea 
                    value={formData.windingDetails.materialEstimate || ""} 
                    onChange={(e) => handleNestedChange('windingDetails', 'materialEstimate', e.target.value)}
                    className="w-full h-[280px] border p-4 outline-none resize-none" 
                    placeholder="List materials..."
                  />
                </div>
              </div>

              {/* Load Testing Table remains exactly the same */}
              <div className="mt-6">
                <h3 className="font-bold text-blue-600 mb-2 uppercase">Load Testing Data</h3>
                <table className="w-full border-collapse border border-blue-600">
                  <thead>
                    <tr className="bg-blue-600 text-white font-bold">
                      <th className="border p-2">WT</th><th className="border p-2">AMPS</th><th className="border p-2">RPM</th><th className="border p-2">KW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.loadTesting.map((row, i) => (
                      <tr key={i}>
                        {['wt', 'amps', 'rpm', 'kw'].map(col => (
                          <td key={col} className="border border-blue-600 p-0">
                            <input value={row[col] || ""} onChange={(e) => handleLoadChange(i, col, e.target.value)} className="w-full text-center p-2 outline-none" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="border p-4">
                    <h3 className="font-bold text-blue-600 mb-2 uppercase">Mechanical Work Done</h3>
                    <textarea value={formData.mechanicalWorkDone || ""} onChange={(e) => handleTopLevelChange('mechanicalWorkDone', e.target.value)} className="w-full h-24 border p-2"/>
                 </div>
                 <div className="border p-4">
                    <h3 className="font-bold text-blue-600 mb-2 uppercase">Assembling & Testing</h3>
                    {['hvTest', 'runningTime', 'temperature'].map(f => (
                       <input key={f} placeholder={f.toUpperCase()} value={formData.assemblingTesting[f] || ""} onChange={(e) => handleNestedChange('assemblingTesting', f, e.target.value)} className="w-full border mb-2 p-2" />
                    ))}
                 </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4">
                 <div>
                    <h3 className="font-bold text-blue-600 uppercase">Assembled Proof Image</h3>
                    <input type="file" onChange={handleImageUpload} className="mt-2" />
                    {formData.assembledProof.imageUrl && <img src={formData.assembledProof.imageUrl} className="h-20 mt-2 border-2 border-blue-600" alt="Proof"/>}
                 </div>
                 <div>
                    <h3 className="font-bold text-blue-600 uppercase">Drive Link</h3>
                    <input value={formData.assembledProof.driveLink || ""} onChange={(e) => handleNestedChange('assembledProof', 'driveLink', e.target.value)} className="w-full border p-2 mt-2" placeholder="URL here..."/>
                 </div>
              </div>
            </form>
          </div>
        )}

        {/* --- RECENT RECORDS GRID --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Recent Inspections</h2>
            <span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">{records.length} Total</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {records.length === 0 ? (
              <div className="col-span-full py-10 text-center text-gray-400 font-bold border-2 border-dashed rounded-xl">
                No records found. Click "Add New" to begin.
              </div>
            ) : (
              records.map((rec) => (
                <div key={rec._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 group hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black italic">
                        #{rec.srfNumber}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => generatePDF(rec)} className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-green-600 transition-colors"><Download size={16}/></button>
                        <button onClick={() => handleEdit(rec)} className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(rec._id)} className="p-1.5 bg-gray-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                      </div>
                  </div>
                  <h4 className="font-black text-gray-800 text-sm uppercase truncate">{rec.companyName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                    Date: {rec.date ? new Date(rec.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}