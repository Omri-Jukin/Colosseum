# Asset Register

This project keeps third-party asset provenance explicit. Runtime attribution is
also displayed in the lower-left corner of the experience.

## Included asset

### Low Poly Roman Amphitheatre (WIP)

- **Local file:** `public/models/roman-amphitheatre.glb`
- **Original title:** Low Poly Roman Amphitheatre (WIP)
- **Creator:** AlexFerrart3D
- **Original source:** <https://sketchfab.com/3d-models/low-poly-roman-amphitheatre-wip-ee2aaad3ef1446ee9a69e5c9bde1fca4>
- **License shown by the source:** [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
- **Source-reported complexity:** 14.6k triangles / 9.8k vertices
- **Local payload:** 1,998,420 bytes
- **SHA-256:** `7C95CF065AB07081EF310538522118F63704EAFFE268E2B9E591AD82814874D6`
- **Delivery source:** AllenAI Objaverse 1.0 standardized GLB mirror,
  `glbs/000-109/ee2aaad3ef1446ee9a69e5c9bde1fca4.glb`
- **Objaverse documentation:** <https://objaverse.allenai.org/docs/objaverse-1.0/>

The project loads the standardized GLB without changing its embedded geometry or
materials. At runtime, the scene graph is cloned, centered, uniformly scaled,
and rotated for presentation; these are display transforms only. Credit,
source, and license links are retained here and in the live interface.

## Project-authored scene elements

The ground, lower ambulatory, illuminated route markers, dust particles,
torches, lighting, and contemporary arena ticket pavilion are lightweight
Three.js geometry authored in this repository. They use no third-party textures
or models.

## Researched but not included

### Colosseum Exterior by Andfx / Meshy

- **Source:** <https://www.meshy.ai/3d-models/019dc2c2-5cd4-71fd-8d1e-5b6f7e3f7f00>
- **License:** CC0, as shown in Meshy's public model metadata
- **Reason rejected:** the public metadata reports 8,959,981 faces and
  7,535,739 vertices. That is not appropriate for a responsive web-first
  experience without a substantial offline retopology workflow.

### Colosseum, Rome, Italy by Brian Trepanier

- **Source:** <https://sketchfab.com/3d-models/colosseum-rome-italy-535dc96e586f40bd956ea3cbff810055>
- **License:** CC BY
- **Reason rejected:** approximately 1.5 million triangles, substantially
  heavier than the selected amphitheatre model.

## Attribution text

> “Low Poly Roman Amphitheatre (WIP)” by AlexFerrart3D, used under CC BY
> 4.0. Standardized GLB distributed through AllenAI Objaverse.
