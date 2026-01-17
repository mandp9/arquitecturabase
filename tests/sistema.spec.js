import { test, expect } from '@playwright/test';

test.describe('Flujo Multijugador con Login Real', () => {

  test('Dos usuarios registrados pueden crear y jugar', async ({ browser }) => {

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.goto('/'); 
    await expect(page1.locator('#email')).toBeVisible();
    await page1.locator('#email').fill('ppseconte@gmail.com');  // Tu email real 1
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();

    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();

    const codigoLocator = page1.locator('span.text-warning');
    await expect(codigoLocator).toBeVisible();
    const codigoSala = await codigoLocator.textContent();
    console.log(`Partida creada. Código: ${codigoSala}`);


    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    await page2.goto('/');
    await expect(page2.locator('#email')).toBeVisible();
    await page2.locator('#email').fill('pirma.ba@gmail.com'); 
    await page2.locator('#pwd').fill('1234');
    await page2.locator('#btnLogin').click();

    // Unirse
    await expect(page2.locator('#buscador')).toBeVisible({ timeout: 10000 });
    if (codigoSala) {
        await page2.locator('#buscador').fill(codigoSala);
    }
    
    const botonUnirse = page2.locator('#listaPartidas button.btnUnirse').first();
    await expect(botonUnirse).toBeVisible();
    await botonUnirse.click();

    // 1. PEPE LE DA A "COMENZAR"
    const btnStartP1 = page1.locator('#btnIrAlJuego');
    await expect(btnStartP1).toBeVisible({ timeout: 10000 });
    await btnStartP1.click();

    const btnStartP2 = page2.locator('#btnIrAlJuego');
    try {
        await btnStartP2.waitFor({ state: 'visible', timeout: 3000 });
        if (await btnStartP2.isVisible()) {
            console.log("Juan también necesita pulsar 'A la batalla'...");
            await btnStartP2.click();
        }
    } catch (e) {
        console.log("Juan entró directo al juego o el botón ya no está.");
    }
    
    await expect(page1.locator('#info-turno')).toBeVisible({ timeout: 15000 });
    await expect(page2.locator('#info-turno')).toBeVisible({ timeout: 15000 });

    await expect(page1.locator('.carta').first()).toBeVisible();
    await expect(page2.locator('.carta').first()).toBeVisible();

    console.log("¡Test completado con éxito! Ambos jugadores están en el tablero.");

    await context1.close();
    await context2.close();
  });
});