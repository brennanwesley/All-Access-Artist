export const SECTION_IDS = [
  'dashboard',
  'releases',
  'content',
  'fans',
  'community',
  'royalties',
  'settings',
  'pitch',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const DEFAULT_SECTION: SectionId = 'dashboard';

export const SECTION_CANONICAL_PATHS: Record<SectionId, string> = {
  dashboard: '/dashboard',
  releases: '/dashboard/releases',
  content: '/dashboard/content',
  fans: '/dashboard/fans',
  community: '/dashboard/community',
  royalties: '/dashboard/royalties',
  settings: '/dashboard/settings',
  pitch: '/dashboard/pitch',
};

export const isSectionId = (value: string): value is SectionId =>
  SECTION_IDS.includes(value as SectionId);

export const normalizeSectionId = (value: string | null | undefined): SectionId => {
  if (value && isSectionId(value)) {
    return value;
  }

  return DEFAULT_SECTION;
};

export const pathFromSection = (section: SectionId): string =>
  SECTION_CANONICAL_PATHS[section];

export const sectionFromPath = (pathname: string): SectionId => {
  if (pathname.startsWith('/releases/') || pathname.startsWith('/dashboard/releases')) {
    return 'releases';
  }

  if (pathname.startsWith('/dashboard/content')) {
    return 'content';
  }

  if (pathname.startsWith('/dashboard/fans')) {
    return 'fans';
  }

  if (pathname.startsWith('/dashboard/community')) {
    return 'community';
  }

  if (pathname.startsWith('/dashboard/royalties')) {
    return 'royalties';
  }

  if (pathname.startsWith('/dashboard/settings')) {
    return 'settings';
  }

  if (pathname.startsWith('/dashboard/pitch')) {
    return 'pitch';
  }

  return DEFAULT_SECTION;
};

export const isDetailPath = (pathname: string): boolean =>
  pathname.startsWith('/releases/') ||
  pathname.startsWith('/songs/') ||
  pathname.startsWith('/metadata/');

export const sectionFromLocationState = (state: unknown): SectionId | null => {
  if (typeof state !== 'object' || state === null || !('activeSection' in state)) {
    return null;
  }

  const activeSection = (state as { activeSection?: unknown }).activeSection;

  if (typeof activeSection !== 'string') {
    return null;
  }

  return normalizeSectionId(activeSection);
};
