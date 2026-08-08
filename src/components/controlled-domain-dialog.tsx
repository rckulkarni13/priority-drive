import { DomainFormDialog } from "./domain-form-dialog";
import { Domain } from "@/types";

interface ControlledDomainDialogProps {
  isOpen: boolean;
  onDomainCreate: (domainData: Omit<Domain, "id" | "createdDate">) => Promise<string>;
  onApplyChecklist?: (domain: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledDomainDialog({
  isOpen,
  onDomainCreate,
  onApplyChecklist,
  onClose,
  workspaceId
}: ControlledDomainDialogProps) {
  if (!isOpen) return null;

  return (
    <DomainFormDialog
      key="new-domain"
      defaultOpen
      onOpenChange={(o) => { if (!o) onClose(); }}
      onDomainCreate={onDomainCreate}
      onApplyChecklist={onApplyChecklist}
      workspaceId={workspaceId}
    />
  );
}
