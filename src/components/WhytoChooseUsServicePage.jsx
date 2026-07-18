import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  Truck,
  Handshake,
  FileCheck,
  MessageCircle
} from "lucide-react";

/* =====================================================
   WHY CHOOSE SPRADA2GLOBAL (SIMPLIFIED)
===================================================== */

const features = [
  {
    icon: ShieldCheck,
    title: "Quality & Compliance",
    text:
      "Products are sourced from audited suppliers with strict checks on quality, packaging and labeling as per destination-country regulations. Complete and accurate documentation minimizes customs delays and ensures buyer confidence."
  },
  {
    icon: FileCheck,
    title: "Transparent Trade Practices",
    text:
      "Every shipment is carefully planned from sourcing to documentation, ensuring compliance with international standards and buyer requirements while maintaining competitive pricing and consistent quality."
  },
  {
    icon: MessageCircle,
    title: "Clear Communication & Service",
    text:
      "Clients receive proactive communication at every stage—from enquiry and sampling to shipment and post-delivery support—backed by quick responses and a dedicated contact person."
  },
  {
    icon: Handshake,
    title: "Long-Term Partnership Focus",
    text:
      "We focus on repeat, stable business by understanding client-specific quality, quantity and branding needs. Flexible terms and a solution-oriented approach support long-term growth."
  },
  {
    icon: Globe2,
    title: "Trusted Global Sourcing",
    text:
      "Strong partnerships with verified manufacturers, suppliers, and distributors worldwide ensure reliability, scalability and consistent supply across multiple product categories."
  },
  {
    icon: Truck,
    title: "Worldwide Reach",
    text:
      "Reliable import and export operations serving buyers across global markets with timely delivery, compliant logistics and professional execution."
  }
];

/* -----------------------------------------------------
   Component – simplified animations
----------------------------------------------------- */

export default function WhyChooseSprada() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-[#f7f7f5] to-white overflow-hidden">
      {/* Decorative backgrounds (kept, but no animation) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#d7b15b]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#164946]/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header – single fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Why Choose{" "}
            <span className="text-[#164946]">Sprada</span>
            <span className="text-[#d7b15b]">2Global</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            SPRADA2GLOBAL EXIM is a professionally managed import–export firm connecting reliable producers with quality-conscious buyers across global markets—focused on transparency, compliance and long-term partnerships.
          </p>
        </motion.div>

        {/* Cards – simple staggered fade-in */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#164946] text-white mb-6 shadow-md">
                  <Icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#164946] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}