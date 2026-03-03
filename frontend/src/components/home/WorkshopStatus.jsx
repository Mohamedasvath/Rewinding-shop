import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function WorkshopStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // SHOP TIME (CHANGE THIS)
      const openHour = 9;
      const closeHour = 18;

      setIsOpen(hours >= openHour && hours < closeHour);

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      );
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">

      <motion.div
        initial={{ opacity:0, scale:.9 }}
        whileInView={{ opacity:1, scale:1 }}
        transition={{ duration:.5 }}
        viewport={{ once:true }}
        className="max-w-4xl mx-auto text-center bg-white rounded-3xl shadow-xl p-10 border"
      >
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
            <Clock size={30}/>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4">
          Workshop Status
        </h2>

        {/* Badge */}
        <motion.div
          animate={{ scale: [1,1.05,1] }}
          transition={{ repeat:Infinity, duration:1.5 }}
          className={`inline-block px-6 py-2 rounded-full text-lg font-semibold
          ${isOpen
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
          }`}
        >
          {isOpen ? "OPEN NOW" : "CLOSED"}
        </motion.div>

        {/* Time */}
        <p className="text-gray-600 mt-4">
          Current Time: <span className="font-semibold">{time}</span>
        </p>

        {/* Working Hours */}
        <p className="text-gray-500 text-sm mt-2">
          Working Hours: 9:00 AM — 6:00 PM
        </p>

      </motion.div>

    </section>
  );
}
