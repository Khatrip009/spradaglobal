import React from "react";
// We assume Framer Motion is available
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";

// =================================================================================
// 1. ICONS (Playful & Bold)
// =================================================================================
const GlobeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);
const LayersIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);
const FactoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
    <path d="M17 18h1"></path>
    <path d="M12 18h1"></path>
    <path d="M7 18h1"></path>
  </svg>
);
const ShieldIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

// =================================================================================
// 2. DATA
// =================================================================================
const FEATURES = [
  {
    id: 1,
    title: "Global Import & Export",
    desc: "Global sourcing from verified suppliers and manufacturers. End-to-end import and export operations with structured processes and global compliance.",
    Icon: GlobeIcon,
    // Brand Teal Primary
    gradient: "from-teal-500 via-teal-700 to-cyan-600",
    badge: "Worldwide",
  },
  {
    id: 2,
    title: "Multi-Category Expertise",
    desc: "A diversified export portfolio sourced directly from verified manufacturing partners. Reliable logistics and timely worldwide delivery",
    Icon: LayersIcon,
    // Brand Amber Accent
    gradient: "from-amber-500 via-orange-600 to-red-500",
    badge: "Diverse",
  },
  {
    id: 3,
    title: "Verified Manufacturers",
    desc: "Compliance with international trade and quality standards. Direct sourcing from import - export-ready manufacturers with international certifications.",
    Icon: FactoryIcon,
    // Teal/Green blend for manufacturing
    gradient: "from-green-500 via-emerald-600 to-teal-500",
    badge: "Certified",
  },
  {
    id: 4,
    title: "Compliance & Trust",
    desc: "Efficient handling, packaging, and documentation. Documentation, certifications and regulatory compliance handled seamlessly",
    Icon: ShieldIcon,
    // Strong Teal/Accent for trust
    gradient: "from-teal-600 via-blue-600 to-amber-500",
    badge: "Secure",
  },
];

// =================================================================================
// 3. UTILITY COMPONENTS (3D Tilt & Blobs)
// =================================================================================

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-100, 100], [7, -7]); 
  const rotateY = useTransform(mouseX, [-100, 100], [-7, 7]);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// =================================================================================
// 4. MAIN COMPONENT
// =================================================================================
const AboutUsSection = () => {
  return (
    <div className="relative bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* Background Ambience (Floating Blobs) - Updated to Teal/Amber Brand Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-amber-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* === HEADER SECTION === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          
          {/* Text Content */}
          <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm mb-6">
              {/* Pulse in Brand Teal */}
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Who We Are</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              Global Trade, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-teal-400">
                Built on Trust.
              </span>
            </h2>
            
            <div className="relative p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
                <p className="text-lg text-slate-700 leading-relaxed font-medium">
                  {/* Text Accent in Brand Teal */}
                  <span className="text-teal-700 font-bold">Sprada2Global</span> is a professionally managed import–export company delivering reliable, scalable and fully compliant trade solutions.
                </p>
                <div className="h-px w-full bg-gradient-to-r from-slate-300 to-transparent my-4"></div>
                <p className="text-slate-600 leading-relaxed">
                  With extensive experience in international trade, we specialize in importing and exporting a wide variety of goods across industries. Our focus on quality, transparency and efficient logistics enables us to build long-term global partnerships.
                </p>
            </div>
          </motion.div>

          {/* Abstract Visual / Image Placeholder - Updated to Brand Colors */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] w-full hidden lg:block perspective-1000"
          >
             {/* 3D layered abstract composition - Teal Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 rounded-[2rem] shadow-2xl transform rotate-3 opacity-90"></div>
             <div className="absolute inset-0 bg-slate-900 rounded-[2rem] shadow-2xl transform -rotate-2 scale-[0.98] overflow-hidden flex items-center justify-center">
                {/* Abstract Map Grid */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="text-center p-8">
                   <h3 className="text-4xl font-black text-white mb-2">SPRADA</h3>
                   {/* GLOBAL EXIM in Brand Amber Accent */}
                   <div className="text-amber-400 font-bold tracking-[0.5em] text-sm">GLOBAL EXIM</div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <motion.div 
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]"
             >
                <div className="flex items-center space-x-3 mb-2">
                   {/* Icon background in lighter Teal */}
                   <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                      <ShieldIcon className="w-6 h-6" />
                   </div>
                   <span className="font-bold text-slate-800">100% Secure</span>
                </div>
                <p className="text-xs text-slate-500">Fully compliant & certified trade operations.</p>
             </motion.div>
          </motion.div>
        </div>

        {/* === GRID FEATURES SECTION === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <TiltCard key={feature.id} className="relative group perspective-1000">
               <motion.div
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1, duration: 0.5 }}
                 className="h-full bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
               >
                 {/* Top Badge */}
                 <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-md bg-white/50">
                    {feature.badge}
                 </div>

                 {/* Animated Icon Background */}
                 <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-blob`}></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-40 blur-lg group-hover:opacity-60 transition-opacity duration-300`}></div>
                    <feature.Icon className="relative z-10 w-8 h-8 text-slate-800" />
                 </div>

                 <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                   {feature.title}
                 </h3>
                 
                 <p className="text-sm text-slate-600 leading-relaxed mb-6">
                   {feature.desc}
                 </p>

                 {/* Bottom Decorative Line */}
                 <div className={`mt-auto w-12 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500`}></div>
               </motion.div>
            </TiltCard>
          ))}
        </div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(5px, -10px) scale(1.05); }
          66% { transform: translate(-5px, 5px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 5s infinite; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AboutUsSection;