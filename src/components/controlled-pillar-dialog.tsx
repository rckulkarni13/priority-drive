import { useEffect, useRef } from "react";
import { PillarFormDialog } from "./pillar-form-dialog";
import { Domain, StrategicPillar } from "@/types";

interface ControlledPillarDialogProps {
  isOpen: boolean;
  domainId?: string;
  domains: Domain[];
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => void;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledPillarDialog({
  isOpen,
  domainId,
  domains,
  onPillarCreate,
  onClose,
  workspaceId
}: ControlledPillarDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <PillarFormDialog
      domains={domains}
      onPillarCreate={(pillarData) => {
        onPillarCreate(pillarData);
        onClose();
      }}
      workspaceId={workspaceId}
    >
      <button ref={triggerRef} style={{ display: 'none' }} />
    </PillarFormDialog>
  );
}