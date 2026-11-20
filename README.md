# Colosseum · The Flavian Journey

An interactive 3D visit that moves from a distant exterior view onto a
human-height lower-perimeter route. Nine staged camera stops end at a
contemporary visitor pavilion beyond the ancient outer ring. The checkout is
intentionally mocked and never asks for payment details.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Experience structure

- A full-viewport React Three Fiber scene is code-split from the interface.
- The scroll position drives a smooth nine-keyframe camera and look-at path.
- After the exterior approach, the camera remains near human eye level and
  follows a visible oval ambulatory toward the exterior pavilion.
- Every historical claim is paired with a visible source link. The claim ledger
  and wording caveats are recorded in
  [HISTORICAL_SOURCES.md](./HISTORICAL_SOURCES.md).
- Next, previous, progress-rail, keyboard, and skip controls provide alternatives
  to scrolling.
- Reduced-motion preferences switch navigation to direct section jumps and
  shorten transitions.
- The scene includes loading and model-error states.
- The ticket domain validates access type, quantity, date, and entry time before
  creating a demonstration booking reference.
- The compact ticket panel is responsive and becomes a mobile bottom sheet.

Asset provenance and license requirements are recorded in [ASSETS.md](./ASSETS.md).
Rendered model, route, destination, and mobile evidence is collected in
[docs/visual-validation](./docs/visual-validation/README.md).
