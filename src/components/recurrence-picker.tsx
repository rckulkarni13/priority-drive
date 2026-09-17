import { Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecurrenceRule, describeRecurrence } from "@/lib/recurrence";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Mode = 'none' | RecurrenceRule['freq'];

interface RecurrencePickerProps {
  value?: RecurrenceRule;
  onChange: (value?: RecurrenceRule) => void;
  /** Reference date used to seed sensible defaults (usually the priority start date). */
  referenceDate?: Date;
}

export function RecurrencePicker({ value, onChange, referenceDate }: RecurrencePickerProps) {
  const ref = referenceDate ?? new Date();
  const mode: Mode = value?.freq ?? 'none';

  const setMode = (next: Mode) => {
    if (next === 'none') return onChange(undefined);
    switch (next) {
      case 'daily':
        return onChange({ freq: 'daily', interval: 1 });
      case 'weekly':
        return onChange({ freq: 'weekly', interval: 1, weekdays: [ref.getDay()] });
      case 'monthly_date':
        return onChange({ freq: 'monthly_date', interval: 1, monthDay: ref.getDate() });
      case 'monthly_weekday':
        return onChange({
          freq: 'monthly_weekday',
          interval: 1,
          weekday: ref.getDay(),
          weekOfMonth: Math.min(4, Math.ceil(ref.getDate() / 7)) as 1 | 2 | 3 | 4,
        });
    }
  };

  const patch = (updates: Partial<RecurrenceRule>) => {
    if (!value) return;
    onChange({ ...value, ...updates });
  };

  const toggleWeekday = (day: number) => {
    if (!value) return;
    const current = value.weekdays || [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    patch({ weekdays: next.length ? next : [day] });
  };

  const isWeeks = mode === 'weekly' || mode === 'biweekly';
  const isMonthly = mode === 'monthly_date' || mode === 'monthly_weekday';
  const unit = mode === 'daily' ? 'day(s)' : mode === 'weekly' ? 'week(s)' : 'month(s)';

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <Label className="flex items-center gap-2">
        <Repeat className="w-4 h-4" />
        Repeat
      </Label>

      <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Does not repeat</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly on chosen days</SelectItem>
          <SelectItem value="monthly_date">Monthly on a date</SelectItem>
          <SelectItem value="monthly_weekday">Monthly on a weekday</SelectItem>
        </SelectContent>
      </Select>

      {value && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Every</span>
            <Input
              type="number"
              min={1}
              max={99}
              value={value.interval}
              onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>

          {isWeeks && (
            <div className="flex gap-1">
              {WEEKDAY_SHORT.map((label, day) => (
                <Button
                  key={day}
                  type="button"
                  variant={value.weekdays?.includes(day) ? "default" : "outline"}
                  size="icon"
                  className={cn("h-9 w-9 text-xs")}
                  onClick={() => toggleWeekday(day)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          {mode === 'monthly_date' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">On day</span>
              <Input
                type="number"
                min={1}
                max={31}
                value={value.monthDay ?? 1}
                onChange={(e) => patch({ monthDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
                className="w-20"
              />
            </div>
          )}

          {mode === 'monthly_weekday' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">On the</span>
              <Select
                value={String(value.weekOfMonth ?? 1)}
                onValueChange={(v) => patch({ weekOfMonth: Number(v) as 1 | 2 | 3 | 4 | -1 })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">first</SelectItem>
                  <SelectItem value="2">second</SelectItem>
                  <SelectItem value="3">third</SelectItem>
                  <SelectItem value="4">fourth</SelectItem>
                  <SelectItem value="-1">last</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(value.weekday ?? 1)} onValueChange={(v) => patch({ weekday: Number(v) })}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                    <SelectItem key={d} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {describeRecurrence(value)} — repeats until you turn it off or delete the task.
          </p>
        </div>
      )}
    </div>
  );
}

export function RecurrenceSummary({ rule }: { rule: RecurrenceRule }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Repeat className="w-3 h-3" />
      {describeRecurrence(rule)}
    </span>
  );
}
