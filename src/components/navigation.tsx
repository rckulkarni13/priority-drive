import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FolderTree, 
  CheckSquare, 
  Plus,
  Target,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = 'today' | 'hierarchy' | 'completed' | 'all-tasks';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  todayTasksCount: number;
  completedTasksCount: number;
  allTasksCount: number;
}

export function Navigation({ 
  currentView, 
  onViewChange, 
  todayTasksCount,
  completedTasksCount,
  allTasksCount
}: NavigationProps) {
  const navItems = [
    {
      id: 'today' as View,
      label: 'Today\'s Priorities',
      icon: CalendarDays,
      count: todayTasksCount,
      color: 'text-blue-600',
    },
    {
      id: 'hierarchy' as View,
      label: 'Hierarchy View',
      icon: FolderTree,
      count: allTasksCount,
      color: 'text-purple-600',
    },
    {
      id: 'all-tasks' as View,
      label: 'All Tasks',
      icon: Target,
      count: allTasksCount,
      color: 'text-green-600',
    },
    {
      id: 'completed' as View,
      label: 'Completed',
      icon: CheckSquare,
      count: completedTasksCount,
      color: 'text-gray-600',
    },
  ];

  return (
    <nav className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isActive && "shadow-md",
              !isActive && "hover:bg-background/80"
            )}
          >
            <Icon className={cn("w-4 h-4", !isActive && item.color)} />
            <span className="font-medium">{item.label}</span>
            {item.count > 0 && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="text-xs ml-1"
              >
                {item.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}