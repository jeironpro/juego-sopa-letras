let palabras = [];
const tamano = 12;
const contenedorTablero = document.getElementById("tablero");
const contenedorPalabras = document.getElementById("contenedor-palabras");
const contenedorPalabraSeleccionada = document.getElementById("palabra-seleccionada");
const progresoBar = document.getElementById("progreso");

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
            palabras = seleccionarPalabrasAleatorias(data.palabras, 10);
            inicializarTablero();
        })
        .catch(error => {
            console.log(`Error al intentar cargar el JSON: ${error}`);
        });
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
let direccionSeleccion = null;

function obtenerPosicion(letra) {
    return { x: parseInt(letra.dataset.x, 10), y: parseInt(letra.dataset.y, 10) };
}

function normalizarVector(dx, dy) {
    return { dx: dx === 0 ? 0 : dx / Math.abs(dx), dy: dy === 0 ? 0 : dy / Math.abs(dy) };
}

function esAdyacente(p1, p2) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
}

function mismaDireccion(p1, p2, dir) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const norm = normalizarVector(dx, dy);
    return norm.dx === dir.dx && norm.dy === dir.dy;
}

function marcarLetra(letra) {
    letra.classList.add("seleccionada");
    seleccion.push(letra);
    seleccion.forEach(l => l.classList.remove('primera', 'ultima'));
    if (seleccion.length > 0) {
        seleccion[0].classList.add('primera');
        seleccion[seleccion.length - 1].classList.add('ultima');
    }
    actualizarPalabraSeleccionada();
}

function desmarcarUltima() {
    const ultima = seleccion.pop();
    if (ultima) {
        ultima.classList.remove("seleccionada", "primera", "ultima");
    }
    seleccion.forEach(l => l.classList.remove('primera', 'ultima'));
    if (seleccion.length > 0) {
        seleccion[0].classList.add('primera');
        seleccion[seleccion.length - 1].classList.add('ultima');
    }
    actualizarPalabraSeleccionada();
}

function limpiarSeleccion() {
    seleccion.forEach(l => l.classList.remove("seleccionada", "primera", "ultima"));
    seleccion = [];
    direccionSeleccion = null;
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
            ancho = cellW * 0.9;
            alto = cellH * 0.9;
        } else {
            ancho = distancia + cellW * 1.15;
            alto = cellH * 0.9;
        }
        
        const resaltado = document.createElement('div');
        resaltado.className = 'resaltado';
        resaltado.style.width = `${ancho}px`;
        resaltado.style.height = `${alto}px`;
        resaltado.style.left = `${mx}px`;
        resaltado.style.top = `${my}px`;
        resaltado.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
        resaltado.classList.add('show');
        contenedorTablero.appendChild(resaltado);
    }
}

contenedorTablero.addEventListener('mousedown', e => {
    if (!e.target.classList.contains('celda-sopa-letras')) {
        return;
    }
    limpiarSeleccion();
    seleccionActiva = true;
    marcarLetra(e.target);
});

contenedorTablero.addEventListener('mousemove', e => {
    if (!seleccionActiva) {
        return;
    }
    if (!e.target.classList.contains('celda-sopa-letras')) {
        return;
    }
    if (seleccion.includes(e.target)) {
        if (seleccion.length >= 2 && e.target === seleccion[seleccion.length - 2]) {
            desmarcarUltima();
        }
        return;
    }
    const ultima = seleccion[seleccion.length - 1];
    const posUltima = obtenerPosicion(ultima);
    const posNueva = obtenerPosicion(e.target);
    if (!esAdyacente(posUltima, posNueva)) {
        return;
    }
    if (seleccion.length === 1) {
        direccionSeleccion = normalizarVector(posNueva.x - posUltima.x, posNueva.y - posUltima.y);
        marcarLetra(e.target);
    } else if (mismaDireccion(posUltima, posNueva, direccionSeleccion)) {
        marcarLetra(e.target);
    }
});

document.addEventListener('mouseup', () => {
    if (!seleccionActiva) {
        return;
    }
    seleccionActiva = false;
    const palabra = seleccion.map(l => l.textContent).join('');
    if (palabra) {
        console.log('Palabra seleccionada:', palabra);
        verificarPalabra(palabra);
    }
    limpiarSeleccion();
});

inicializarJuego();