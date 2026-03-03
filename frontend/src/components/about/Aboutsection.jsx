import { motion } from "framer-motion";
import {
  Wrench,
  Settings,
  ShieldCheck,
  Award,
  Cog,
  Hammer,
  Phone,
  Zap,
  Target,
  Eye,
  ArrowRight,
  Factory,
  Cpu
} from "lucide-react";

/* ================= BACKGROUND ICONS (Industrial Style) ================= */
function BackgroundIcons() {
  const icons = [Wrench, Cog, Settings, Factory, Zap];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            initial={{ rotate: 0, opacity: 0.03 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 50 + i * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute text-blue-500"
            style={{
              top: `${(i * 31) % 100}%`,
              left: `${(i * 19) % 100}%`
            }}
          >
            <Icon size={120 + (i % 3) * 60} strokeWidth={0.3} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================= HERO (Branding Focus) ================= */
function AboutHero() {
  return (
    <section className="relative pt-48 pb-32 bg-[#050505] overflow-hidden">
      <BackgroundIcons />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[180px] rounded-full -z-10" />

      <div className="relative max-w-6xl mx-auto text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1 border border-blue-500/30 rounded-full mb-8"
        >
          <p className="text-blue-500 font-mono tracking-[0.4em] uppercase text-[10px]">
            // ESTABLISHED 2009 • TAMIL NADU
          </p>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-9xl font-[900] italic tracking-tighter uppercase leading-[0.8] mb-10 text-white"
        >
          Power <br /> <span className="text-blue-600 underline decoration-white/10">Industry.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg md:text-2xl max-w-4xl mx-auto font-medium leading-relaxed italic"
        >
          At <span className="text-white">Senthil Rewind Works</span>, we don't just fix motors. 
          We re-engineer them. From heavy industrial induction motors to high-precision 
          submersible pumps, we restore peak performance.
        </motion.p>
      </div>
    </section>
  );
}

/* ================= WORKSHOP STATS ================= */
function WorkshopStats() {
    const stats = [
        { label: "Years Excellence", val: "15+" },
        { label: "Motors Restored", val: "12K+" },
        { label: "Success Rate", val: "100%" },
        { label: "Turnaround", val: "24H" },
    ];
    return (
        <section className="bg-blue-600 py-12">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
                {stats.map((s, i) => (
                    <div key={i} className="text-center">
                        <h4 className="text-4xl md:text-6xl font-black text-white uppercase italic">{s.val}</h4>
                        <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mt-2">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ================= CORE CAPABILITIES ================= */
function Capabilities() {
  const cards = [
    {
      icon: <Cpu size={40} />,
      title: "Precision Rewinding",
      desc: "Using 99.9% pure electrolytic grade copper for maximum conductivity and heat resistance."
    },
    {
      icon: <Settings size={40} />,
      title: "Dynamic Balancing",
      desc: "Zero-vibration calibration to extend the bearing life and operational efficiency of your machines."
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Insulation Testing",
      desc: "Class-H insulation and vacuum pressure impregnation to withstand extreme industrial environments."
    }
  ];

  return (
    <section className="py-32 bg-[#080808] relative z-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-left">
            <h2 className="text-blue-600 font-mono text-sm tracking-[0.3em] uppercase mb-4">// OUR ARSENAL</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">Engineered for <br/> Heavy Duty.</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0c0c0c] border border-white/5 p-12 hover:border-blue-600/50 transition-all group"
            >
                <div className="text-blue-500 mb-8 group-hover:-rotate-12 transition-transform duration-500">
                {card.icon}
                </div>
                <h3 className="text-white text-2xl font-black uppercase italic mb-4">
                {card.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed">
                {card.desc}
                </p>
            </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}

/* ================= CTA (Workshop Contact) ================= */
function CTA() {
  return (
    <section className="py-32 bg-[#050505] px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2rem] p-12 md:p-24 text-center relative shadow-[0_0_60px_rgba(37,99,235,0.3)]">
        <h3 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter text-white mb-10 leading-[0.85]">
          Machine Failure? <br /> <span className="text-black/30">Not On Our Watch.</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
            href="tel:+919344790389"
            className="w-full sm:w-auto bg-black text-white font-black uppercase tracking-[0.2em] px-12 py-6 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-3 text-sm"
            >
            <Phone size={20} /> 
            Call the Workshop
            </a>
            <p className="text-white/60 font-mono text-xs uppercase tracking-widest">
                Available 24/7 for <br/> Emergency Repairs
            </p>
        </div>
      </div>
    </section>
  );
}

/* ================= MAIN PAGE ================= */
export default function About() {
  return (
    <main className="bg-[#050505] selection:bg-blue-600 selection:text-white">
      <AboutHero/>
      <WorkshopStats/>
      <Capabilities/>
      
      {/* Vision Section */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6">
            <Target className="mx-auto text-blue-500 mb-8" size={48}/>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-6">Our Mission</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
                To eliminate downtime for our clients by providing world-class motor restoration 
                services that surpass OEM standards. We believe in quality that moves the world.
            </p>
        </div>
      </section>

      <CTA/>
    </main>
  );
}