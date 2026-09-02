"use client";

import { useMemo } from "react";
import { BackSide, Float32BufferAttribute, LatheGeometry, Vector2 } from "three";

/**
 * The room the bike is photographed in.
 *
 * Without it the canvas clears to nothing and the bike floats on the page's own
 * background: no horizon, so nothing to read the floor against and no sense of
 * a space the bike is standing in. Fog alone cannot fix that, because fog needs
 * something to fade out.
 *
 * It is a round infinity cove rather than a back wall because the camera orbits
 * the full circle. A wall would leave the void on show from half the presets,
 * and the profile and rear angles are exactly the ones a buyer uses to check
 * where a strip sits.
 */

/** Where the wall stands. Outside OrbitControls' maxDistance of 8, so the
 *  camera can never push through it. */
const COVE_RADIUS = 10.5;
/** The quarter round that makes floor and wall one surface, as a real cove
 *  does: the point of a cove is that there is no corner to see. */
const COVE_FILLET = 2.6;
const COVE_HEIGHT = 7;

/**
 * The cove is lit from the floor up and falls off into the roof. Baking that as
 * a vertex color costs one attribute and saves lighting a wall that is only
 * ever seen out of focus, behind the subject.
 */
function buildCove(): LatheGeometry {
  const profile: Vector2[] = [];
  const steps = 14;

  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    profile.push(
      new Vector2(
        COVE_RADIUS - COVE_FILLET + COVE_FILLET * Math.sin(a),
        COVE_FILLET * (1 - Math.cos(a)),
      ),
    );
  }
  profile.push(new Vector2(COVE_RADIUS, COVE_HEIGHT));

  const geometry = new LatheGeometry(profile, 96);

  const position = geometry.getAttribute("position");
  const colors: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const falloff = Math.max(0, 1 - position.getY(i) / COVE_HEIGHT) ** 1.8;
    const level = 0.14 + falloff * 0.86;
    colors.push(level, level, level);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

  return geometry;
}

/**
 * Two overhead strip lights. They are geometry, not lights: the Environment
 * already lights the bike, and what the floor was missing was something to
 * reflect. They sit above the frame, so what the visitor actually sees is the
 * pair of soft streaks they lay down the reflection.
 */
function Fixtures() {
  return (
    <group position={[0, 4.3, 0]}>
      {[-1, 2.4].map((z) => (
        <mesh key={z} position={[0, 0, z]}>
          <boxGeometry args={[9, 0.08, 0.26]} />
          {/* Deliberately under the bloom threshold of 0.92: a fixture that
              blooms competes with the strip, and the strip is the product. */}
          <meshBasicMaterial color="#5b6675" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Sits inside the grounded group, so its base meets the reflective floor. */
export function ShowroomSet() {
  const cove = useMemo(buildCove, []);

  return (
    <group>
      <mesh geometry={cove} renderOrder={-1}>
        {/* This color is the knob. The cove has to sit far enough above the
            page's own black to read as a surface, and far enough below the
            bike to stay the background: too bright and the hero copy loses the
            ground it is set on. */}
        <meshStandardMaterial
          vertexColors
          color="#1d222a"
          roughness={0.95}
          metalness={0}
          side={BackSide}
        />
      </mesh>
      <Fixtures />
    </group>
  );
}
