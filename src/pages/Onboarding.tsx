import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHydration } from '@/contexts/HydrationContext';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { SelectionCard } from '@/components/SelectionCard';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { genderOptions, ageRangeOptions, healthConditionsList } from '@/lib/hydration';
import { Droplets, User, Calendar, Scale, HeartPulse, MapPin } from 'lucide-react';

type OnboardingStep = 'gender' | 'age' | 'weight' | 'health' | 'gps';

const stepOrder: OnboardingStep[] = ['gender', 'age', 'weight', 'health', 'gps'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, setProfile, setOnboardingComplete } = useHydration();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
  const [selectedGender, setSelectedGender] = useState(profile.gender);
  const [hrtMonths, setHrtMonths] = useState<number>(profile.hrtMonths || 0);
  const [selectedAge, setSelectedAge] = useState(profile.ageRange);
  const [weight, setWeight] = useState(profile.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(profile.healthConditions);
  const [customCondition, setCustomCondition] = useState('');
  const [medications, setMedications] = useState(profile.medications);
  const [gpsEnabled, setGpsEnabled] = useState(profile.gpsEnabled);

  const stepIndex = stepOrder.indexOf(currentStep);
  const isMidTransition = selectedGender.includes('transition');

  const handleContinue = () => {
    // Save current step data
    const updatedProfile = { ...profile };
    
    switch (currentStep) {
      case 'gender':
        updatedProfile.gender = selectedGender;
        updatedProfile.hrtMonths = isMidTransition ? hrtMonths : undefined;
        break;
      case 'age':
        updatedProfile.ageRange = selectedAge;
        break;
      case 'weight':
        updatedProfile.weight = weight ? parseFloat(weight) : null;
        updatedProfile.weightUnit = weightUnit;
        break;
      case 'health':
        updatedProfile.healthConditions = selectedConditions;
        updatedProfile.medications = medications;
        break;
      case 'gps':
        updatedProfile.gpsEnabled = gpsEnabled;
        setProfile(updatedProfile);
        setOnboardingComplete(true);
        navigate('/');
        return;
    }
    
    setProfile(updatedProfile);
    
    // Move to next step
    const nextIndex = stepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  const handleSkip = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    } else {
      setOnboardingComplete(true);
      navigate('/');
    }
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions(prev => [...prev, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'gender':
        return (
          <>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {genderOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  selected={selectedGender === option.value}
                  onClick={() => setSelectedGender(option.value)}
                />
              ))}
            </div>
            
            {isMidTransition && (
              <div className="mt-6 animate-slide-up">
                <Label className="text-sm font-medium text-muted-foreground">
                  Months on HRT (0-24)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={24}
                  value={hrtMonths}
                  onChange={(e) => setHrtMonths(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="mt-2 h-14 text-lg"
                  placeholder="Enter months"
                />
              </div>
            )}
          </>
        );

      case 'age':
        return (
          <div className="space-y-3">
            {ageRangeOptions.map((option) => (
              <SelectionCard
                key={option.value}
                label={option.label}
                selected={selectedAge === option.value}
                onClick={() => setSelectedAge(option.value)}
              />
            ))}
          </div>
        );

      case 'weight':
        return (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={`Enter weight in ${weightUnit}`}
                  className="h-14 text-lg"
                  min={10}
                  max={300}
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted p-2">
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    weightUnit === 'kg' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  kg
                </button>
                <button
                  onClick={() => setWeightUnit('lb')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    weightUnit === 'lb' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  lb
                </button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your weight helps us calculate your optimal daily water intake.
            </p>
          </>
        );

      case 'health':
        return (
          <>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {healthConditionsList.map((condition) => (
                <SelectionCard
                  key={condition}
                  label={condition}
                  selected={selectedConditions.includes(condition)}
                  onClick={() => toggleCondition(condition)}
                  variant="checkbox"
                />
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Input
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Add custom condition"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addCustomCondition()}
              />
              <button
                onClick={addCustomCondition}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                Add
              </button>
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium text-muted-foreground">
                Current medications (optional)
              </Label>
              <Input
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Enter any medications"
                className="mt-2"
              />
            </div>
          </>
        );

      case 'gps':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl bg-primary/5 p-6 text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <p className="text-muted-foreground">
                We use your location to adjust water recommendations based on local weather conditions like temperature and humidity.
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">Enable GPS</span>
              </div>
              <Switch
                checked={gpsEnabled}
                onCheckedChange={setGpsEnabled}
              />
            </div>
          </div>
        );
    }
  };

  const getIllustration = () => {
    const iconClass = "h-24 w-24 text-primary";
    switch (currentStep) {
      case 'gender':
        return <User className={iconClass} />;
      case 'age':
        return <Calendar className={iconClass} />;
      case 'weight':
        return <Scale className={iconClass} />;
      case 'health':
        return <HeartPulse className={iconClass} />;
      case 'gps':
        return <MapPin className={iconClass} />;
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'gender':
        return 'Select Your Gender';
      case 'age':
        return 'Select Your Age';
      case 'weight':
        return 'Enter Your Weight';
      case 'health':
        return 'Health Conditions';
      case 'gps':
        return 'Enable GPS Permission';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'gender':
        return 'This helps us personalize your hydration needs';
      case 'age':
        return 'Age affects your daily water requirements';
      case 'weight':
        return 'Weight is the most important factor for hydration';
      case 'health':
        return 'Select any conditions that may affect hydration';
      case 'gps':
        return 'Get weather-adjusted recommendations';
    }
  };

  return (
    <OnboardingScreen
      step={stepIndex + 1}
      totalSteps={stepOrder.length}
      title={getTitle()}
      subtitle={getSubtitle()}
      onContinue={handleContinue}
      onSkip={handleSkip}
      showSkip={currentStep === 'weight' || currentStep === 'health'}
      illustration={
        <div className="p-8 rounded-full bg-secondary/50 animate-pulse-glow">
          {getIllustration()}
        </div>
      }
    >
      {renderStepContent()}
    </OnboardingScreen>
  );
}
