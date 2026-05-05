// ---------- intro overlay timing ----------
//
// Sequence:
//   t=0          page loads, dark overlay covers everything, intro.webp plays
//   t=INTRO_MS   one full WebP loop has played; start zoom + reveal
//                - measure brand-block's screen rect
//                - shrink + move WebP to that rect
//                - fade overlay bg out (revealing the real page underneath)
//                - fade page contents in
//   t=INTRO_MS + ZOOM_MS   zoom done; remove overlay, brand-block is visible.

const overlay = document.getElementById("introOverlay");
const animImg = document.getElementById("introAnim");
const brandBlock = document.querySelector(".brand-block");

const ANIM_SRC = "../assets/intro.webp";
const LOGO_SRC = "../assets/PreVisAI_logo_transparent.png";

const INTRO_MS = 4000;        // one full loop of intro.webp
const HOLD_AFTER_SWAP = -200;  // brief beat on the static logo before zooming
const ZOOM_MS = 1800;         // matches the CSS transition duration

function setZoomTarget() {
  const r = brandBlock.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  // The static logo PNG fills its full image, so its width directly controls
  // visible size. Match the brand-block width 1:1.
  overlay.style.setProperty("--target-x", `${cx}px`);
  overlay.style.setProperty("--target-y", `${cy}px`);
  overlay.style.setProperty("--target-w", `${r.width}px`);
}

function swapToLogo() {
  // hard swap the src — same element, no fade
  animImg.src = LOGO_SRC;
}

function startZoom() {
  setZoomTarget();
  document.body.classList.remove("intro-active");
  document.body.classList.add("intro-zooming");
  overlay.classList.add("zooming");

  setTimeout(() => {
    overlay.classList.add("done");
    document.body.classList.remove("intro-zooming");
    document.body.classList.add("intro-done");
  }, ZOOM_MS);
}

// Force the animation to start from frame 0 every page load:
//   1. <img> in HTML has no src — nothing decodes during HTML parse.
//   2. We set src from JS with a per-load cache-buster (?t=...) so the
//      browser fetches and decodes fresh, with no resumed playback state.
//   3. We use `img.decode()` (not the `load` event) to wait until the
//      first frame is fully decoded and ready to paint, then schedule
//      the swap+zoom — so the timer's t=0 and the WebP's frame 0 fire
//      on the same animation frame.
function scheduleIntroSequence() {
  // 1. let WebP play one full loop, 2. hard-swap src to static logo,
  // 3. brief hold so the swap reads, 4. shrink + glide to brand-block.
  requestAnimationFrame(() => {
    setTimeout(swapToLogo, INTRO_MS);
    setTimeout(startZoom, INTRO_MS + HOLD_AFTER_SWAP);
  });
}

animImg.src = `${ANIM_SRC}?t=${Date.now()}`;

if (typeof animImg.decode === "function") {
  animImg.decode().then(scheduleIntroSequence).catch(() => {
    // decode() can reject in rare cases (network error, etc.) — fall
    // back to the load event so the sequence still runs.
    animImg.addEventListener("load", scheduleIntroSequence, { once: true });
  });
} else {
  // Older browsers without decode()
  animImg.addEventListener("load", scheduleIntroSequence, { once: true });
}

// Recompute target if the user resizes mid-zoom (rare, but harmless).
window.addEventListener("resize", () => {
  if (document.body.classList.contains("intro-zooming")) {
    setZoomTarget();
  }
});
