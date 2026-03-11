import React, { useLayoutEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion"; // Fix: Changed to framer-motion
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { Bolt, Cog, Wrench, ShieldCheck, Activity, Timer, Award, Factory, Zap, Mail, ChevronDown } from "lucide-react";
import herobg from '../../assets/car-engine.jpg';

gsap.registerPlugin(ScrollTrigger);

// Responsive Section Component
const Section = ({ children, className, id }) => (
  <section id={id} className={`relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 md:px-10 py-20 ${className}`}>
    {children}
  </section>
);

export default function ResponsiveAwardLanding() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Image Reveal Animations
      gsap.utils.toArray(".reveal-img").forEach((img) => {
        gsap.fromTo(img, 
          { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
          { 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              end: "bottom 15%",
              scrub: 1
            }
          }
        );
      });

      // Horizontal Parallax Text
      gsap.to(".scrolling-text", {
        xPercent: -50,
        scrollTrigger: {
          trigger: ".scrolling-text",
          scrub: 0.5,
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#050505] text-white selection:bg-blue-600 overflow-x-hidden">
      
      {/* 1. HERO SECTION - UPDATED BRANDING & CONTENT */}
      <Section className="snap-start bg-black !pt-0">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src={herobg} className="w-full h-full object-cover grayscale" alt="Industrial Hero Background" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>
        
        <div className="relative z-10 text-center w-full max-w-[95vw]">
          <motion.h1 
            initial={{y:50, opacity:0}} 
            animate={{y:0, opacity:1}} 
            transition={{duration:1}} 
            className="text-[11vw] md:text-[6vw] font-[1000] italic tracking-tighter uppercase leading-[0.85] mb-6"
          >
            SENTHIL <br/> <span className="text-blue-600">REWINDING WORKS.</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <p className="text-gray-400 text-sm md:text-xl font-medium tracking-wide leading-relaxed px-4">
              Premium <span className="text-white font-bold">Industrial Motor Rewinding</span>, 
              Submersible Pump Services, and Dynamic Balancing. Engineered for maximum 
              durability and <span className="text-blue-500 font-bold">Zero Industrial Downtime.</span>
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mt-10">
            <button 
                onClick={() => navigate("/request")} 
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 font-black uppercase tracking-widest text-sm md:text-lg hover:scale-105 transition shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              Submit Request
            </button>
            <button 
                onClick={() => navigate("/track")} 
                className="w-full sm:w-auto px-10 py-5 border border-white/20 backdrop-blur-md font-black uppercase tracking-widest text-sm md:text-lg hover:bg-white hover:text-black transition"
            >
              Track Status
            </button>
          </div>
        </div>
        <ChevronDown className="absolute bottom-6 md:bottom-10 animate-bounce text-gray-500" size={32} />
      </Section>

      {/* 2. THE PROBLEM */}
      <Section className="bg-[#080808]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <p className="text-blue-600 font-mono text-xs md:text-sm mb-4 tracking-widest uppercase italic">// THE COST OF SILENCE</p>
            <h2 className="text-4xl md:text-7xl font-bold leading-tight max-w-3xl uppercase tracking-tighter">
              Every Minute of Downtime is a Leak in Revenue.
            </h2>
            <div className="mt-8 h-1 w-20 md:w-32 bg-red-600" />
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1649038780045-235e4b6e40b4?w=600" 
              alt="Industrial Motor Repair"
              className="w-full h-[350px] md:h-[500px] object-cover rounded-2xl shadow-2xl grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent rounded-2xl" />
          </div>
        </div>
      </Section>

      {/* 3. CRAFTSMANSHIP */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl w-full">
          <div className="reveal-img overflow-hidden rounded-2xl h-[300px] md:h-[500px]">
            <img src="https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=2070" className="w-full h-full object-cover" alt="Craft" />
          </div>
          <div className="space-y-6 text-left">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase leading-none">Not Just a Repair. <br/> A Resurrection.</h2>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
              We treat every motor like a masterpiece. Electrolytic-grade copper, surgical precision, and a commitment to zero-fail performance.
            </p>
          </div>
        </div>
      </Section>

      {/* 4. PARALLAX TEXT */}
      <div className="py-10 md:py-20 overflow-hidden whitespace-nowrap border-y border-white/5">
        <h2 className="scrolling-text text-[15vw] md:text-[6rem] font-black text-white uppercase leading-none">
          Precision • Reliability • Excellence • Power • 
        </h2>
      </div>

      {/* 5. STATS */}
      <Section className="bg-blue-600">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-20 text-center w-full">
          {[["1000+", "MOTORS"], ["24HR", "TAT"], ["100%", "SUCCESS"]].map(([val, label]) => (
            <div key={label} className="group">
              <h3 className="text-7xl md:text-9xl font-black group-hover:scale-110 transition-transform duration-500 tracking-tighter">{val}</h3>
              <p className="tracking-[0.3em] text-xs md:text-sm font-bold opacity-80 uppercase mt-2">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. TECHNOLOGY */}
      <Section className="bg-[#0a0a0a]">
        <h2 className="text-xl md:text-3xl font-light uppercase tracking-[0.5em] md:tracking-[1em] mb-12 md:mb-20 text-center">The Arsenal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl w-full">
          <TechCard icon={<Zap/>} title="VPI Treatment" desc="Vacuum Pressure Impregnation for high-voltage durability." />
          <TechCard icon={<Activity/>} title="Analysis" desc="Precision dynamic balancing and vibration testing." />
          <TechCard icon={<Factory/>} title="Load Test" desc="Full-load operational testing before delivery." />
        </div>
      </Section>

      {/* 7. INDUSTRIAL TRUST */}
      <Section>
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2070" className="w-full h-full object-cover grayscale" alt="Industry" />
        </div>
        <h2 className="text-4xl md:text-7xl font-black z-10 text-center max-w-4xl px-4 leading-tight uppercase tracking-tighter italic">
          Built for Heavy Industry. <br className="hidden md:block"/> <span className="text-gray-500">Trusted by Giants.</span>
        </h2>
      </Section>

      {/* 8. OUR COMMITMENT */}
      <Section className="bg-white text-black">
        <div className="max-w-4xl text-center space-y-8">
          <Award size={64} className="mx-auto text-blue-600" />
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Quality Without <br/> Compromise.</h2>
          <p className="text-lg md:text-2xl font-medium text-gray-700">Every single component is re-engineered to surpass original manufacturer specifications.</p>
        </div>
      </Section>

      {/* 9. TURNAROUND */}
      <Section>
        <div className="relative w-full flex items-center justify-center py-20">
          <div className="absolute w-full max-w-[300px] md:max-w-[500px] aspect-square bg-blue-600/20 blur-[80px] md:blur-[150px] rounded-full" />
          <div className="text-center z-10 px-4">
            <Timer size={48} className="mx-auto mb-6 text-blue-400" />
            <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-tight tracking-tighter">Fastest Turnaround <br className="hidden md:block"/> in the Industry.</h2>
          </div>
        </div>
      </Section>

      {/* 10. CALL TO ACTION */}
      <Section className="snap-end border-t border-white/10">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-12 text-center leading-[0.9]">RESTORING <br/> <span className="text-blue-600 underline">MOMENTUM.</span></h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto sm:max-w-none sm:justify-center px-4">
          <button onClick={() => navigate("/request")} className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black text-xl uppercase hover:scale-105 transition shadow-2xl shadow-blue-500/50">
            Start Now
          </button>
          <button className="w-full sm:w-auto p-5 border border-white/20 hover:bg-white hover:text-black transition flex items-center justify-center gap-2 group">
            <Mail size={24} /> <span className="sm:hidden font-bold uppercase tracking-widest">Contact Us</span>
          </button>
        </div>
      </Section>

      {/* PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 origin-left z-50" style={{ scaleX }} />
    </div>
  );
}

function TechCard({ icon, title, desc }) {
  return (
    <div className="p-8 md:p-12 border border-white/5 bg-white/5 backdrop-blur-md hover:border-blue-500 transition-all duration-500 group text-left">
      <div className="text-blue-500 mb-6 group-hover:scale-110 group-hover:-rotate-12 transition duration-500">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-4 italic">{title}</h3>
      <p className="text-gray-400 text-sm md:text-base leading-relaxed">{desc}</p>
    </div>
  );
}