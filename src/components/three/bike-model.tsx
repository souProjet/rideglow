"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";
import type { Silhouette } from "@/lib/bike-geometry";
import type { BikeModel } from "@/lib/bike-models";

/**
 * Drops an arbitrary GLB into the showroom's frame: +X forward, ground at
 * y = 0, overall length matched to the family silhouette so the LED runs land
 * on the bodywork without retuning them per model.
 *
 * Artists model at every scale and origin imaginable. Measuring the bounding
 * box and solving for the transform beats asking whoever adds a model to guess
 * three numbers, and it means a replacement asset needs no code change.
 */
export function BikeModelMesh({ model, silhouette }: { model: BikeModel; silhouette: Silhouette }) {
  // `true` pulls the Draco decoder from the gstatic CDN, so an optimized model
  // can ship compressed. Uncompressed GLBs load through the same path.
  const { scene } = useGLTF(model.url, true);

  const fitted = useMemo(() => {
    const root = scene.clone(true);
    root.rotation.y = model.yaw ?? 0;
    root.updateMatrixWorld(true);

    // `precise` walks the vertices instead of transforming each mesh's own
    // axis-aligned box. On a model whose parts are modeled straight and then
    // rotated into place, the cheap path inflates the box by whatever those
    // rotations sweep: the CB500X came out 6% long and floating 10 cm off the
    // floor, which is also 10 cm of daylight under every LED run. One pass over
    // the vertices per model, memoized with the fit.
    const box = new Box3().setFromObject(root, true);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    // A bounding box spans tire to tire; a wheelbase is axle to axle. Adding
    // both radii back is what stops every model coming out short.
    const target = silhouette.wheelbase + silhouette.frontRadius + silhouette.rearRadius;
    const scale = size.x > 0.0001 ? target / size.x : 1;

    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return root;
  }, [scene, model.yaw, silhouette.wheelbase, silhouette.frontRadius, silhouette.rearRadius]);

  return <primitive object={fitted} />;
}

export function preloadBikeModel(url: string) {
  useGLTF.preload(url, true);
}
