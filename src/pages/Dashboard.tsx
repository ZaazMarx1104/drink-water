import { useState, useEffect } from 'react';
import { useHydration } from '@/contexts/HydrationContext';
import { CircularProgress } from '@/components/CircularProgress';
import { WaterButton } from '@/components/WaterButton';
import { WeatherBadge } from '@/components/WeatherBadge';
import { TabBar, TabId } from '@/components/TabBar';
import { WaterWarningDialog } from '@/components/WaterWarningDialog';
import { MorningSurvey } from '@/components/MorningSurvey';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Droplets, Clock, TrendingUp, Award, Settings, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useWeather } from '@/hooks/useWeather';
import StatsPage from './Stats';
import ProfilePage from './Profile';

const quickAmounts = [125, 250, 500, 1000];

export default function Dashboard() {
  const {
    hydrationResult,
    totalConsumed,
    addWater,
    todayLogs,
    removeLog,
    weather,
    setWeather,
    checkWaterWarnings,
    previousDayData,
    submitFeedback,
    showMorningSurvey,
    setShowMorningSurvey,
    profile,
  } = useHydration();

  const { weather: liveWeather, requestLocation } = useWeather();

  const [activeTab, setActiveTab] = useState<TabId>('drink');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [isPastDialogOpen, setIsPastDialogOpen] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [warningType, setWarningType] = useState<'hourly' | 'daily' | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const percentage = Math.round((totalConsumed / hydrationResult.dailyTarget) * 100);
  const remaining = Math.max(0, hydrationResult.dailyTarget - totalConsumed);

  // Fetch weather on mount if GPS enabled
  useEffect(() => {
    if (profile.gpsEnabled && !weather) {
      requestLocation();
    }
  }, [profile.gpsEnabled, weather, requestLocation]);

  // Update weather in context when live weather changes
  useEffect(() => {
    if (liveWeather) {
      setWeather(liveWeather);
    }
  }, [liveWeather, setWeather]);

  const handleAddWater = (amount: number) => {
    const warnings = checkWaterWarnings(amount);

    if (warnings.hourly || warnings.daily) {
      setPendingAmount(amount);
      setWarningType(warnings.hourly ? 'hourly' : 'daily');
      setShowWarning(true);
      return;
    }

    confirmAddWater(amount);
  };

  const confirmAddWater = (amount: number) => {
    addWater(amount);
    toast.success(`Added ${amount} ml! 💧`);
    setPendingAmount(null);
    setShowWarning(false);
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 5000) {
      handleAddWater(amount);
      setCustomAmount('');
      setIsCustomDialogOpen(false);
    }
  };

  const renderDrinkTab = () => (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-20">
      {/* Bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bubble-glow rounded-full p-1">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold water-text-gradient">DrinkWater</h1>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 relative z-10">
        {/* Weather Badge */}
        <WeatherBadge
          temperature={weather?.temperature}
          adjustment={hydrationResult.environmentAdjustment > 0 ? hydrationResult.environmentAdjustment : undefined}
          className="mb-6"
        />

        {/* Circular Progress */}
        <div className="relative">
          <CircularProgress
            value={totalConsumed}
            max={hydrationResult.dailyTarget}
            size={240}
            strokeWidth={16}
            className="mb-6"
          >
            <div className="text-center">
              <div className="text-5xl font-bold water-text-gradient">
                {percentage}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {totalConsumed} / {hydrationResult.dailyTarget} ml
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6 animate-fade-in">
          {percentage >= 100 ? (
            <div className="flex items-center gap-2 text-accent">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Goal achieved! Great job! 🎉</span>
            </div>
          ) : percentage >= 75 ? (
            <p className="text-foreground">Almost there! Keep it up!</p>
          ) : percentage >= 50 ? (
            <p className="text-foreground">You're doing great! Halfway there!</p>
          ) : (
            <p className="text-muted-foreground">
              You've drunk <span className="font-semibold text-foreground">{totalConsumed} ml</span> today. Keep going!
            </p>
          )}
        </div>

        {/* Remaining indicator */}
        {remaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <TrendingUp className="h-4 w-4" />
            <span>{remaining} ml remaining for today</span>
          </div>
        )}
      </div>

      {/* Quick Add Section */}
      <div className="px-6 pb-6 relative z-10">
        {/* Past water link - moved up */}
        <Dialog open={isPastDialogOpen} onOpenChange={setIsPastDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full mb-4 text-sm text-primary hover:underline flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              Had water & forgot to add it? Click Here
            </button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-2xl max-h-[70vh]">
            <DialogHeader>
              <DialogTitle>Today's Drinks</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {todayLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No drinks logged yet today
                </p>
              ) : (
                todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl bg-muted p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Droplets className="h-4 w-4 text-primary" />
                      <span className="font-medium">{log.amount} ml</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </span>
                      <button
                        onClick={() => removeLog(log.id)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick amount buttons with custom as 5th option */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-3 min-w-max">
            {quickAmounts.map((amount) => (
              <WaterButton
                key={amount}
                amount={amount}
                onClick={handleAddWater}
                className="w-[72px] flex-shrink-0"
              />
            ))}
            
            {/* Custom button - same size as others */}
            <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
              <DialogTrigger asChild>
                <div>
                  <WaterButton
                    amount={0}
                    label="CUSTOM"
                    variant="custom"
                    onClick={() => {}}
                    className="w-[72px] flex-shrink-0"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Add Custom Amount</DialogTitle>
                </DialogHeader>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter ml"
                    className="flex-1 h-12"
                    min={1}
                    max={5000}
                  />
                  <Button onClick={handleCustomAdd} className="h-12 px-6 water-gradient">
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Drink & Save button */}
        <Button
          onClick={() => handleAddWater(hydrationResult.nextDrinkAmount)}
          className="w-full h-14 mt-4 text-lg font-semibold water-gradient hover:opacity-90 shadow-water"
        >
          <Droplets className="mr-2 h-5 w-5" />
          Drink {hydrationResult.nextDrinkAmount} ml & Save
        </Button>
      </div>
      {/* Water Warning Dialog */}
      <WaterWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        type={warningType || 'hourly'}
        onConfirm={() => pendingAmount && confirmAddWater(pendingAmount)}
      />

      {/* Morning Survey */}
      {previousDayData && (
        <MorningSurvey
          open={showMorningSurvey}
          onOpenChange={setShowMorningSurvey}
          previousIntake={previousDayData.consumed}
          previousTarget={previousDayData.target}
          onSubmit={submitFeedback}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {activeTab === 'drink' && renderDrinkTab()}
      {activeTab === 'stats' && <StatsPage />}
      {activeTab === 'profile' && <ProfilePage />}
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
