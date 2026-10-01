# RYE · Desarrollo Humano

Hero interactiva construida con HTML, CSS y JavaScript. Lista para subir a GitHub y publicar con GitHub Pages, sin instalar dependencias ni compilar.

## Abrir la página

Abre `index.html` con tu navegador. Conserva `assets`, `styles.css`, `app.js` y `config.js` junto al HTML.

La carpeta `extras` contiene además `RYE-autonomo.html`, una copia con CSS, JavaScript e imágenes integrados. Sirve para abrir o compartir un único archivo; la versión principal editable es la de la raíz.

## Subir a GitHub

1. Descomprime `RYE-GitHub.zip`.
2. Crea un repositorio en tu cuenta de GitHub.
3. Sube **el contenido de la carpeta RYE-GitHub**, manteniendo las subcarpetas. `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta.
4. Guarda los cambios con un commit. Si utilizas GitHub Desktop o Git, también se incluirán los archivos de configuración que empiezan con punto.

## Publicar con GitHub Pages

1. En tu repositorio, abre **Settings → Pages**.
2. En **Build and deployment → Source**, elige **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/(root)**.
4. Pulsa **Save** y espera a que GitHub muestre la dirección publicada.

Las rutas de imágenes y estilos son relativas, compatibles con páginas publicadas bajo el nombre de un repositorio. El archivo `.nojekyll` permite servir el sitio estático directamente. No se necesita un workflow personalizado.

Documentación oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Archivos incluidos

| Archivo o carpeta | Uso |
| --- | --- |
| `index.html` | Estructura, textos, navegación, carrusel y formularios. |
| `styles.css` | Colores, tipografías, diseño responsive y animaciones. |
| `app.js` | Carrusel, menú, ventanas, formulario e interacciones. |
| `config.js` | Número de WhatsApp, intervalo y primera fotografía. |
| `assets/logo.png` | Logo transparente original. |
| `assets/clinic_recepcion.jpg` | Fotografía de recepción. |
| `assets/clinic_tomatis.jpg` | Fotografía del espacio de actividades. |
| `assets/founders_rigoberto_erika.jpg` | Fotografía de los fundadores. |
| `extras/RYE-autonomo.html` | Versión de un solo archivo con imágenes integradas. |
| `referencia/diseno-original.png` | Captura proporcionada como referencia. |
| `.gitignore` | Exclusión de archivos temporales y configuraciones locales. |
| `.gitattributes` | Normalización de finales de línea y formatos binarios. |
| `.editorconfig` | Ajustes de edición y codificación UTF-8. |
| `.nojekyll` | Publicación estática con GitHub Pages. |

## Configurar WhatsApp

En `config.js`, reemplaza la cadena vacía de `whatsappNumber` por el número real de RYE en formato internacional: solo dígitos, con código de país y sin `+`, espacios ni guiones. Para Ecuador, el código es `593` y se omite el cero inicial del número nacional.

El número de la clínica no fue proporcionado. Hasta configurarlo, el formulario prepara un mensaje copiable y **no realiza un envío**. Con el número configurado, abre WhatsApp con el mensaje preparado; el visitante decide cuándo enviarlo.

## Editar el diseño

- **Textos:** `index.html`.
- **Colores y tipografías:** variables al inicio de `styles.css`.
- **Fotos:** reemplaza los archivos de `assets` conservando sus nombres, o actualiza sus rutas en `index.html`.
- **Encuadre:** reglas `.slide img` y `.slide.founders img` de `styles.css`.
- **Velocidad del carrusel:** `slideInterval` en `config.js`, expresado en milisegundos; `4000` equivale a 4 segundos.
- **Foto inicial:** `initialSlide`: `0` recepción, `1` actividades, `2` fundadores.
- **Ubicación:** el enlace actual abre el sector Kennedy Nueva, Guayaquil. Sustitúyelo por la dirección exacta cuando esté disponible.

La navegación abre consultas por servicio y una ventana de los fundadores. El alcance es una hero; no se incluyen páginas independientes de servicios, backend ni base de datos.

## Tipografías y referencia

Se usan Montserrat y Bodoni Moda desde Google Fonts. Necesitan internet; si no cargan, se usan fuentes del sistema. Son aproximaciones visuales: la familia original de Canva no pudo identificarse con certeza a partir de la captura. El logo y las tres fotografías son los archivos proporcionados.

Para comparar la foto de fundadores con la referencia, abre `index.html?slide=2` y pausa el carrusel. Los indicadores y el botón de pausa se añadieron para permitir control manual.

## Interacciones y accesibilidad

- Cambio automático cada 4 segundos, fundido, zoom suave, pausa y selección manual.
- Flechas del teclado cuando el foco está en los controles del carrusel y gesto horizontal en móvil.
- Animación de botones y fondo sensible al cursor.
- Menú móvil y ventanas con cierre mediante Escape.
- Respeto a `prefers-reduced-motion` y pausa automática al ocultar la pestaña.
- Validación de campos y preparación del mensaje sin almacenamiento de datos.

## Comprobaciones

Se revisaron la sintaxis de JavaScript, las referencias locales y las imágenes integradas en el HTML autónomo. La validación visual automatizada estuvo bloqueada por las restricciones de la sesión; revisa la página en tu navegador antes de publicarla.

## Sobre la copia autónoma

Los cambios en la raíz no se aplican automáticamente a `extras/RYE-autonomo.html`. Para mantener una única versión actualizada, edita y publica siempre los archivos de la raíz. La copia autónoma es una entrega adicional del diseño actual.
