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
                  <FormLabel>Associated Products</FormLabel>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={field.value.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, product.id]);
                            } else {
                              field.onChange(field.value.filter(id => id !== product.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                        <label
                          htmlFor={`product-${product.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {product.title}
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