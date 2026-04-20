import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  /* --- ESTO ES LO QUE SOLUCIONA EL TIMEOUT --- */
  webServer: {
    command: 'npm run dev -- --mode test',        // Comando para encender tu App
    url: 'http://localhost:5174',  // Playwright espera a que esta URL responda
    reuseExistingServer: true, // Si ya tienes el server abierto en otra terminal, lo usará
    timeout: 120 * 1000,           // Da 2 min para que el servidor arranque (por si acaso)
  },
});