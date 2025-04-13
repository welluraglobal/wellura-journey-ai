
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
    SplashScreen: {
      launchAutoHide: true,
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#5B46A2'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    Permissions: {
      camera: 'prompt',
      microphone: 'prompt'
    }
  }
};

export default config;
