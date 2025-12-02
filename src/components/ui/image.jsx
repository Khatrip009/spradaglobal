import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Lightweight Image component (no external image-kit dependency).
 * - Props: src, alt, className, width, height, style, placeholder, lazy (bool), objectFit,
 *   onLoad, allowClick (bool: default false) -> when false the component prevents click
 *   events from bubbling up (defensive against parent links / delegated handlers).
 *
 * Example:
 * <Image src="/img/foo.jpg" alt="Foo" width={800} height={600} placeholder="/img/foo-blur.jpg" />
 */

const Image = forwardRef(function Image(
  {
    src,
    alt = "",
    className = "",
    width,
    height,
    style,
    placeholder,
    lazy = true,
    objectFit = "cover",
    onLoad,
    allowClick = false, // default: prevent click propagation (defensive)
    ...rest
  },
  ref
) {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(!!placeholder);

  // expose a `load` method if parent wants to trigger load
  useImperativeHandle(ref, () => ({
    load: () => {
      if (imgRef.current && imgRef.current.src !== src) {
        imgRef.current.src = src;
      }
    },
  }));

  useEffect(() => {
    // if src changes, reset state so placeholder shows until the new image loads
    setIsLoaded(false);
    setShowPlaceholder(!!placeholder);
  }, [src, placeholder]);

  // defensive click handler: preventDefault+stopPropagation by default unless allowClick=true
  const handleClick = (e) => {
    if (!allowClick) {
      e.preventDefault();
      e.stopPropagation();
    }
    // If the caller provided an onClick inside rest, call it after stopping (preserve expected local handlers)
    if (typeof rest.onClick === "function") {
      try { rest.onClick(e); } catch (err) { /* ignore */ }
    }
  };

  return (
    <div
      className={`relative overflow-hidden inline-block ${className}`}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
        ...style,
      }}
      // If someone clicks the wrapper, handle defensively as well
      onClick={handleClick}
    >
      {/* placeholder (blur or small image) */}
      {showPlaceholder && placeholder && (
        <img
          src={placeholder}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover blur-sm scale-105 transition-opacity"
          style={{
            opacity: isLoaded ? 0 : 1,
            objectFit,
          }}
          // prevent bubbling for placeholder too
          onClick={handleClick}
        />
      )}

      {/* real image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        onLoad={(e) => {
          setIsLoaded(true);
          // hide placeholder after short delay for smoother transition
          setTimeout(() => setShowPlaceholder(false), 80);
          onLoad && onLoad(e);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          display: "block",
          transition: "opacity 200ms ease-in-out, transform 200ms ease-in-out",
          opacity: isLoaded ? 1 : 0,
        }}
        // defensive: stop clicks from bubbling unless allowClick set
        onClick={handleClick}
        {...rest}
      />
    </div>
  );
});

export { Image };
export default Image;
