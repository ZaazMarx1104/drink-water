import { Droplets, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'drink' | 'stats' | 'profile';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'drink' as TabId, label: 'Drink', icon: Droplets },
  { id: 'stats' as TabId, label: 'Stats', icon: BarChart3 },
  { id: 'profile' as TabId, label: 'Profile', icon: User },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-6 rounded-xl transition-all no-select",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isActive && "text-primary"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export type { TabId };
