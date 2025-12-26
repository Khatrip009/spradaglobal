import React from "react";
// We assume Framer Motion is available
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

// =================================================================================
// 1. ICONS (Playful & Bold - Lucide style)
// =================================================================================
// Icon for Export Services (Plane flying upwards)
const Plane = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20l4-16l6 6l-10 4z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 13h5.5l1.5 3h12v-3l-7-4l-3 4H2z" />
        <path d="M12 18H5.5L7 15H11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Icon for Import Services (Box/package coming in)
const Download = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Icon for Supplier Network (Users/community)
const Users = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);


// =================================================================================
// 2. DATA (Vibrant & Punchy)
// =================================================================================
const SERVICES = [
  {
    id: "01",
    title: "Export Services",
    short: "Comprehensive export solutions",
    details: "We manage direct sourcing, rigorous quality testing, complete export documentation and smooth logistics to ensure timely international delivery.",
    Icon: Plane,
    gradient: "from-indigo-500 via-blue-600 to-purple-600",
    shadow: "shadow-indigo-500/30",
    textAccent: "text-indigo-600",
  },
  {
    id: "02",
    title: "Import Services",
    short: "Trusted import solutions",
    details: "Leverage our network of global suppliers, gain compliance support, mandatory inspection checks and secure warehousing for all inbound goods.",
    Icon: Download,
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/30",
    textAccent: "text-emerald-600",
  },
  {
    id: "03",
    title: "Supplier Network",
    short: "Verified suppliers and farmers",
    details: "Our network is built on verified partnerships, promoting sustainable sourcing and offering full traceability from farm to final destination.",
    Icon: Users,
    gradient: "from-amber-400 via-orange-500 to-red-500",
    shadow: "shadow-orange-500/30",
    textAccent: "text-orange-600",
  },
];

// =================================================================================
// 3. SPECIAL EFFECTS COMPONENTS
// =================================================================================

// 3D Tilt Card Component for a subtle interactive effect (Copied from FeatureUnboxing)
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
// 4. MAIN COMPONENT: CoreServicesPage
// =================================================================================
const CoreServicesPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* Background Ambience - Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-24 max-w-xl mx-auto"
        >
          <p className="text-base font-bold uppercase tracking-widest text-pink-600 mb-2">
            Our Core Offerings
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Seamless Global Trade Solutions
          </h1>
          <p className="text-lg text-slate-500 mt-3">
            A trusted suite of services covering the entire trade lifecycle, from sourcing to final delivery.
          </p>
        </motion.div>


        {/* The Animated Services Grid */}
        <div className="relative pt-12">
          
          {/* 1. The Energy Stream (Connector Line - Desktop Only) */}
          {/* Adapted for a simpler, less dense grid */}
          <div className="absolute top-[8rem] left-0 w-full hidden lg:block pointer-events-none">
              {/* Base Track */}
              <div className="h-3 w-full bg-slate-200/50 rounded-full backdrop-blur-sm"></div>
              {/* Animated Flow (Glow) */}
              <motion.div 
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute top-0 left-0 h-3 w-full bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 rounded-full opacity-30"
              />
              {/* Moving Particles */}
              <motion.div 
                 initial={{ left: "-10%" }}
                 animate={{ left: "110%" }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-0 h-3 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 blur-sm rounded-full"
              />
          </div>

          {/* 2. Grid of Services: Optimized for 3 items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 relative">
            {SERVICES.map((service, index) => (
              <div key={service.id} className="relative flex flex-col items-center group perspective-1000">
                
                {/* 3D TILT CARD WRAPPER */}
                <TiltCard className="w-full relative flex flex-col items-center">
                  
                  {/* ICON ISLAND (Floating) */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.15 }}
                    whileHover={{ scale: 1.1, y: -10 }}
                    className="relative z-20 w-36 h-36 flex items-center justify-center mb-[-3rem] cursor-pointer"
                  >
                    {/* The Morphing Background Blob */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${service.gradient} rounded-[2rem] opacity-90 shadow-2xl shadow-slate-300 animate-blob-slow transition-all duration-300`}></div>
                    
                    {/* Glass Overlay on Blob */}
                    <div className="absolute inset-2 bg-white/20 backdrop-blur-sm rounded-[1.5rem] border border-white/30"></div>
                    
                    {/* The Icon */}
                    <service.Icon className="w-12 h-12 text-white drop-shadow-lg relative z-10" />
                    
                    {/* Floating Badge */}
                    <div className="absolute -top-2 -right-2 bg-white text-slate-900 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100">
                        {service.id}
                    </div>
                  </motion.div>

                  {/* CONTENT GLASS CARD */}
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.15) }}
                    className="w-full pt-16 pb-8 px-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 text-center relative overflow-hidden group-hover:bg-white/80 min-h-[18rem] flex flex-col justify-between"
                  >
                    
                    {/* Giant Watermark Number */}
                    <div className="absolute top-10 right-4 text-9xl font-black text-slate-900/5 select-none pointer-events-none scale-150 origin-top-right group-hover:scale-125 transition-transform duration-700">
                      {service.id}
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className={`text-2xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br ${service.gradient}`}>
                          {service.title}
                        </h3>
                        <p className="text-slate-600 font-bold text-sm uppercase tracking-wider mb-3 min-h-[2rem] flex items-center justify-center">
                          {service.short}
                        </p>
                    </div>
                    
                    {/* Details */}
                    <p className="text-slate-500 text-sm leading-relaxed relative z-10">
                      {service.details}
                    </p>

                    {/* Bottom Gradient Line */}
                    <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r ${service.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </motion.div>

                </TiltCard>
                
                {/* Mobile Connector */}
                {index !== SERVICES.length - 1 && (
                    <div className="lg:hidden h-16 w-1 bg-gradient-to-b from-slate-200 to-transparent mt-4 rounded-full"></div>
                )}

              </div>
            ))}
          </div>

        </div>

      </div>
      
      {/* Global Styles for Custom Animations (Copied from FeatureUnboxing) */}
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

export default CoreServicesPage;