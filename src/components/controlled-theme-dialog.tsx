import { useEffect, useRef } from "react";
import { ThemeFormDialog } from "./theme-form-dialog";
import { Theme, StrategicPillar } from "@/types";

interface ControlledThemeDialogProps {
  isOpen: boolean;
  pillarId?: string;
  strategicPillars: StrategicPillar[];
  onThemeCreate: (themeData: Omit<Theme, "id" | "createdDate">) => void;
  onClose: () => void;
}

export function ControlledThemeDialog({
  isOpen,
  pillarId,
  strategicPillars,
  onThemeCreate,
  onClose
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
      onThemeCreate={(themeData) => {
        onThemeCreate(themeData);
        onClose();
      }}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <button ref={triggerRef} style={{ display: 'none' }} />
    </ThemeFormDialog>
  );
}