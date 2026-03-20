export function VivZLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: { outer: 32, inner: 24, text: 10 },
    md: { outer: 44, inner: 32, text: 14 },
    lg: { outer: 64, inner: 48, text: 20 },
    xl: { outer: 96, inner: 72, text: 30 },
  };
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={s.outer}
        height={s.outer}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer hexagon */}
        <polygon
          points="48,4 88,26 88,70 48,92 8,70 8,26"
          fill="#7C3AED"
          stroke="#5B21B6"
          strokeWidth="2"
        />
        {/* Inner accent */}
        <polygon
          points="48,16 78,32 78,64 48,80 18,64 18,32"
          fill="#8B5CF6"
        />
        {/* Z shape */}
        <path
          d="M28 34 L68 34 L36 62 L68 62"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        style={{ fontSize: s.text + 4 }}
        className="font-black tracking-widest text-violet-700 select-none"
      >
        VIV
        <span className="text-violet-400">-</span>
        Z
      </span>
    </span>
  );
}
