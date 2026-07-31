import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StrategicPillar, Domain } from "@/types";
import { useWorkspaceTerms } from "@/hooks/use-workspace-terms";

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetTimeFrame: z.string().min(1, "Target timeframe is required"),
  domainIds: z.array(z.string()).min(1, "Please select at least one"),
  color: z.string().min(1, "Color is required"),
});

type PillarFormData = z.infer<typeof pillarSchema>;

interface PillarFormDialogProps {
  children: React.ReactNode;
  domains: Domain[];
  defaultDomainId?: string;
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => void;
  workspaceId: string;
}

export function PillarFormDialog({ children, domains, defaultDomainId, onPillarCreate, workspaceId }: PillarFormDialogProps) {
  const [open, setOpen] = useState(false);
  const terms = useWorkspaceTerms(workspaceId);
  const label = terms.pillar.singular;
  const domainLabel = terms.domain;
  const themeLabel = terms.theme;

  const form = useForm<PillarFormData>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: "",
      description: "",
      targetTimeFrame: "",
      domainIds: defaultDomainId ? [defaultDomainId] : [],
      color: "#8b5cf6",
    },
  });

  const onSubmit = (data: PillarFormData) => {
    onPillarCreate({
      title: data.title,
      description: data.description || "",
      targetTimeFrame: data.targetTimeFrame,
      domainIds: data.domainIds,
      workspaceId,
      color: data.color
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New {label}</DialogTitle>
          <DialogDescription>
            Add a {label.toLowerCase()} to organize your {themeLabel.plural.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label} Title</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${label.toLowerCase()} title...`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Describe the ${label.toLowerCase()}...`}
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetTimeFrame"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Timeframe</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q1 2024, H1 2024..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input 
                      type="color" 
                      {...field}
                      className="h-10 w-full cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domainIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated {domainLabel.plural}</FormLabel>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <div key={domain.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`domain-${domain.id}`}
                          checked={field.value.includes(domain.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, domain.id]);
                            } else {
                              field.onChange(field.value.filter(id => id !== domain.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                        <label
                          htmlFor={`domain-${domain.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {domain.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create {label}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}