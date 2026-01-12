import { useHydration } from '@/contexts/HydrationContext';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TrendingUp, Award, Target, Droplets, Sun } from 'lucide-react';

export default function StatsPage() {
  const { hydrationResult, totalConsumed, weeklyData, weather } = useHydration();

  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayName = dayNames[today.getDay()];

  // Calculate stats
  const avgIntake = Math.round(
    weeklyData.reduce((sum, d) => sum + d.amount, 0) / weeklyData.length
  );
  const goalDays = weeklyData.filter(d => d.amount >= d.target).length;
  const streak = weeklyData.slice().reverse().findIndex(d => d.amount < d.target);
  const currentStreak = streak === -1 ? weeklyData.length : streak;

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 water-text-gradient">Statistics</h1>

        {/* Today's Breakdown */}
        <Card className="p-4 mb-4 shadow-card">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Today's Breakdown
          </h2>
          
          <div className="space-y-2">
            {hydrationResult.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={item.isAddition ? 'text-accent' : 'text-destructive'}>
                  {item.isAddition ? '+' : '-'}{item.value} ml
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex justify-between items-center font-semibold">
              <span>Daily Target</span>
              <span className="text-primary">{hydrationResult.dailyTarget} ml</span>
            </div>
          </div>
        </Card>

        {/* Weather Message */}
        {weather && weather.temperature > 25 && (
          <Card className="p-4 mb-4 bg-accent/10 border-accent/20 shadow-card">
            <div className="flex items-start gap-3">
              <Sun className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  It's {weather.temperature.toFixed(1)}°C in {weather.city} today!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  We added {hydrationResult.environmentAdjustment} ml more to beat the heat.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center shadow-card">
            <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-xl font-bold">{avgIntake}</div>
            <div className="text-xs text-muted-foreground">Avg ml/day</div>
          </Card>
          
          <Card className="p-3 text-center shadow-card">
            <Award className="h-5 w-5 mx-auto text-accent mb-1" />
            <div className="text-xl font-bold">{goalDays}/7</div>
            <div className="text-xs text-muted-foreground">Goals hit</div>
          </Card>
          
          <Card className="p-3 text-center shadow-card">
            <Droplets className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day streak</div>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="p-4 shadow-card">
          <h2 className="font-semibold text-lg mb-4">7-Day Progress</h2>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  hide
                  domain={[0, 'dataMax']}
                />
                <ReferenceLine 
                  y={hydrationResult.dailyTarget} 
                  stroke="hsl(var(--primary))"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                >
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.day === todayName
                          ? 'hsl(var(--primary))'
                          : entry.amount >= entry.target
                          ? 'hsl(var(--accent))'
                          : 'hsl(var(--secondary))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Goal reached</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </Card>

        {/* Achievement Badges */}
        <Card className="p-4 mt-4 shadow-card">
          <h2 className="font-semibold text-lg mb-3">Achievements</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className={`text-center p-3 rounded-xl ${currentStreak >= 3 ? 'bg-accent/10' : 'bg-muted opacity-50'}`}>
              <div className="text-2xl mb-1">💧</div>
              <div className="text-xs font-medium">3-Day Streak</div>
            </div>
            <div className={`text-center p-3 rounded-xl ${currentStreak >= 7 ? 'bg-accent/10' : 'bg-muted opacity-50'}`}>
              <div className="text-2xl mb-1">🌊</div>
              <div className="text-xs font-medium">Week Warrior</div>
            </div>
            <div className={`text-center p-3 rounded-xl ${totalConsumed >= hydrationResult.dailyTarget ? 'bg-accent/10' : 'bg-muted opacity-50'}`}>
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs font-medium">Today's Goal</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
