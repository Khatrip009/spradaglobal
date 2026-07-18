// src/components/AboutUsSection.jsx
import React from "react";

// =================================================================================
// 1. ICONS
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
    gradient: "from-teal-500 to-cyan-600",
    badge: "Worldwide",
  },
  {
    id: 2,
    title: "Multi-Category Expertise",
    desc: "A diversified export portfolio sourced directly from verified manufacturing partners. Reliable logistics and timely worldwide delivery",
    Icon: LayersIcon,
    gradient: "from-amber-500 to-red-500",
    badge: "Diverse",
  },
  {
    id: 3,
    title: "Verified Manufacturers",
    desc: "Compliance with international trade and quality standards. Direct sourcing from import-export-ready manufacturers with international certifications.",
    Icon: FactoryIcon,
    gradient: "from-green-500 to-teal-500",
    badge: "Certified",
  },
  {
    id: 4,
    title: "Compliance & Trust",
    desc: "Efficient handling, packaging, and documentation. Documentation, certifications and regulatory compliance handled seamlessly",
    Icon: ShieldIcon,
    gradient: "from-teal-600 to-amber-500",
    badge: "Secure",
  },
];

// =================================================================================
// 3. MAIN COMPONENT – Simplified
// =================================================================================
const AboutUsSection = () => {
  return (
    <div className="relative bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      
      {/* Background blobs (static, no animation) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-teal-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-amber-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* === HEADER SECTION === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          
          {/* Text Content – simple fade-in with CSS */}
          <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm mb-6">
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
                <span className="text-teal-700 font-bold">Sprada2Global</span> is a professionally managed import–export company delivering reliable, scalable and fully compliant trade solutions.
              </p>
              <div className="h-px w-full bg-gradient-to-r from-slate-300 to-transparent my-4"></div>
              <p className="text-slate-600 leading-relaxed">
                With extensive experience in international trade, we specialize in importing and exporting a wide variety of goods across industries. Our focus on quality, transparency and efficient logistics enables us to build long-term global partnerships.
              </p>
            </div>
          </div>

          {/* Abstract Visual – simplified, no motion */}
          <div className="relative h-[500px] w-full hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 rounded-[2rem] shadow-2xl transform rotate-3 opacity-90"></div>
            <div className="absolute inset-0 bg-slate-900 rounded-[2rem] shadow-2xl transform -rotate-2 scale-[0.98] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="text-center p-8">
                <h3 className="text-4xl font-black text-white mb-2">SPRADA</h3>
                <div className="text-amber-400 font-bold tracking-[0.5em] text-sm">GLOBAL EXIM</div>
              </div>
            </div>
            
            {/* Floating Badge – simple */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                  <ShieldIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800">100% Secure</span>
              </div>
              <p className="text-xs text-slate-500">Fully compliant & certified trade operations.</p>
            </div>
          </div>
        </div>

        {/* === GRID FEATURES === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.id}
              className="group h-full bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-300 flex flex-col items-start relative overflow-hidden opacity-0 animate-fadeInUp"
              style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2 py-1 rounded-md bg-white/50">
                {feature.badge}
              </div>

              {/* Icon */}
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-40 blur-lg group-hover:opacity-60 transition-opacity duration-300`}></div>
                <feature.Icon className="relative z-10 w-8 h-8 text-slate-800" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {feature.desc}
              </p>

              {/* Decorative line */}
              <div className={`mt-auto w-12 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500`}></div>
            </div>
          ))}
        </div>

      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AboutUsSection;