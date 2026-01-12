// DrinkWater Hydration Algorithm
// Based on scientific research and medical guidelines

export interface UserProfile {
  gender: string;
  ageRange: string;
  weight: number | null;
  weightUnit: 'kg' | 'lb';
  healthConditions: string[];
  medications: string;
  hrtMonths?: number;
  gpsEnabled: boolean;
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  altitude: number; // Meters
  uvIndex: number;
  city: string;
}

export interface HydrationResult {
  dailyTarget: number;
  baseAmount: number;
  ageAdjustment: number;
  genderAdjustment: number;
  healthAdjustment: number;
  environmentAdjustment: number;
  nextDrinkAmount: number;
  breakdown: {
    label: string;
    value: number;
    isAddition: boolean;
  }[];
}

// Convert weight to kg if needed
export function toKg(weight: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? weight * 0.453592 : weight;
}

// Convert kg to lb
export function toLb(weight: number): number {
  return weight * 2.20462;
}

// Get weight baseline multiplier based on weight
function getWeightBaseline(weightKg: number): number {
  if (weightKg < 50) return 33;
  if (weightKg <= 100) return 30.5;
  return 28;
}

// Get age adjustment factor
function getAgeFactor(ageRange: string): number {
  switch (ageRange) {
    case '5-13':
      return 1.20; // +20%
    case '14-24':
      return 1.10; // +10%
    case '65+':
      return 0.95; // -5%
    default:
      return 1.0;
  }
}

// Get gender adjustment factor
function getGenderFactor(gender: string, hrtMonths?: number): number {
  // Base factors
  const maleFactor = 1.0;
  const femaleFactor = 0.9;

  switch (gender) {
    case 'male':
    case 'trans-male-transitioned':
    case 'intersex-male':
      return maleFactor;
    case 'female':
    case 'trans-female-transitioned':
    case 'intersex-female':
      return femaleFactor;
    case 'trans-male-transition':
      // FTM: transitioning from 0.9 to 1.0
      if (hrtMonths !== undefined && hrtMonths <= 24) {
        return femaleFactor + (maleFactor - femaleFactor) * (hrtMonths / 24);
      }
      return 0.95;
    case 'trans-female-transition':
      // MTF: transitioning from 1.0 to 0.9
      if (hrtMonths !== undefined && hrtMonths <= 24) {
        return maleFactor - (maleFactor - femaleFactor) * (hrtMonths / 24);
      }
      return 0.95;
    case 'non-binary':
    case 'other':
      return 0.95; // Average between male and female
    default:
      return 1.0;
  }
}

// Get health conditions adjustment
function getHealthFactor(conditions: string[]): { factor: number; adjustments: { label: string; value: number }[] } {
  let factor = 1.0;
  const adjustments: { label: string; value: number }[] = [];

  conditions.forEach((condition) => {
    switch (condition.toLowerCase()) {
      case 'kidney stones':
        factor += 0.30;
        adjustments.push({ label: 'Kidney Stones', value: 30 });
        break;
      case 'diabetes type 1':
      case 'diabetes type 2':
        factor += 0.15;
        adjustments.push({ label: 'Diabetes', value: 15 });
        break;
      case 'fever':
        factor += 0.20;
        adjustments.push({ label: 'Fever', value: 20 });
        break;
      case 'heart failure':
        factor -= 0.30;
        adjustments.push({ label: 'Heart Failure', value: -30 });
        break;
      case 'kidney failure':
        factor -= 0.40;
        adjustments.push({ label: 'Kidney Failure', value: -40 });
        break;
      case 'uti':
        factor += 0.20;
        adjustments.push({ label: 'UTI', value: 20 });
        break;
      case 'pregnancy':
        factor += 0.15;
        adjustments.push({ label: 'Pregnancy', value: 15 });
        break;
      case 'breastfeeding':
        factor += 0.25;
        adjustments.push({ label: 'Breastfeeding', value: 25 });
        break;
      case 'hyperthyroidism':
        factor += 0.10;
        adjustments.push({ label: 'Hyperthyroidism', value: 10 });
        break;
      case 'asthma':
        factor += 0.05;
        adjustments.push({ label: 'Asthma', value: 5 });
        break;
      case 'liver cirrhosis':
        factor -= 0.15;
        adjustments.push({ label: 'Liver Cirrhosis', value: -15 });
        break;
    }
  });

  return { factor: Math.max(factor, 0.3), adjustments };
}

// Get environmental adjustment based on weather
function getEnvironmentFactor(weather: WeatherData | null): { factor: number; adjustments: { label: string; value: number }[] } {
  if (!weather) {
    return { factor: 1.0, adjustments: [] };
  }

  let factor = 1.0;
  const adjustments: { label: string; value: number }[] = [];

  // Temperature adjustment: +3% per degree above 25°C (max +50%)
  if (weather.temperature > 25) {
    const tempAdjust = Math.min((weather.temperature - 25) * 0.03, 0.50);
    factor += tempAdjust;
    adjustments.push({ label: 'Temperature', value: Math.round(tempAdjust * 100) });
  }

  // Humidity adjustment: +10% if above 70%
  if (weather.humidity > 70) {
    factor += 0.10;
    adjustments.push({ label: 'High Humidity', value: 10 });
  }

  // Altitude adjustment: +15% above 1500m
  if (weather.altitude > 1500) {
    factor += 0.15;
    adjustments.push({ label: 'High Altitude', value: 15 });
  }

  // UV Index adjustment: +8% if above 6
  if (weather.uvIndex > 6) {
    factor += 0.08;
    adjustments.push({ label: 'High UV', value: 8 });
  }

  return { factor, adjustments };
}

// Main hydration calculation function
export function calculateHydration(
  profile: UserProfile,
  weather: WeatherData | null,
  consumed: number = 0
): HydrationResult {
  // Default weight if not provided
  const weightKg = profile.weight ? toKg(profile.weight, profile.weightUnit) : 70;

  // Step 1: Weight baseline
  const baselineMultiplier = getWeightBaseline(weightKg);
  const baseAmount = weightKg * baselineMultiplier;

  // Step 2: Age adjustment
  const ageFactor = getAgeFactor(profile.ageRange);
  const ageAdjustment = baseAmount * (ageFactor - 1);

  // Step 3: Gender adjustment
  const genderFactor = getGenderFactor(profile.gender, profile.hrtMonths);
  const genderAdjustment = baseAmount * (genderFactor - 1);

  // Step 4: Health conditions
  const healthResult = getHealthFactor(profile.healthConditions);
  const healthAdjustment = baseAmount * (healthResult.factor - 1);

  // Step 5: Environmental factors
  const envResult = getEnvironmentFactor(weather);
  const environmentAdjustment = baseAmount * (envResult.factor - 1);

  // Calculate total
  let dailyTarget = baseAmount * ageFactor * genderFactor * healthResult.factor * envResult.factor;

  // Apply safety limits
  const minLimit = 1500;
  const maxLimit = Math.min(weightKg * 100, 24000);
  const restrictedMax = profile.healthConditions.some(c => 
    ['heart failure', 'kidney failure'].includes(c.toLowerCase())
  ) ? 2000 : maxLimit;

  dailyTarget = Math.max(minLimit, Math.min(dailyTarget, restrictedMax));

  // Calculate next drink recommendation
  const deficit = dailyTarget - consumed;
  const nextDrinkAmount = Math.min(Math.max(200, deficit * 0.3), 500);

  // Build breakdown
  const breakdown: { label: string; value: number; isAddition: boolean }[] = [
    { label: 'Base (weight)', value: Math.round(baseAmount), isAddition: true },
  ];

  if (ageAdjustment !== 0) {
    breakdown.push({ 
      label: `Age (${profile.ageRange})`, 
      value: Math.abs(Math.round(ageAdjustment)), 
      isAddition: ageAdjustment > 0 
    });
  }

  if (genderAdjustment !== 0) {
    breakdown.push({ 
      label: 'Gender adjustment', 
      value: Math.abs(Math.round(genderAdjustment)), 
      isAddition: genderAdjustment > 0 
    });
  }

  healthResult.adjustments.forEach(adj => {
    breakdown.push({
      label: adj.label,
      value: Math.abs(Math.round(baseAmount * adj.value / 100)),
      isAddition: adj.value > 0,
    });
  });

  envResult.adjustments.forEach(adj => {
    breakdown.push({
      label: adj.label,
      value: Math.abs(Math.round(baseAmount * adj.value / 100)),
      isAddition: adj.value > 0,
    });
  });

  return {
    dailyTarget: Math.round(dailyTarget),
    baseAmount: Math.round(baseAmount),
    ageAdjustment: Math.round(ageAdjustment),
    genderAdjustment: Math.round(genderAdjustment),
    healthAdjustment: Math.round(healthAdjustment),
    environmentAdjustment: Math.round(environmentAdjustment),
    nextDrinkAmount: Math.round(nextDrinkAmount),
    breakdown,
  };
}

// Default user profile
export const defaultProfile: UserProfile = {
  gender: 'male',
  ageRange: '25-35',
  weight: 70,
  weightUnit: 'kg',
  healthConditions: [],
  medications: '',
  gpsEnabled: false,
};

// Health conditions list
export const healthConditionsList = [
  'Asthma',
  'Diabetes Type 1',
  'Diabetes Type 2',
  'Heart Failure',
  'Kidney Stones',
  'Kidney Failure',
  'Liver Cirrhosis',
  'UTI',
  'Hyperthyroidism',
  'Pregnancy',
  'Breastfeeding',
  'Fever',
];

// Gender options
export const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'trans-male-transitioned', label: 'Trans-male (transitioned)' },
  { value: 'trans-female-transitioned', label: 'Trans-female (transitioned)' },
  { value: 'intersex-male', label: 'Intersex (identify as male)' },
  { value: 'intersex-female', label: 'Intersex (identify as female)' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'trans-male-transition', label: 'Trans-male (mid-transition)' },
  { value: 'trans-female-transition', label: 'Trans-female (mid-transition)' },
  { value: 'other', label: 'Other' },
];

// Age range options
export const ageRangeOptions = [
  { value: '5-13', label: '5-13 years old' },
  { value: '14-24', label: '14-24 years old' },
  { value: '25-35', label: '25-35 years old' },
  { value: '36-50', label: '36-50 years old' },
  { value: '51-65', label: '51-65 years old' },
  { value: '65+', label: '65+ years old' },
];
