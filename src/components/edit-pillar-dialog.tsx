import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StrategicPillar, Domain } from "@/types";

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetTimeFrame: z.string().min(1, "Target timeframe is required"),
  domainIds: z.array(z.string()).min(1, "Please select at least one domain"),
  color: z.string().min(1, "Color is required"),
});

type PillarFormData = z.infer<typeof pillarSchema>;

interface EditPillarDialogProps {
  pillar: StrategicPillar | null;
  domains: Domain[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPillarUpdate: (pillarId: string, updates: Partial<StrategicPillar>) => void;
}

export function EditPillarDialog({ pillar, domains, open, onOpenChange, onPillarUpdate }: EditPillarDialogProps) {
  const form = useForm<PillarFormData>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: "",
      description: "",
      targetTimeFrame: "",
      domainIds: [],
      color: "#8b5cf6",
    },
  });

  useEffect(() => {
    if (pillar && open) {
      form.reset({
        title: pillar.title,
        description: pillar.description || "",
        targetTimeFrame: pillar.targetTimeFrame,
        domainIds: pillar.domainIds,
        color: pillar.color || "#8b5cf6",
      });
    }
  }, [pillar, open, form]);

  const onSubmit = (data: PillarFormData) => {
    if (!pillar) return;
    
    onPillarUpdate(pillar.id, {
      title: data.title,
      description: data.description || "",
      targetTimeFrame: data.targetTimeFrame,
      domainIds: data.domainIds,
      color: data.color
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Strategic Pillar</DialogTitle>
          <DialogDescription>
            Update the strategic pillar details.
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
                  <FormLabel>Associated Domains</FormLabel>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <div key={domain.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-domain-${domain.id}`}
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
                          htmlFor={`edit-domain-${domain.id}`}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
