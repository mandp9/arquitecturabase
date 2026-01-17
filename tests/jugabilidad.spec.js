import { test, expect } from '@playwright/test';

test.describe('Mecánicas de Juego y Sincronización', () => {

  test('Las cartas se giran en ambas pantallas y el logout funciona', async ({ browser }) => {

    
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // Login P1
    await page1.locator('#email').fill('ppseconte@gmail.com'); 
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();
    
    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();
    const codigo = await page1.locator('span.text-warning').textContent();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    
    // Login P2
    await page2.locator('#email').fill('pirma.ba@gmail.com'); 
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

    console.log("Probando sincronización de movimientos...");
    await page1.waitForTimeout(2000);

    const textoTurnoPepe = await page1.locator('#info-turno').textContent();
    
    const esTurnoDePpseconte = textoTurnoPepe.includes('TU TURNO');
    
    const nickJugador1 = 'ppseconte@gmail.com';
    const nickJugador2 = 'pirma.ba@gmail.com';

    console.log(`🎲 El servidor ha decidido que empieza: ${esTurnoDePpseconte ? nickJugador1 : nickJugador2}`);

    const paginaJugador = esTurnoDePpseconte ? page1 : page2;
    const paginaEspectador = esTurnoDePpseconte ? page2 : page1;

    const cartaJugador = paginaJugador.locator('#au .carta').first();

    await cartaJugador.dispatchEvent('click');
    await expect(cartaJugador).toHaveClass(/girada/, { timeout: 10000 });

    const cartaEspectador = paginaEspectador.locator('#au .carta').first();
    await expect(cartaEspectador).toHaveClass(/girada/, { timeout: 10000 });
    
    console.log("¡Sincronización perfecta! El movimiento se replicó.");

    //logout
    console.log("Probando cierre de sesión...");
    
    await page1.locator('#lnkSalir').click();

    await expect(page1.locator('#email')).toBeVisible();
    
    await expect(page1.locator('#btnCrearPartida')).toBeHidden();

    console.log("Logout exitoso.")

    await context1.close();
    await context2.close();
  });
});