import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strive.app',
  appName: 'Strive',
  webDir: 'dist',
  server: {
    // GANTI 'https' MENJADI 'http' AGAR BISA KONEK KE LOCALHOST BACKEND
    androidScheme: 'http', 
    cleartext: true
  }
};

export default config;