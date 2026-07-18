// src/components/CoreServicesPage.jsx
import React from "react";
import { motion } from "framer-motion";

// =================================================================================
// 1. ICONS (Lucide style)
// =================================================================================
const Plane = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 20l4-16l6 6l-10 4z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 13h5.5l1.5 3h12v-3l-7-4l-3 4H2z" />
        <path d="M12 18H5.5L7 15H11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Download = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
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

// =================================================================================
// 2. DATA
// =================================================================================
const SERVICES = [
  {
    id: "01",
    title: "Export Services",
    short: "Comprehensive export solutions",
    details: "We manage direct sourcing, rigorous quality testing, complete export documentation and smooth logistics to ensure timely international delivery.",
    Icon: Plane,
    gradient: "from-indigo-500 via-blue-600 to-purple-600",
  },
  {
    id: "02",
    title: "Import Services",
    short: "Trusted import solutions",
    details: "Leverage our network of global suppliers, gain compliance support, mandatory inspection checks and secure warehousing for all inbound goods.",
    Icon: Download,
    gradient: "from-green-400 via-emerald-500 to-teal-500",
  },
  {
    id: "03",
    title: "Supplier Network",
    short: "Verified suppliers and farmers",
    details: "Our network is built on verified partnerships, promoting sustainable sourcing and offering full traceability from farm to final destination.",
    Icon: Users,
    gradient: "from-amber-400 via-orange-500 to-red-500",
  },
];

// =================================================================================
// 3. MAIN COMPONENT – Simplified
// =================================================================================
const CoreServicesPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-pink-600 mb-2">
            Our Core Offerings
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Seamless Global Trade Solutions
          </h1>
          <p className="text-lg text-slate-500 mt-3">
            A trusted suite of services covering the entire trade lifecycle, from sourcing to final delivery.
          </p>
        </motion.div>

        {/* Services Grid – simple cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {SERVICES.map((service, index) => {
            const Icon = service.Icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-start"
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-md mb-5`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {service.title}
                </h3>

                {/* Short description */}
                <p className="text-sm font-semibold text-slate-600 mb-3">
                  {service.short}
                </p>

                {/* Details */}
                <p className="text-sm text-slate-500 leading-relaxed">
                  {service.details}
                </p>

                {/* Decorative line */}
                <div className={`mt-4 w-12 h-1 rounded-full bg-gradient-to-r ${service.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoreServicesPage;