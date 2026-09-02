# Bike models

GLBs dropped here are served at `/models/<file>.glb` and picked up by
`src/lib/bike-models.ts`. A family with no entry falls back to the procedural
silhouette in `src/components/three/bike.tsx`, so the showroom never breaks
while a model is missing.

## Why these four

All four are CC Attribution, downloadable, and carry no manufacturer name or
trade dress. That second point matters more than it looks: this page sells an
aftermarket product, and putting a recognizable branded bike in the hero is a
trademark question the model's own license does not answer.

Triangle counts are deliberately in the 40k-100k band. A 500k-triangle bike
looks no better at hero size and costs a second of parse time on a phone.

| Family   | Model                            | Author            | Tris | Source |
|----------|----------------------------------|-------------------|------|--------|
| roadster | Cafe Racer                       | Andrei Milin      | 95k  | https://sketchfab.com/3d-models/cafe-racer-c02dec85ac0541b8ab6dd56098706b50 |
| sport    | Sports bike                      | Ezequiel Oliveira | 71k  | https://sketchfab.com/3d-models/sports-bike-f1d8d0ba41be4fa7884e7b02c978668a |
| trail    | Enduro bike                      | Zaborchik         | 43k  | https://sketchfab.com/3d-models/enduro-bike-5bb654aed341477b8878f1e2ffd6fcd2 |
| custom   | Custom Vintage Bobber Motorcycle | SURVIVED          | 99k  | https://sketchfab.com/3d-models/custom-vintage-bobber-motorcycle-bdb343822c7344ee9d6766696a586a13 |

## Getting them

Sketchfab requires a signed-in account for downloads: its API returns 401
without one, so this step cannot be scripted from here. A free account is
enough.

1. Open a source link, sign in, `Download 3D Model`, pick **glTF** (`.glb`).
2. Save the archive's `.glb` into this folder as `<family>.glb`.

## Optimizing

Run per file, from the repo root:

```
npx @gltf-transform/cli optimize public/models/<family>.glb public/models/<family>.glb \
  --compress draco --texture-compress webp --texture-size 1024
```

Target is under ~3 MB per model. `BikeModelMesh` already loads through the
Draco decoder, so compressed output needs no code change.

## Attribution

CC-BY is only satisfied if the credit ships with the render. Filling a
`BIKE_MODELS` entry puts the author and license line under the canvas
automatically: set `credit`, `creditUrl` (the author's profile), `license`
(`CC BY 4.0`) and `licenseUrl`.

## After the model lands

`BikeModelMesh` fits the GLB by bounding box, which gets scale and ground
contact right but says nothing about where that particular bike keeps its tank,
swingarm and fork. The LED runs are still generated from the procedural
silhouette, so they will need re-measuring against each real asset.
