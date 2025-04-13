
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.56b570351f3e4ae3996bac6a07625641',
  appName: 'wellura-journey-ai',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://56b57035-1f3e-4ae3-996b-ac6a07625641.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Configurações para plugins nativos
  }
};

export default config;
