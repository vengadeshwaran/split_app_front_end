// Reusable Image Component (React)
// - Single-file functional component
// - Props: src, alt, srcSet, sizes, fallback, placeholder, aspectRatio, objectFit, lazy, caption, className, style, onClick
// - Features: lazy loading, blur placeholder, error fallback, responsive wrapper, accessibility

import React, { useState, useEffect } from 'react';

export default function Image({
  src,
  alt = '',
  srcSet,
  sizes,
  fallback,
  placeholder,
  aspectRatio, // e.g. "16/9" or number (width/height)
  objectFit = 'cover',
  lazy = true,
  caption,
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    // reset states when src changes
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // compute padding-top for aspect ratio container
  const paddingTop = (() => {
    if (!aspectRatio) return undefined;
    if (typeof aspectRatio === 'number') return `${100 / aspectRatio}%`; // aspectRatio = width/height
    if (typeof aspectRatio === 'string' && aspectRatio.includes('/')) {
      const [w, h] = aspectRatio.split('/').map(Number);
      if (w && h) return `${(h / w) * 100}%`;
    }
    return undefined;
  })();

  const handleLoad = () => setLoaded(true);
  const handleError = () => setErrored(true);

  // choose which src to render (fallback on error)
  const renderSrc = errored && fallback ? fallback : src;

  return (
    <figure className={`image-component group ${className}`} style={{ display: 'inline-block', ...style }}>
      <div
        className="image-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: paddingTop || undefined,
          overflow: 'hidden',
          backgroundColor: '#f3f4f6', // neutral placeholder color
        }}
      >
        {/* Placeholder (blur or svg) */}
        {placeholder && !loaded && (
          <div
            aria-hidden
            className="image-placeholder"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              color: '#9ca3af',
              filter: 'blur(8px)',
              transform: 'scale(1.02)'
            }}
          >
            {typeof placeholder === 'string' ? (
              <img src={placeholder} alt="placeholder" style={{ width: '100%', height: '100%', objectFit }} />
            ) : (
              placeholder
            )}
          </div>
        )}

        {/* Actual image */}
        <img
          src={renderSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={onClick ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } }) : undefined}
          style={{
            position: paddingTop ? 'absolute' : 'static',
            top: 0,
            left: 0,
            width: '100%',
            height: paddingTop ? '100%' : 'auto',
            objectFit: objectFit,
            transition: 'opacity 300ms ease, transform 300ms ease',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'none' : 'scale(1.02)'
          }}
          {...rest}
        />

        {/* Fallback small inline icon/message when errored and no fallback provided */}
        {errored && !fallback && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))'
            }}
          >
            Image failed to load
          </div>
        )}
      </div>

      {caption && (
        <figcaption style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{caption}</figcaption>
      )}
    </figure>
  );
}


// Example usage (copy to your component file):
// <Image
//   src="/images/photo.jpg"
//   alt="A beautiful view"
//   fallback="/images/fallback.jpg"
//   placeholder="/images/photo-small.jpg"
//   aspectRatio="16/9"
//   caption="Photo by Someone"
//   className="rounded-lg shadow"
// />
