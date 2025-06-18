/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OPENROUTER_MODEL: string
  readonly VITE_GNEWS_API_KEY: string
  readonly VITE_EVENTBRITE_API_KEY: string
  readonly VITE_EVENTBRITE_CLIENT_SECRET: string
  readonly VITE_EVENTBRITE_PRIVATE_TOKEN: string
  readonly VITE_EVENTBRITE_PUBLIC_TOKEN: string
  readonly VITE_WEATHER_API_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Google Maps API Types
declare global {
  interface Window {
    google: typeof google;
  }
}
