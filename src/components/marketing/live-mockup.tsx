"use client";

import { useEffect, useRef, useState } from "react";

const BORDER = "rgba(255,255,255,0.08)";
const IFRAME_NATURAL_WIDTH = 1280;

export function LiveBrowserMockup({
  domain,
  url,
  accent,
  className,
  style,
}: {
  domain: string;
  url: string;
  accent: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [displayHeight, setDisplayHeight] = useState(260);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: "200px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) {
        setScale(w / IFRAME_NATURAL_WIDTH);
        setDisplayHeight(w < 480 ? 220 : 360);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const iframeHeight = scale > 0 ? Math.ceil(displayHeight / scale) : 900;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${BORDER}`,
        boxShadow: `0 48px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`,
        ...style,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          background: "rgba(20,20,22,0.95)",
          backdropFilter: "blur(12px)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <div
              key={c}
              style={{ width: 11, height: 11, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}66` }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 7,
            padding: "4px 12px",
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
            letterSpacing: "0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {domain}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 10,
            color: accent,
            fontWeight: 700,
            textDecoration: "none",
            opacity: 0.9,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ↗ Open
        </a>
      </div>

      {/* Scaled live site */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          height: displayHeight,
          overflow: "hidden",
          background: "#111",
        }}
      >
        {visible && (
          <iframe
            src={url}
            title={domain}
            style={{
              width: IFRAME_NATURAL_WIDTH,
              height: iframeHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: "none",
              pointerEvents: "none",
              display: "block",
            }}
          />
        )}
        {/* Live badge */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(10,10,11,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 8,
            padding: "4px 9px",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 10, color: "rgba(245,245,247,0.45)", fontWeight: 600 }}>Live</span>
        </div>
      </div>
    </div>
  );
}
