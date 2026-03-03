import { motion } from "framer-motion";
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-32">

      {/* Glow Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-100 via-white to-indigo-100 opacity-60"/>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

        {/* TOP GRID */}
        <div className="grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg">
                <Wrench size={22}/>
              </div>
              <h2 className="text-xl font-bold">
                Motor<span className="text-blue-600">Track</span>
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Professional motor rewinding and repair tracking platform.
              Submit service requests and monitor repair progress live
              from anywhere.
            </p>
          </div>


          {/* LINKS */}
          <FooterColumn
            title="Quick Links"
            links={[
              "Home",
              "Submit Request",
              "Track Status",
              "Technicians",
              "Contact"
            ]}
          />

          {/* SERVICES */}
          <FooterColumn
            title="Our Services"
            links={[
              "Motor Rewinding",
              "Pump Repair",
              "Generator Service",
              "Industrial Motors",
              "Emergency Repair"
            ]}
          />

          {/* CONTACT */}
          <div>
            <h3 className="font-semibold mb-5 text-lg">Contact</h3>

            <div className="space-y-3 text-gray-600 text-sm">

              <ContactItem icon={<Phone size={16}/>}>
                +91 98765 43210
              </ContactItem>

              <ContactItem icon={<Mail size={16}/>}>
                support@motortrack.com
              </ContactItem>

              <ContactItem icon={<MapPin size={16}/>}>
                Plot No 87, AKMG Nagar, 5th Street, Dindigul, Tamil Nadu 624001, India
              </ContactItem>

            </div>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-6">
              <Social icon={<Facebook size={18}/>}/>
              <Social icon={<Instagram size={18}/>}/>
              <Social icon={<Linkedin size={18}/>}/>
            </div>

          </div>

        </div>


        {/* DIVIDER */}
        <div className="border-t mt-14 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MotorTrack. All rights reserved.
        </div>

      </div>
    </footer>
  );
}



/* COLUMN */
function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-semibold mb-5 text-lg">{title}</h3>

      <ul className="space-y-3 text-gray-600 text-sm">
        {links.map((item, i) => (
          <motion.li
            key={i}
            whileHover={{ x: 6 }}
            className="cursor-pointer hover:text-blue-600 transition"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}



/* CONTACT ITEM */
function ContactItem({ icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-blue-600">{icon}</span>
      <span>{children}</span>
    </div>
  );
}



/* SOCIAL ICON */
function Social({ icon }) {
  return (
    <motion.div
      whileHover={{ scale:1.15, rotate:5 }}
      className="bg-white border p-3 rounded-xl shadow hover:shadow-lg cursor-pointer"
    >
      {icon}
    </motion.div>
  );
}
