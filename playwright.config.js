// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  /* Fallar si dejamos un test.only en CI */
  forbidOnly: !!process.env.CI,
  /* Reintentos */
  retries: process.env.CI ? 2 : 0,
  /* Workers (hilos de proceso) */
  workers: process.env.CI ? 1 : undefined,
  /* Reporte en HTML */
  reporter: 'html',
  
  /* --- AJUSTES COMPARTIDOS --- */
  use: {
    /* 1. IMPORTANTE: Descomenta esto y pon tu puerto local (3000) */
    baseURL: 'http://localhost:3000',

    /* Guardar traza si falla (muy útil para depurar) */
    trace: 'on-first-retry',
  },

  /* --- PROYECTOS (NAVEGADORES) --- */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // He comentado Firefox y Safari para que las pruebas sean más rápidas ahora mismo.
    // Puedes descomentarlos luego si quieres probar en todos.
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],
});