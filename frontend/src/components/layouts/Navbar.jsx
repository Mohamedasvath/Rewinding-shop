import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Wrench, Search, Info, ClipboardList, Cog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll pannumpo navbar style mathurathukku
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", path: "/", icon: Wrench },
    { name: "Request", path: "/request", icon: ClipboardList },
    { name: "Track", path: "/track", icon: Search },
    { name: "About", path: "/about", icon: Info }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 py-3 
      ${scrolled ? "bg-white/80 backdrop-blur-xl border-b shadow-sm py-2" : "bg-transparent py-4"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="text-blue-600 bg-blue-50 p-1.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500"
          >
            <Cog size={24}/>
          </motion.div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">
            SRW <span className="text-blue-600"></span>
          </h1>
        </div>

        {/* DESKTOP MENU - Pill Shape Style */}
        <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => 
                  `relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300
                  ${isActive ? "text-white" : "text-gray-600 hover:text-blue-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className="relative z-10" />
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* MODERN HAMBURGER BUTTON */}
        <button
          className="md:hidden relative z-[110] w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-gray-100 rounded-full"
          onClick={() => setOpen(!open)}
        >
          <motion.span 
            animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="w-5 h-0.5 bg-black rounded-full block origin-center"
          />
          <motion.span 
            animate={open ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
            className="w-5 h-0.5 bg-black rounded-full block"
          />
          <motion.span 
            animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="w-5 h-0.5 bg-black rounded-full block origin-center"
          />
        </button>
      </div>

      {/* MOBILE FULL SCREEN MENU REVEAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-0 left-0 right-0 bg-white border-b shadow-2xl overflow-hidden pt-20 pb-10 px-6 z-[105]"
          >
            <div className="flex flex-col space-y-4">
              {links.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <NavLink
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all
                        ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-gray-50 text-gray-700 active:scale-95"}`
                      }
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={20}/>
                        {link.name}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-current opacity-30" />
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}