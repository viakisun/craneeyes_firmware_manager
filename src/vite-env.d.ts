/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_REGION: string
  readonly VITE_AWS_ACCESS_KEY_ID: string
  readonly VITE_AWS_SECRET_ACCESS_KEY: string
  readonly VITE_AWS_BUCKET_NAME: string
  readonly VITE_AWS_DB_HOST: string
  readonly VITE_AWS_DB_PORT: string
  readonly VITE_AWS_DB_NAME: string
  readonly VITE_AWS_DB_USER: string
  readonly VITE_AWS_DB_PASSWORD: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
