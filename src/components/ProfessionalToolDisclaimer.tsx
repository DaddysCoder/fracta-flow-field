export function ProfessionalToolDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11.5px] text-tertiary leading-snug ${className}`}>
      Professional tool only. This resource supports, but does not replace, practitioner
      judgement, appropriate assessment, organisational procedures or current regulatory
      requirements.
    </p>
  );
}
