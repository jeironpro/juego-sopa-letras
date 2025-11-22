let palabras = [];
let todasLasPalabras = [];
const tamano = 12;
const contenedorTablero = document.getElementById("tablero");
const contenedorPalabras = document.getElementById("contenedor-palabras");
const contenedorPalabraSeleccionada = document.getElementById("palabra-seleccionada");
const progresoBar = document.getElementById("progreso");

const modalVictoria = document.createElement('div');
modalVictoria.className = 'modal-victoria';

const contenidoModal = document.createElement('div');
contenidoModal.className = 'contenido-modal';

const titulo = document.createElement('h2');
titulo.textContent = '¡Felicidades!';

const mensaje = document.createElement('p');
mensaje.textContent = 'Has encontrado todas las palabras.';

const btnReiniciar = document.createElement('button');
btnReiniciar.className = 'btn-reiniciar';
btnReiniciar.textContent = 'Jugar de nuevo';
btnReiniciar.addEventListener('click', reiniciarJuego);

contenidoModal.appendChild(titulo);
contenidoModal.appendChild(mensaje);
contenidoModal.appendChild(btnReiniciar);
modalVictoria.appendChild(contenidoModal);
document.body.appendChild(modalVictoria);

function seleccionarPalabrasAleatorias(array, cantidad) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, cantidad);
}

function inicializarJuego() {
    fetch("json/sopas_letras.json")
        .then(respuesta => {
            if (!respuesta.ok) {
                console.log(`Error al intentar cargar las palabras: ${respuesta.status}`);
                throw new Error("Error al cargar palabras");
            }
            return respuesta.json();
        })
        .then(data => {
            todasLasPalabras = data.palabras;
            iniciarPartida();
        })
        .catch(error => {
            console.log(`Error al intentar cargar el JSON: ${error}`);
        });
}

function iniciarPartida() {
    palabras = seleccionarPalabrasAleatorias(todasLasPalabras, 10);
    inicializarTablero();
}

function reiniciarJuego() {
    while (contenedorTablero.firstChild) {
        contenedorTablero.removeChild(contenedorTablero.firstChild);
    }
    while (contenedorPalabras.firstChild) {
        contenedorPalabras.removeChild(contenedorPalabras.firstChild);
    }
    modalVictoria.classList.remove('visible');
    if (progresoBar) progresoBar.style.width = '0%';
    iniciarPartida();
}

function mostrarVictoria() {
    modalVictoria.classList.add('visible');
}

function colocarPalabra(palabra) {
    const coordenadas = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: -1 }
    ];
    for (let intento = 0; intento < 500; intento++) {
        const coord = coordenadas[Math.floor(Math.random() * coordenadas.length)];
        const maxX = coord.x === 1 ? tamano - palabra.length : (coord.x === -1 ? palabra.length - 1 : tamano - 1);
        const maxY = coord.y === 1 ? tamano - palabra.length : (coord.y === -1 ? palabra.length - 1 : tamano - 1);
        const x = Math.floor(Math.random() * (maxX + 1));
        const y = Math.floor(Math.random() * (maxY + 1));
        let puede = true;
        for (let i = 0; i < palabra.length; i++) {
            const nx = x + coord.x * i;
            const ny = y + coord.y * i;
            if (nx < 0 || nx >= tamano || ny < 0 || ny >= tamano) {
                puede = false;
                break;
            }
            const letraExistente = tablero[ny][nx];
            if (letraExistente && letraExistente !== palabra[i]) {
                puede = false;
                break;
            }
        }
        if (!puede) {
            continue;
        }
        for (let i = 0; i < palabra.length; i++) {
            const nx = x + coord.x * i;
            const ny = y + coord.y * i;
            tablero[ny][nx] = palabra[i];
        }
        return true;
    }
    return false;
}

function inicializarTablero() {
    const tablero = Array.from({ length: tamano }, () => Array(tamano).fill(null));
    window.tablero = tablero;

    palabras.sort((a, b) => b.length - a.length);
    palabras.forEach(p => colocarPalabra(p.toUpperCase()));

    for (let i = 0; i < tamano; i++) {
        for (let j = 0; j < tamano; j++) {
            if (!tablero[i][j]) {
                tablero[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    for (let i = 0; i < tamano; i++) {
        for (let j = 0; j < tamano; j++) {
            const celda = document.createElement("div");
            celda.classList.add("celda-sopa-letras");
            celda.textContent = tablero[i][j];
            celda.dataset.x = i;
            celda.dataset.y = j;
            contenedorTablero.appendChild(celda);
        }
    }

    const lista = document.createElement("ul");
    palabras.forEach(p => {
        const li = document.createElement("li");
        const palabraMinuscula = p.toLowerCase();
        li.dataset.palabra = palabraMinuscula;
        li.textContent = palabraMinuscula;
        lista.appendChild(li);
    });
    contenedorPalabras.appendChild(lista);
}

let seleccion = [];
let seleccionActiva = false;
let celdaInicio = null;

function obtenerPosicion(letra) {
    return { x: parseInt(letra.dataset.x, 10), y: parseInt(letra.dataset.y, 10) };
}

function obtenerCeldaEnPosicion(x, y) {
    return document.querySelector(`.celda-sopa-letras[data-x="${x}"][data-y="${y}"]`);
}

function marcarLetra(letra) {
    if (!letra.classList.contains("seleccionada")) {
        letra.classList.add("seleccionada");
        seleccion.push(letra);
    }
}

function limpiarSeleccion() {
    seleccion.forEach(l => l.classList.remove("seleccionada"));
    seleccion = [];
    celdaInicio = null;
    seleccionActiva = false;
    actualizarPalabraSeleccionada();
}

function actualizarPalabraSeleccionada() {
    const palabra = seleccion.map(l => l.textContent).join("");
    contenedorPalabraSeleccionada.textContent = palabra;
    
    if (palabra && seleccionActiva) {
        contenedorPalabraSeleccionada.style.opacity = '1';
    } else {
        contenedorPalabraSeleccionada.style.opacity = '0';
    }
}

function actualizarProgreso() {
    const total = palabras.length;
    const encontradas = document.querySelectorAll('.contenedor-palabras li.found').length;
    if (progresoBar) {
        progresoBar.style.width = `${(encontradas / total) * 100}%`;
    }
    
    if (encontradas === total) {
        mostrarVictoria();
    }
}

function verificarPalabra(palabra) {
    const palabraMinuscula = palabra.toLowerCase();
    const invertida = palabraMinuscula.split('').reverse().join('');
    const encontrada = palabras.find(p => {
        const pl = p.toLowerCase();
        return pl === palabraMinuscula || pl === invertida;
    });
    if (!encontrada) {
        return;
    }
    const li = document.querySelector(`li[data-palabra="${encontrada.toLowerCase()}"]`);
    if (li && !li.classList.contains('found')) {
        li.classList.add('found', 'linea-verde');
        actualizarProgreso();
    }
    if (seleccion.length >= 1) {
        const primera = seleccion[0].getBoundingClientRect();
        const ultima = seleccion[seleccion.length - 1].getBoundingClientRect();
        const tableroRect = contenedorTablero.getBoundingClientRect();
        
        const cx1 = primera.left + primera.width / 2 - tableroRect.left;
        const cy1 = primera.top + primera.height / 2 - tableroRect.top;
        const cx2 = ultima.left + ultima.width / 2 - tableroRect.left;
        const cy2 = ultima.top + ultima.height / 2 - tableroRect.top;
        
        const dx = cx2 - cx1;
        const dy = cy2 - cy1;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
        
        const mx = (cx1 + cx2) / 2;
        const my = (cy1 + cy2) / 2;
        
        const cellW = primera.width;
        const cellH = primera.height;
        
        let ancho, alto;
        if (seleccion.length === 1) {
            ancho = cellW * 0.4;
        } else {
            ancho = distancia + cellW * 0.9;
        }
        alto = cellH * 0.7;
        
        const resaltado = document.createElement('div');
        resaltado.className = 'resaltado';
        resaltado.style.width = `${ancho}px`;
        resaltado.style.height = `${alto}px`;
        resaltado.style.left = `${mx}px`;
        resaltado.style.top = `${my}px`;
        resaltado.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
        resaltado.classList.add('mostrar');
        contenedorTablero.appendChild(resaltado);
    }
}

function iniciarSeleccion(celda) {
    limpiarSeleccion();
    seleccionActiva = true;
    celdaInicio = celda;
    marcarLetra(celda);
    actualizarPalabraSeleccionada();
}

function continuarSeleccion(celdaActual) {
    if (!seleccionActiva || !celdaInicio || !celdaActual) return;
    
    const posInicio = obtenerPosicion(celdaInicio);
    const posActual = obtenerPosicion(celdaActual);

    const dx = posActual.x - posInicio.x;
    const dy = posActual.y - posInicio.y;

    let pasoX = 0;
    let pasoY = 0;

    if (dx === 0 && dy === 0) {
        // Misma celda
    } else if (Math.abs(dx) > Math.abs(dy) * 1.5) {
        // Horizontal
        pasoX = Math.sign(dx);
    } else if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        // Vertical
        pasoY = Math.sign(dy);
    } else {
        // Diagonal - más sensible
        pasoX = Math.sign(dx);
        pasoY = Math.sign(dy);
    }

    seleccion.forEach(l => l.classList.remove("seleccionada"));
    seleccion = [];

    if (pasoX === 0 && pasoY === 0 && (dx !== 0 || dy !== 0)) {
         marcarLetra(celdaInicio);
    } else {
        const longitud = Math.max(Math.abs(dx), Math.abs(dy));
        for (let i = 0; i <= longitud; i++) {
            const x = posInicio.x + (pasoX * i);
            const y = posInicio.y + (pasoY * i);
            const celda = obtenerCeldaEnPosicion(x, y);
            if (celda) marcarLetra(celda);
        }
    }
    actualizarPalabraSeleccionada();
}

function finalizarSeleccion() {
    if (!seleccionActiva) return;
    seleccionActiva = false;

    const palabra = seleccion.map(l => l.textContent).join('');
    if (palabra) {
        console.log('Palabra seleccionada:', palabra);
        verificarPalabra(palabra);
    }
    limpiarSeleccion();
}

contenedorTablero.addEventListener('mousedown', e => {
    if (e.target.classList.contains('celda-sopa-letras')) {
        iniciarSeleccion(e.target);
    }
});

contenedorTablero.addEventListener('mousemove', e => {
    continuarSeleccion(e.target);
});

document.addEventListener('mouseup', finalizarSeleccion);

contenedorTablero.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elemento && elemento.classList.contains('celda-sopa-letras')) {
            iniciarSeleccion(elemento);
        }
    }
}, { passive: false });

contenedorTablero.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
        continuarSeleccion(elemento);
    }
}, { passive: false });

document.addEventListener('touchend', finalizarSeleccion);

inicializarJuego();