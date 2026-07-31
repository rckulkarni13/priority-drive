import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceType } from '@/types';
import { getWorkspaceTerminology, WorkspaceTerminology } from '@/lib/workspace-terminology';

const typeCache = new Map<string, WorkspaceType>();

/**
 * Resolves workspace-specific terminology for a given workspace id.
 * Types are cached across dialogs so we only hit the network once per workspace.
 */
export function useWorkspaceTerms(workspaceId?: string): WorkspaceTerminology {
  const [type, setType] = useState<WorkspaceType>(
    (workspaceId && typeCache.get(workspaceId)) || 'custom'
  );

  useEffect(() => {
    if (!workspaceId) return;

    const cached = typeCache.get(workspaceId);
    if (cached) {
      setType(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('workspaces')
        .select('type')
        .eq('id', workspaceId)
        .maybeSingle();

      const resolved = (data?.type as WorkspaceType) || 'custom';
      typeCache.set(workspaceId, resolved);
      if (!cancelled) setType(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return getWorkspaceTerminology(type);
}
