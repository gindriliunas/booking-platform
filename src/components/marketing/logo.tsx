import Image from "next/image";

const sizes = {
  sm: 80,
  md: 110,
  lg: 160,
  xl: 220,
};

export function VivZLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const px = sizes[size];

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/viv-z-logo.png"
        alt="VIV-Z"
        width={px}
        height={px}
        className="object-contain"
        priority
      />
    </span>
  );
}
