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
  if (!isOpen) return null;

  return (
    <PillarFormDialog
      key={domainId || 'new-pillar'}
      defaultOpen
      onOpenChange={(o) => { if (!o) onClose(); }}
      domains={domains}
      defaultDomainId={domainId}
      onPillarCreate={(pillarData) => {
        onPillarCreate(pillarData);
        onClose();
      }}
      workspaceId={workspaceId}
    />
  );
}