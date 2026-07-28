# Seedance Prompt: Seamless Life Growth Loop

Use the two local references:

- `public/assets/site/life-growth-seedling-reference.png` as Image 1
- `public/assets/site/life-growth-tree-reference.png` as Image 2

Target output:

- `public/assets/site/life-growth-loop.mp4`
- 8 seconds
- 16:9
- 1080p preferred
- muted website background, visually seamless loop

Prompt:

```text
Create an 8-second seamless looping cinematic macro animation based on Image 1 and Image 2.

Closed-loop narrative: the final mature orange fruit tree must visually and spatially return to the initial tiny seedling state, forming an infinite seamless loop. The last frame should match the first frame composition closely enough for a smooth loop cut.

Start from Image 1: an extreme clean macro view of a small green seedling growing from a minimalist grassy hill, pure white negative-space background, soft stable daylight, delicate floating air particles. Camera slowly pushes in with a subtle orbital macro movement. The seedling has a breathing life rhythm, gently growing and contracting, with tiny leaf tremors.

At the key transition, a soft golden energy stream rises from roots to crown. The energy flow must feel reversible and continuous, not explosive. The seedling accelerates growth: stem extends, leaves unfold, small blossoms appear, then orange fruits gradually fill the branches.

Camera slowly dollies out as the space expands from the macro grassy mound into a complete ecological hill. Resolve into Image 2: a full lush orange fruit tree centered on a rounded green hill, evenly dotted with orange fruits, colorful tiny flowers in pink, yellow, purple, and white across the grass. Keep subtle living motion: leaves swaying gently, flowers moving slightly, light softly flowing across the canopy.

Loop design: in the final second, the mature tree, hill, golden root energy, and camera movement subtly compress through a soft optical morph back toward the original tiny seedling composition. Do not make a hard reset. The final frame should be clean white background, grassy hill, and small seedling matching the first frame. Soft natural realism, elegant commercial website hero background, bright white background, lush green, orange fruits, no text, no logos, no people, no camera shake, no dark background.
```

Suggested Seedance command after `belt` is installed and logged in:

```powershell
belt app run bytedance/seedance-2-0 --input '{
  "prompt": "Create an 8-second seamless looping cinematic macro animation based on Image 1 and Image 2. Closed-loop narrative: the final mature orange fruit tree must visually and spatially return to the initial tiny seedling state, forming an infinite seamless loop. The last frame should match the first frame composition closely enough for a smooth loop cut. Start from Image 1: an extreme clean macro view of a small green seedling growing from a minimalist grassy hill, pure white negative-space background, soft stable daylight, delicate floating air particles. Camera slowly pushes in with a subtle orbital macro movement. The seedling has a breathing life rhythm, gently growing and contracting, with tiny leaf tremors. At the key transition, a soft golden energy stream rises from roots to crown. The energy flow must feel reversible and continuous, not explosive. The seedling accelerates growth: stem extends, leaves unfold, small blossoms appear, then orange fruits gradually fill the branches. Camera slowly dollies out as the space expands from the macro grassy mound into a complete ecological hill. Resolve into Image 2: a full lush orange fruit tree centered on a rounded green hill, evenly dotted with orange fruits, colorful tiny flowers in pink, yellow, purple, and white across the grass. Keep subtle living motion: leaves swaying gently, flowers moving slightly, light softly flowing across the canopy. Loop design: in the final second, the mature tree, hill, golden root energy, and camera movement subtly compress through a soft optical morph back toward the original tiny seedling composition. Do not make a hard reset. The final frame should be clean white background, grassy hill, and small seedling matching the first frame. Soft natural realism, elegant commercial website hero background, bright white background, lush green, orange fruits, no text, no logos, no people, no camera shake, no dark background.",
  "reference_images": [
    "public/assets/site/life-growth-seedling-reference.png",
    "public/assets/site/life-growth-tree-reference.png"
  ],
  "generate_audio": false,
  "duration": 8,
  "ratio": "16:9",
  "resolution": "1080p",
  "watermark": false
}'
```
