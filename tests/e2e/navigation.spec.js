import { test, expect } from '@playwright/test';

test.describe('Navegação e Layout E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Injetar token de sessão no localStorage antes do carregamento da página
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'token-jwt-simulado-12345');
      window.localStorage.setItem('tenantId', 'tenant-id-simulado-999');
    });
  });

  test('deve navegar pelas abas principais da Sidebar e visualizar as telas corretas', async ({ page }) => {
    // Ir para a página inicial (Dashboard)
    await page.goto('/');
    // Aguardar o preloader completar (que agora dura 1.4s)
    await page.waitForTimeout(2500);

    // Validar carregamento do Dashboard
    await expect(page.locator('text=Acompanhe o desempenho de todas as suas campanhas')).toBeVisible();

    // Navegar para o Gestor de Tráfego
    await page.click('aside a[href="/traffic"]');
    await expect(page).toHaveURL('/traffic');
    await expect(page.locator('text=Central unificada de campanhas multicanal')).toBeVisible();

    // Navegar para a tela de Analytics Profundo
    await page.click('aside a[href="/analytics"]');
    await expect(page).toHaveURL('/analytics');
    
    // Validar se o novo painel de Lacuna de Atribuição (Attribution Gap) que criamos está presente
    await expect(page.locator('text=Lacuna de Atribuição (Attribution Gap)')).toBeVisible();

    // Navegar para a nossa nova tela Rastreamento UTM
    await page.click('aside a[href="/tracking"]');
    await expect(page).toHaveURL('/tracking');
    await expect(page.locator('text=Rastreamento UTM & Pixels')).toBeVisible();

    // Navegar para a nossa nova tela Validador de Campanhas QA
    await page.click('aside a[href="/campaign-qa"]');
    await expect(page).toHaveURL('/campaign-qa');
    await expect(page.locator('text=Campaign QA (Auditoria Pré-Lançamento)')).toBeVisible();
  });
});
