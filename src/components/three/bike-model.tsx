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

    const box = new Box3().setFromObject(root);
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
