// src/components/CertificateSection.jsx

import React, { useEffect, useState } from "react";
import { getCertifications, toAbsoluteImageUrl } from "../lib/api";

// =================================================================================
// CERTIFICATION CARD
// =================================================================================

const CertificateCard = ({ item, index, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = item?.logo_url
    ? toAbsoluteImageUrl(item.logo_url) || item.logo_url
    : null;

  return (
    <div
      className="group opacity-0 translate-y-5 animate-fadeInUp"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <button
        type="button"
        onClick={() => onClick(item)}
        className="w-full text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label={`View ${item.title} certification`}
      >
        {/* ================================================================
            IMAGE
        ================================================================= */}
        <div className="mb-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <div className="aspect-[4/2.5] w-full flex items-center justify-center p-4">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={item.title || "Certification"}
                loading="lazy"
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.045-.133-2.06-.382-3.016z"
                    />
                  </svg>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  Certification logo unavailable
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================
            CONTENT
        ================================================================= */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full text-blue-700 bg-blue-50 border border-blue-100">
              Certified
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
            {item.title || "Certification"}
          </h3>

          <p className="text-slate-600 text-sm leading-6 line-clamp-3 min-h-[72px]">
            {item.short_details ||
              "Certification and compliance information."}
          </p>

          {/* View link */}
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
            <span>View certification</span>

            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

// =================================================================================
// CERTIFICATION MODAL
// =================================================================================

const CertificateModal = ({ certificate, onClose }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = certificate?.logo_url
    ? toAbsoluteImageUrl(certificate.logo_url) ||
      certificate.logo_url
    : null;

  // Lock body scroll + Escape key
  useEffect(() => {
    if (!certificate) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [certificate, onClose]);

  // Reset image state whenever another certificate opens
  useEffect(() => {
    setImageError(false);
  }, [certificate]);

  if (!certificate) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ================================================================
            CLOSE BUTTON
        ================================================================= */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-white shadow-sm transition"
          aria-label="Close certification preview"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* ================================================================
            HEADER
        ================================================================= */}
        <div className="px-5 pt-6 pr-16 md:px-8 md:pt-8 md:pr-20">
          <span className="inline-flex items-center px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full text-blue-700 bg-blue-50 border border-blue-100 mb-3">
            Certification
          </span>

          <h2
            id="certificate-modal-title"
            className="text-2xl md:text-3xl font-bold text-slate-900 mb-2"
          >
            {certificate.title || "Certification"}
          </h2>

          <p className="text-slate-600 leading-7 mb-6">
            {certificate.short_details ||
              "Certification and compliance information."}
          </p>
        </div>

        {/* ================================================================
            CERTIFICATE IMAGE
        ================================================================= */}
        <div className="mx-5 mb-5 md:mx-8 md:mb-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[260px] flex items-center justify-center">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={`${certificate.title || "Certification"} preview`}
              className="w-full h-auto max-h-[70vh] object-contain p-3 md:p-5"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="py-16 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.045-.133-2.06-.382-3.016z"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium text-slate-600">
                Certification image unavailable
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================================================================================
// MAIN CERTIFICATION SECTION
// =================================================================================

const CertificateSection = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===========================================================================
  // LOAD CERTIFICATIONS FROM SUPABASE
  // ===========================================================================

  useEffect(() => {
    let mounted = true;

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          getCertifications() returns:

          {
            certifications: [...],
            total: number
          }
        */

        const response = await getCertifications();

        if (!mounted) return;

        const list = Array.isArray(response)
          ? response
          : response?.certifications || [];

        const normalized = list
          .filter(
            (certificate) =>
              certificate &&
              certificate.is_published !== false
          )
          .sort(
            (a, b) =>
              Number(a?.sort_order || 0) -
              Number(b?.sort_order || 0)
          );

        setCertificates(normalized);
      } catch (err) {
        console.error(
          "[CertificateSection] Failed to load certifications:",
          err
        );

        if (!mounted) return;

        setCertificates([]);
        setError(
          "Unable to load certification information right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCertificates();

    return () => {
      mounted = false;
    };
  }, []);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <section
      id="certifications"
      className="relative w-full py-24 md:py-32 bg-slate-50 overflow-hidden font-sans"
    >
      {/* =====================================================================
          DECORATIVE BACKGROUND
      ====================================================================== */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="certificate-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 32 L 32 0"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#certificate-grid)"
          />
        </svg>
      </div>

      {/* =====================================================================
          CONTENT
      ====================================================================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================================================================
            HEADER
        ==================================================================== */}
        <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
          <p className="text-base font-bold uppercase tracking-widest text-blue-600 mb-2">
            Certified &amp; Compliant
          </p>

          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Global Standard, Local Trust
          </h2>

          <p className="text-lg text-slate-600 mt-4 leading-8">
            Our certifications and registrations reflect our
            commitment to regulatory compliance, quality
            standards, and dependable international trade.
          </p>
        </div>

        {/* ===================================================================
            LOADING STATE
        ==================================================================== */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg animate-pulse"
              >
                <div className="aspect-[4/2.5] rounded-xl bg-slate-200 mb-4" />

                <div className="h-5 w-24 bg-slate-200 rounded-full mb-3" />

                <div className="h-6 w-3/4 bg-slate-200 rounded mb-3" />

                <div className="h-4 w-full bg-slate-200 rounded mb-2" />

                <div className="h-4 w-5/6 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            ERROR STATE
        ==================================================================== */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto text-center bg-white border border-red-100 rounded-2xl shadow-sm px-6 py-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 9v3m0 4h.01M10.29 3.86l-7.13 12A2 2 0 004.87 19h14.26a2 2 0 001.71-3.14l-7.13-12a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>

            <p className="text-red-600 font-medium">
              {error}
            </p>
          </div>
        )}

        {/* ===================================================================
            EMPTY STATE
        ==================================================================== */}
        {!loading &&
          !error &&
          certificates.length === 0 && (
            <div className="max-w-2xl mx-auto text-center bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-10">
              <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.045-.133-2.06-.382-3.016z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                Certifications
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Certification information will be available here
                soon.
              </p>
            </div>
          )}

        {/* ===================================================================
            CERTIFICATION GRID
        ==================================================================== */}
        {!loading &&
          !error &&
          certificates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {certificates.map((certificate, index) => (
                <CertificateCard
                  key={certificate.id}
                  item={certificate}
                  index={index}
                  onClick={setSelectedCertificate}
                />
              ))}
            </div>
          )}
      </div>

      {/* =====================================================================
          MODAL
      ====================================================================== */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* =====================================================================
          ANIMATION
      ====================================================================== */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeInUp {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
};

export default CertificateSection;