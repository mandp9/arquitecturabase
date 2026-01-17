import { test, expect } from '@playwright/test';

test.describe('Finalización de Partida por Abandono', () => {

  test('Si un jugador abandona, el otro es devuelto al Home', async ({ browser }) => {
    
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    await page1.locator('#email').fill('pirma.ba@gmail.com'); 
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();
    
    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();
    const codigo = await page1.locator('span.text-warning').textContent();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    
    await page2.locator('#email').fill('ppseconte@gmail.com'); 
    await page2.locator('#pwd').fill('1234');
    await page2.locator('#btnLogin').click();

    await page2.locator('#buscador').fill(codigo);
    await page2.locator('#listaPartidas button.btnUnirse').first().click();

    await expect(page1.locator('#btnIrAlJuego')).toBeVisible();
    await page1.locator('#btnIrAlJuego').click();

    try {
        const btnJuan = page2.locator('#btnIrAlJuego');
        await btnJuan.waitFor({ state: 'visible', timeout: 2000 });
        if (await btnJuan.isVisible()) await btnJuan.click();
    } catch (e) {}

    await expect(page1.locator('#info-turno')).toBeVisible();
    await expect(page2.locator('#info-turno')).toBeVisible();
    console.log("Partida iniciada.");

    
    console.log("Juan decide abandonar la partida...");

    await page2.locator('#lnkSalir').click();

    await expect(page2.locator('#email')).toBeVisible();
    console.log("Juan ha salido correctamente.");
    
    console.log("Verificando que Pepe es redirigido al Home...");

    const btnCrear = page1.locator('#btnCrearPartida');
    
    await expect(btnCrear).toBeVisible({ timeout: 10000 });

    console.log("¡Correcto! La partida se canceló y Pepe está en el Home.");

    await context1.close();
    await context2.close();
  });
});