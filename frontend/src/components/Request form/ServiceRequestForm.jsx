import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Wrench,
  Factory,
  Settings,
  Timer,
  CheckCircle2,
  Cog,
  Zap,
  Loader2,
  Send,
  Hash
} from "lucide-react";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function ServiceRequestForm() {
  const [success, setSuccess] = useState(false);

  return (
    <div className="relative bg-[#050505] text-white min-h-screen selection:bg-blue-600 overflow-hidden font-sans">
      <BackgroundGear />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10" />
      <ServiceForm setSuccess={setSuccess} />
      <SuccessPopup success={success} setSuccess={setSuccess} />
    </div>
  );
}

function ServiceForm({ setSuccess }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    make: "",
    hp: "",
    rpm: "",
    serialNumber: "",
    problem: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique SRF & Tracking
      const uniqueId = Date.now();

      const payload = {
        srfNumber: `SRF-${uniqueId}`,
        trackingCode: `JOB-${uniqueId}`,

        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        technician: "",
        stage: "Pending",

        motorDetails: {
          make: form.make,
          hp: form.hp,
          serialNumber: form.serialNumber,
          gatePassNumber: ""
        }
      };

      console.log("Submitting:", payload);

      const response = await api.post("/service", payload);

      if (response.status === 201 || response.status === 200) {
        // toast.success("Service Request Protocol Initiated");
        setSuccess(true);

        setForm({
          customerName: "",
          phone: "",
          address: "",
          make: "",
          hp: "",
          rpm: "",
          serialNumber: "",
          problem: ""
        });
      }
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "System Error: Try again"
      );
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
        <div className="text-center space-y-4">
          <p className="text-blue-500 font-mono tracking-[0.4em] uppercase text-[10px] font-black underline underline-offset-8 decoration-blue-500/30">
            // Restoration Request
          </p>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
            Book <span className="text-blue-600">Service.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Input icon={<User size={16} />} label="Customer Name" name="customerName" value={form.customerName} onChange={handleChange} required />
          <Input icon={<Phone size={16} />} label="Contact Number" name="phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-widest text-white flex items-center gap-2 px-1">
            <MapPin size={16} className="text-blue-500" /> Pick-up Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full h-24 bg-[#111111] border border-white/20 rounded-xl p-5 outline-none focus:border-blue-500 transition-all text-white resize-none"
          />
        </div>

        <div className="pt-10 border-t border-white/10 space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
            <Settings size={14} className="animate-spin-slow" /> Machine Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input icon={<Factory size={14} />} label="Make" name="make" value={form.make} onChange={handleChange} />
            <Input icon={<Zap size={14} />} label="HP" name="hp" value={form.hp} onChange={handleChange} />
            <Input icon={<Hash size={14} />} label="Serial No" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[12px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2 px-1">
            <Wrench size={16} /> Symptom Description
          </label>
          <textarea
            name="problem"
            value={form.problem}
            onChange={handleChange}
            required
            className="w-full h-24 bg-[#111111] border border-white/20 rounded-xl p-5 outline-none focus:border-orange-500 transition-all text-white resize-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          className="w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Request</>}
        </motion.button>
      </motion.form>
    </div>
  );
}

function Input({ icon, label, ...props }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
        <span className="text-blue-500">{icon}</span> {label}
      </label>
      <div className="flex items-center gap-3 border border-white/10 rounded-xl px-4 py-3 bg-[#111111] focus-within:border-blue-500 transition-all">
        <input {...props} className="w-full outline-none bg-transparent text-sm text-white" />
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

function SuccessPopup({ success, setSuccess }) {
  return (
    <AnimatePresence>
      {success && (
        <motion.div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md z-[100] px-6">
          <motion.div className="bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase italic mb-3">Done Ur Request updated</h2>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200"
            >
              Dismiss
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}