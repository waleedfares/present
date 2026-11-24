import { geoMercator } from 'd3-geo';
import type { Location } from './beats';
import mapProjection from './map-projection.json';

export const width = 1920;
export const height = 1080;
const projection = geoMercator().scale(mapProjection.scale)
  .center(mapProjection.center as Location).translate(mapProjection.translate as Location);

export function point(location: Location): [number, number] {
  return projection(location)!;
}

export const places = {
  istanbul: [28.98, 41.01], jaffa: [34.75, 32.05], jerusalem: [35.22, 31.78],
  nablus: [35.26, 32.22], acre: [35.08, 32.93], hebron: [35.1, 31.53],
  safad: [35.5, 32.96], tiberias: [35.54, 32.79], basel: [7.59, 47.56], beirut: [35.50, 33.89],
} satisfies Record<string, Location>;

export function line(locations: Location[], close = false) {
  return locations.map((location, i) => {
    const [x, y] = point(location);
    return (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ') + (close ? ' Z' : '');
}

export function curve(start: Location, control1: Location, control2: Location, end: Location) {
  return 'M' + point(start).join(' ') + ' C' + [control1, control2, end].map(location => point(location).join(' ')).join(' ');
}

// TODO: Refine the illustrative extent and approximate sanjaq boundaries against historical maps.
export const palestine = line([[34.22,31.34],[34.45,31.69],[34.76,32.29],[35.04,32.81],[35.08,33.08],[35.58,33.27],[35.67,32.94],[35.59,32.48],[35.57,32],[35.48,31.49],[35.2,30.88],[34.97,30.14],[34.9,29.52],[34.55,30.1],[34.29,31.02]], true);
export const districts = [
  line([[34.25,31.36],[34.5,31.81],[34.75,32.14],[35.12,32.06],[35.52,32.05],[35.46,31.59],[35.19,30.97],[34.41,31.03]], true),
  line([[34.75,32.14],[34.92,32.61],[35.21,32.57],[35.58,32.55],[35.52,32.05],[35.12,32.06]], true),
  line([[34.92,32.61],[35.08,32.98],[35.15,33.13],[35.54,33.24],[35.64,32.88],[35.58,32.55],[35.21,32.57]], true),
];

// TODO: Colony positions and staging are illustrative, not exact settlement sites or founding years.
export const colonies: Location[] = [
  [34.88,32.10], [34.80,31.96], [34.85,31.89], [34.95,31.87], [34.94,32.08],
  [35.03,32.56], [35.08,32.60], [35.03,32.51], [35.26,32.67], [35.47,32.95],
  [35.56,32.87], [35.50,32.82], [35.48,32.72], [35.56,32.69], [35.48,32.61],
  [35.32,32.68], [35.22,32.61], [34.93,32.44], [34.89,32.45], [34.87,32.32],
  [34.90,32.28], [34.85,32.22], [34.83,32.15], [34.90,32.16], [34.84,32.04],
  [34.78,31.92], [34.80,31.82], [34.86,31.81], [34.92,31.79], [35.52,33.03],
];

export const decreeRoute = curve(places.istanbul, [28.15,38.28], [35.6,35.05], places.jaffa);
export const arrivalRoute = curve([20.2,34.25], [24.8,32.7], [30.3,33.8], places.jaffa);
export const directRoute = curve(places.istanbul, [27.8,38], [34,35], places.jerusalem);
export const provincialRoutes = [
  curve(places.beirut, [36.8,33.35], [36.6,32.55], places.nablus),
  curve(places.beirut, [35.7,33.53], [34.92,33.32], places.acre),
];
export const donors: Location[] = [[2.35,48.86],[9.0,48.4]];
export const moneyRoutes = [
  curve(donors[0], [12.6,48.3], [24.2,37.75], places.jaffa),
  curve(donors[1], [18.5,49.35], [32.4,40.3], places.jaffa),
];
export const landPatches = [
  line([[34.78,32.0],[34.86,32.07],[35.03,32.18],[35.12,32.05],[35.03,31.9],[34.91,31.85],[34.79,31.88]], true),
  line([[35.22,32.58],[35.58,32.51],[35.63,32.69],[35.53,32.91],[35.36,32.81]], true),
  line([[34.83,32.29],[34.89,32.47],[35.03,32.57],[35.14,32.56],[35.09,32.39],[34.96,32.27]], true),
];
