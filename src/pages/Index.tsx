import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useHydration } from '@/contexts/HydrationContext';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingComplete } = useHydration();

  useEffect(() => {
    if (!onboardingComplete) {
      navigate('/welcome');
    }
  }, [onboardingComplete, navigate]);

  return null;
};

export default Index;
