import { useEffect, useReducer } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceType } from '@/types';
import {
  parseTierLabels,
  resolveWorkspaceTerminology,
  TierLabelOverrides,
  WorkspaceTerminology,
} from '@/lib/workspace-terminology';

interface CachedWorkspace {
  type: WorkspaceType;
  tierLabels?: TierLabelOverrides;
}

const typeCache = new Map<string, CachedWorkspace>();
const listeners = new Set<() => void>();

/**
 * Primes the workspace-type cache (called once workspaces are loaded) so every
 * open dialog immediately renders the right terminology.
 */
export function registerWorkspaceTypes(
  list: { id: string; type: WorkspaceType; tierLabels?: TierLabelOverrides }[]
) {
  let changed = false;
  for (const ws of list) {
    const existing = typeCache.get(ws.id);
    const next: CachedWorkspace = { type: ws.type, tierLabels: ws.tierLabels };
    if (
      !existing ||
      existing.type !== next.type ||
      JSON.stringify(existing.tierLabels ?? null) !== JSON.stringify(next.tierLabels ?? null)
    ) {
      typeCache.set(ws.id, next);
      changed = true;
    }
  }
  if (changed) listeners.forEach((notify) => notify());
}

/**
 * Resolves workspace-specific terminology for a given workspace id.
 * Types are cached across dialogs so we only hit the network once per workspace.
 */
export function useWorkspaceTerms(workspaceId?: string): WorkspaceTerminology {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, [forceUpdate]);

  useEffect(() => {
    if (!workspaceId || typeCache.has(workspaceId)) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('workspaces')
        .select('type, tier_labels')
        .eq('id', workspaceId)
        .maybeSingle();

      if (cancelled || !data?.type) return;
      registerWorkspaceTypes([
        {
          id: workspaceId,
          type: data.type as WorkspaceType,
          tierLabels: parseTierLabels(data.tier_labels),
        },
      ]);
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const cached = workspaceId ? typeCache.get(workspaceId) : undefined;
  return resolveWorkspaceTerminology(cached?.type ?? 'custom', cached?.tierLabels);
}
