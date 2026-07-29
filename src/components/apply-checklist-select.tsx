import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checklist } from "@/types";

interface ApplyChecklistSelectProps {
  checklists: Checklist[];
  value: string;
  onChange: (checklistId: string) => void;
  disabled?: boolean;
}

export const NO_CHECKLIST = "none";

export function ApplyChecklistSelect({
  checklists,
  value,
  onChange,
  disabled,
}: ApplyChecklistSelectProps) {
  return (
    <Select value={value || NO_CHECKLIST} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a checklist (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_CHECKLIST}>No Checklist</SelectItem>
        {checklists.map((checklist) => (
          <SelectItem key={checklist.id} value={checklist.id}>
            {checklist.title} (v{checklist.versionNumber} · {checklist.items.length} steps)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}