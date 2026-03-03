import { motion } from "framer-motion";
import { Wrench, Users, Clock, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: <Wrench size={28} />,
    value: "1500+",
    label: "Motors Serviced",
  },
  {
    icon: <Users size={28} />,
    value: "1200+",
    label: "Happy Clients",
  },
  {
    icon: <Clock size={28} />,
    value: "24/7",
    label: "Live Tracking",
  },
  {
    icon: <ShieldCheck size={28} />,
    value: "99%",
    label: "Accuracy Rate",
  },
];

export default function QuickStats() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-blue-400/20 blur-[160px] rounded-full"/>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-indigo-400/20 blur-[160px] rounded-full"/>

      {/* TITLE */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl font-bold">
          Our Service Performance
        </h2>
        <p className="text-gray-600 mt-3">
          Trusted motor rewinding & repair tracking platform
        </p>
      </div>

      {/* STATS GRID */}
      <div className="relative z-10 max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">

        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, scale: .9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.15, duration:.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.04 }}
            className="group backdrop-blur-xl bg-white/60 border border-white/40
                       rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl
                       transition-all duration-300"
          >

            {/* ICON */}
            <div className="flex justify-center mb-5">
              <div className="p-4 rounded-2xl bg-gradient-to-tr
                              from-blue-600 to-indigo-600 text-white
                              shadow-lg group-hover:scale-110 transition">
                {stat.icon}
              </div>
            </div>

            {/* NUMBER */}
            <h2 className="text-4xl font-extrabold bg-gradient-to-r
                           from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {stat.value}
            </h2>

            {/* LABEL */}
            <p className="text-gray-600 mt-3 text-sm tracking-wide">
              {stat.label}
            </p>

          </motion.div>
        ))}
      </div>
    </section>
  );
}
