import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

export default function ServiceTable({ services }) {
  return (
    <div className="bg-white rounded-2xl shadow border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">SRF</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Stage</th>
            <th className="p-4 text-left">Technician</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {services.map((s) => (
            <motion.tr
              key={s._id}
              whileHover={{ backgroundColor: "#f8fafc" }}
              className="border-t"
            >
              <td className="p-4">{s.srfNumber}</td>
              <td className="p-4">{s.customerName}</td>
              <td className="p-4">{s.stage}</td>
              <td className="p-4">{s.technician || "-"}</td>
              <td className="p-4 flex gap-3">
                <Edit className="cursor-pointer text-blue-600" size={18} />
                <Trash2 className="cursor-pointer text-red-500" size={18} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
