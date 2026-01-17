import { test, expect } from '@playwright/test';

test.describe('Reglas del Juego: Control de Turnos', () => {

  test('Un jugador no puede levantar cartas si no es su turno', async ({ browser }) => {
    
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


    console.log("Verificando cumplimiento de reglas de turno...");

    const textoTurnoP1 = await page1.locator('#info-turno').textContent();
    const esTurnoP1 = textoTurnoP1.includes('TU TURNO');
    
    const paginaActiva = esTurnoP1 ? page1 : page2;
    const paginaInactiva = esTurnoP1 ? page2 : page1;
    
    const nombreActivo = esTurnoP1 ? 'pirma.ba' : 'ppseconte';
    const nombreInactivo = esTurnoP1 ? 'ppseconte' : 'pirma.ba';

    console.log(`Turno de: ${nombreActivo}`);
    console.log(`Esperando: ${nombreInactivo}`);


    console.log(`${nombreInactivo} intenta tocar una carta fuera de turno...`);
    
    const cartaTrampa = paginaInactiva.locator('#au .carta').first();
    
    await cartaTrampa.dispatchEvent('click');
    
    await paginaInactiva.waitForTimeout(1000);

    await expect(cartaTrampa).not.toHaveClass(/girada/);
    console.log("¡Bloqueo exitoso! La carta no se movió.");


    console.log(`Ahora ${nombreActivo} mueve legalmente...`);
    
    const cartaLegal = paginaActiva.locator('#au .carta').first();
    
    await cartaLegal.dispatchEvent('click');
    
    await expect(cartaLegal).toHaveClass(/girada/, { timeout: 5000 });
    
    await expect(cartaTrampa).toHaveClass(/girada/, { timeout: 5000 });
    
    console.log("Movimiento legal aceptado y sincronizado.");

    await context1.close();
    await context2.close();
  });
});