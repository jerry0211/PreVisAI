import { clamp01, easeOutCubic, lerp } from './timeline';
import styles from './ClickCursor.module.css';

interface ClickCursorProps {
  /** Local time since the cursor appeared, ms. */
  t: number;
  /** Click target (frame px). */
  x: number;
  y: number;
  /** Entry point the cursor glides in FROM (frame px). */
  fromX: number;
  fromY: number;
  size?: number;
  move?: number; // travel time to the target
  clickAt?: number; // moment of the click (from appearance)
  ripple?: number; // ripple expand/fade
  rippleSize?: number; // max ripple diameter
}

/**
 * A reusable animated pointer that glides in and clicks a point, with a press
 * dip and an expanding ripple. Rendered in a frame's coordinate space.
 */
export function ClickCursor({
  t,
  x,
  y,
  fromX,
  fromY,
  size = 44,
  move = 600,
  clickAt = 760,
  ripple = 480,
  rippleSize = 150,
}: ClickCursorProps) {
  if (t < 0) return null;

  const p = easeOutCubic(clamp01(t / move));
  const cx = lerp(fromX, x, p);
  const cy = lerp(fromY, y, p);

  const dip = Math.max(0, 1 - Math.abs(t - clickAt) / 120);
  const pressScale = 1 - 0.22 * dip;

  const rp = clamp01((t - clickAt) / ripple);
  const showRipple = t >= clickAt && rp < 1;

  return (
    <div className={styles.layer} aria-hidden="true">
      {showRipple && (
        <span
          className={styles.ripple}
          style={{
            left: x,
            top: y,
            width: lerp(rippleSize * 0.16, rippleSize, rp),
            height: lerp(rippleSize * 0.16, rippleSize, rp),
            opacity: (1 - rp) * 0.85,
          }}
        />
      )}
      <span
        className={styles.cursor}
        style={{ left: cx, top: cy, transform: `scale(${pressScale})` }}
      >
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path
            d="M7 4 L7 27 L13 21 L17 30 L21 28 L17 19 L25 19 Z"
            fill="#fff"
            stroke="#0c090a"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
