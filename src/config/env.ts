import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

export const env = {
  baseUrl: getRequiredEnv('BASE_URL', 'https://automationexercise.com'),
  apiBaseUrl: getRequiredEnv('API_BASE_URL', 'https://automationexercise.com'),
  auth: {
    email: getOptionalEnv('AUTH_EMAIL'),
    password: getOptionalEnv('AUTH_PASSWORD')
  },
  execution: {
    headless: getBooleanEnv('HEADLESS', true)
  }
};
