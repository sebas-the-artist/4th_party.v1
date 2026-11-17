import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-logo-frame ${className}`}>
      <Image
        className="brand-logo"
        src="/brand/dishpute-logo.png"
        alt=""
        width={128}
        height={128}
      />
    </span>
  );
}
