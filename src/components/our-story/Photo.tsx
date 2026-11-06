import Image from "next/image";

type PhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** CSS object-position, e.g. "50% 24%". Anchors the crop on the subject. */
  focus?: string;
  /** Parallax depth for the horizontal journey. Negative = foreground (moves faster). */
  depth?: number;
  /** Adds a subtle 3D Y-rotation while the panel crosses the viewport. */
  tilt?: boolean;
};

/**
 * A masked photo. The wrapper (`.photo`) is what gets clip-path reveals and
 * 3D transforms; the inner image (`.photo__img`) gets the counter-parallax.
 * SVG placeholders skip the image optimizer; real JPG/WebP/AVIF files use it.
 */
export default function Photo({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  focus = "50% 50%",
  depth,
  tilt = false,
}: PhotoProps) {
  return (
    <div
      className={`photo ${className}`}
      data-depth={depth !== undefined ? String(depth) : undefined}
      data-tilt={tilt ? "" : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className="photo__img"
        style={{ objectPosition: focus }}
      />
    </div>
  );
}