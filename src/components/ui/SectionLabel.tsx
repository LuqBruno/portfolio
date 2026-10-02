export function SectionLabel({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <p className={`mono section-label ${className ?? ''}`} data-reveal>
      <span className="section-label__index">{index}</span>
      <span>{label}</span>
    </p>
  );
}
