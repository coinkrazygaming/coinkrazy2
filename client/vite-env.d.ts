/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_PAY_MERCHANT_ID: string;
  readonly VITE_STRIPE_MERCHANT_ID: string;
  readonly VITE_GOOGLE_PAY_ENVIRONMENT: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
