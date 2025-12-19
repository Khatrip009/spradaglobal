import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ================= ICONS ================= */

const MapPin = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 21.7c-3.3 0-6-2.7-6-6s6-15 6-15 6 11.7 6 15-2.7 6-6 6z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Mail = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MessageSquare = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ExternalLink = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/* ================= DATA ================= */

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Office",
    primary: "359, A R Mall, Mota Varachha, Surat",
    secondary: "Gujarat, India - 394101",
    href: "https://www.google.com/maps/search/?api=1&query=359+A+R+Mall+Mota+Varachha+Surat+Gujarat+394101",
    action: "Get Directions",
    gradient: "from-blue-500 to-indigo-600",
    actionIcon: ExternalLink,
  },
  {
    icon: Mail,
    title: "Email Us",
    primary: "sprada2globalexim@gmail.com",
    secondary: "We usually reply within 24 hours",
    href: "mailto:sprada2globalexim@gmail.com",
    action: "Send Email",
    gradient: "from-emerald-500 to-teal-600",
    actionIcon: Mail,
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business",
    primary: "+91 98765 43210",
    secondary: "Available 24/7",
    href: "https://wa.me/919876543210",
    action: "Chat Now",
    gradient: "from-orange-500 to-red-600",
    actionIcon: MessageSquare,
  },
];

/* ================= 3D TILT CARD ================= */

const TiltCard = ({ children }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 220, damping: 28 });
  const sy = useSpring(my, { stiffness: 220, damping: 28 });

  // ⬇️ Reduce horizontal rotation (major fix)
  const rx = useTransform(sy, [-120, 120], [12, -12]);
  const ry = useTransform(sx, [-120, 120], [-8, 8]);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -16 }}
      transition={{ type: "spring", stiffness: 180 }}
      className="
        relative
        isolation-isolate
        will-change-transform
      "
    >
      {children}
    </motion.div>
  );
};

/* ================= MAIN ================= */

const ContactUsSection = () => (
  <section className="relative py-36 bg-gradient-to-b from-white via-slate-50 to-white overflow-visible">
    {/* Background energy */}
    <motion.div
      aria-hidden
      className="absolute -top-40 -right-40 w-[45rem] h-[45rem] bg-gradient-to-br from-indigo-300/30 to-cyan-300/30 rounded-full blur-3xl"
      animate={{ scale: [1, 1.15, 1], rotate: [0, 12, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="relative max-w-7xl mx-auto px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-center mb-24"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">
          Get In Touch
        </p>
        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mt-2">
          Let’s Build Your Global Trade Advantage
        </h2>
      </motion.div>

      {/* Cards Grid — KEY FIX */}
      <div
        className="
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
          gap-16
          perspective-[1400px]
          overflow-visible
        "
      >
        {contactInfo.map((item, i) => {
          const Icon = item.icon;
          const ActionIcon = item.actionIcon;

          return (
            <TiltCard key={i}>
                <div
                  className="
                    relative
                    max-w-[22rem]
                    mx-auto
                    bg-white/85 backdrop-blur-xl
                    rounded-3xl
                    border border-slate-200
                    shadow-2xl
                    p-8
                    overflow-visible
                  "
                >
              {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.15, rotateZ: 6 }}
                  className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl`}
                >
                  <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                </motion.div>

                <h4 className="font-extrabold text-slate-900 text-lg">
                  {item.title}
                </h4>
                <p className="font-semibold text-slate-800 break-all">
                  {item.primary}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {item.secondary}
                </p>

                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-sm text-slate-800 hover:opacity-80 transition"
                >
                  {item.action}
                  <ActionIcon className="w-4 h-4" />
                </a>

                {/* Edge glow */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  </section>
);

export default ContactUsSection;
