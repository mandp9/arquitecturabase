import { test, expect } from '@playwright/test';

test.describe('Flujo Completo: Partida Perfecta y Victoria', () => {

  test.setTimeout(120000); 

  test('Los jugadores cooperan para limpiar el tablero y acabar la partida', async ({ browser }) => {
    
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // P1: pirma.ba
    await page1.locator('#email').fill('pirma.ba@gmail.com'); 
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();
    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();
    const codigo = await page1.locator('span.text-warning').textContent();

    // P2: ppseconte
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.locator('#email').fill('ppseconte@gmail.com'); 
    await page2.locator('#pwd').fill('1234');
    await page2.locator('#btnLogin').click();
    await page2.locator('#buscador').fill(codigo);
    await page2.locator('#listaPartidas button.btnUnirse').first().click();

    await page1.locator('#btnIrAlJuego').click();
    try {
        const btnJuan = page2.locator('#btnIrAlJuego');
        await btnJuan.waitFor({ state: 'visible', timeout: 2000 });
        if (await btnJuan.isVisible()) await btnJuan.click();
    } catch (e) {}

    await page1.waitForTimeout(2000); 
    console.log(" Partida iniciada. Analizando tablero...");

    const imagenes = await page1.locator('#au .carta .frente img').all();
    const count = imagenes.length;
    let mapaCartas = {};

    for (let i = 0; i < count; i++) {
        const src = await imagenes[i].getAttribute('src');
        if (!mapaCartas[src]) mapaCartas[src] = [];
        mapaCartas[src].push(i);
    }

    console.log(`Tablero analizado. Hay ${Object.keys(mapaCartas).length} parejas.`);

    for (const [src, indices] of Object.entries(mapaCartas)) {
        
        if (indices.length === 2) {
            const i1 = indices[0];
            const i2 = indices[1];

            const textoTurnoP1 = await page1.locator('#info-turno').textContent();
            
            const esTurnoP1 = textoTurnoP1.includes('TU TURNO') || textoTurnoP1.includes('pirma');
            
            const paginaActiva = esTurnoP1 ? page1 : page2;
            const quienJuega = esTurnoP1 ? 'P1 (Pepe)' : 'P2 (Juan)';

            console.log(`${quienJuega} va a completar pareja: ${src}`);

            await paginaActiva.locator('#au .carta').nth(i1).dispatchEvent('click');
            await paginaActiva.waitForTimeout(500); 
            await paginaActiva.locator('#au .carta').nth(i2).dispatchEvent('click');
            
            await paginaActiva.waitForTimeout(2000); 
        }
    }

    console.log("Tablero despejado. Esperando pantalla de fin...");

    
    await expect(page1.locator('body')).toContainText(/VICTORIA|DERROTA|Resultados|Volver/i, { timeout: 30000 });

    const textoPantalla = await page1.locator('body').innerText();
    console.log(`¡Pantalla final detectada!\n${textoPantalla}`);
    
    console.log("¡Partida completada y validada correctamente!");

    await context1.close();
    await context2.close();
  });
});