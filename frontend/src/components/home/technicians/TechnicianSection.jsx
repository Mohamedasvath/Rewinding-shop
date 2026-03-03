import { motion } from "framer-motion";
import TechnicianCard from "./TechnicianCard";
import { technicians } from "../../../data/technicians";

export default function TechnicianSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: .6 }}
        viewport={{ once: true }}
        className="text-center mb-16 px-6"
      >
        <h2 className="text-4xl font-bold">
          Meet Our Expert Technicians
        </h2>

        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Our certified professionals ensure your motor repair is handled with
          precision, experience, and industry-grade expertise.
        </p>
      </motion.div>


      {/* Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {technicians.map((tech, i) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <TechnicianCard tech={tech} />
          </motion.div>
        ))}
      </div>

    </section>
  );
}
