import { motion } from "framer-motion";

export default function Featurecard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur border rounded-3xl p-8 shadow-md hover:shadow-2xl"
    >
      <div className="text-blue-600 mb-4">{icon}</div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="text-gray-600 text-sm mt-2">{desc}</p>
    </motion.div>
  );
}
