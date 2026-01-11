import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Droplets, ArrowRight, Shield, Cloud, Bell } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center animate-float">
          <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-primary/10 mb-6 bubble-glow">
            <Droplets className="h-14 w-14 text-primary" />
          </div>
          <h1 className="text-4xl font-bold water-text-gradient mb-2">DrinkWater</h1>
          <p className="text-lg text-muted-foreground">Your Personal Hydration Companion</p>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Personalized Targets</p>
              <p className="text-sm text-muted-foreground">Based on your body & health</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Weather Adjusted</p>
              <p className="text-sm text-muted-foreground">GPS-based recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Smart Reminders</p>
              <p className="text-sm text-muted-foreground">Never forget to hydrate</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Link to="/auth" className="block">
            <Button className="w-full h-14 text-lg font-semibold water-gradient hover:opacity-90 shadow-water">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-muted-foreground relative z-10">
        <p>Stay hydrated, stay healthy 💧</p>
      </div>
    </div>
  );
}
