import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: [
            '@supabase/supabase-js',
            'src/lib/supabase.ts',
            'src/lib/database.ts',
            'src/lib/userDataService.ts',
            'src/lib/userStatisticsService.ts'
          ],
          maps: [
            '@googlemaps/react-wrapper',
            'src/components/map/GoogleMap.tsx'
          ],
          'travel-services': [
            'src/lib/travelStoriesService.ts',
            'src/lib/travelPlansService.ts',
            'src/lib/storyCommentsService.ts',
            'src/lib/exaUnifiedService.ts',
            'src/lib/newsApi.ts',
            'src/lib/weatherApi.ts',
            'src/lib/eventsApi.ts'
          ],
          payments: [
            'src/lib/revenueCat.ts',
            'src/components/payment/RevenueCatPayment.tsx',
            'src/components/payment/PricingPlans.tsx',
            'src/contexts/SubscriptionContext.tsx'
          ],
          ui: [
            'lucide-react',
            'src/components/common/LanguageSelector.tsx',
            'src/components/layout/TabNavigation.tsx'
          ],
          'ai-safety': [
            'src/lib/aiSafetyService.ts',
            'src/lib/locationSafetyService.ts',
            'src/lib/travelAlertApi.ts'
          ]
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
});
