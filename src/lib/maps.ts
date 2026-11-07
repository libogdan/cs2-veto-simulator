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
  Dust2: '/maps/dust2.jpg',
  Mirage: '/maps/mirage.jpg',
  Inferno: '/maps/inferno.jpg',
  Nuke: '/maps/nuke.jpg',
  Cache: '/maps/cache.jpg',
  Ancient: '/maps/ancient.jpg',
  Anubis: '/maps/anubis.jpg',
};
