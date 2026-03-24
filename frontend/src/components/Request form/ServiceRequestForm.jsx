import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, MapPin, Wrench, Factory, Settings,
  CheckCircle2, Cog, Zap, Loader2, Send, Hash
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ── Silent 2-digit generators — never shown to user ── */
const genSRF = () => `SRF-${String(Math.floor(Math.random() * 90) + 10)}`;
const genTRK = () => `TRK-${String(Math.floor(Math.random() * 90) + 10)}`;

export default function ServiceRequestForm() {
  const [success, setSuccess]           = useState(false);
  const [customerName, setCustomerName] = useState("");

  return (
    <div className="relative bg-[#050505] text-white min-h-screen selection:bg-blue-600 overflow-hidden font-sans">
      <BackgroundGear />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10" />
      <ServiceForm setSuccess={setSuccess} setCustomerName={setCustomerName} />
      <SuccessPopup success={success} setSuccess={setSuccess} customerName={customerName} />
    </div>
  );
}

function ServiceForm({ setSuccess, setCustomerName }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    make: "",
    hp: "",
    serialNumber: "",
    problem: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName.trim()) return toast.error("Customer name is required");
    if (!form.phone.trim())        return toast.error("Phone number is required");
    if (!form.address.trim())      return toast.error("Address is required");
    if (!form.problem.trim())      return toast.error("Problem description is required");

    setLoading(true);
    try {
      const payload = {
        srfNumber:         genSRF(),               // e.g. SRF-47 — admin will update
        trackingCode:      genTRK(),               // e.g. TRK-83 — admin will update
        customerName:      form.customerName.trim(),
        phone:             form.phone.trim(),
        address:           form.address.trim(),
        technician:        "",
        stage:             "Pending",
        motorDetails: {
          make:            form.make.trim(),
          hp:              form.hp.trim(),
          serialNumber:    form.serialNumber.trim(),
          gatePassNumber:  ""
        },
        natureOfComplaint: form.problem.trim(),
      };

      const response = await axios.post(`${BACKEND}/service`, payload);

      if (response.status === 201 || response.status === 200) {
        setCustomerName(form.customerName.trim());
        setSuccess(true);
        setForm({
          customerName: "", phone: "", address: "",
          make: "", hp: "", serialNumber: "", problem: ""
        });
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-6 relative z-10">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl space-y-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <p className="text-blue-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black underline underline-offset-8 decoration-blue-500/30">
            // Restoration Request
          </p>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            Book <span className="text-blue-600">Service.</span>
          </h2>
        </div>

        {/* Customer Info */}
        <div className="grid md:grid-cols-2 gap-8">
          <Input icon={<User size={16}/>}  label="Customer Name *"  name="customerName" value={form.customerName} onChange={handleChange} />
          <Input icon={<Phone size={16}/>} label="Contact Number *" name="phone"        value={form.phone}        onChange={handleChange} type="tel" />
        </div>

        {/* Address */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 px-1">
            <MapPin size={16} className="text-blue-500" /> Pick-up Address *
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, City, State..."
            className="w-full h-24 bg-[#111111] border border-white/20 rounded-xl p-5 outline-none focus:border-blue-500 transition-all text-white resize-none placeholder-white/20"
          />
        </div>

        {/* Motor Specs */}
        <div className="pt-10 border-t border-white/10 space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
            <Settings size={14} /> Machine Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input icon={<Factory size={14}/>} label="Make"       name="make"         value={form.make}         onChange={handleChange} placeholder="e.g. Siemens" />
            <Input icon={<Zap size={14}/>}     label="HP"         name="hp"           value={form.hp}           onChange={handleChange} placeholder="e.g. 5" />
            <Input icon={<Hash size={14}/>}    label="Serial No." name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="S/N" />
          </div>
        </div>

        {/* Problem */}
        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2 px-1">
            <Wrench size={16} /> Problem Description *
          </label>
          <textarea
            name="problem"
            value={form.problem}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            className="w-full h-24 bg-[#111111] border border-white/20 rounded-xl p-5 outline-none focus:border-orange-500 transition-all text-white resize-none placeholder-white/20"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          className="w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          {loading
            ? <><Loader2 className="animate-spin" size={20} /> Submitting...</>
            : <><Send size={18} /> Submit Request</>
          }
        </motion.button>
      </motion.form>
    </div>
  );
}

function Input({ icon, label, placeholder = "", type = "text", ...props }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
        <span className="text-blue-500">{icon}</span> {label}
      </label>
      <div className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 bg-[#111111] focus-within:border-blue-500 transition-all">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-sm text-white placeholder-white/20"
          {...props}
        />
      </div>
    </div>
  );
}

function BackgroundGear() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      className="fixed opacity-[0.03] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white"
    >
      <Cog size={600} strokeWidth={1} />
    </motion.div>
  );
}

function SuccessPopup({ success, setSuccess, customerName }) {
  return (
    <AnimatePresence>
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-[100] px-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{   scale: 0.9, opacity: 0 }}
            className="bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase italic">Request Received!</h2>
              <p className="text-gray-400 text-sm font-semibold">
                {customerName}, your service request has been submitted successfully.
              </p>
              <p className="text-gray-600 text-[11px] font-bold uppercase tracking-widest pt-1">
                Our team will contact you shortly to confirm your booking.
              </p>
            </div>

            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}