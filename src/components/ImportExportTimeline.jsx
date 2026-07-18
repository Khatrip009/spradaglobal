import React from "react";
import { motion } from "framer-motion";

// =================================================================================
// 1. ICONS (Lucide style)
// =================================================================================
const Search = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const Filter = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
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
    title: "Sourcing & Procurement",
    short: "Verified Origins",
    details: "Strategic vetting & audit trails. Identifying reliable suppliers and products worldwide",
    Icon: Search,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "02",
    title: "Inspection & Quality Control",
    short: "Precision Prep",
    details: "Hygiene control & micro-grading. Ensuring products meet agreed specifications and standards",
    Icon: Filter,
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    id: "03",
    title: "Packaging & Documentation",
    short: "Secure Seal",
    details: "Smart labeling & optimized loads. Secure packaging and accurate trade documentation",
    Icon: Package,
    gradient: "from-amber-300 to-orange-400",
  },
  {
    id: "04",
    title: "Compliance & Clearance",
    short: "Lab Certified",
    details: "Global compliance & purity checks. Managing regulatory, customs and certification requirements.",
    Icon: ShieldCheck,
    gradient: "from-violet-400 to-purple-500",
  },
  {
    id: "05",
    title: "Global Logistics",
    short: "Fast Track",
    details: "Live tracking & rapid clearance. Efficient import and export shipping with trusted logistics partners",
    Icon: Truck,
    gradient: "from-emerald-400 to-green-500",
  },
];

// =================================================================================
// 3. MAIN COMPONENT – Simplified
// =================================================================================
const ImportExportTimeline = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight">
          The Journey
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          From sourcing to final delivery, we follow a structured and transparent process to ensure smooth import and export operations across all product categories.
        </p>
      </div>

      {/* Grid of Steps – simple cards with hover effect */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {STEPS.map((step, index) => {
          const Icon = step.Icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
            >
              {/* Icon with gradient background */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-md mb-4`}>
                <Icon className="w-10 h-10" />
              </div>

              {/* Step number */}
              <span className="text-sm font-bold text-slate-400 tracking-wider mb-1">
                {step.id}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-800 mb-1">
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

              {/* Decorative line */}
              <div className={`mt-4 w-12 h-1 rounded-full bg-gradient-to-r ${step.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ImportExportTimeline;