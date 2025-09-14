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
import { StrategicPillar, Product } from "@/types";

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  targetTimeFrame: z.string().min(1, "Target timeframe is required"),
  productIds: z.array(z.string()).min(1, "Please select at least one product"),
});

type PillarFormData = z.infer<typeof pillarSchema>;

interface PillarFormDialogProps {
  children: React.ReactNode;
  products: Product[];
  onPillarCreate: (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => void;
}

export function PillarFormDialog({ children, products, onPillarCreate }: PillarFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<PillarFormData>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      title: "",
      description: "",
      targetTimeFrame: "",
      productIds: [],
    },
  });

  const onSubmit = (data: PillarFormData) => {
    onPillarCreate({
      title: data.title,
      description: data.description,
      targetTimeFrame: data.targetTimeFrame,
      productIds: data.productIds,
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
                  <FormLabel>Description</FormLabel>
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
              name="productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Product</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange([value])}
                    value={field.value[0] || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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