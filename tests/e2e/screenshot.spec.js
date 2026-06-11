import { test, expect } from '@playwright/test';

test('capturar screenshots', async ({ page }) => {
  // Acessar raiz e tirar screenshot
  try {
    await page.goto('/', { timeout: 15000 });
    // Aguardar o carregamento de qualquer elemento do Dashboard
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/e2e/screenshot-root.png' });
  } catch (err) {
    console.error('Erro ao capturar raiz:', err.message);
    await page.screenshot({ path: 'tests/e2e/screenshot-root-error.png' });
  }

  // Acessar login e tirar screenshot
  try {
    await page.goto('/login', { timeout: 15000 });
    // Aguardar 5s para o preloader terminar de rodar
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'tests/e2e/screenshot-login.png' });
  } catch (err) {
    console.error('Erro ao capturar login:', err.message);
    await page.screenshot({ path: 'tests/e2e/screenshot-login-error.png' });
  }
});
