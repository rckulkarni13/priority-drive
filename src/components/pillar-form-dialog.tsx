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

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetTimeFrame: z.string().min(1, "Target timeframe is required"),
  domainIds: z.array(z.string()).min(1, "Please select at least one domain"),
});

type PillarFormData = z.infer<typeof pillarSchema>;

interface PillarFormDialogProps {
  children: React.ReactNode;
  domains: Domain[];
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => void;
  workspaceId: string;
}

export function PillarFormDialog({ children, domains, onPillarCreate, workspaceId }: PillarFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<PillarFormData>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: "",
      description: "",
      targetTimeFrame: "",
      domainIds: [],
    },
  });

  const onSubmit = (data: PillarFormData) => {
    onPillarCreate({
      title: data.title,
      description: data.description || "",
      targetTimeFrame: data.targetTimeFrame,
      domainIds: data.domainIds,
      workspaceId
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
          <DialogTitle>Create New Strategic Pillar</DialogTitle>
          <DialogDescription>
            Add a strategic pillar to organize your themes and initiatives.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pillar Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter pillar title..." {...field} />
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
                      placeholder="Describe the strategic pillar..."
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
              name="domainIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Domains</FormLabel>
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
              <Button type="submit">Create Pillar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}