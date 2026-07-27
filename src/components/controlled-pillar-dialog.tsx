import { useEffect, useRef } from "react";
import { PillarFormDialog } from "./pillar-form-dialog";
import { Domain, StrategicPillar } from "@/types";

interface ControlledPillarDialogProps {
  isOpen: boolean;
  domains: Domain[];
  domainId?: string;
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => void;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledPillarDialog({
  isOpen,
  domains,
  domainId,
  onPillarCreate,
  onClose,
  workspaceId
}: ControlledPillarDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [isOpen, domainId]);

  if (!isOpen) return null;

  return (
    <PillarFormDialog
      key={domainId || 'new-pillar'}
      domains={domains}
      defaultDomainId={domainId}
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