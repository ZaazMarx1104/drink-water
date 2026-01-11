import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHydration } from '@/contexts/HydrationContext';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { SelectionCard } from '@/components/SelectionCard';
import { GenderPopup } from '@/components/GenderPopup';
import { MedicationsList, Medication } from '@/components/MedicationsList';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { healthConditionsList } from '@/lib/hydration';
import { Droplets, User, Calendar, Scale, HeartPulse, MapPin, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

type OnboardingStep = 'gender' | 'age' | 'weight' | 'health' | 'gps';

const stepOrder: OnboardingStep[] = ['gender', 'age', 'weight', 'health', 'gps'];

const mainGenderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, setProfile, setOnboardingComplete } = useHydration();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
  const [selectedGender, setSelectedGender] = useState(profile.gender);
  const [hrtMonths, setHrtMonths] = useState<number>(profile.hrtMonths || 0);
  const [showGenderPopup, setShowGenderPopup] = useState(false);
  const [selectedAge, setSelectedAge] = useState(profile.ageRange);
  const [weight, setWeight] = useState(profile.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(profile.healthConditions);
  const [customCondition, setCustomCondition] = useState('');
  const [medications, setMedications] = useState<Medication[]>(
    profile.medicationsList || []
  );
  const [gpsEnabled, setGpsEnabled] = useState(profile.gpsEnabled);

  const stepIndex = stepOrder.indexOf(currentStep);

  const handleBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(stepOrder[stepIndex - 1]);
    }
  };

  const handleContinue = () => {
    // Validate weight on weight step
    if (currentStep === 'weight') {
      if (!weight || parseFloat(weight) < 10 || parseFloat(weight) > 300) {
        toast.error('Please enter a valid weight (10-300 kg or equivalent in lb)');
        return;
      }
    }

    // Save current step data
    const updatedProfile = { ...profile };
    
    switch (currentStep) {
      case 'gender':
        updatedProfile.gender = selectedGender;
        updatedProfile.hrtMonths = selectedGender.includes('transition') ? hrtMonths : undefined;
        break;
      case 'age':
        updatedProfile.ageRange = selectedAge;
        break;
      case 'weight':
        updatedProfile.weight = parseFloat(weight);
        updatedProfile.weightUnit = weightUnit;
        break;
      case 'health':
        updatedProfile.healthConditions = selectedConditions;
        updatedProfile.medicationsList = medications;
        updatedProfile.medications = medications.map((m) => m.name).join(', ');
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

  const handleGenderSelect = (value: string) => {
    if (value === 'other') {
      setShowGenderPopup(true);
    } else {
      setSelectedGender(value);
    }
  };

  const ageRangeOptions = [
    { value: '5-13', label: '5-13 years old' },
    { value: '14-24', label: '14-24 years old' },
    { value: '25-35', label: '25-35 years old' },
    { value: '36-50', label: '36-50 years old' },
    { value: '51-65', label: '51-65 years old' },
    { value: '65+', label: '65+ years old' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 'gender':
        return (
          <>
            <div className="space-y-3">
              {mainGenderOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  label={option.label}
                  selected={
                    option.value === 'other'
                      ? !['male', 'female'].includes(selectedGender)
                      : selectedGender === option.value
                  }
                  onClick={() => handleGenderSelect(option.value)}
                />
              ))}
            </div>

            {!['male', 'female'].includes(selectedGender) && selectedGender !== 'other' && (
              <div className="mt-4 p-3 rounded-xl bg-muted animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedGender.replace(/-/g, ' ')}</span>
                </p>
              </div>
            )}

            <GenderPopup
              open={showGenderPopup}
              onOpenChange={setShowGenderPopup}
              selectedGender={selectedGender}
              onSelectGender={setSelectedGender}
              hrtMonths={hrtMonths}
              onHrtMonthsChange={setHrtMonths}
            />
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
                  max={weightUnit === 'kg' ? 300 : 660}
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
              Your weight is essential for calculating your optimal daily water intake accurately.
            </p>
          </>
        );

      case 'health':
        return (
          <>
            <div className="space-y-3 max-h-[35vh] overflow-y-auto">
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
            
            <div className="mt-6">
              <Label className="text-sm font-medium mb-3 block">
                Medications (optional)
              </Label>
              <MedicationsList
                medications={medications}
                onMedicationsChange={setMedications}
              />
            </div>
          </>
        );

      case 'gps':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl bg-primary/5 p-6 text-center bubble-container">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center bubble-glow">
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
    <div className="min-h-screen bg-background">
      {/* Bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      <OnboardingScreen
        step={stepIndex + 1}
        totalSteps={stepOrder.length}
        title={getTitle()}
        subtitle={getSubtitle()}
        onContinue={handleContinue}
        onSkip={handleSkip}
        showSkip={currentStep === 'health'}
        showBack={stepIndex > 0}
        onBack={handleBack}
        illustration={
          <div className="p-8 rounded-full bg-secondary/50 bubble-glow animate-float">
            {getIllustration()}
          </div>
        }
      >
        {renderStepContent()}
      </OnboardingScreen>
    </div>
  );
}
