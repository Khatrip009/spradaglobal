import React, { useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence } from "framer-motion";

// =================================================================================
// 1. CERTIFICATION DATA & PLACEHOLDERS
// =================================================================================
const CERTIFICATES = [
    {
    id: 'iec',
    name: "Import Export Code (IEC)",
    desc: "Mandatory authorization issued by DGFT for international import and export operations.",
    imgUrl: "/images/certificates/IEC.jpg",
    color: "bg-blue-500",
  },
     {
    id: 'msme',
    name: "MSME Registration",
    desc: "Registered as a Micro, Small, or Medium Enterprise under Government of India.",
    imgUrl: "/images/certificates/MSME.jpg",
    color: "bg-green-500",
  },
    {
    id: 'rcmc',
    name: "RCMC Certificate",
    desc: "Registration-Cum-Membership Certificate validating exporter credibility and compliance.",
    imgUrl: "/images/certificates/RCMC.jpg",
    color: "bg-orange-500",
  },
    {
        id: 'fssai',
        name: "FSSAI License",
        desc: "Food safety and quality compliance certificate.",
        imgUrl: "https://placehold.co/800x500/ef4444/ffffff?text=FSSAI+Food+Safety",
        color: "bg-red-500",
    },
    {
    id: 'gst',
    name: "GST Registration",
    desc: "Goods and Services Tax compliant entity, ensuring transparent and lawful trade operations.",
    imgUrl: "/images/certificates/gst01.jpg",
    color: "bg-purple-500",
  },
    {
        id: 'iso',
        name: "ISO Certified",
        desc: "International standard for quality management systems.",
        imgUrl: "https://placehold.co/800x500/06b6d4/ffffff?text=ISO+Quality+Standard",
        color: "bg-cyan-500",
    },
];


// =================================================================================
// 2. 3D CERTIFICATE CARD COMPONENT
// =================================================================================

const CertificateCard = ({ item, index, onClick }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 400, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 400, damping: 20 });

    const rotateX = useTransform(mouseY, [-50, 50], [10, -10]);
    const rotateY = useTransform(mouseX, [-50, 50], [-10, 10]);

    const imageX = useTransform(mouseX, [-50, 50], [15, -15]);
    const imageY = useTransform(mouseY, [-50, 50], [15, -15]);
    
    const shadowOpacity = useTransform(mouseX, [-50, 50], [0.1, 0.2]);

    const onMouseMove = ({ clientX, clientY }) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        x.set(clientX - left - width / 2);
        y.set(clientY - top - height / 2);
    };

    const onMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            key={item.id}
            className="perspective-1000"
            // ENTRANCE ANIMATION
            initial={{ opacity: 0, scale: 0.8, rotateX: 30, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
            viewport={{ once: true, amount: 0.4 }}
        >
            <motion.div
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={() => onClick(item)} // Added click handler
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    boxShadow: useTransform(shadowOpacity, opacity => 
                        `0 25px 50px -12px rgba(0, 0, 0, ${opacity * 0.5}), 0 0 100px rgba(0, 0, 0, ${opacity * 0.8})`
                    ),
                }}
                className="w-full bg-white rounded-3xl p-6 border-4 border-slate-100 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/30 transform-gpu overflow-hidden cursor-pointer"
            >
                {/* 3D Image Container */}
                <motion.div
                    style={{ 
                        x: imageX, 
                        y: imageY,
                        translateZ: 30 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="mb-4 rounded-xl overflow-hidden shadow-lg border-2 border-slate-50 relative aspect-[4/2.5] w-full"
                >
                    <img 
                        src={item.imgUrl} 
                        alt={`${item.name} Placeholder`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/AAAAAA/000000?text=Certificate+Image" }}
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"></div>
                </motion.div>

                {/* Text Content */}
                <motion.div style={{ translateZ: 10 }}>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase rounded-full text-white ${item.color} mb-2`}>
                        {item.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {item.name}
                    </h3>
                    <p className="text-slate-600 text-sm">
                        {item.desc}
                    </p>
                </motion.div>
                
            </motion.div>
        </motion.div>
    );
};

// =================================================================================
// 3. MODAL COMPONENT (High-Impact 3D Preview)
// =================================================================================

const CertificateModal = ({ certificate, onClose }) => {
    // Only render if a certificate is selected
    if (!certificate) return null;

    return (
        // Modal Backdrop: Fixed, covers screen, closes on click outside
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 transition-all duration-300"
        >
            {/* Modal Content Container */}
            <motion.div
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the content
                // 3D Entrance/Exit Animation
                initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                // --- EDITED: Added max-h-[90vh] and overflow-y-auto for constrained scrolling frame ---
                className="relative bg-white rounded-3xl p-6 md:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto perspective-1000 shadow-2xl"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-700 hover:text-red-600 transition duration-200 z-10 p-2 rounded-full bg-white/50 backdrop-blur-sm"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                {/* Header */}
                <h2 className="text-2xl font-extrabold text-slate-900 mb-4">{certificate.name}</h2>
                <p className="text-sm text-slate-600 mb-6">{certificate.desc}</p>

                {/* Full Image Preview */}
                <div className="rounded-xl overflow-hidden border-4 border-slate-100 shadow-xl">
                    <img 
                        src={certificate.imgUrl} 
                        alt={`${certificate.name} Preview`} 
                        className="w-full h-auto object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x500/AAAAAA/000000?text=Certificate+Preview" }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

// =================================================================================
// 4. MAIN COMPONENT: CertificateSection
// =================================================================================
const CertificateSection = () => {
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    const handleCardClick = (certificate) => {
        setSelectedCertificate(certificate);
    };

    const closeModal = () => {
        // Clear selected certificate which will unmount the modal
        setSelectedCertificate(null);
    };

    return (
        <div className="relative w-full py-24 md:py-32 bg-slate-50 overflow-hidden font-sans">
            
            {/* Background Geometric Pattern */}
            <div className="absolute inset-0 opacity-10">
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
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
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
                        <CertificateCard 
                            key={item.id} 
                            item={item} 
                            index={index} 
                            onClick={handleCardClick} // Pass the click handler
                        />
                    ))}
                </div>
            </div>
            
            {/* Modal Layer: Uses AnimatePresence for smooth transitions */}
            <AnimatePresence>
                {selectedCertificate && (
                    <CertificateModal 
                        certificate={selectedCertificate} 
                        onClose={closeModal} 
                    />
                )}
            </AnimatePresence>
            
             {/* CSS for Tilt Perspective */}
             <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
};

export default CertificateSection;