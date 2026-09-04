# juego-sopa-letras

Sopa de letras en el navegador: encuentra todas las palabras de la lista ocultas en una cuadrícula de 12x12, marcando las letras que las componen.

## Características

- Cuadrícula de 12x12 generada al azar a partir de un listado de palabras.
- Selección de las letras con el ratón o la pantalla táctil para marcar una palabra.
- Barra de progreso y contador de palabras encontradas.
- Modal de victoria al completar todas las palabras de la sopa.
- Sopas de letras cargadas desde `json/sopas_letras.json`.

## Tecnologías

- HTML5, CSS3 y JavaScript (ES6+), sin dependencias externas.
- Datos de las sopas en formato JSON.

## Uso

1. Clona el repositorio.
2. Abre `index.html` en el navegador o sirve la carpeta con un servidor estático local.

No requiere instalación ni compilación.

## Estructura del proyecto

```
juego-sopa-letras/
├── index.html
├── css/                   # estilos de la cuadrícula
├── js/                    # lógica del juego
├── json/                  # sopas y listas de palabras
└── icon/                  # favicon
```

## Licencia
Este proyecto está bajo la licencia **MIT**.  
Consulta el archivo [LICENSE](LICENSE) para más detalles.
