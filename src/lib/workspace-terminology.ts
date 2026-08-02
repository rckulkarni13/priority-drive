import { WorkspaceType } from "@/types";

export interface WorkspaceTerminology {
  domain: {
    singular: string;
    plural: string;
  };
  pillar: {
    singular: string;
    plural: string;
  };
  theme: {
    singular: string;
    plural: string;
  };
}

export type TierKey = 'domain' | 'pillar' | 'theme';

export const TIER_KEYS: TierKey[] = ['domain', 'pillar', 'theme'];

/** Per-workspace display-label overrides. Any missing value falls back to the default. */
export type TierLabelOverrides = Partial<
  Record<TierKey, { singular?: string | null; plural?: string | null }>
>;

export const MAX_TIER_LABEL_LENGTH = 40;

/** Overlays a workspace's custom labels on top of its type defaults. */
export function resolveWorkspaceTerminology(
  type: WorkspaceType,
  overrides?: TierLabelOverrides | null
): WorkspaceTerminology {
  const defaults = getWorkspaceTerminology(type);
  if (!overrides) return defaults;

  const pick = (value: unknown, fallback: string) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed ? trimmed.slice(0, MAX_TIER_LABEL_LENGTH) : fallback;
  };

  return TIER_KEYS.reduce((acc, key) => {
    acc[key] = {
      singular: pick(overrides[key]?.singular, defaults[key].singular),
      plural: pick(overrides[key]?.plural, defaults[key].plural),
    };
    return acc;
  }, { ...defaults } as WorkspaceTerminology);
}

/** Narrows an untyped jsonb value from the database into label overrides. */
export function parseTierLabels(value: unknown): TierLabelOverrides | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const result: TierLabelOverrides = {};
  for (const key of TIER_KEYS) {
    const entry = raw[key];
    if (!entry || typeof entry !== 'object') continue;
    const { singular, plural } = entry as Record<string, unknown>;
    result[key] = {
      singular: typeof singular === 'string' ? singular : undefined,
      plural: typeof plural === 'string' ? plural : undefined,
    };
  }
  return Object.keys(result).length ? result : undefined;
}

export function getWorkspaceTerminology(type: WorkspaceType): WorkspaceTerminology {
  switch (type) {
    case 'work':
      return {
        domain: { singular: 'Domain', plural: 'Domains' },
        pillar: { singular: 'Strategic Pillar', plural: 'Strategic Pillars' },
        theme: { singular: 'Theme', plural: 'Themes' },
      };
    case 'school':
      return {
        domain: { singular: 'Subject', plural: 'Subjects' },
        pillar: { singular: 'Learning Goal', plural: 'Learning Goals' },
        theme: { singular: 'Topic', plural: 'Topics' },
      };
    case 'home':
      return {
        domain: { singular: 'Area', plural: 'Areas' },
        pillar: { singular: 'Goal', plural: 'Goals' },
        theme: { singular: 'Project', plural: 'Projects' },
      };
    case 'custom':
    default:
      return {
        domain: { singular: 'Domain', plural: 'Domains' },
        pillar: { singular: 'Pillar', plural: 'Pillars' },
        theme: { singular: 'Theme', plural: 'Themes' },
      };
  }
}
