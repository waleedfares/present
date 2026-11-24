import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoGraticule, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import sharp from 'sharp';

const output = name => new URL('../src/assets/' + name + '.webp', import.meta.url);
const config = JSON.parse(await readFile(new URL('../src/map-projection.json', import.meta.url), 'utf8'));
const atlas = JSON.parse(await readFile(new URL(import.meta.resolve('world-atlas/land-50m.json')), 'utf8'));
const land = feature(atlas, atlas.objects.land);
const { center, scale, translate, tiles } = config;
const mapWidth = translate[0] * 2;
const mapHeight = translate[1] * 2;
const projection = geoMercator().scale(scale).center(center).translate(translate)
  .clipExtent([[0, 0], [mapWidth, mapHeight]]);
const path = geoPath(projection);
const coast = path(land);
const grid = path(geoGraticule().extent([[-28, 12], [73, 65]]).step([3, 3])());

for (const { name, bounds: [x, y, width, height], density } of tiles) {
  // Draw the same projected geometry at a higher density in the closest camera views.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * density}" height="${height * density}" viewBox="${x} ${y} ${width} ${height}">
    <defs>
      <path id="land" d="${coast}"/>
      <path id="grid" d="${grid}"/>
      <clipPath id="land-clip"><use href="#land"/></clipPath>
      <radialGradient id="sea" gradientUnits="userSpaceOnUse" cx="1060" cy="520" r="1210">
        <stop stop-color="#102741"/><stop offset=".56" stop-color="#0a1828"/><stop offset="1" stop-color="#071422"/>
      </radialGradient>
      <linearGradient id="land-light" gradientUnits="userSpaceOnUse" x1="430" y1="160" x2="1550" y2="970">
        <stop stop-color="#1b344c"/><stop offset=".58" stop-color="#13263b"/><stop offset="1" stop-color="#0e2033"/>
      </linearGradient>
    </defs>
    <rect width="${mapWidth}" height="${mapHeight}" fill="url(#sea)"/>
    <use href="#grid" fill="none" stroke="#8bb4da" stroke-width=".5" stroke-opacity=".19"/>
    <g fill="none" stroke="#456a91" stroke-linejoin="round">
      <use href="#land" stroke-width="11" stroke-opacity=".08"/>
      <use href="#land" stroke-width="6.4" stroke-opacity=".11"/>
      <use href="#land" stroke-width="2.8" stroke-opacity=".16"/>
    </g>
    <use href="#land" fill="url(#land-light)"/>
    <use href="#grid" clip-path="url(#land-clip)" fill="none" stroke="#8bb4da" stroke-width=".5" stroke-opacity=".14"/>
    <use href="#land" fill="none" stroke="#7fa3c4" stroke-width=".52" stroke-opacity=".4" stroke-linejoin="round"/>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ lossless: true, effort: 6 }).toFile(fileURLToPath(output(name)));
}
