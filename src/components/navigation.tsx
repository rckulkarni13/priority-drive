import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  FolderTree, 
  CheckSquare, 
  Plus,
  Target,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = 'today' | 'calendar' | 'hierarchy' | 'completed' | 'all-tasks' | 'manage';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  todayTasksCount: number;
  completedTasksCount: number;
  allTasksCount: number;
  domainsCount: number;
  pillarsCount: number;
  themesCount: number;
}

export function Navigation({ 
  currentView, 
  onViewChange, 
  todayTasksCount,
  completedTasksCount,
  allTasksCount,
  domainsCount,
  pillarsCount,
  themesCount
}: NavigationProps) {
  // Time-based views shown directly
  const timeBasedViews = [
    {
      id: 'today' as View,
      label: 'Today',
      icon: CalendarDays,
      count: todayTasksCount,
      color: 'text-blue-600',
    },
    {
      id: 'calendar' as View,
      label: 'Calendar',
      icon: CalendarX2,
      count: allTasksCount,
      color: 'text-pink-600',
    },
  ];

  // Other views in More dropdown
  const moreViews = [
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
      id: 'manage' as View,
      label: 'Manage Items',
      icon: Settings,
      count: domainsCount + pillarsCount + themesCount,
      color: 'text-orange-600',
    },
    {
      id: 'completed' as View,
      label: 'Completed',
      icon: CheckSquare,
      count: completedTasksCount,
      color: 'text-gray-600',
    },
  ];

  const isMoreViewActive = moreViews.some(view => view.id === currentView);

  return (
    <nav className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg">
      {/* Time-based views */}
      {timeBasedViews.map((item) => {
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

      {/* More dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isMoreViewActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              isMoreViewActive && "shadow-md"
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="font-medium">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background">
          <DropdownMenuLabel>Other Views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {moreViews.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isActive && "bg-accent"
                )}
              >
                <Icon className={cn("w-4 h-4", item.color)} />
                <span className="flex-1">{item.label}</span>
                {item.count > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}