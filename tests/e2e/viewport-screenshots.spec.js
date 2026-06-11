import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

const PAGES = [
  { name: 'dashboard', path: '/' },
  { name: 'traffic-manager', path: '/traffic' },
  { name: 'campaigns', path: '/campaigns' },
  { name: 'creatives', path: '/creatives' },
  { name: 'social-media', path: '/social-media' },
  { name: 'whatsapp-inbox', path: '/whatsapp' },
  { name: 'deep-analytics', path: '/analytics' },
  { name: 'tracking-utm', path: '/tracking' },
  { name: 'campaign-qa', path: '/campaign-qa' },
  { name: 'smart-campaign', path: '/smart-campaign' },
  { name: 'finances', path: '/finances' },
  { name: 'integrations', path: '/integrations' },
  { name: 'settings', path: '/settings' }
];

test.describe('Captura de Screenshots e Teste de Redimensionamento Responsivo', () => {
  test.beforeEach(async ({ page }) => {
    // Injetar token de sessão simulado antes do carregamento da página
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'token-jwt-simulado-12345');
      window.localStorage.setItem('tenantId', 'tenant-id-simulado-999');
    });
  });

  for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
    test.describe(`Viewport: ${vpName.toUpperCase()} (${vpSize.width}x${vpSize.height})`, () => {
      test.use({ viewport: vpSize });

      for (const pageInfo of PAGES) {
        test(`capturar screenshot de ${pageInfo.name}`, async ({ page }) => {
          // Navegar até a página correspondente
          await page.goto(pageInfo.path, { timeout: 15000 });
          // Aguardar a renderização inicial
          await page.waitForTimeout(1000);
          
          // Caminho de saída
          const outputDir = path.join('tests', 'e2e', 'screenshots', 'viewport', vpName);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const outputPath = path.join(outputDir, `${pageInfo.name}.png`);
          
          // Capturar screenshot
          await page.screenshot({ path: outputPath });
          console.log(`[Screenshot] Gravado: ${outputPath}`);
        });
      }
    });
  }

  // Testar também a página de login sem token (com e sem preloader)
  test.describe('Login & Preloader Viewports', () => {
    for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
      test.use({ viewport: vpSize });
      
      test(`capturar login em ${vpName}`, async ({ page }) => {
        // Limpar localStorage para testar sem login
        await page.addInitScript(() => {
          window.localStorage.clear();
        });
        
        await page.goto('/login', { timeout: 15000 });
        // Aguardar o preloader completar (que agora dura 1.4s)
        await page.waitForTimeout(2000);
        
        const outputDir = path.join('tests', 'e2e', 'screenshots', 'viewport', vpName);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, 'login.png');
        await page.screenshot({ path: outputPath });
        console.log(`[Screenshot] Login Gravado: ${outputPath}`);
      });
    }
  });
});
