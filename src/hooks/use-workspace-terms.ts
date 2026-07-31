import { useEffect, useReducer } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceType } from '@/types';
import { getWorkspaceTerminology, WorkspaceTerminology } from '@/lib/workspace-terminology';

const typeCache = new Map<string, WorkspaceType>();
const listeners = new Set<() => void>();

/**
 * Primes the workspace-type cache (called once workspaces are loaded) so every
 * open dialog immediately renders the right terminology.
 */
export function registerWorkspaceTypes(list: { id: string; type: WorkspaceType }[]) {
  let changed = false;
  for (const ws of list) {
    if (typeCache.get(ws.id) !== ws.type) {
      typeCache.set(ws.id, ws.type);
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
        .select('type')
        .eq('id', workspaceId)
        .maybeSingle();

      if (cancelled || !data?.type) return;
      registerWorkspaceTypes([{ id: workspaceId, type: data.type as WorkspaceType }]);
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const type = (workspaceId ? typeCache.get(workspaceId) : undefined) ?? 'custom';
  return getWorkspaceTerminology(type);
}
