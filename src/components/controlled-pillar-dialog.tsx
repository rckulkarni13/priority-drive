import { PillarFormDialog } from "./pillar-form-dialog";
import { Domain, StrategicPillar } from "@/types";

interface ControlledPillarDialogProps {
  isOpen: boolean;
  domains: Domain[];
  domainId?: string;
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => Promise<string>;
  onApplyChecklist?: (pillar: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledPillarDialog({
  isOpen,
  domains,
  domainId,
  onPillarCreate,
  onApplyChecklist,
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
      onPillarCreate={onPillarCreate}
      onApplyChecklist={onApplyChecklist}
      workspaceId={workspaceId}
    />
  );
}
