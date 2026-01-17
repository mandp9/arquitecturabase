import { test, expect } from '@playwright/test';

test.describe('Mecánicas de Objetos: Pócimas', () => {

  test('El jugador activo puede gastar su pócima', async ({ browser }) => {

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

    await page1.waitForTimeout(2000);
    console.log(" Partida lista. Buscando quién tiene el turno...");

    const textoTurnoP1 = await page1.locator('#info-turno').textContent();
    const esTurnoP1 = textoTurnoP1.includes('TU TURNO');
    
    const paginaActiva = esTurnoP1 ? page1 : page2;
    const nombreJugador = esTurnoP1 ? 'pirma.ba' : 'ppseconte';

    console.log(`Turno de: ${nombreJugador}. Él intentará usar la pócima.`);

    const lblPocima = paginaActiva.locator('#lblPocimas');
    const imgPocima = paginaActiva.locator('.img-pocima');
    const btnPocima = paginaActiva.locator('#contenedor-pocima');

    await expect(lblPocima).toHaveText('1');
    await expect(imgPocima).not.toHaveClass(/pocima-off/);
    console.log("El jugador tiene 1 pócima activa.");

    console.log("Bebiendo pócima...");
    
    await btnPocima.click({ force: true });

    await expect(lblPocima).toHaveText('0');
    
    await expect(imgPocima).toHaveClass(/pocima-off/);
    
    console.log("Pócima consumida. Contador a 0.");

    await context1.close();
    await context2.close();
  });
});