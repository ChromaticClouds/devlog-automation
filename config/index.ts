import "dotenv/config";

export const config = {
  GITHUB_API_BASE_URL:
    process.env.GITHUB_API_BASE_URL ?? "https://api.github.com",
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
};
