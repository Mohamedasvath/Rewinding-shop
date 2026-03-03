import { motion } from "framer-motion";

export default function TechnicianCard({ tech }) {
  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl shadow-md hover:shadow-2xl p-7 text-center border"
    >
      <img
        src={tech.image}
        alt={tech.name}
        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-100"
      />

      <h3 className="mt-4 text-xl font-bold">{tech.name}</h3>

      <p className="text-blue-600 font-medium text-sm">{tech.role}</p>

      <p className="text-gray-500 text-sm mt-2">{tech.experience}</p>

      <div className="mt-4 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-block">
        {tech.speciality}
      </div>
    </motion.div>
  );
}
