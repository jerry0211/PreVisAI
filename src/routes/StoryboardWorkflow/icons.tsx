/** Inline glyphs used by the workflow cards. */

export function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 16l4-4 3 3 5-6 4 6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="8" r="1.4" fill="white" />
    </svg>
  );
}

export function ScriptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5h14M5 10h14M5 15h9M5 20h6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 2 L9 6 L3 10 Z" fill="currentColor" />
    </svg>
  );
}
