import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação E2E', () => {
  test('deve exibir erro ao tentar login com credenciais incorretas', async ({ page }) => {
    // Interceptar rota de login para retornar erro 401
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciais inválidas' })
      });
    });

    await page.goto('/login');

    // Preencher campos
    await page.fill('input[type="email"]', 'usuario_errado@teste.com');
    await page.fill('input[type="password"]', 'senha_errada');
    await page.click('button[type="submit"]');

    // Verificar exibição da mensagem de erro
    const errorMessage = page.locator('text=Credenciais inválidas');
    await expect(errorMessage).toBeVisible();
  });

  test('deve realizar login com sucesso e redirecionar para o painel principal', async ({ page }) => {
    // Interceptar rota de login para retornar sucesso com JWT simulado
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-jwt-simulado-12345',
          tenant_id: 'tenant-id-simulado-999'
        })
      });
    });

    await page.goto('/login');

    // Preencher campos
    await page.fill('input[type="email"]', 'sucesso@teste.com');
    await page.fill('input[type="password"]', 'senha_forte_123');
    await page.click('button[type="submit"]');

    // Validar se redirecionou para o Dashboard (raiz "/")
    await expect(page).toHaveURL('/');
  });
});
