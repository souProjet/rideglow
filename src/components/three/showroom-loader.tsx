"use client";

import dynamic from "next/dynamic";

/**
 * The whole 3D stack (three, fiber, drei, postprocessing) is the heaviest thing
 * on the site by an order of magnitude. Keeping it behind a client-only dynamic
 * import means the server sends copy and layout first, and WebGL loads after.
 */
const Showroom = dynamic(() => import("@/components/three/showroom").then((m) => m.Showroom), {
  ssr: false,
});

export { Showroom as ShowroomCanvas };
