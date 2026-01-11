import { Sun, Cloud, CloudRain, Thermometer, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherBadgeProps {
  temperature?: number;
  adjustment?: number;
  className?: string;
}

function getWeatherIcon(temp: number) {
  if (temp >= 30) return Sun;
  if (temp >= 20) return Cloud;
  return CloudRain;
}

export function WeatherBadge({ temperature, adjustment, className }: WeatherBadgeProps) {
  if (temperature === undefined) {
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground",
        className
      )}>
        <Thermometer className="h-4 w-4" />
        <span>Enable GPS for weather</span>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(temperature);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm shadow-card">
        <WeatherIcon className="h-5 w-5 text-primary" />
        <span className="font-medium">Temp: {temperature}°C</span>
      </div>
      
      {adjustment && adjustment > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent-foreground">
          <Droplets className="h-4 w-4 text-accent" />
          <span className="font-medium">+{adjustment} ml for heat</span>
        </div>
      )}
    </div>
  );
}
