// src/components/ui/image.jsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { assetPath } from "../../lib/assetPath";
import { makeAbsoluteUrl } from "../../lib/urlHelpers";

/**
 * Image (named + default export)
 *
 * - Exports: named `Image` and default export
 * - Preserves forwardRef API from previous component
 * - Lazy loads with IntersectionObserver, fallback graceful placeholder
 * - Resolves URLs using makeAbsoluteUrl (uploads) and assetPath (public assets)
 *
 * Props:
 *  - src, alt, className, width, height, style
 *  - placeholder: low-res URL or boolean (true => gray box)
 *  - lazy: boolean (default true)
 *  - objectFit: css object-fit (default 'cover')
 *  - allowClick: boolean (default false) — when false prevents click propagation
 *  - onLoad, onError
 */
const ImageBase = forwardRef(function ImageBase(
  {
    src,
    alt = "",
    className = "",
    width,
    height,
    style = {},
    placeholder = null,
    lazy = true,
    objectFit = "cover",
    onLoad,
    onError,
    allowClick = false,
    ...rest
  },
  ref
) {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);

  const [visible, setVisible] = useState(!lazy); // if not lazy, visible immediately
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!!placeholder);
  const [failed, setFailed] = useState(false);

  // expose load method via ref (compat)
  useImperativeHandle(ref, () => ({
    load: () => {
      setVisible(true);
      if (imgRef.current && imgRef.current.dataset && imgRef.current.dataset.src) {
        imgRef.current.src = imgRef.current.dataset.src;
      }
    },
  }));

  // URL resolver
  const resolveSrc = (s) => {
    if (!s) return null;
    const t = String(s).trim();
    if (!t) return null;

    if (/^https?:\/\//i.test(t) || /^\/\//.test(t)) return t;
    if (/^(?:\/)?(?:src\/)?uploads\/?/i.test(t) || /[^\\/]+\.(jpe?g|png|gif|webp|svg|bmp|avif)$/i.test(t)) {
      return makeAbsoluteUrl(t);
    }
    if (t.startsWith("/")) {
      return assetPath(t);
    }
    return makeAbsoluteUrl(t);
  };

  const finalSrc = resolveSrc(src);
  const placeholderSrc = typeof placeholder === "string" ? resolveSrc(placeholder) : null;
  const fallbackSrc = assetPath("images/placeholder.png") || "/images/placeholder.png";

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazy) {
      setVisible(true);
      return;
    }
    const el = wrapperRef.current;
    if (!el) {
      setVisible(true);
      return;
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true);
              io.disconnect();
            }
          });
        },
        { rootMargin: "200px" }
      );
      io.observe(el);
      return () => io.disconnect();
    } else {
      setVisible(true);
    }
  }, [lazy]);

  // reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setShowPlaceholder(!!placeholder);
    setFailed(false);
  }, [finalSrc, placeholder]);

  const internalOnLoad = (e) => {
    setIsLoaded(true);
    setTimeout(() => setShowPlaceholder(false), 80);
    if (onLoad) onLoad(e);
  };

  const internalOnError = (e) => {
    setFailed(true);
    if (onError) onError(e);
  };

  const handleClick = (e) => {
    if (!allowClick) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (err) {}
    }
    if (typeof rest.onClick === "function") {
      try {
        rest.onClick(e);
      } catch (err) {}
    }
  };

  const wrapperStyle = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
    ...style,
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit,
    display: "block",
    transition: "opacity 220ms ease-in-out, transform 220ms ease-in-out",
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? "none" : "translateY(6px)",
  };

  const placeholderStyle = {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
    objectFit,
    background: "#EEE",
    filter: placeholderSrc ? "blur(8px)" : "none",
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden inline-block ${className}`}
      style={wrapperStyle}
      onClick={handleClick}
      aria-busy={!isLoaded}
    >
      {/* placeholder (blur or gray) */}
      {showPlaceholder && (
        placeholderSrc ? (
          <img src={placeholderSrc} alt="" aria-hidden="true" style={placeholderStyle} />
        ) : (
          <div aria-hidden="true" style={{ ...placeholderStyle, background: "#EEE" }} />
        )
      )}

      {/* real image (only render when visible) */}
      {visible && !failed && (
        <img
          ref={imgRef}
          src={finalSrc || placeholderSrc || fallbackSrc}
          data-src={finalSrc || placeholderSrc || fallbackSrc}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          style={imgStyle}
          onLoad={internalOnLoad}
          onError={internalOnError}
          {...rest}
        />
      )}

      {/* fallback when failed */}
      {visible && failed && (
        <img
          src={placeholderSrc || fallbackSrc}
          alt={alt}
          loading="lazy"
          style={{ ...imgStyle, opacity: 1 }}
        />
      )}
    </div>
  );
});

// Named + default export
export const Image = ImageBase;
export default ImageBase;
