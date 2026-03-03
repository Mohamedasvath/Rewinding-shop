import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Search, Info, ClipboardList, Cog, Home, Menu, X, Wrench } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "unset";
  }, [location.pathname]);

  // Handle body scroll when menu is open
  const toggleMenu = () => {
    const nextState = !open;
    setOpen(nextState);
    document.body.style.overflow = nextState ? "hidden" : "unset";
  };

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Request", path: "/request", icon: ClipboardList },
    { name: "Track", path: "/track", icon: Search },
    { name: "About", path: "/about", icon: Info }
  ];

  return (
    <div className="relative font-sans antialiased">
      {/* MAIN HEADER */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-300 
        ${scrolled || open ? "bg-white shadow-md border-b border-gray-100 py-3" : "bg-transparent py-5"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* LOGO */}
          <NavLink to="/" className="flex items-center gap-2 relative z-[60]">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
              <Cog size={20} className="text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <span className={`text-xl font-black tracking-tighter uppercase transition-colors duration-300 ${scrolled || open ? "text-slate-900" : "text-white"}`}>
              SR<span className="text-blue-600 italic">W</span>
            </span>
          </NavLink>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => 
                  `text-xs font-black uppercase tracking-[2px] transition-all duration-300
                  ${isActive ? "text-blue-600 scale-105" : scrolled ? "text-slate-600 hover:text-blue-600" : "text-white/80 hover:text-white"}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* MOBILE TOGGLE - Ithu mattum thaan main nav-la irukkum */}
          <button
            aria-label="Toggle Menu"
            className={`md:hidden p-2 rounded-xl transition-all active:scale-90
            ${scrolled || open ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white backdrop-blur-md"}`}
            onClick={toggleMenu}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE SIDEBAR OVERLAY */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-300 md:hidden
        ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={toggleMenu}
      />

      {/* SIDEBAR CONTAINER */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white z-[110] shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Top Section */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-blue-600" />
            <span className="font-black text-slate-900 uppercase tracking-tighter">Menu</span>
          </div>
          {/* Optional: Inner close button if you want double safety */}
          <button onClick={toggleMenu} className="p-1 text-slate-400 hover:text-slate-900 md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 py-6 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={toggleMenu}
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all
                ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 active:bg-slate-100"}`
              }
            >
              <link.icon size={20} />
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Senthil Rewind Works</p>
              <p className="text-[9px] text-blue-600 font-bold italic uppercase">Quality Motor Services</p>
           </div>
        </div>
      </div>
    </div>
  );
}