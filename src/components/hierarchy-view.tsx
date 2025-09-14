import { useState } from "react";
import { Product, StrategicPillar, Theme, Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FolderTree, Target, Lightbulb, CheckSquare, Trash2 } from "lucide-react";
import { TaskCard } from "./task-card";

interface HierarchyViewProps {
  products: Product[];
  strategicPillars: StrategicPillar[];
  themes: Theme[];
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onProductDelete?: (productId: string) => void;
  onPillarDelete?: (pillarId: string) => void;
  onThemeDelete?: (themeId: string) => void;
}

export function HierarchyView({ 
  products, 
  strategicPillars, 
  themes, 
  tasks, 
  onTaskEdit, 
  onTaskToggleStatus, 
  onTaskReopen,
  onProductDelete,
  onPillarDelete,
  onThemeDelete,
}: HierarchyViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string, type: 'product' | 'pillar' | 'theme') => {
    const setters = {
      product: setExpandedProducts,
      pillar: setExpandedPillars,
      theme: setExpandedThemes
    };
    
    setters[type](prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTasksForTheme = (themeId: string) => {
    return tasks.filter(task => 
      task.themeIds.includes(themeId) && 
      task.type === 'task'
    );
  };

  const getSubtasksForTask = (taskId: string) => {
    return tasks.filter(task => 
      task.parentTaskId === taskId && 
      task.type === 'subtask'
    );
  };

  const getThemesForPillar = (pillarId: string) => {
    return themes.filter(theme => theme.strategicPillarIds.includes(pillarId));
  };

  const getPillarsForProduct = (productId: string) => {
    return strategicPillars.filter(pillar => pillar.productIds.includes(productId));
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No products found. Create your first product to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FolderTree className="w-5 h-5" />
        Hierarchy View
      </h2>

      <div className="space-y-3">
        {products.map(product => {
          const productPillars = getPillarsForProduct(product.id);
          const isProductExpanded = expandedProducts.has(product.id);

          return (
            <Card key={product.id} className="overflow-hidden">
              <Collapsible
                open={isProductExpanded}
                onOpenChange={() => toggleExpanded(product.id, 'product')}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                     <CardTitle className="flex items-center justify-between text-base">
                       <div className="flex items-center gap-2">
                         {isProductExpanded ? (
                           <ChevronDown className="w-4 h-4" />
                         ) : (
                           <ChevronRight className="w-4 h-4" />
                         )}
                         <FolderTree className="w-4 h-4 text-primary" />
                         {product.title}
                       </div>
                       <div className="flex items-center gap-2">
                         <Badge variant="outline">{productPillars.length} pillars</Badge>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={(e) => {
                             e.stopPropagation();
                             onProductDelete?.(product.id);
                           }}
                           className="h-6 w-6 p-0"
                         >
                           <Trash2 className="w-3 h-3" />
                         </Button>
                       </div>
                     </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-3 pl-4">
                      {productPillars.map(pillar => {
                        const pillarThemes = getThemesForPillar(pillar.id);
                        const isPillarExpanded = expandedPillars.has(pillar.id);

                        return (
                          <Card key={pillar.id} className="border-l-4 border-l-primary/30">
                            <Collapsible
                              open={isPillarExpanded}
                              onOpenChange={() => toggleExpanded(pillar.id, 'pillar')}
                            >
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                                   <CardTitle className="flex items-center justify-between text-sm">
                                     <div className="flex items-center gap-2">
                                       {isPillarExpanded ? (
                                         <ChevronDown className="w-3 h-3" />
                                       ) : (
                                         <ChevronRight className="w-3 h-3" />
                                       )}
                                       <Target className="w-3 h-3 text-blue-600" />
                                       {pillar.title}
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Badge variant="outline" className="text-xs">
                                         {pillarThemes.length} themes
                                       </Badge>
                                       <Button 
                                         variant="outline" 
                                         size="sm" 
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           onPillarDelete?.(pillar.id);
                                         }}
                                         className="h-5 w-5 p-0"
                                       >
                                         <Trash2 className="w-2.5 h-2.5" />
                                       </Button>
                                     </div>
                                   </CardTitle>
                                </CardHeader>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  {pillar.description && (
                                    <p className="text-xs text-muted-foreground mb-3">
                                      {pillar.description}
                                    </p>
                                  )}

                                  <div className="space-y-2 pl-3">
                                    {pillarThemes.map(theme => {
                                      const themeTasks = getTasksForTheme(theme.id);
                                      const isThemeExpanded = expandedThemes.has(theme.id);

                                      return (
                                        <Card key={theme.id} className="border-l-4 border-l-green-200">
                                          <Collapsible
                                            open={isThemeExpanded}
                                            onOpenChange={() => toggleExpanded(theme.id, 'theme')}
                                          >
                                            <CollapsibleTrigger asChild>
                                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-2">
                                                 <CardTitle className="flex items-center justify-between text-xs">
                                                   <div className="flex items-center gap-2">
                                                     {isThemeExpanded ? (
                                                       <ChevronDown className="w-3 h-3" />
                                                     ) : (
                                                       <ChevronRight className="w-3 h-3" />
                                                     )}
                                                     <Lightbulb className="w-3 h-3 text-green-600" />
                                                     {theme.title}
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                     <Badge variant="outline" className="text-xs">
                                                       {themeTasks.length} tasks
                                                     </Badge>
                                                     <Button 
                                                       variant="outline" 
                                                       size="sm" 
                                                       onClick={(e) => {
                                                         e.stopPropagation();
                                                         onThemeDelete?.(theme.id);
                                                       }}
                                                       className="h-4 w-4 p-0"
                                                     >
                                                       <Trash2 className="w-2 h-2" />
                                                     </Button>
                                                   </div>
                                                 </CardTitle>
                                              </CardHeader>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                              <CardContent className="pt-0">
                                                {theme.description && (
                                                  <p className="text-xs text-muted-foreground mb-2">
                                                    {theme.description}
                                                  </p>
                                                )}

                                                <div className="space-y-2 pl-2">
                                                  {themeTasks.map(task => {
                                                    const subtasks = getSubtasksForTask(task.id);
                                                    
                                                    return (
                                                      <div key={task.id} className="space-y-1">
                                                        <TaskCard
                                                          task={task}
                                                          onEdit={onTaskEdit}
                                                          onToggleStatus={onTaskToggleStatus}
                                                          onReopen={onTaskReopen}
                                                        />
                                                        
                                                        {subtasks.length > 0 && (
                                                          <div className="ml-8 space-y-1">
                                                            {subtasks.map(subtask => (
                                                              <TaskCard
                                                                key={subtask.id}
                                                                task={subtask}
                                                                onEdit={onTaskEdit}
                                                                onToggleStatus={onTaskToggleStatus}
                                                                onReopen={onTaskReopen}
                                                              />
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                  
                                                  {themeTasks.length === 0 && (
                                                    <p className="text-xs text-muted-foreground italic">
                                                      No tasks in this theme
                                                    </p>
                                                  )}
                                                </div>
                                              </CardContent>
                                            </CollapsibleContent>
                                          </Collapsible>
                                        </Card>
                                      );
                                    })}
                                    
                                    {pillarThemes.length === 0 && (
                                      <p className="text-xs text-muted-foreground italic">
                                        No themes in this pillar
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        );
                      })}
                      
                      {productPillars.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          No strategic pillars in this product
                        </p>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}