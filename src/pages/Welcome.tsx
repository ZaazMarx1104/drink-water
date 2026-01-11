import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Droplets, ChevronRight, Heart, MapPin, BarChart3, Bell } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    { icon: Heart, label: 'Personalized hydration' },
    { icon: MapPin, label: 'Weather-adjusted goals' },
    { icon: BarChart3, label: 'Track your progress' },
    { icon: Bell, label: 'Smart reminders' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <div className="mb-8 animate-float">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
            <div className="relative h-32 w-32 rounded-full water-gradient flex items-center justify-center shadow-water animate-pulse-glow">
              <Droplets className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-3 animate-slide-up">
          Welcome To <span className="water-text-gradient">DrinkWater</span>
        </h1>
        
        <p className="text-center text-muted-foreground mb-8 max-w-xs animate-fade-in">
          DrinkWater is a personalized hydration tracker that helps you stay healthy and hydrated throughout the day.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 space-y-3">
        <Button
          onClick={() => navigate('/onboarding')}
          className="w-full h-14 text-lg font-semibold water-gradient hover:opacity-90 shadow-water"
        >
          Get Started
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
