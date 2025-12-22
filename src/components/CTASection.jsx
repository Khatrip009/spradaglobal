import React from "react";

/* =========================================================================
   SIMPLE BUTTON COMPONENT
   ========================================================================= */

const Button = ({ children, className, as = "button", href, ...props }) => {
  const base =
    "cta-button transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4";

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
   CTA SECTION
   ========================================================================= */

const CTASection = ({ onRequestQuote }) => {
  const styles = `
    .cta-wrapper {
      --bg-page:#f7f7f7;
      --bg-light:#ffffff;
      --accent-gold:#D7B15B;
      --color-dark:#1f2937;
      --color-brand:#33504F;
      --border-color:rgba(0,0,0,0.08);
      background:var(--bg-page);
      padding:5rem 1rem;
    }

    .cta-section {
      padding:3rem 2rem;
      background:var(--bg-light);
      border-radius:1rem;
      border:1px solid var(--border-color);
      box-shadow:0 8px 30px rgba(0,0,0,0.07);
      text-align:center;
      font-family:Inter,sans-serif;
    }

    .cta-title {
      font-size:2.25rem;
      font-weight:800;
      margin-bottom:.75rem;
      color:var(--color-dark);
    }

    .cta-description {
      max-width:48rem;
      margin:0 auto 2rem;
      color:rgba(31,41,55,.8);
      font-size:1.125rem;
    }

    .cta-buttons-container {
      display:flex;
      flex-wrap:wrap;
      gap:1.25rem;
      justify-content:center;
    }

    .cta-button {
      padding:.75rem 2rem;
      border-radius:.5rem;
      font-weight:700;
      text-decoration:none;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
    }

    .cta-button-primary {
      background:var(--accent-gold);
      color:var(--color-brand);
    }

    .cta-button-primary:hover {
      background:#e0bc60;
      box-shadow:0 0 0 3px var(--accent-gold);
    }

    .cta-button-outline {
      border:2px solid var(--color-brand);
      color:var(--color-brand);
      background:transparent;
    }

    .cta-button-outline:hover {
      background:rgba(51,80,79,.05);
      box-shadow:0 0 0 3px var(--color-brand);
    }
  `;

  return (
    <div className="cta-wrapper">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Your Import - Export Journey?</h2>

        <p className="cta-description">
          Join satisfied customers worldwide who trust SPRADA2GLOBAL EXIM for
          premium peanuts and dependable global trade services.
        </p>

        <div className="cta-buttons-container">
          {/* REQUEST QUOTE → GLOBAL MODAL */}
          <Button
            as="button"
            onClick={onRequestQuote}
            className="cta-button-primary"
            aria-label="Request a quote"
          >
            Request Quote
          </Button>

          {/* DOWNLOAD CATALOG */}
          <Button
            as="a"
            href="/catalog/SPRADA2GLOBAL-Catalog.pdf"
            className="cta-button-outline"
            download
            aria-label="Download product catalog"
          >
            Download Catalog
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CTASection;
