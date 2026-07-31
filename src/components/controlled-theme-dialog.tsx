import { useEffect, useRef } from "react";
import { ThemeFormDialog } from "./theme-form-dialog";
import { Theme, StrategicPillar } from "@/types";

interface ControlledThemeDialogProps {
  isOpen: boolean;
  pillarId?: string;
  strategicPillars: StrategicPillar[];
  onThemeCreate: (themeData: Omit<Theme, "id" | "createdDate">) => Promise<string>;
  onApplyChecklist?: (themeId: string, itemTitles: string[]) => void | Promise<void>;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledThemeDialog({
  isOpen,
  pillarId,
  strategicPillars,
  onThemeCreate,
  onApplyChecklist,
  onClose,
  workspaceId
}: ControlledThemeDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [isOpen, pillarId]);

  if (!isOpen) return null;

  return (
    <ThemeFormDialog
      key={pillarId || 'new-theme'}
      strategicPillars={strategicPillars}
      defaultPillarId={pillarId}
      onThemeCreate={onThemeCreate}
      onApplyChecklist={onApplyChecklist}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      workspaceId={workspaceId}
    >
      <button ref={triggerRef} style={{ display: 'none' }} />
    </ThemeFormDialog>
  );
}