import { motion } from "framer-motion";
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  Settings
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-32 bg-white border-t border-slate-100 overflow-hidden">
      
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234338ca' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND COLUMN */}
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
                <Settings size={24} className="animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                SR<span className="text-blue-600">W</span>
              </h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Leading the industry in precision motor rewinding and industrial pump services. 
              Efficiency, durability, and trust since 1995.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <Social icon={<Facebook size={18}/>}/>
              <Social icon={<Instagram size={18}/>}/>
              <Social icon={<Twitter size={18}/>}/>
            </div>
          </div>

          {/* LINKS - QUICK ACCESS */}
          <FooterColumn
            title="Sitemap"
            links={[
              "Home",
              "Request Service",
              "Track Repair",
              "Success Stories",
              "About SRW"
            ]}
          />

          {/* SERVICES - CORE WORK */}
          <FooterColumn
            title="Our Arsenal"
            links={[
              "Industrial Rewinding",
              "Dynamic Balancing",
              "Submersible Pump",
              "Transformer Service",
              "VPI Insulation"
            ]}
          />

          {/* CONTACT INFO */}
          <div className="space-y-6 text-center md:text-left">
            <h3 className="text-slate-900 font-bold uppercase tracking-widest text-xs italic">Get In Touch</h3>
            <div className="space-y-4">
              <ContactItem icon={<Phone size={18}/>} label="+91 98421 52637" />
              <ContactItem icon={<Mail size={18}/>} label="senthilrewinding@gmail.com" />
              <ContactItem icon={<MapPin size={18}/>} label="Plot No 87, AKMG Nagar, Dindigul - 01" />
            </div>
          </div>

        </div>

        {/* BOTTOM STRIP */}
        <div className="border-t border-slate-100 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} SENTHIL REWINDING WORKS. 
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer transition">Privacy</span>
            <span className="hover:text-blue-600 cursor-pointer transition">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* REUSABLE COLUMN */
function FooterColumn({ title, links }) {
  return (
    <div className="text-center md:text-left">
      <h3 className="text-slate-900 font-bold uppercase tracking-widest text-xs mb-6 italic">{title}</h3>
      <ul className="space-y-3">
        {links.map((item, i) => (
          <motion.li
            key={i}
            whileHover={{ x: 5, color: "#2563eb" }}
            className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-sm font-semibold cursor-pointer transition-colors"
          >
            <ChevronRight size={14} className="text-blue-600/50" />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* CONTACT ITEM */
function ContactItem({ icon, label }) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 group cursor-default">
      <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-slate-600 text-sm font-medium group-hover:text-blue-600 transition-colors">
        {label}
      </span>
    </div>
  );
}

/* SOCIAL ICON */
function Social({ icon }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: "#2563eb", color: "#fff" }}
      className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 cursor-pointer transition-all"
    >
      {icon}
    </motion.div>
  );
}