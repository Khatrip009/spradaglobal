// src/components/CTASection.jsx
import React from "react";

/* =========================================================================
   SIMPLE BUTTON COMPONENT (kept as is)
   ========================================================================= */
const Button = ({ children, className, as = "button", href, ...props }) => {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4";

  if (as === "a") {
    return (
      <a href={href} className={`${base} ${className}`} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
};

/* =========================================================================
   CTA SECTION – SIMPLIFIED
   ========================================================================= */
const CTASection = ({ onRequestQuote }) => {
  return (
    <div className="bg-[#f7f7f7] py-20 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg p-8 sm:p-12 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Ready to Start Your Import - Export Journey?
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed mb-8">
          Join satisfied customers worldwide who trust SPRADA2GLOBAL EXIM for
          premium peanuts and dependable global trade services.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {/* Request Quote */}
          <Button
            as="button"
            onClick={onRequestQuote}
            className="bg-[#D7B15B] text-[#33504F] hover:bg-[#c9a44e] hover:shadow-lg"
            aria-label="Request a quote"
          >
            Request Quote
          </Button>

          {/* Download Catalog */}
          <Button
            as="a"
            href="/catalog/SPRADA2GLOBAL-Catalog.pdf"
            className="border-2 border-[#33504F] text-[#33504F] hover:bg-[#33504F]/5 hover:shadow-lg"
            download
            aria-label="Download product catalog"
          >
            Download Catalog
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;