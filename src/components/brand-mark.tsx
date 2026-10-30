export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <span className="brand-mark__ring brand-mark__ring--outer" />
      <span className="brand-mark__ring brand-mark__ring--mid" />
      <span className="brand-mark__dot" />
    </span>
  );
}
