/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Database configuration (for backward compatibility)
  readonly VITE_AWS_DB_HOST: string
  readonly VITE_AWS_DB_PORT: string
  readonly VITE_AWS_DB_NAME: string
  readonly VITE_AWS_DB_USER: string
  readonly VITE_AWS_DB_PASSWORD: string
  
  // Frontend-safe configuration
  readonly VITE_API_BASE_URL: string
  
  // Note: AWS S3 credentials are NEVER exposed to browser
  // All S3 operations go through secure backend API
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
