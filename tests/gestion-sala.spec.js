import { test, expect } from '@playwright/test';

test.describe('Gestión de Salas y Permisos', () => {

  test('El creador ve actualizaciones en tiempo real y puede disolver la sala', async ({ browser }) => {
    
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // Login P1 (Admin/Creador)
    await page1.locator('#email').fill('pirma.ba@gmail.com'); 
    await page1.locator('#pwd').fill('1234');
    await page1.locator('#btnLogin').click();
    
    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 10000 });
    await page1.locator('#btnCrearPartida').click();
    
    const codigo = await page1.locator('span.text-warning').textContent();
    console.log(`Sala creada: ${codigo}`);

    await expect(page1.locator('#listaJugadoresSala li')).toHaveCount(1);
    await expect(page1.locator('#listaJugadoresSala li').first()).toContainText('pirma.ba@gmail.com');

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    
    await page2.locator('#email').fill('ppseconte@gmail.com'); 
    await page2.locator('#pwd').fill('1234');
    await page2.locator('#btnLogin').click();

    await page2.locator('#buscador').fill(codigo);
    await page2.locator('#listaPartidas button.btnUnirse').first().click();


    console.log("Comprobando que Pepe ve a Juan entrar sin recargar...");

    await expect(page1.locator('#listaJugadoresSala li')).toHaveCount(2);
    
    await expect(page1.locator('#listaJugadoresSala li').nth(1)).toContainText('ppseconte@gmail.com');
    console.log(" WebSocket funcionó: Pepe vio aparecer a Juan.");

    // Pepe es el JEFE: Debe tener botón ROJO de "Disolver equipo" (#btnEliminarPartida)
    await expect(page1.locator('#btnEliminarPartida')).toBeVisible();
    
    // Juan es el INVITADO: NO debe ver el botón de borrar, sino el de "Abandonar" (#btnSalirPartida)
    await expect(page2.locator('#btnEliminarPartida')).toBeHidden();
    await expect(page2.locator('#btnSalirPartida')).toBeVisible();
    
    console.log("Permisos correctos: El invitado no puede borrar la sala.");

    console.log("Probando disolución de sala...");

    page1.on('dialog', async dialog => {
        console.log(`Apareció alerta: "${dialog.message()}"`);
        await dialog.accept(); 
    });

    await page1.locator('#btnEliminarPartida').click();

    await expect(page1.locator('#btnCrearPartida')).toBeVisible({ timeout: 5000 });
    
    console.log("Sala disuelta y Admin devuelto al Home.");

    await context1.close();
    await context2.close();
  });
});