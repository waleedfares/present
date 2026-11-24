# The Living Map

A 12-beat presentation about Ottoman policy and enforcement in Palestine. The 16:9 stage keeps one Mercator map in view throughout.

## Run locally

```sh
npm install
npm run dev
```

Open the local address printed by Vite. Use these commands to verify and serve the production build locally.

```sh
npm run build
npm run preview
```

The production files are in `dist/`. The map, fonts, and effects load locally, so the presentation works with internet access disabled once dependencies are installed and the local server is running.

## Present

| Action | Input |
| --- | --- |
| Start from the black screen | Enter or Space |
| Next beat | Enter, right arrow, Space, Page Down, click, or swipe left |
| Previous beat, with effects already in place | Left arrow, Page Up, or swipe right |
| Return to the black screen | Home |
| Toggle fullscreen | F |
| Show or hide speaker notes | N |

The speaker notes are hidden when the presentation opens. The stage follows the operating system’s reduced-motion setting. The separate [presenter script](output/pdf/Waleed-Fares-Presenter-Script.pdf) follows the 12 beats in order.

## Edit the presentation

Edit `src/beats.ts` to change the text, byline, years, camera framing, enabled effects, or speaker notes. The same file contains the map captions and timeline milestones. Camera centers use longitude followed by latitude.

The colony points and sanjaq outlines in `src/geography.ts` are illustrative. The TODOs in that file and in `src/beats.ts` mark places to verify against the course reader.

## Filastin front page

Beat 10 uses the front page of *Filastin*, issue 51, dated 15 July 1911. The archive scan is bundled locally as `src/assets/filastin.webp`, and the scene shows the masthead and upper columns. [Internet Archive scan](https://archive.org/details/1911_20250520) · [Jrayed issue record](https://www.nli.org.il/en/newspapers/falastin/1911/07/15/01/)

## Refusal scene portraits

- Abd al-Hamid II photographed by Abdullah Frères. [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sultan_Abdul_Hamid_II_of_the_Ottoman_Empire.jpg)
- Theodor Herzl portrait from the Yeshiva University Museum collection via the Center for Jewish History. [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Portrait_of_Theodor_Herzl_(4547885407).jpg)

## Regenerate the map

The map backdrop is pre-rendered from Natural Earth 50m land with the Mercator settings in `src/map-projection.json`. If you change that file or the map styling in `scripts/generate-map.mjs`, run `npm run generate:map` before building. The denser Istanbul and Palestine tiles share the same projection, so the overlays stay aligned throughout camera moves.
