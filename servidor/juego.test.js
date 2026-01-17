const modelo = require("./modelo.js");

jest.mock('@google-cloud/secret-manager', () => ({
    SecretManagerServiceClient: class {
        async accessSecretVersion() { return [{ payload: { data: Buffer.from("secreto") } }]; }
    }
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue(true) })
}));

jest.mock("./cad.js", () => ({
    CAD: class {
        conectar(cb) { cb && cb(this); }
        buscarUsuario(criterio, cb) { cb(null); }
        insertarLog(log, cb) { if(cb) cb(log); }
        sumarMonedas(email, cantidad, cb) { if(cb) cb(cantidad); }
    }
}));

describe('Mecánicas del Juego', function() {
    let sistema;
    let codigo;
    let partida;
    const JUGADOR_A = 'Pepe';
    const JUGADOR_B = 'Juan';

    beforeEach(function() {
        sistema = new modelo.Sistema({ test: true });
        sistema.agregarUsuario(JUGADOR_A);
        sistema.agregarUsuario(JUGADOR_B);
        const res = sistema.crearPartida(JUGADOR_A);
        codigo = res.codigo;
        sistema.unirAPartida(JUGADOR_B, codigo);
        sistema.iniciarPartida(codigo, JUGADOR_A);
        partida = sistema.partidas[codigo];
        
        partida.turno = JUGADOR_A;
    });

    describe('Generación de Mazo', () => {
        it('El mazo debe contener EXACTAMENTE 2 de los 4 tipos de cartas especiales', () => {
            const valoresMazo = partida.mazo.map(c => c.valor);
            
            const posiblesEspeciales = ["enemy9.jpg", "enemy18.jpg", "enemy19.jpg", "enemy21.jpg"];
            const especialesEncontrados = valoresMazo.filter(valor => posiblesEspeciales.includes(valor));
            const tiposUnicos = new Set(especialesEncontrados); //evita duplicados
            
            expect(tiposUnicos.size).toBe(2);
            expect(partida.mazo.length).toBe(16); 
        });
    });

    describe('Gestión de Turnos', () => {
        it('No permite voltear carta si no es tu turno', () => {
            const resultado = sistema.voltearCarta(codigo, JUGADOR_B, 0); // Intenta Juan, turno de Pepe
            expect(resultado).toBeNull();
        });

        it('Si aciertas pareja, MANTIENES el turno', () => {
            partida.mazo[0] = { id: 0, valor: "enemy1.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 1, valor: "enemy1.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 0);
            sistema.voltearCarta(codigo, JUGADOR_A, 1);

            expect(partida.turno).toBe(JUGADOR_A);
        });

        it('Si fallas pareja, PIERDES el turno', () => {
            partida.mazo[0] = { id: 0, valor: "enemy1.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 1, valor: "enemy2.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 0);
            sistema.voltearCarta(codigo, JUGADOR_A, 1);

            expect(partida.turno).toBe(JUGADOR_B); 
        });
    });

    describe('Efectos de Cartas', () => {
        
        it('GATO (Trampa): Resta 10 monedas', () => {
            partida.puntos[JUGADOR_A] = 50; 
            partida.mazo[0] = { id: 0, valor: "enemy19.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 1, valor: "enemy19.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 0);
            const res = sistema.voltearCarta(codigo, JUGADOR_A, 1);

            expect(res.tipo).toBe("pareja");
            expect(res.monedas).toBe(-10);
            expect(partida.puntos[JUGADOR_A]).toBe(40);
        });

        it('COFRE BUENO (ID Par): Suma 20 monedas', () => {
            partida.mazo[0] = { id: 2, valor: "enemy21.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 4, valor: "enemy21.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 2);
            const res = sistema.voltearCarta(codigo, JUGADOR_A, 4);

            expect(res.monedas).toBe(20);
        });

        it('COFRE MALO (ID Impar): Resta 10 monedas', () => {
            partida.mazo[0] = { id: 3, valor: "enemy21.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 5, valor: "enemy21.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 3);
            const res = sistema.voltearCarta(codigo, JUGADOR_A, 5);

            expect(res.monedas).toBe(-10);
        });

        it('HECHICERO: Permite fallar con 3 cartas y pasa turno', () => {
            partida.mazo[0] = { id: 0, valor: "enemy9.jpg", estado: 'oculta' };
            partida.mazo[1] = { id: 1, valor: "enemy9.jpg", estado: 'oculta' };
            sistema.voltearCarta(codigo, JUGADOR_A, 0);
            sistema.voltearCarta(codigo, JUGADOR_A, 1);
            expect(partida.limiteVolteo).toBe(3); 

            partida.mazo[2] = { id: 2, valor: "A.jpg", estado: 'oculta' };
            partida.mazo[3] = { id: 3, valor: "B.jpg", estado: 'oculta' };
            partida.mazo[4] = { id: 4, valor: "C.jpg", estado: 'oculta' };

            sistema.voltearCarta(codigo, JUGADOR_A, 2);
            sistema.voltearCarta(codigo, JUGADOR_A, 3);
            const resFallo = sistema.voltearCarta(codigo, JUGADOR_A, 4); 

            expect(resFallo.tipo).toBe("fallo");
            expect(resFallo.cartas.length).toBe(3); 
            expect(partida.turno).toBe(JUGADOR_B); 
            expect(partida.limiteVolteo).toBe(2); 
        });
    });

    describe('Uso de Pócimas', () => {
        it('No puedes usar pócima si tienes 0', () => {
            partida.pocimas[JUGADOR_A] = 0;
            const res = partida.usarPocima(JUGADOR_A);
            expect(res).toBeNull();
        });

        it('Pócima de REVELAR (Simulada)', () => {
            const randomOriginal = Math.random;
            Math.random = () => 0.8; 

            partida.mazo[5] = { id: 5, valor: "oculta.jpg", estado: 'oculta' };

            const res = partida.usarPocima(JUGADOR_A);
            
            expect(res.efecto).toBe("revelar");
            expect(res.carta).toBeDefined();
            expect(partida.pocimas[JUGADOR_A]).toBe(0); 

            Math.random = randomOriginal;
        });

        it('Pócima de MONEDAS (Simulada)', () => {
            const randomOriginal = Math.random;
            Math.random = () => 0.2; 

            const res = partida.usarPocima(JUGADOR_A);
            
            expect(res.efecto).toBe("monedas");
            expect(res.valor).toBe(10);
            expect(partida.puntos[JUGADOR_A]).toBe(10); 

            Math.random = randomOriginal;
        });
    });

    describe('Final de Partida', () => {
        it('Detecta victoria cuando no quedan cartas', () => {
            partida.mazo.forEach(c => c.estado = 'encontrada');
            
            let c1 = partida.mazo.find(c => c.id === 0);
            let c2 = partida.mazo.find(c => c.id === 1);

            c1.estado = 'oculta'; c1.valor = 'fin.jpg';
            c2.estado = 'oculta'; c2.valor = 'fin.jpg';

            partida.puntos[JUGADOR_A] = 100;
            partida.puntos[JUGADOR_B] = 20;

            sistema.voltearCarta(codigo, JUGADOR_A, 0); 
            const res = sistema.voltearCarta(codigo, JUGADOR_A, 1); 

            expect(res).not.toBeNull(); 
            expect(res.tipo).toBe("final");
            expect(res.ganador).toBe(JUGADOR_A);
            expect(partida.estado).toBe("finalizada");
        });

        it('Detecta EMPATE correctamente', () => {
            partida.mazo.forEach(c => c.estado = 'encontrada');

            let c1 = partida.mazo.find(c => c.id === 0);
            let c2 = partida.mazo.find(c => c.id === 1);

            c1.estado = 'oculta'; c1.valor = 'fin.jpg';
            c2.estado = 'oculta'; c2.valor = 'fin.jpg';

            partida.puntos[JUGADOR_A] = 50;
            partida.puntos[JUGADOR_B] = 60; 
            
            sistema.voltearCarta(codigo, JUGADOR_A, 0);
            const res = sistema.voltearCarta(codigo, JUGADOR_A, 1);

            expect(res).not.toBeNull();
            expect(res.ganador).toBe("empate");
            expect(res.puntos[JUGADOR_A]).toBe(60);
            expect(res.puntos[JUGADOR_B]).toBe(60);
        });
    });
});