type RotatingBadgeProps = {
  /** Text that runs around the ring. ~40 characters fills it well. */
  text: string;
  /** Unique id for the SVG path (must differ per badge on the page). */
  id: string;
  className?: string;
  /** Glyph in the centre of the ring. */
  glyph?: string;
};

/** Circular rotating text badge, as in the reference ("follow us on social networks"). */
export default function RotatingBadge({
  text,
  id,
  className = "",
  glyph = "+",
}: RotatingBadgeProps) {
  return (
    <div className={`badge ${className}`} aria-hidden="true">
      <svg className="badge__ring" viewBox="0 0 200 200">
        <defs>
          <path
            id={id}
            d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
          />
        </defs>
        <text className="badge__text">
          <textPath href={`#${id}`} textLength="484" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="badge__glyph">{glyph}</span>
    </div>
  );
}
