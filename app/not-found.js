import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-[22px] font-bold text-brand-ink">Not found</h1>
      <p className="mt-[6px] text-[13.5px] text-ink-muted">That page or record does not exist, or it was deleted.</p>
      <Link href="/" className="mt-[16px] text-[13px] font-semibold text-brand-ink hover:underline">Back to the dashboard</Link>
    </div>
  );
}
