import React from "react";
import { motion } from "framer-motion";

// =================================================================================
// 1. ICONS (Lucide style)
// =================================================================================
const MessageCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const Search = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const FileText = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"></path>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
);
const Package = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.89 2.07l.08.14a2 2 0 0 0 .76 1.48L20 8"></path>
    <path d="M2.07 12.89l.14-.08a2 2 0 0 0 1.48-.76L8 4"></path>
    <path d="M4 12V2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10"></path>
    <rect x="2" y="12" width="20" height="8" rx="2"></rect>
    <path d="M12 20v2"></path>
  </svg>
);
const ShieldCheck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);
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
// 2. DATA
// =================================================================================
const STEPS = [
  {
    id: "01",
    title: "Consultation",
    short: "Understand requirements",
    details: "In-depth analysis of your needs, market feasibility and legal frameworks to define the project scope.",
    Icon: MessageCircle,
    gradient: "from-indigo-400 via-blue-500 to-sky-500",
  },
  {
    id: "02",
    title: "Sourcing",
    short: "Procurement & QC",
    details: "Strategic acquisition of materials coupled with rigorous quality control checks at the origin.",
    Icon: Search,
    gradient: "from-pink-500 via-rose-500 to-red-500",
  },
  {
    id: "03",
    title: "Quality Assurance",
    short: "Testing & certification",
    details: "Comprehensive multi-stage testing, stress assessments and official third-party compliance certification.",
    Icon: ShieldCheck,
    gradient: "from-cyan-400 via-blue-500 to-indigo-500",
  },
  {
    id: "04",
    title: "Processing",
    short: "Packing for export",
    details: "Customized preservation, smart labeling, optimized loading and secure, climate-controlled container preparation.",
    Icon: Package,
    gradient: "from-amber-300 via-orange-400 to-red-400",
  },
  {
    id: "05",
    title: "Documentation",
    short: "Export documents & compliance",
    details: "Full management of customs forms, regulatory clearances and all necessary international export permits.",
    Icon: FileText,
    gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
  },
  {
    id: "06",
    title: "Logistics",
    short: "Shipping & delivery",
    details: "Final mile tracking, rapid customs passage and guaranteed door-to-door delivery within the stipulated timeline.",
    Icon: Truck,
    gradient: "from-emerald-400 via-green-500 to-teal-500",
  },
];

// =================================================================================
// 3. MAIN COMPONENT – Simplified
// =================================================================================
const FeatureUnboxing = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-32 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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

        {/* Grid of Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 md:gap-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col items-center text-center bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Icon Container */}
                <div className={`w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg mb-4`}>
                  <step.Icon className="w-10 h-10" />
                </div>

                {/* Step Number */}
                <span className="text-sm font-bold text-slate-400 tracking-widest mb-1">
                  {step.id}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {step.title}
                </h3>

                {/* Short description */}
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  {step.short}
                </p>

                {/* Details */}
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.details}
                </p>

                {/* Bottom accent line */}
                <div className={`mt-4 w-12 h-1 rounded-full bg-gradient-to-r ${step.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureUnboxing;