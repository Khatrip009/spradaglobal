import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =================================================================================
// 1. CERTIFICATION DATA – UPDATED WITH YOUR ACTUAL FILE NAMES
// =================================================================================
const CERTIFICATES = [
  {
    id: "iec",
    name: "Import Export Code (IEC)",
    desc: "Mandatory authorization issued by DGFT for international import and export operations.",
    imgUrl: "/images/certificates/IEC.jpg",
    color: "bg-blue-500",
  },
  {
    id: "msme",
    name: "MSME Registration",
    desc: "Registered as a Micro, Small, or Medium Enterprise under Government of India.",
    imgUrl: "/images/certificates/MSME.jpg",
    color: "bg-green-500",
  },
  {
    id: "rcmc",
    name: "RCMC Certificate",
    desc: "Registration-Cum-Membership Certificate validating exporter credibility and compliance.",
    imgUrl: "/images/certificates/RCMC.jpg",
    color: "bg-orange-500",
  },
  {
    id: "fssai",
    name: "FSSAI License",
    desc: "Food safety and quality compliance certificate – Central License for export operations.",
    imgUrl: "/images/certificates/FSSAI LICENCE Page_page-0001.jpg", // exact filename
    color: "bg-red-500",
  },
  {
    id: "gst",
    name: "GST Registration",
    desc: "Goods and Services Tax compliant entity, ensuring transparent and lawful trade operations.",
    imgUrl: "/images/certificates/gst01.jpg",
    color: "bg-purple-500",
  },
  
  // --- NEW CERTIFICATES ---
  {
    id: "gmp",
    name: "GMP Certification",
    desc: "Good Manufacturing Practices certification ensuring quality production standards.",
    imgUrl: "/images/certificates/SPRADA2GLOBAL EXIM,,GMP FINAL (1)_page-0001.jpg",
    color: "bg-teal-500",
  },
  {
    id: "haccp",
    name: "HACCP Certification",
    desc: "Hazard Analysis and Critical Control Points system for food safety.",
    imgUrl: "/images/certificates/SPRADA2GLOBAL EXIM,,HACCP FINAL (2)_page-0001.jpg",
    color: "bg-indigo-500",
  },
];

// =================================================================================
// 2. SIMPLE CERTIFICATE CARD (NO 3D)
// =================================================================================
const CertificateCard = ({ item, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.3 }}
      className="group"
    >
      <div
        onClick={() => onClick(item)}
        className="w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      >
        {/* Image Container */}
        <div className="mb-4 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
          <div className="aspect-[4/2.5] w-full flex items-center justify-center">
            <img
              src={item.imgUrl}
              alt={item.name}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/800x500/AAAAAA/000000?text=Certificate+Image";
              }}
            />
          </div>
        </div>

        {/* Text Content */}
        <div>
          <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full text-white ${item.color} mb-2`}>
            {item.id}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
          <p className="text-slate-600 text-sm">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

// =================================================================================
// 3. MODAL COMPONENT (SIMPLE)
// =================================================================================
const CertificateModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-700 hover:text-red-600 transition z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">{certificate.name}</h2>
        <p className="text-slate-600 mb-6">{certificate.desc}</p>

        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
          <img
            src={certificate.imgUrl}
            alt={`${certificate.name} Preview`}
            className="w-full h-auto max-h-[70vh] object-contain p-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/800x500/AAAAAA/000000?text=Certificate+Preview";
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// =================================================================================
// 4. MAIN COMPONENT
// =================================================================================
const CertificateSection = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  return (
    <div className="relative w-full py-24 md:py-32 bg-slate-50 overflow-hidden font-sans">
      {/* Background Pattern (optional) */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 0 32 L 32 0" stroke="#CBD5E1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24 max-w-2xl mx-auto"
        >
          <p className="text-base font-bold uppercase tracking-widest text-blue-600 mb-2">
            Certified & Compliant
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Global Standard, Local Trust
          </h2>
          <p className="text-lg text-slate-600 mt-4">
            Our adherence to key regulatory and quality certifications ensures secure and dependable trade worldwide.
          </p>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {CERTIFICATES.map((item, index) => (
            <CertificateCard key={item.id} item={item} index={index} onClick={setSelectedCertificate} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <CertificateModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateSection;