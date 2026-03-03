import { motion } from "framer-motion";

const showcaseData = [
  {
    id: 1,
    title: "Industrial Motor Repair",
    before:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800",
    after:
      "https://images.unsplash.com/photo-1581092919535-7146ff1a5902?q=80&w=800",
  },
  {
    id: 2,
    title: "Pump Motor Rewinding",
    before:
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=800",
    after:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800",
  },
  {
    id: 3,
    title: "Generator Motor Service",
    before:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=800",
    after:
      "https://images.unsplash.com/photo-1581093458791-9d15482442f2?q=80&w=800",
  }
];

export default function BeforeAfterSection() {
  return (
    <section className="relative py-28 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[450px] h-[450px] bg-blue-400/20 blur-[170px] rounded-full"/>
      <div className="absolute bottom-[-150px] right-[-150px] w-[450px] h-[450px] bg-indigo-400/20 blur-[170px] rounded-full"/>

      {/* Heading */}
      <div className="text-center mb-20 px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          Before & After Results
        </h2>

        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Witness real transformation of damaged motors into
          fully restored, high-performance machines handled by
          expert technicians.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto px-6 relative z-10">

        {showcaseData.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 60, scale:.95 }}
            whileInView={{ opacity: 1, y: 0, scale:1 }}
            transition={{ delay: i * 0.15, duration:.6 }}
            viewport={{ once: true }}
            whileHover={{ y: -12 }}
            className="group backdrop-blur-xl bg-white/70 border border-white/40
                       rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden"
          >

            {/* TITLE */}
            <div className="p-6 border-b text-center">
              <h3 className="font-semibold text-lg tracking-wide">
                {item.title}
              </h3>
            </div>

            {/* BEFORE AFTER */}
            <div className="grid grid-cols-2">

              {/* BEFORE */}
              <div className="relative overflow-hidden">
                <img
                  src={item.before}
                  alt="before"
                  className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 text-xs font-semibold
                                 bg-red-500/90 backdrop-blur px-3 py-1 rounded-full text-white shadow">
                  BEFORE
                </span>
              </div>

              {/* AFTER */}
              <div className="relative overflow-hidden">
                <img
                  src={item.after}
                  alt="after"
                  className="h-56 w-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 right-3 text-xs font-semibold
                                 bg-green-600/90 backdrop-blur px-3 py-1 rounded-full text-white shadow">
                  AFTER
                </span>
              </div>

            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
}
