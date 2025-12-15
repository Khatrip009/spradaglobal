import React from "react";
// We assume Framer Motion is available
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

// =================================================================================
// 1. ICONS (Lucide style)
// =================================================================================
const Clock = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const Award = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 18 17 23 15.79 13.89"></polyline>
    </svg>
);
const Users = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);
const Globe = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);
const DollarSign = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);
const Headset = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
);

// =================================================================================
// 2. DATA
// =================================================================================
const WHY_CHOOSE_US = [
    {
        id: 1,
        title: "Timely Delivery",
        detail: "Reliable logistics and tracking ensure your goods arrive exactly when promised.",
        Icon: Clock,
        gradient: "from-cyan-400 to-blue-500",
    },
    {
        id: 2,
        title: "Certified Quality",
        detail: "Adherence to the highest international standards and mandatory quality certifications.",
        Icon: Award,
        gradient: "from-emerald-400 to-green-500",
    },
    {
        id: 3,
        title: "Expert Team",
        detail: "Leverage the knowledge of seasoned, experienced professionals in agricultural trade.",
        Icon: Users,
        gradient: "from-violet-400 to-purple-500",
    },
    {
        id: 4,
        title: "Global Reach",
        detail: "Our network serves over 50+ countries, offering access to diverse global markets.",
        Icon: Globe,
        gradient: "from-orange-400 to-red-500",
    },
    {
        id: 5,
        title: "Competitive Pricing",
        detail: "Optimized direct sourcing and streamlined operations guarantee market-leading pricing.",
        Icon: DollarSign,
        gradient: "from-amber-300 to-yellow-500",
    },
    {
        id: 6,
        title: "24/7 Support",
        detail: "Round-the-clock, dedicated support ensures operational continuity and peace of mind.",
        Icon: Headset,
        gradient: "from-pink-400 to-rose-500",
    },
];

// =================================================================================
// 3. SPECIAL EFFECTS COMPONENTS (Reused Tilt Logic for interactivity)
// =================================================================================

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    // Calculate position relative to center
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Increased tilt intensity for a more dramatic 3D effect
  const rotateX = useTransform(mouseY, [-100, 100], [8, -8]);
  const rotateY = useTransform(mouseX, [-100, 100], [-8, 8]);
  // Removed scale transformation, focusing purely on rotation for stability
  
  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};


// =================================================================================
// 4. MAIN COMPONENT: WhyChooseUsSection
// =================================================================================
const WhyChooseUsSection = () => {
    return (
        <div className="relative w-full py-24 md:py-32 bg-white overflow-hidden font-sans">
            
            {/* Background Texture/Grid (Light color for background) */}
            <div className="absolute inset-0 opacity-50">
                <div className="w-full h-full bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] blur-[1px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-16 md:mb-24 max-w-2xl mx-auto"
                >
                    {/* Updated text color for light background */}
                    <p className="text-base font-bold uppercase tracking-widest text-emerald-600 mb-2">
                        Commitment to Excellence
                    </p>
                    {/* Updated text color for light background */}
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                    Why Choose{" "}
                        <span className="text-[#164946]">Sprada</span>
                        <span className="text-[#d7b15b]">2Global</span>
                    </h2>
                    {/* Updated text color for light background */}
                    <p className="text-lg text-slate-600 mt-4">
                        Advantages of partnering with us for reliable, certified, and globally connected agricultural trade.
                    </p>
                </motion.div>


                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {WHY_CHOOSE_US.map((item, index) => (
                        <motion.div
                            key={item.id}
                            // ENHANCED 3D ANIMATION: Added rotateX and perspective for a dramatic, 3D entrance
                            initial={{ opacity: 0, scale: 0.8, rotateX: 20, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
                            viewport={{ once: true, amount: 0.4 }}
                            className="perspective-1000"
                        >
                            <TiltCard className="w-full h-full">
                                {/* Added `transform-gpu` for better rendering performance of 3D transforms */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl transition-all duration-300 hover:shadow-cyan-500/30 h-full flex flex-col items-start text-left transform-gpu">
                                    
                                    {/* Icon & ID */}
                                    {/* ENHANCED ANIMATION: Added pulse/lift effect on hover for the icon container */}
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className={`w-14 h-14 p-3 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.gradient} shadow-lg shadow-slate-300/50 cursor-pointer`}
                                    >
                                        <item.Icon className="w-full h-full text-white" />
                                    </motion.div>
                                    
                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 flex-grow">
                                        {item.detail}
                                    </p>
                                    
                                    {/* Callout Link (Remains gradient for pop) */}
                                    <div className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${item.gradient} flex items-center`}>
                                        Learn More
                                        <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>

            </div>
            
             {/* CSS for Tilt Perspective */}
             <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
};

export default WhyChooseUsSection;