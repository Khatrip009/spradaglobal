import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  User,
  Building2,
  Mail,
  Phone,
  Globe2,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { apiPost } from "@/lib/api";

/* =====================================================
   PREMIUM + FUN CONTACT FORM MODAL
===================================================== */

export default function ContactForm({
  open,
  onClose,
  context = "general",
  product = null
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    message: ""
  });

  if (!open) return null;

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiPost("/api/leads", {
        ...form,
        context,
        product_id: product?.id || null,
        product_name: product?.title || null
      });

      onClose();
      alert("Thank you! Our export team will contact you shortly.");
    } catch {
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const title =
    context === "specification"
      ? "Request Specifications"
      : "Start a Conversation";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* MODAL */}
        <motion.div
          initial={{ y: 90, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className="
            relative z-10 w-full max-w-2xl
            bg-gradient-to-br from-white via-[#fbfbf9] to-white
            rounded-3xl shadow-[0_50px_140px_rgba(0,0,0,0.65)]
            max-h-[90vh] flex flex-col
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-8 py-5 border-b">
            <div className="flex items-center gap-4">
              <img
                src="/images/SPRADA_LOGO.png"
                alt="Sprada Global Exim"
                className="h-10 w-auto"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#164946]">
                    {title}
                  </h3>
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="
                      inline-flex items-center gap-1
                      text-xs font-bold
                      px-2 py-0.5 rounded-full
                      bg-[#d7b15b]/20 text-[#164946]
                    "
                  >
                    <Sparkles className="w-3 h-3" />
                    Quick
                  </motion.span>
                </div>

                <p className="text-xs text-gray-500">
                  Export enquiries handled within 24 hours
                </p>
              </div>
            </div>

            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-500 hover:text-black" />
            </button>
          </div>

          {/* BODY */}
          <div className="overflow-y-auto px-8 py-6">
            {product && (
              <div className="
                mb-6 rounded-2xl
                bg-gradient-to-r from-[#164946]/10 to-[#d7b15b]/10
                p-4 text-sm border
              ">
                <strong className="text-[#164946]">Product:</strong>{" "}
                {product.title}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <Input icon={User} name="name" label="Full Name" onChange={update} required />
              <Input icon={Building2} name="company" label="Company Name" onChange={update} />
              <Input icon={Mail} name="email" type="email" label="Email Address" onChange={update} required />
              <Input icon={Phone} name="phone" label="Phone / WhatsApp" onChange={update} />
              <Input icon={Globe2} name="country" label="Country" onChange={update} />

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Message / Requirement
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    name="message"
                    rows="4"
                    onChange={update}
                    className="
                      w-full rounded-xl border
                      pl-10 pr-4 py-2
                      focus:ring-2 focus:ring-[#d7b15b]
                      transition
                    "
                    placeholder="Quantity, destination country, packaging, certifications..."
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="
                  w-full mt-6
                  inline-flex items-center justify-center gap-2
                  bg-gradient-to-r from-[#164946] to-[#0e2f2c]
                  text-white font-extrabold
                  px-6 py-3 rounded-xl
                  shadow-lg
                "
              >
                {loading ? "Submitting..." : "Send Enquiry"}
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -----------------------------------------------------
   INPUT WITH ICON + FUN FOCUS
----------------------------------------------------- */

function Input({ label, name, type = "text", onChange, required, icon: Icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="
            absolute left-3 top-3
            text-gray-400 w-4 h-4
            group-focus-within:text-[#164946]
            transition
          " />
        )}
        <input
          type={type}
          name={name}
          onChange={onChange}
          required={required}
          className="
            w-full rounded-xl border
            pl-10 pr-4 py-2
            focus:ring-2 focus:ring-[#d7b15b]
            focus:border-[#d7b15b]
            transition
          "
        />
      </div>
    </div>
  );
}
