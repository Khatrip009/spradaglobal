import React, { useRef } from "react";
// We assume Framer Motion is available
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";

// =================================================================================
// 1. ICONS (Playful & Bold - Lucide style)
// =================================================================================
// Icon for Consultation
const MessageCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
// Icon for Sourcing/Procurement
const Search = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
// Icon for Documentation
const FileText = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);
// Icon for Processing/Packing
const Package = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 2.07l.08.14a2 2 0 0 0 .76 1.48L20 8"></path>
    <path d="M2.07 12.89l.14-.08a2 2 0 0 0 1.48-.76L8 4"></path>
    <path d="M4 12V2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10"></path>
    <rect x="2" y="12" width="20" height="8" rx="2"></rect>
    <path d="M12 20v2"></path>
  </svg>
);
// Icon for Quality Assurance/Testing
const ShieldCheck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);
// Icon for Logistics
const Truck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="10" height="8" rx="2"></rect>
    <path d="M22 17H12M12 17v-4l-3-4H2"></path>
    <path d="M7 17h12"></path>
    <circle cx="7" cy="17" r="5"></circle>
    <circle cx="19" cy="17" r="5"></circle>
  </svg>
);

// =================================================================================
// 2. DATA (Vibrant & Punchy)
// =================================================================================
const STEPS = [
  {
    id: "01",
    title: "Consultation",
    short: "Understand requirements",
    details: "In-depth analysis of your needs, market feasibility and legal frameworks to define the project scope.",
    Icon: MessageCircle,
    gradient: "from-indigo-400 via-blue-500 to-sky-500",
    shadow: "shadow-blue-500/30",
    textAccent: "text-blue-600",
  },
  {
    id: "02",
    title: "Sourcing",
    short: "Procurement & QC",
    details: "Strategic acquisition of materials coupled with rigorous quality control checks at the origin.",
    Icon: Search,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    shadow: "shadow-pink-500/30",
    textAccent: "text-pink-600",
  },
  {
    id: "03",
    title: "Quality Assurance",
    short: "Testing & certification",
    details: "Comprehensive multi-stage testing, stress assessments and official third-party compliance certification.",
    Icon: ShieldCheck,
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    shadow: "shadow-cyan-500/30",
    textAccent: "text-cyan-600",
  },
  {
    id: "04",
    title: "Processing",
    short: "Packing for export",
    details: "Customized preservation, smart labeling, optimized loading and secure, climate-controlled container preparation.",
    Icon: Package,
    gradient: "from-amber-300 via-orange-400 to-red-400",
    shadow: "shadow-amber-500/30",
    textAccent: "text-orange-600",
  },
  {
    id: "05",
    title: "Documentation",
    short: "Export documents & compliance",
    details: "Full management of customs forms, regulatory clearances and all necessary international export permits.",
    Icon: FileText,
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
    shadow: "shadow-purple-500/30",
    textAccent: "text-purple-600",
  },
  {
    id: "06",
    title: "Logistics",
    short: "Shipping & delivery",
    details: "Final mile tracking, rapid customs passage and guaranteed door-to-door delivery within the stipulated timeline.",
    Icon: Truck,
    gradient: "from-emerald-400 via-green-500 to-teal-500",
    shadow: "shadow-emerald-500/30",
    textAccent: "text-emerald-600",
  },
];

// =================================================================================
// 3. SPECIAL EFFECTS COMPONENTS
// =================================================================================

// 3D Tilt Card Component for a subtle interactive effect
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    // Calculate position relative to the center of the card
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Define rotation limits (inverted for a natural, "floating" feel)
  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d", // Important for 3D effect
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// =================================================================================
// 4. MAIN COMPONENT: FeatureUnboxing
// =================================================================================
const FeatureUnboxing = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* Background Ambience - Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* New, minimalist "Out-of-the-Box" Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-24 max-w-xl mx-auto"
        >
          <p className="text-base font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Our Workflow
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Systematic Approach to Quality
          </h1>
          <p className="text-lg text-slate-500 mt-3">
            From consultation to final delivery, we ensure excellence, compliance and timely execution every step of the way.
          </p>
        </motion.div>


        {/* The Animated Process Flow Ecosystem */}
        <div className="relative">
          
          {/* 1. The Energy Stream (Connector Line - Desktop Only) */}
          <div className="absolute top-[4.5rem] left-0 w-full hidden lg:block pointer-events-none">
              {/* Base Track */}
              <div className="h-3 w-full bg-slate-200/50 rounded-full backdrop-blur-sm"></div>
              {/* Animated Flow (Glow) */}
              <motion.div 
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute top-0 left-0 h-3 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-emerald-500 rounded-full opacity-30"
              />
              {/* Moving Particles */}
              <motion.div 
                 // Note: The parent container must be in view for this to trigger.
                 // Using initial and animate ensures it runs constantly after load/in view.
                 initial={{ left: "-10%" }}
                 animate={{ left: "110%" }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-0 h-3 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 blur-sm rounded-full"
              />
          </div>

          {/* 2. Grid of Steps: Adjusted for 6 items on XL screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-12 lg:gap-6 relative">
            {STEPS.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center group perspective-1000">
                
                {/* 3D TILT CARD WRAPPER */}
                <TiltCard className="w-full relative flex flex-col items-center">
                  
                  {/* ICON ISLAND (Floating) */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.15 }} // Slightly increased delay for sequence
                    whileHover={{ scale: 1.1, y: -10 }}
                    className="relative z-20 w-36 h-36 flex items-center justify-center mb-[-3rem] cursor-pointer"
                  >
                    {/* The Morphing Background Blob */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${step.gradient} rounded-[2rem] opacity-90 shadow-2xl shadow-slate-300 animate-blob-slow transition-all duration-300`}></div>
                    
                    {/* Glass Overlay on Blob */}
                    <div className="absolute inset-2 bg-white/20 backdrop-blur-sm rounded-[1.5rem] border border-white/30"></div>
                    
                    {/* The Icon */}
                    <step.Icon className="w-12 h-12 text-white drop-shadow-lg relative z-10" />
                    
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 bg-white text-slate-900 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100">
                        {index + 1}
                    </div>
                  </motion.div>

                  {/* CONTENT GLASS CARD */}
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.15) }}
                    className="w-full pt-16 pb-8 px-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-center relative overflow-hidden group-hover:bg-white/80"
                  >
                    
                    {/* Giant Watermark Number */}
                    <div className="absolute top-10 right-4 text-9xl font-black text-slate-900/5 select-none pointer-events-none scale-150 origin-top-right group-hover:scale-125 transition-transform duration-700">
                      {step.id}
                    </div>

                    {/* Content */}
                    <h3 className={`text-xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br ${step.gradient}`}>
                      {step.title}
                    </h3>
                    <p className="text-slate-600 font-bold text-sm uppercase tracking-wider mb-3 min-h-[2rem] flex items-center justify-center">
                      {step.short}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed relative z-10 min-h-[4rem]">
                      {step.details}
                    </p>

                    {/* Bottom Gradient Line */}
                    <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${step.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </motion.div>

                </TiltCard>
                
                {/* Mobile Connector */}
                {index !== STEPS.length - 1 && (
                    <div className="lg:hidden h-16 w-1 bg-gradient-to-b from-slate-200 to-transparent mt-4 rounded-full"></div>
                )}

              </div>
            ))}
          </div>

        </div>

      </div>
      
      {/* Global Styles for Custom Animations */}
      <style>{`
        /* 3D Perspective for Tilt Effect */
        .perspective-1000 {
          perspective: 1000px;
        }

        /* Keyframes for the background blobs */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        /* Slower animation for the icon island blob */
        .animate-blob-slow {
            animation: blob 10s infinite;
        }
        /* Delayed animations for separation */
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default FeatureUnboxing;