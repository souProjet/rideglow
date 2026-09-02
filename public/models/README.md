# Bike models

GLBs dropped here are served at `/models/<file>.glb` and picked up by
`src/lib/bike-models.ts`. A family with no entry falls back to the procedural
silhouette in `src/components/three/bike.tsx`, so the showroom never breaks
while a model is missing.

## What is here

| Family   | Model           | Author       | License   | Size   |
|----------|-----------------|--------------|-----------|--------|
| sport    | SPY-HYPERSPORT  | Amvall       | CC BY 4.0 | 1.8 MB |
| trail    | Honda CB500X    | DevanirGrau  | CC BY 4.0 | 3.0 MB |

`roadster` and `custom` have no model yet and render the procedural silhouette.

Two things to weigh before adding one.

Prefer bikes with no manufacturer name or trade dress. This page sells an
aftermarket product, and a recognizable branded bike in the hero is a trademark
question the model's own license does not answer. The CB500X above is exactly
that case: clean CC-BY, Honda badging on the tank.

Keep triangle counts in the 40k-100k band. A 500k-triangle bike looks no better
at hero size and costs a second of parse time on a phone. The CB500X is over it
at 379k vertices and is the first candidate for `--simplify` if the
configurator gets slow on mid-range phones.

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

## Placing the LED runs

`BikeModelMesh` fits the GLB by bounding box, which gets scale and ground
contact right but says nothing about where that particular bike keeps its tank,
swingarm and fork. So each model carries its own five runs in the `strips`
field of its `BIKE_MODELS` entry: x, y, and the half-width of the panel the tape
sits on, in fitted meters. Leave `strips` out and the rig falls back to the runs
derived from the procedural silhouette, which are solved for the placeholder and
land in mid-air beside a scanned bike.

### Where a run goes

A run sits on a part a fitter can reach and stick tape to, not on a line drawn
beside the bike. Every family carries five, ordered nose to tail, and the labels
in `stripRuns` (`src/lib/catalog.ts`) are what the funnel prints:

| Run | Part | Notes |
|-----|------|-------|
| `frontFender` | under the fender, over the tire | an arc, because the part is round |
| `fork` | fork leg, axle to yoke | stop at the yoke: above it nothing leans outboard |
| `engineCase` / `fairingEdge` | crankcase cover, or the fairing's lower lip | a faired bike hides its cases, so it spends this run on the edge |
| `swingarm` / `frameRail` | swingarm, or the rail above it | a rail when the silencer hides the arm in profile |
| `subframe` | the loop under the tail | |
| `rearHugger` | under the rear hugger | only where the model has one |

The two arcs are arcs on purpose. A straight run cut across a fender or a case
cover reads as a stray wire rather than fitted tape. On the procedural bikes the
fender arc has to stay inside the shell `bike.tsx` actually lathes, and 25 mm
clear of it: the tape is 14 mm wide in the radial direction, so a run authored at
the shell's own radius renders half-buried in it.

Measure them, do not eyeball them. The scratchpad scripts written for the first
two models reproduce `BikeModelMesh`'s fit exactly (yaw, then uniform scale to
`wheelbase + frontRadius + rearRadius`, then translate so the bike is centered
on x and z with its lowest vertex at y = 0) and then query the mesh:

- `parts.py <glb> <yaw> <target>`: fitted world bounds per node. Start here to
  find the swingarm, the fork and the tail.
- `place.py <glb> <yaw> <target> "x:y,x:y" [r]`: like `probe.py`, but names the
  four nodes contributing most to each hit, with their own half-widths. This is
  the one that answers "what part is this run on?", and the answer is what the
  code comment should record.
- `slice.py <glb> <yaw> <target> <Node,Node>`: per-x-column y range and max
  half-width for named nodes. This is what a run's z values come from.
- `probe.py <glb> <yaw> <target> "x:y,x:y"`: max half-width near each point, or
  `EMPTY` where there is no surface. Run every authored point through this: it
  is what caught the 30 cm hole under the SPY's cantilevered tail, where a run
  at seat height crossed open air. **Call it at `r=0.022, step=1`.** The 45 mm
  default merges parts that are 4 cm apart, which on an open-frame bike reports
  bodywork where there is only a frame tube: every floating run so far came from
  a reading taken at the default radius.
- `widest.py`: per-x station, the three y values where the bike is widest, with
  an exclude list for parts the tape does not go on (hand guards, mirrors).

Three traps worth knowing. The widest surface at a station is often not the one
the tape goes on: on the CB500X the widest thing beside the fork is the beak,
and the widest thing beside the swingarm is the muffler. A run has to clear the
bike's own exhaust in profile, which is why the CB500X carries a frame-rail run
instead of a swingarm one: its silencer hides the whole arm from the side the
configurator shows. And when a probe mixes two surfaces, prefer the per-node
figure over `z95` of the neighborhood: measure the node the tape is actually on,
not the column of air around it.
