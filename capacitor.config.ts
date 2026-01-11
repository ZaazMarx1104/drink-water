import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8279aeec73de43b88066199c1b410960',
  appName: 'DrinkWater',
  webDir: 'dist',
  server: {
    url: 'https://8279aeec-73de-43b8-8066-199c1b410960.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#2E86AB',
      sound: 'beep.wav',
    },
  },
};

export default config;
