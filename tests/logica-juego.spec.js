import { test, expect } from '@playwright/test';

test.describe('Lógica del Juego: Aciertos y Puntuación', () => {

  test('Jugador acierta pareja, gana puntos y repite turno', async ({ browser }) => {

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // Login P1 
    await page1.locator('#email').fill('pirma.ba@gmail.com'); 
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();
    
    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();
    const codigo = await page1.locator('span.text-warning').textContent();

    // Login P2 
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
    
    console.log(" Analizando el tablero para buscar parejas...");

    const textoTurnoPagina1 = await page1.locator('#info-turno').textContent();
    const esTurnoDePagina1 = textoTurnoPagina1.includes('TU TURNO');
    
    const nickJugador1 = 'pirma.ba@gmail.com';
    const nickJugador2 = 'ppseconte@gmail.com';

    const paginaActiva = esTurnoDePagina1 ? page1 : page2;
    const nombreJugador = esTurnoDePagina1 ? nickJugador1 : nickJugador2;
    
    console.log(`Turno de: ${nombreJugador}`);

 
    const imagenes = await paginaActiva.locator('#au .carta .frente img').all();
    
    let cartaA_index = -1;
    let cartaB_index = -1;
    let srcEncontrado = "";

    for (let i = 0; i < imagenes.length; i++) {
        const src1 = await imagenes[i].getAttribute('src');
        
        for (let j = i + 1; j < imagenes.length; j++) {
            const src2 = await imagenes[j].getAttribute('src');
            
            // Si son iguales y NO son especiales (para simplificar el test, evitamos gatos/cofres)
            // Filtramos las cartas normales (enemy1, enemy2, etc...)
            if (src1 === src2 && !src1.includes('enemy19') && !src1.includes('enemy21')) {
                cartaA_index = i;
                cartaB_index = j;
                srcEncontrado = src1;
                break;
            }
        }
        if (cartaA_index !== -1) break; 
    }

    if (cartaA_index === -1) {
        console.log("No se encontraron parejas normales (solo especiales), saltando test.");
        return; 
    }

    console.log(`Pareja detectada en índices [${cartaA_index}] y [${cartaB_index}] (${srcEncontrado})`);

    const selectorPuntos = '#panel-info #mis-monedas'; 
    const elPuntosAntes = paginaActiva.locator(selectorPuntos).first();
    const puntosAntes = parseInt(await elPuntosAntes.textContent()) || 0;

    console.log(`Puntos iniciales: ${puntosAntes}`);

    const cartas = paginaActiva.locator('#au .carta');
    
    await cartas.nth(cartaA_index).dispatchEvent('click');
    
    await paginaActiva.waitForTimeout(1000); 
    
    await cartas.nth(cartaB_index).dispatchEvent('click');

    console.log("Esperando confirmación del servidor...");
    await paginaActiva.waitForTimeout(4000); 

    // Verificar que las cartas SIGUEN GIRADAS
    await expect(cartas.nth(cartaA_index)).toHaveClass(/girada/);
    await expect(cartas.nth(cartaB_index)).toHaveClass(/girada/);
    console.log("Las cartas siguen boca arriba (pareja correcta).");

    const elPuntosDespues = paginaActiva.locator(selectorPuntos).first();
    const puntosDespues = parseInt(await elPuntosDespues.textContent()) || 0;
    
    console.log(`Puntos finales: ${puntosDespues}`);

    if (puntosDespues > puntosAntes) {
        console.log(`¡Correcto! Puntuación subió (+${puntosDespues - puntosAntes}).`);
    } else {
        throw new Error(`La puntuación no subió. Antes: ${puntosAntes}, Después: ${puntosDespues}`);
    }

    const textoTurnoPost = await paginaActiva.locator('#info-turno').textContent();
    expect(textoTurnoPost).toContain('TU TURNO');
    console.log("El jugador mantiene el turno por acertar.");

    await context1.close();
    await context2.close();
  });
});