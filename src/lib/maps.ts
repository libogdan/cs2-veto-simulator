/** Current competitive (Active Duty) pool. Edit here to change the pool. */
export const MAP_POOL = [
  'Dust2',
  'Mirage',
  'Inferno',
  'Nuke',
  'Cache',
  'Ancient',
  'Anubis',
] as const;

export type MapName = (typeof MAP_POOL)[number];

/** Files live in /public/maps */
export const MAP_IMAGE: Record<MapName, string> = {
  Dust2: `${import.meta.env.BASE_URL}maps/dust2.jpg`,
  Mirage: `${import.meta.env.BASE_URL}maps/mirage.jpg`,
  Inferno: `${import.meta.env.BASE_URL}maps/inferno.jpg`,
  Nuke: `${import.meta.env.BASE_URL}maps/nuke.jpg`,
  Cache: `${import.meta.env.BASE_URL}maps/cache.jpg`,
  Ancient: `${import.meta.env.BASE_URL}maps/ancient.jpg`,
  Anubis: `${import.meta.env.BASE_URL}maps/anubis.jpg`,
};
