import React, { useRef, useState, useEffect } from "react";

/* ================= ICONS ================= */

const Clock = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Calendar = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AlertTriangle = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M10.29 3.86L1.83 19a2 2 0 0 0 1.77 3h16.8a2 2 0 0 0 1.77-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

/* ================= DATA ================= */

const BUSINESS_HOURS = [
  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 1:00 PM", isWeekend: true },
  { day: "Emergency Support", hours: "24/7 Available", isEmergency: true },
];

const getTodayDay = () => {
  const d = new Date().getDay();
  if (d >= 1 && d <= 5) return "Monday - Friday";
  if (d === 6) return "Saturday";
  return "";
};

/* ================= 3D TILT HOOK ================= */

const useTilt = () => {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;

      setStyle({
        transform: `
          perspective(1200px)
          rotateX(${dy * 14}deg)
          rotateY(${-dx * 14}deg)
          translateY(-6px)
          scale(1.04)
        `,
        boxShadow: `
          ${-dx * 30}px ${dy * 30}px 60px rgba(79,70,229,.35),
          0 20px 50px rgba(0,0,0,.18)
        `,
        transition: "transform .12s ease-out",
      });
    };

    const reset = () =>
      setStyle({
        transform: "perspective(1200px)",
        boxShadow: "0 18px 40px rgba(0,0,0,.15)",
        transition: "all .6s cubic-bezier(.03,.98,.52,.99)",
      });

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    reset();

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return [ref, style];
};

/* ================= CARD ================= */

const HoursCard = ({ item, isToday }) => {
  const [ref, tiltStyle] = useTilt();

  let Icon = Clock;
  if (item.isEmergency) Icon = AlertTriangle;
  if (item.isWeekend) Icon = Calendar;

  return (
    <div ref={ref} style={tiltStyle} className={`hours-card ${isToday ? "is-today" : ""}`}>
      <div className="glass" />
      <div className="content">
        <div className={`icon-box ${item.isEmergency ? "danger" : ""}`}>
          <Icon />
        </div>

        <h4>
          {item.day}
          {isToday && !item.isEmergency && <span className="badge">TODAY</span>}
        </h4>

        <p>{item.hours}</p>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */

const WorkingHours = () => {
  const today = getTodayDay();

  return (
    <section className="working-hours">
      <style>{`
        .working-hours {
          min-height: 100vh;
          padding: 6rem 1rem;
          background: radial-gradient(circle at top, #eef2ff, #f8fafc);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          max-width: 1100px;
          width: 100%;
          text-align: center;
        }

        h2 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
        }

        .subtitle {
          letter-spacing: .3em;
          font-weight: 800;
          text-transform: uppercase;
          background: linear-gradient(90deg,#4f46e5,#ec4899);
          -webkit-background-clip: text;
          color: transparent;
        }

        .desc {
          max-width: 720px;
          margin: 0 auto 4rem;
          font-size: 1.25rem;
          color: #475569;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 3rem;
          justify-items: center;
        }

        .hours-card {
          position: relative;
          width: 100%;
          max-width: 320px;
          background: #fff;
          border-radius: 1.75rem;
          padding: 2.75rem 2rem;
          transform-style: preserve-3d;
        }

        .glass {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.2));
          backdrop-filter: blur(18px);
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
        }

        .icon-box {
          width: 72px;
          height: 72px;
          margin: 0 auto 1.5rem;
          border-radius: 1rem;
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 5s ease-in-out infinite;
        }

        .icon-box svg {
          width: 36px;
          height: 36px;
          color: white;
        }

        .icon-box.danger {
          background: linear-gradient(135deg,#ef4444,#ec4899);
          animation: pulse 2.5s infinite;
        }

        h4 {
          font-size: 1.3rem;
          font-weight: 900;
          margin-bottom: .5rem;
        }

        p {
          font-size: 2rem;
          font-weight: 900;
        }

        .badge {
          margin-left: .5rem;
          font-size: .7rem;
          padding: .2rem .6rem;
          background: #4f46e5;
          color: white;
          border-radius: 999px;
        }

        .is-today {
          outline: 4px solid rgba(79,70,229,.25);
        }

        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,.6); }
          70% { box-shadow: 0 0 0 25px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>

      <div className="container">
        <p className="subtitle">Business Schedule</p>
        <h2>Always Open for Service</h2>
        <p className="desc">
          Our operations are structured for reliability and responsiveness, with emergency
          support available around the clock.
        </p>

        <div className="grid">
          {BUSINESS_HOURS.map((b, i) => (
            <HoursCard key={i} item={b} isToday={b.day === today} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkingHours;
