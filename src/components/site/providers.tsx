"use client";

import { MotionConfig } from "framer-motion";

/**
 * Client providers for the whole app.
 *
 * `MotionConfig reducedMotion="user"` is the only thing that makes Framer
 * Motion respect `prefers-reduced-motion`. Framer's default is
 * `reducedMotion: "never"`, and its animations are JS-driven, so the CSS
 * media query in globals.css never reached them — every fade, slide and
 * spring played at full strength for someone who had explicitly asked for
 * less. Under "user" Framer drops transform and layout animation while
 * still animating opacity, so content continues to appear rather than
 * snapping in.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
