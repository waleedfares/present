export type Location = [longitude: number, latitude: number];

export type Effect =
  | 'decree' | 'population' | 'basel' | 'colonies' | 'thread' | 'ships'
  | 'lens' | 'administration' | 'money' | 'land' | 'press' | 'dissolve';

export interface Beat {
  id: string;
  camera: { center: Location; zoom: number; drift?: Location; duration?: number };
  year?: string;
  title: string;
  lines: readonly string[];
  topics?: readonly string[];
  effects: readonly Effect[];
  notes: string;
}

// TODO: Verify exact dates and wording of Ottoman immigration and land-sale restrictions.
// TODO: Verify any quotation from Herzl’s meetings with the Sultan before adding it.
// TODO: Add a verified course-reader source note for each beat.

export const cover = { byline: 'By Waleed Fares' };

export const refusalPortraits = [
  { name: 'Abd al-Hamid II', role: 'Ottoman sultan' },
  { name: 'Theodor Herzl', role: 'Zionist leader' },
] as const;

export const milestones = [
  { year: 1878, label: '1878 · First Zionist colony' },
  { year: 1882, label: '1882 · First wave of Zionist immigration' },
  { year: 1914, label: '1914 · About 30 colonies' },
];

export const mapCopy = {
  places: {
    istanbul: 'Istanbul', jaffa: 'Jaffa', jerusalem: 'Jerusalem', nablus: 'Nablus',
    acre: 'Acre', hebron: 'Hebron', safad: 'Safad', tiberias: 'Tiberias', basel: 'Basel, Switzerland', beirut: 'Beirut',
  },
  palestine: 'Palestine',
  seas: ['Mediterranean Sea', 'Black Sea'],
  stamp: 'NO',
  donors: ['Baron Edmond de Rothschild', 'Baron Maurice de Hirsch'],
  newspaper: {
    title: 'Filastin',
    date: 'Jaffa · 15 July 1911',
    alt: 'Masthead and upper columns of the 15 July 1911 Filastin front page, issue 51',
    archive: 'https://archive.org/details/1911_20250520',
  },
  comparison: {
    dispatch: 'Orders from Istanbul',
    arrivals: 'Arrivals by sea',
  },
};

const local = { center: [33.2, 31.55] as Location, zoom: 8.7 };

export const beats: readonly Beat[] = [
  {
    id: 'title',
    camera: { center: [24.8, 37.3], zoom: 1.67, drift: [25.5, 37.05] },
    title: 'Abd al-Hamid II Says No',
    lines: ['Why did immigration and land purchases in Palestine continue?'],
    effects: [],
    notes: 'Open with the question. The Sultan said no. Yet by 1914 the land looked very different.',
  },
  {
    id: 'refusal',
    camera: { center: [27.0, 41.0], zoom: 5.0 },
    title: 'The Sultan’s refusal',
    lines: ['Herzl sought Ottoman support for his plans in Palestine. The Sultan refused.'],
    effects: ['decree'],
    notes: 'Herzl approached the Sultan repeatedly. The answer was no each time.',
  },
  {
    id: 'population',
    camera: local,
    year: '1878',
    title: 'Palestine in 1878',
    lines: ['Jewish communities lived here before the first Zionist immigration wave.'],
    effects: ['population'],
    notes: 'Set the baseline. Most Jews here were observant, living in four cities of religious importance and minimally engaged with Zionism.',
  },
  {
    id: 'europe',
    camera: { center: [18.8, 40.15], zoom: 1.64 },
    year: '1897',
    title: 'First Zionist Congress',
    lines: ['Delegates gathered in Basel and founded the Zionist Organization.'],
    effects: ['basel'],
    notes: 'A movement with a plan, outside the empire that ruled Palestine.',
  },
  {
    id: 'colonies',
    camera: { center: [33.15, 31.18], zoom: 8.55 },
    year: '1878',
    title: 'Settlement begins',
    lines: ['The first colony and immigration wave came before the congress in Basel.'],
    effects: ['colonies'],
    notes: 'The first colony and first wave of Zionist immigration both predated the Basel Congress.',
  },
  {
    id: 'gap',
    camera: { center: [28.8, 36.15], zoom: 3.15 },
    title: 'Policy and capacity',
    lines: ['Istanbul tried to limit immigration and land sales.', 'People kept arriving and buying land.'],
    topics: ['Istanbul’s policy', 'What happened'],
    effects: ['thread', 'ships', 'colonies'],
    notes: 'Policy means what Istanbul decided. Capacity means what it could actually enforce.',
  },
  {
    id: 'capitulations',
    camera: local,
    title: 'Foreign legal privileges',
    lines: ['The capitulations gave some foreign subjects a way around Ottoman restrictions.'],
    effects: ['lens'],
    notes: 'Foreign privileges could include exemption from Ottoman taxes or local prosecution.',
  },
  {
    id: 'distance',
    camera: { center: [28.8, 36.15], zoom: 3.15 },
    title: 'Local enforcement',
    lines: ['Jerusalem reported to Istanbul. Nablus and Acre were attached to Beirut.'],
    effects: ['administration'],
    notes: 'The Jerusalem district reported to Istanbul. The Nablus and Acre districts were attached to the Province of Beirut.',
  },
  {
    id: 'money',
    camera: { center: [17.75, 41.1], zoom: 1.65 },
    title: 'Money from Europe',
    lines: ['Donors funded colonies. From 1901, the Jewish National Fund bought land.'],
    effects: ['money', 'land', 'colonies'],
    notes: 'Rothschild and Hirsch supported early colonies. The Jewish National Fund acquired land.',
  },
  {
    id: 'response',
    camera: local,
    title: 'Palestinians spoke up',
    lines: ['People raised concerns through petitions, Parliament, and the press.'],
    topics: ['1891 · Petition', '1908–1914 · Parliament', 'Filastin and al-Karmil'],
    effects: ['press'],
    notes: 'Jerusalem’s notables petitioned, deputies were elected, and Palestinian newspapers warned about Zionist plans.',
  },
  {
    id: 'outcome',
    camera: { center: [24.8, 37.15], zoom: 1.78, duration: 3 },
    year: '1914',
    title: 'About 30',
    lines: ['Zionist colonies by 1914'],
    effects: ['colonies'],
    notes: 'By 1914 the course reader counts about thirty Zionist colonies. That is the outcome the refusal did not prevent.',
  },
  {
    id: 'closing',
    camera: { center: [25.1, 36.9], zoom: 1.46, drift: [25.55, 36.65], duration: 3 },
    title: 'The Sultan said no. Settlement continued.',
    lines: [],
    topics: ['Legal privileges', 'Local enforcement', 'European funding'],
    effects: ['dissolve', 'colonies'],
    notes: 'Return to the gap between Ottoman policy and Ottoman capacity.',
  },
];
