import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHydration } from '@/contexts/HydrationContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { SelectionCard } from '@/components/SelectionCard';
import { ConditionAutocomplete } from '@/components/ConditionAutocomplete';
import { genderOptions, ageRangeOptions, healthConditionsList, toKg, toLb } from '@/lib/hydration';
import { 
  User, Calendar, Scale, HeartPulse, MapPin, Moon, Bell, 
  ChevronRight, Info, Shield, Crown, LogOut, Pencil
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, setProfile, setOnboardingComplete } = useHydration();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  
  // Edit states
  const [editWeight, setEditWeight] = useState(profile.weight?.toString() || '');
  const [editWeightUnit, setEditWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit);
  const [editAgeRange, setEditAgeRange] = useState(profile.ageRange);
  const [editConditions, setEditConditions] = useState<string[]>(profile.healthConditions);
  const [editGender, setEditGender] = useState(profile.gender);
  const [editGpsEnabled, setEditGpsEnabled] = useState(profile.gpsEnabled);

  const getGenderLabel = () => {
    const option = genderOptions.find(o => o.value === profile.gender);
    return option?.label || profile.gender;
  };

  const getAgeLabel = () => {
    const option = ageRangeOptions.find(o => o.value === profile.ageRange);
    return option?.label || profile.ageRange;
  };

  const getWeightDisplay = () => {
    if (!profile.weight) return 'Not set';
    return `${profile.weight} ${profile.weightUnit}`;
  };

  const handleReset = () => {
    localStorage.clear();
    setOnboardingComplete(false);
    navigate('/onboarding');
  };

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  };

  const saveWeight = () => {
    const weightNum = parseFloat(editWeight);
    if (weightNum >= 10 && weightNum <= 300) {
      setProfile({ ...profile, weight: weightNum, weightUnit: editWeightUnit });
    }
  };

  const saveAgeRange = () => {
    setProfile({ ...profile, ageRange: editAgeRange });
  };

  const toggleCondition = (condition: string) => {
    setEditConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const saveConditions = () => {
    setProfile({ ...profile, healthConditions: editConditions });
  };

  const saveGender = () => {
    setProfile({ ...profile, gender: editGender });
  };

  const saveGps = () => {
    setProfile({ ...profile, gpsEnabled: editGpsEnabled });
  };

  const openWeightDialog = () => {
    setEditWeight(profile.weight?.toString() || '');
    setEditWeightUnit(profile.weightUnit);
  };

  const openAgeDialog = () => {
    setEditAgeRange(profile.ageRange);
  };

  const openConditionsDialog = () => {
    setEditConditions(profile.healthConditions);
  };

  const openGenderDialog = () => {
    setEditGender(profile.gender);
  };

  const openGpsDialog = () => {
    setEditGpsEnabled(profile.gpsEnabled);
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6 water-text-gradient">Profile</h1>

        {/* User Info Card */}
        <Card className="p-4 mb-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Guest User</h2>
              <p className="text-sm text-muted-foreground">Sign in to sync data</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Sign in with Google
          </Button>
        </Card>

        {/* Personal Info */}
        <Card className="mb-4 shadow-card overflow-hidden">
          <h3 className="font-semibold p-4 pb-2">Personal Information</h3>
          
          <div className="divide-y divide-border">
            {/* Editable Gender */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={openGenderDialog}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span>Gender</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{getGenderLabel()}</span>
                    <Pencil className="h-4 w-4 text-primary" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Edit Gender</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {genderOptions.map((option) => (
                    <SelectionCard
                      key={option.value}
                      label={option.label}
                      selected={editGender === option.value}
                      onClick={() => setEditGender(option.value)}
                    />
                  ))}
                </div>
                <DialogClose asChild>
                  <Button onClick={saveGender} className="w-full water-gradient mt-4">
                    Save
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            {/* Editable Age Range */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={openAgeDialog}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Age Range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{getAgeLabel()}</span>
                    <Pencil className="h-4 w-4 text-primary" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Age Range</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {ageRangeOptions.map((option) => (
                    <SelectionCard
                      key={option.value}
                      label={option.label}
                      selected={editAgeRange === option.value}
                      onClick={() => setEditAgeRange(option.value)}
                    />
                  ))}
                </div>
                <DialogClose asChild>
                  <Button onClick={saveAgeRange} className="w-full water-gradient mt-4">
                    Save
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            {/* Editable Weight */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={openWeightDialog}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <span>Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{getWeightDisplay()}</span>
                    <Pencil className="h-4 w-4 text-primary" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Weight</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    placeholder={`Enter weight in ${editWeightUnit}`}
                    className="flex-1 h-12"
                    min={10}
                    max={editWeightUnit === 'kg' ? 300 : 660}
                  />
                  <div className="flex items-center gap-2 rounded-xl bg-muted p-2">
                    <button
                      onClick={() => setEditWeightUnit('kg')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        editWeightUnit === 'kg' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      onClick={() => setEditWeightUnit('lb')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        editWeightUnit === 'lb' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={saveWeight} className="w-full water-gradient">
                    Save
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            {/* Editable Health Conditions */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={openConditionsDialog}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-muted-foreground" />
                    <span>Health Conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {profile.healthConditions.length > 0 
                        ? `${profile.healthConditions.length} selected`
                        : 'None'}
                    </span>
                    <Pencil className="h-4 w-4 text-primary" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Edit Health Conditions</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <ConditionAutocomplete
                    options={healthConditionsList}
                    selected={editConditions}
                    onChange={setEditConditions}
                    placeholder="Search health conditions..."
                  />
                </div>
                <DialogClose asChild>
                  <Button onClick={saveConditions} className="w-full water-gradient mt-2">
                    Save
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            
            {/* Editable GPS */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={openGpsDialog}
                  className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>GPS Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={editGpsEnabled ? 'text-accent' : 'text-muted-foreground'}>
                      {profile.gpsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Pencil className="h-4 w-4 text-primary" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>GPS Location Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable GPS to get weather-adjusted hydration recommendations based on your local temperature and humidity.
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-medium">Enable GPS</span>
                    </div>
                    <Switch
                      checked={editGpsEnabled}
                      onCheckedChange={setEditGpsEnabled}
                    />
                  </div>
                </div>
                <DialogClose asChild>
                  <Button onClick={saveGps} className="w-full water-gradient">
                    Save
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Settings */}
        <Card className="mb-4 shadow-card overflow-hidden">
          <h3 className="font-semibold p-4 pb-2">Settings</h3>
          
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span>Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span>Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </Card>

        {/* Premium */}
        <Card className="mb-4 shadow-card overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
              <span className="font-semibold">Go Premium</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Remove ads, sync across devices, and unlock advanced stats.
            </p>
            <Button className="w-full water-gradient">
              Upgrade Now
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="mb-4 shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <span>About DrinkWater</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            
            <button className="flex items-center justify-between p-4 w-full text-left hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Medical Disclaimer</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </Card>

        {/* Reset */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Reset All Data?</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              This will delete all your data including hydration logs and settings. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          DrinkWater v1.0.0
        </p>
      </div>
    </div>
  );
}
