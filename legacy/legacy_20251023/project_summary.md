# Project Summary: Semanauak Yolotl - El Corazón del 
      Universo
    2 
    3 This document summarizes the current state of the
      "Semanauak Yolotl" project, including its architecture,
      features, and the last known issue.
    4 
    5 ## Project Goal
    6 The project aims to create an interactive 3D visualization
      of the Mesoamerican calendar system, specifically focusing
      on the Tonalpohualli and Xiuhpohualli cycles.
    7 
    8 ## Architecture
    9 The project follows a Model-View-Controller (MVC)-like
      architecture:
   10 -   **Model:** `SemanauakYolotl.js` (time engine) and
      `Artefacto.js` (calendar logic).
   11 -   **View:** `ArtefactoVisual.js` (main 3D scene manager)
      and individual `Anillo...` classes (visual representation
      of each ring).
   12 -   **Controller:** `Controlador.js` (handles user input).
   13 
   14 ## Current Features
   15 -   **Interactive 3D Rings:** Visual representation of
      various calendar cycles.
   16 -   **Procedural Layout:** Rings are dynamically positioned
      and sized based on `LAYOUT_CONFIG` in `ArtefactoVisual.js`.
   17 -   **Detailed Info Panel:** Displays current calendar data
      (Momento, Tonal, Trecena, Veintena, Tonalpohualli,
      Xiuhpohualli).
   18 -   **Granular Controls:** Buttons to advance/retreat by
      Momento, Tonal, Trecena, Veintena, Tonalpohualli, and Año.
   19 -   **Matrix View Toggle:** A "Ver Matriz" button to expand
      the `AnilloTonalpohualli` into a full matrix view, with
      outer rings adjusting dynamically.
   20 -   **Optimized Geometries:** Reduced vertex count for
      `CircleGeometry` in `AnilloXiuhpohualli`,
      `AnilloTonalpohualli`, and `AnilloNumeral`.
   21 
   22 ## Last Known Issue: AnilloTonalpohualli Alignment
   23 
   24 The `AnilloTonalpohualli` (the 52-segment ring with
      quincunxes) is still reported as being offset by half a
      segment.
   25 -   **Current State:** The `crearTodosLosGlifos` method
      places `Segmento 0`'s quincunx centered at `90 + 3.46 =
      93.46` degrees.
   26 -   **Desired State:** `Segmento 0`'s quincunx should be
      centered at `90` degrees (12 o'clock).
   27 -   **Previous Attempt:** Re-introducing `this.rotation.z =
      -(segmentWidthRadians / 2);` in the constructor was
      intended to correct this, but the user reports it's still
      misaligned. This suggests a deeper interaction or a
      misunderstanding of the compounding rotations.
   28 
   29 ## File Contents
   30 
   31 ### `Artefacto.js`
  // Artefacto.js - La Maquinaria Calendárica

  export const TONALES = ['Sipaktli', 'Ejekatl', 'Kali', 'Kuetspalin',
  'Kouatl', 'Mikistli', 'Masatl', 'Tochtli', 'Atl', 'Itskuintli',
  'Osomatli', 'Malinali', 'Akatl', 'Oselotl', 'Kuautli',
  'Koskakuautli', 'Olin', 'Tekpatl', 'Kiauitl', 'Xochitl'];
  export const CARGADORES = ['Tochtli', 'Akatl', 'Tekpatl', 'Kali'];

  export class Artefacto {
      constructor() {
          // Estado interno de la cuenta
          this.estado = {
              diaAbsoluto: 0,
              momentoDelDia: 0,
              diaDelAnio: 0,
              anio: 0,
              diaDelTonalpohualli: 1,
          };
          this.diaDelTonalpohualliCongelado = 1;
      }

      // El único método que recalcula el estado. Se llama cuando el
  corazón late.
      actualizar(momento) {
          const momentoInt = Math.floor(momento);
          const PULSOS_ANIO = 1461;

          const anio = Math.floor(momentoInt / PULSOS_ANIO);
          const momentoEnAnio = momentoInt % PULSOS_ANIO;

          let diaDelAnio;
          let momentoDelDia;

          // Los primeros 364 días (índice 0-363) tienen 4 pulsos.
  Total: 364 * 4 = 1456 pulsos.
          if (momentoEnAnio < 1456) {
              diaDelAnio = Math.floor(momentoEnAnio / 4);
              momentoDelDia = momentoEnAnio % 4;
          } else { // El último día (índice 364) tiene 5 pulsos.
              diaDelAnio = 364;
              momentoDelDia = momentoEnAnio - 1456;
          }

          const diaAbsoluto = (anio * 365) + diaDelAnio;
          const esNemontemi = (diaDelAnio + 1) > 360;

          let diaDelTonalpohualli;
          const diasCongeladosPrevios = anio * 5;
          const diaActivoParaTonal = diaAbsoluto -
  diasCongeladosPrevios;

          if (!esNemontemi) {
              diaDelTonalpohualli = diaActivoParaTonal % 260 + 1;
              this.diaDelTonalpohualliCongelado = diaDelTonalpohualli;
          } else {
              diaDelTonalpohualli = this.diaDelTonalpohualliCongelado;
          }

          // Almacena el nuevo estado
          this.estado = { diaAbsoluto, anio, diaDelAnio, momentoDelDia,
  diaDelTonalpohualli, esNemontemi };
          return this.estado;
      }

      // Métodos para obtener información formateada para la pantalla
      getTonalDisplay() {
          if (this.estado.esNemontemi) {
              const diaNemontemiAbsoluto = (this.estado.anio * 5) +
  (this.estado.diaDelAnio - 360);
              return Nemontemi (${(diaNemontemiAbsoluto % 13) + 1} 
  ${TONALES[diaNemontemiAbsoluto % 20]});
          } else {
              return ${(this.estado.diaDelTonalpohualli - 1) % 13 + 1} 
  ${TONALES[(this.estado.diaDelTonalpohualli - 1) % 20]};
          }
      }

      getAnioDisplay() {
          const anioDelCiclo = this.estado.anio + 1;
          const anioNumeral = (this.estado.anio % 13) + 1;
          const cargadorNombre = CARGADORES[this.estado.anio % 4];
          return ${anioDelCiclo} (${anioNumeral} ${cargadorNombre});
      }

      getTrecenaDisplay() {
          if (this.estado.esNemontemi) return '-';
          return ${Math.floor((this.estado.diaDelTonalpohualli - 1) / 
  13) + 1};
      }

      getVeintenaDisplay() {
          if (this.estado.esNemontemi) return '-';
          return ${Math.floor((this.estado.diaDelAnio) / 20) + 1};
      }

      getTonalpohualliCount() {
          if (this.estado.esNemontemi) return '-';
          return ${this.estado.diaDelTonalpohualli};
      }

  }
   1 
   2 ### `SemanauakYolotl.js`
  // SemanauakYolotl.js - El Corazón del Universo

  // Un despachador de eventos simple para desacoplar la lógica.
  class EventDispatcher {
      constructor() {
          this._listeners = {};
      }
      addEventListener(type, listener) {
          if (!this._listeners[type]) {
              this._listeners[type] = [];
          }
          this._listeners[type].push(listener);
      }
      dispatchEvent(event) {
          if (!this._listeners[event.type]) return;
          this._listeners[event.type].forEach(listener =>
  listener(event));
      }
  }

  export class SemanauakYolotl extends EventDispatcher {
      constructor() {
          super();
          this.momentoAbsoluto = 0;
          this.isAnimating = false;
          this.velocidad = 0.2;
      }

      // El latido principal del motor, llamado en cada cuadro de
  animación.
      latir() {
          if (!this.isAnimating) return;

          this.momentoAbsoluto += this.velocidad;
          this.dispatchEvent({ type: 'pulso' }); // Emite un pulso
  continuo
      }

      // Funciones de control que interactúan con el tiempo.
      play() { this.isAnimating = true; }
      stop() { this.isAnimating = false; }

      avanzarMomento(cantidad = 1) {
          this.stop();
          this.momentoAbsoluto += cantidad;
          this.dispatchEvent({ type: 'pulso' });
      }

      retrocederMomento(cantidad = 1) {
          this.stop();
          this.momentoAbsoluto = Math.max(0, this.momentoAbsoluto -
  cantidad);
          this.dispatchEvent({ type: 'pulso' });
      }

      // --- MÉTODOS DE SALTO POR UNIDAD CALENDÁRICA ---

      avanzarTrecena(cantidad = 1) {
          this.avanzarMomento(cantidad  13  4); // 13 días * 4
  pulsos/día
      }
      retrocederTrecena(cantidad = 1) {
          this.retrocederMomento(cantidad  13  4);
      }

      avanzarVeintena(cantidad = 1) {
          this.avanzarMomento(cantidad  20  4); // 20 días * 4
  pulsos/día
      }
      retrocederVeintena(cantidad = 1) {
          this.retrocederMomento(cantidad  20  4);
      }

      avanzarTonalpohualli(cantidad = 1) {
          this.avanzarMomento(cantidad  260  4); // 260 días * 4
  pulsos/día
      }
      retrocederTonalpohualli(cantidad = 1) {
          this.retrocederMomento(cantidad  260  4);
      }

      // Le permite al artefacto decirle al corazón cuántos pulsos
  tiene el día actual.
      getPulsosDelDia(momento = this.momentoAbsoluto) {
          const momentoEnAnio = Math.floor(momento) % 1461;
          // Si el pulso está dentro de los primeros 1456 pulsos del
  año (364 días * 4 pulsos), el día tiene 4 pulsos.
          // De lo contrario, estamos en el último día, que tiene 5
  pulsos.
          if (momentoEnAnio < 1456) {
              return 4;
          } else {
              return 5;
          }
      }
  }
   1 
   2 ### `index.html`
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8" />
      <title>Semanauak Yolotl - El Corazón del Universo</title>
      <link rel="stylesheet" href="/style.css">
  </head>
  <body>
      <div id="info">
          <div id="readout">Calibrando máquina...</div>
      </div>

      <div id="control-panel">
          <div class="control-group"><button
  id="play-btn">Play</button><button id="stop-btn"
  disabled>Stop</button></div>
          <div class="control-group"><span>Momento</span><button
  id="prev-momento-btn">-</button><button
  id="next-momento-btn">+</button></div>
          <div class="control-group"><span>Tonal</span><button
  id="prev-tonal-btn">-</button><button
  id="next-tonal-btn">+</button></div>
          <div class="control-group"><span>Trecena</span><button
  id="prev-trecena-btn">-</button><button
  id="next-trecena-btn">+</button></div>
          <div class="control-group"><span>Veintena</span><button
  id="prev-veintena-btn">-</button><button
  id="next-veintena-btn">+</button></div>
          <div class="control-group"><span>Tonalpohualli</span><button
  id="prev-tonalpohualli-btn">-</button><button
  id="next-tonalpohualli-btn">+</button></div>
          <div class="control-group"><span>Año</span><button
  id="prev-xiuhpohualli-btn">-</button><button
  id="next-xiuhpohualli-btn">+</button></div>
          <div class="control-group"><button id="toggle-matrix-btn">Ver
  Matriz</button></div>
      </div>
      </div>

      <script type="module" src="/main.js"></script>
  </body>
  </html>
   1 
   2 ### `main.js`
  import { SemanauakYolotl } from './SemanauakYolotl.js';
  import { Artefacto } from './Artefacto.js';
  import { ArtefactoVisual } from './src/ArtefactoVisual.js';
  import { Controlador } from './src/Controlador.js';

  /**
    * ===================================================================
      ====
    * SEMANAUAK YOLOTL - EL CORAZÓN DEL UNIVERSO (v2.0 - Refactorizado)
    * ===================================================================
      ====
    *
    * main.js - El Director de Orquesta
    *
    * Responsabilidades:
    * 1. Crear las instancias principales del Modelo, la Vista y el
      Controlador.
    * 2. Conectar el "pulso" del Modelo con las actualizaciones de la
      Vista.
    * 3. Iniciar la simulación.
    *
    * ===================================================================
      ====
   */

  // --- 1. INICIALIZACIÓN DE MÓDULOS ---

  // El Modelo: La lógica pura del tiempo y el calendario.
  const corazon = new SemanauakYolotl();
  const artefacto = new Artefacto();

  // La Vista: El gestor de toda la representación visual en Three.js.
  const vista = new ArtefactoVisual();

  // El Controlador: El gestor de la interacción del usuario con los
  botones.
  const controlador = new Controlador(corazon, artefacto, vista);

  // --- 2. CONEXIÓN PRINCIPAL (MODELO -> VISTA) ---

  const infoPanel = document.getElementById('readout');

  // Escuchamos el evento 'pulso' del corazón.
  corazon.addEventListener('pulso', () => {
      // Cuando el corazón late, actualizamos el modelo del artefacto.
      const estadoActual =
  artefacto.actualizar(corazon.momentoAbsoluto);

      // Pasamos el nuevo estado a la vista para que se actualice.
      vista.actualizar(estadoActual);

      // También actualizamos el panel de información directamente.
      infoPanel.innerHTML = `
          <b>MOMENTO ABSOLUTO:</b>
  ${Math.floor(corazon.momentoAbsoluto)}<br>
          <b>PULSO DEL DÍA:</b> ${estadoActual.momentoDelDia + 1} /
  ${corazon.getPulsosDelDia(corazon.momentoAbsoluto)}<hr>
          <b>TONAL:</b> ${artefacto.getTonalDisplay()}<br>
          <b>TRECENA:</b> ${artefacto.getTrecenaDisplay()}<br>
          <b>TONALPOHUALLI:</b> ${artefacto.getTonalpohualliCount()} /
  260<hr>
          <b>VEINTENA:</b> ${artefacto.getVeintenaDisplay()}<br>
          <b>XIUHPOHUALLI:</b> ${artefacto.getAnioDisplay()}<br>
      `;
  });

  // --- 3. INICIO DE LA SIMULACIÓN ---

  // Inicia el bucle de animación, pasándole el corazón para que lata
  en cada cuadro.
  vista.iniciarAnimacion(corazon);

  // Disparamos un pulso inicial para que la visualización muestre el
  estado del momento 0.
  corazon.dispatchEvent({ type: 'pulso' });
   1 
   2 ### `src/Anillo.js`
  import * as THREE from 'three';

  /**
    * Clase base para todos los anillos visuales del artefacto.
    * Extiende de THREE.Group para poder contener múltiples mallas
      (meshes)
    * y ser tratada como un único objeto en la escena.
   */
  export class Anillo extends THREE.Group {
      /**
        * @param {number} radio - El radio principal del anillo.
       */
      constructor(radio, tubeWidth) {
          super();
          this.radio = radio;
          this.tubeWidth = tubeWidth;
      }

      /**
        * Método "abstracto" que debe ser implementado por cada clase de
          anillo específica.
        * Se encarga de actualizar la apariencia del anillo (rotación,
          colores, etc.)
        * basándose en el estado actual del calendario.
        * @param {object} estado - El objeto de estado proveniente de la
          clase Artefacto.
       */
      actualizar(estado) {
          throw new Error("El método 'actualizar' debe ser implementado
  por la clase hija");
      }

      /**
        * Función de utilidad para crear texturas a partir de un array de
          colores.
        * @param {number[]} colors - Un array de códigos de color
          hexadecimales.
        * @returns {THREE.CanvasTexture} Una textura de canvas lista para
          ser usada en un material.
       */
      crearTextura(colors) {
          const segments = colors.length;
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 32;
          const context = canvas.getContext('2d');
          const segWidth = canvas.width / segments;

          for (let i = 0; i < segments; i++) {
              context.fillStyle = new
  THREE.Color(colors[i]).getStyle();
              context.fillRect(i * segWidth, 0, segWidth,
  canvas.height);
          }
          return new THREE.CanvasTexture(canvas);
      }
  }
   1 
   2 ### `src/AnilloMomentos.js`
  import * as THREE from 'three';
  import { Anillo } from './Anillo.js';
  import { NEGRO, ROJO, BLANCO, AZUL } from './ArtefactoVisual.js';

  export class AnilloMomentos extends Anillo {
      constructor(radio, tubeWidth) {
          super(radio, tubeWidth);

          // Geometría de Torus con 4 lados para un aspecto de disco
  plano
          const geometria = new THREE.TorusGeometry(this.radio,
  this.tubeWidth, 4, 128);
          const textura = this.crearTextura([NEGRO, ROJO, BLANCO,
  AZUL]);
          const material = new THREE.MeshBasicMaterial({ map: textura
  });
          const malla = new THREE.Mesh(geometria, material);

          // Rotar -45 grados para centrar el color rojo en la parte
  superior
          malla.rotation.z = -45 * (Math.PI / 180);

          this.add(malla);
      }

      actualizar(estado) {
          const DEGREES_TO_RADIANS = Math.PI / 180;
          const momentoOffsetAnual = estado.anio % 4;
          const momentoVisual = momentoOffsetAnual +
  estado.momentoDelDia;
          // La rotación de todo el grupo (this) mueve el anillo
          this.rotation.z = -(momentoVisual / 4)  360 
  DEGREES_TO_RADIANS;
      }
  }
   1 
   2 ### `src/AnilloNumeral.js`
  import * as THREE from 'three';
  import { Anillo } from './Anillo.js';

  const ACTIVE_COLOR = 0xffffff;
  const INACTIVE_COLOR = 0x666666;
  const NUMERAL_SCALE = 2.0; // Multiplicador para el tamaño de los
  símbolos numerales

  export class AnilloNumeral extends Anillo {
      constructor(radio, tubeWidth) {
          super(radio, tubeWidth);

          this.simbolos = []; // Almacenará los 13 grupos de símbolos
          this.crearSimbolos();
      }

      crearSimbolos() {
          const anguloOffset = Math.PI / 2; // Empezar arriba (12 en
  punto)

          for (let i = 1; i <= 13; i++) {
              const simbolo = this.crearGeometriaSimbolo(i);

              // CORRECCIÓN 1: Usar '+' para disponer en sentido
  anti-horario
              const angulo = anguloOffset + ((i - 1) / 13)  Math.PI  2;
              simbolo.position.x = Math.cos(angulo) * this.radio;
              simbolo.position.y = Math.sin(angulo) * this.radio;

              // CORRECCIÓN 2: Rotar el símbolo para que su base apunte
  al centro
              simbolo.rotation.z = angulo - Math.PI / 2;

              this.add(simbolo);
              this.simbolos.push(simbolo);
          }
      }

      crearGeometriaSimbolo(number) {
          const simboloGrupo = new THREE.Group();
          const material = new THREE.MeshBasicMaterial({ color:
  INACTIVE_COLOR });

          const bars = Math.floor(number / 5);
          const dots = number % 5;

          const barWidth = this.tubeWidth * 0.8;
          const barHeight = barWidth * 0.15;
          const dotRadius = barHeight / 2;
          const spacing = barHeight * 0.8;

          let currentY = 0;

          // Crear y posicionar barras desde abajo hacia arriba
          for (let i = 0; i < bars; i++) {
              const barGeo = new THREE.PlaneGeometry(barWidth,
  barHeight);
              const barMesh = new THREE.Mesh(barGeo, material);
              barMesh.position.y = currentY + (barHeight / 2);
              barMesh.position.z = 0.01; // Ligeramente por encima del
  plano
              simboloGrupo.add(barMesh);
              currentY += barHeight + spacing;
          }

          // Crear y posicionar puntos encima de las barras
          if (dots > 0) {
              const dotTotalWidth = (dots  dotRadius  2) + ((dots - 1)
  * spacing);
              let currentX = -(dotTotalWidth / 2) + dotRadius;

              for (let i = 0; i < dots; i++) {
                  const dotGeo = new THREE.CircleGeometry(dotRadius,
  4);
                  const dotMesh = new THREE.Mesh(dotGeo, material);
                  dotMesh.position.x = currentX;
                  dotMesh.position.y = currentY + dotRadius;
                  simboloGrupo.add(dotMesh);
                  currentX += (dotRadius * 2) + spacing;
              }
          }

          // Centrar el grupo de símbolos verticalmente
          const totalHeight = simboloGrupo.children.reduce((max, child)
  => Math.max(max, child.position.y), 0);
          simboloGrupo.children.forEach(child => {
              child.position.y -= totalHeight / 2;
          });

          // Aplicar la escala global al grupo
          simboloGrupo.scale.set(NUMERAL_SCALE, NUMERAL_SCALE,
  NUMERAL_SCALE);

          return simboloGrupo;
      }

      actualizar(estado) {
          const numeralIndex = (estado.diaDelTonalpohualli - 1) % 13;

          // Rotar todo el anillo para alinear
          const DEGREES_TO_RADIANS = Math.PI / 180;
          this.rotation.z = -(numeralIndex / 13)  360 
  DEGREES_TO_RADIANS;

          // Resaltar el símbolo activo
          this.simbolos.forEach((simbolo, i) => {
              const esActivo = (i === numeralIndex);
              simbolo.children.forEach(mesh => {
                  mesh.material.color.set(esActivo ? ACTIVE_COLOR :
  INACTIVE_COLOR);
              });
          });
      }
  }
   1 
   2 ### `src/AnilloTonal.js`
  import * as THREE from 'three';
  import { Anillo } from './Anillo.js';

  import { NEGRO, ROJO, BLANCO, AZUL } from './ArtefactoVisual.js';

  // --- CONFIGURACIÓN DE GLIFOS ---
  const GLYPH_RADIUS = 0.8; // El radio total del glifo (círculo +
  borde)
  const BORDER_THICKNESS = 0.2; // El grosor del borde negro

  /**
    * Representa el anillo de los 20 tonales.
    * Consiste en una base con 4 zonas de color y 20 glifos (círculos)
    * que se posicionan encima.
   */
  export class AnilloTonal extends Anillo {
      constructor(radio, tubeWidth) {
          super(radio, tubeWidth);

          this.crearBase();
          this.crearGlifos();
      }

      /**
        * Crea el anillo base con las 4 zonas de color (Negro, Rojo,
          Blanco, Azul).
       */
      crearBase() {
          const geometria = new THREE.TorusGeometry(this.radio,
  this.tubeWidth, 4, 40);

          const colors = [
              ...Array(5).fill(NEGRO),  // Zona 1
              ...Array(5).fill(ROJO),   // Zona 2
              ...Array(5).fill(BLANCO), // Zona 3
              ...Array(5).fill(AZUL),   // Zona 4
          ];
          const textura = this.crearTextura(colors);

          const material = new THREE.MeshBasicMaterial({ map: textura
  });
          const malla = new THREE.Mesh(geometria, material);

          // --- AJUSTE DE ALINEACIÓN ---
          // Rotamos la malla base 90 grados (para alinear a las 12) -
  9 grados (para centrar entre glifos).
          malla.rotation.z = (90 - 9) * (Math.PI / 180);

          this.add(malla);
      }

      /**
        * Crea los 20 glifos (círculos) que representan cada tonal.
       */
      crearGlifos() {
          this.glifos = []; // Contendrá los grupos (borde + relleno)
          this.glifoFills = []; // Contendrá solo los rellenos, para
  fácil acceso al color

          const geometriaBorde = new THREE.CircleGeometry(GLYPH_RADIUS,
  24);
          const materialBorde = new THREE.MeshBasicMaterial({ color:
  0x000000 });

          const geometriaRelleno = new THREE.CircleGeometry(GLYPH_RADIUS
   - BORDER_THICKNESS, 24);

          // --- AJUSTE DE ALINEACIÓN ---
          // El punto de partida es arriba (12 en punto), que
  corresponde a 90 grados (PI / 2).
          const anguloOffset = Math.PI / 2;

          for (let i = 0; i < 20; i++) {
              const glifoGrupo = new THREE.Group();

              const borde = new THREE.Mesh(geometriaBorde,
  materialBorde);
              glifoGrupo.add(borde);

              const materialRelleno = new THREE.MeshBasicMaterial({
                  color: 0xffffff, // Color inicial blanco
                  transparent: true,
                  opacity: 0.9
              });
              const relleno = new THREE.Mesh(geometriaRelleno,
  materialRelleno);
              relleno.position.z = 0.01; // Ligeramente por encima del
  borde para evitar z-fighting
              glifoGrupo.add(relleno);

              // Posicionamos en el perímetro, comenzando desde el
  offset y avanzando en sentido horario.
              const angulo = anguloOffset - (i / 20)  Math.PI  2;
              glifoGrupo.position.x = Math.cos(angulo) * (this.radio -
  this.tubeWidth / 2);
              glifoGrupo.position.y = Math.sin(angulo) * (this.radio -
  this.tubeWidth / 2);
              glifoGrupo.position.z = 1.4; // Por encima del anillo
  base

              this.add(glifoGrupo);
              this.glifos.push(glifoGrupo);
              this.glifoFills.push(relleno); // Guardar referencia al
  relleno
          }
      }

      /**
        * Actualiza la rotación del anillo y resalta el glifo activo.
        * @param {object} estado - El estado del calendario.\
       */
      actualizar(estado) {
          const DEGREES_TO_RADIANS = Math.PI / 180;
          const tonalIndex = (estado.diaDelTonalpohualli - 1) % 20;

          // 1. Rota el grupo entero para alinear el puntero con el
  tonal actual
          this.rotation.z = -(tonalIndex / 20)  360 
  DEGREES_TO_RADIANS;

          // 2. Resalta el glifo activo en amarillo, el resto en blanco.
          this.glifoFills.forEach((relleno, i) => {
              // El glifo que termina en la parte superior es (20 -
  tonalIndex) % 20
              const glifoEnCima = (20 - tonalIndex) % 20;
              const esActivo = (i === glifoEnCima);

              relleno.material.color.set(esActivo ? 0xffff00 :
  0xffffff);

              // Escalar el grupo completo para que el borde y el
  relleno crezcan juntos
              const glifoGrupo = this.glifos[i];
              glifoGrupo.scale.set(esActivo ? 1.3 : 1, esActivo ? 1.3 :
  1, 1);
          });
      }
  }
   1 
   2 ### `src/AnilloTonalpohualli.js`
  import * as THREE from 'three';
  import { Anillo } from './Anillo.js';
  import gsap from 'gsap';


  // Configuración para el diseño de los glifos internos
  const GLIFO_INTERNO_RADIO = 0.08;
  const GLYPH_SCALE_MATRIX = 4; // Escala de los glifos en vista de
  matriz
  const COLUMN_GLYPH_SPACING_FACTOR = 1.7; // Factor para ajustar la
  separación en la columna

  export class AnilloTonalpohualli extends Anillo {
      constructor(radio, tubeWidth) {
          super(radio, tubeWidth);

          this.segmentos = []; // Almacenará los 52 grupos de 5 glifos
          this.selectedIndex = null;
          this.isMatrixView = false;

          this.crearBase();
          this.crearTodosLosGlifos();
      }

      crearBase() {
          const geometria = new THREE.TorusGeometry(this.radio,
  this.tubeWidth, 4, 52);
          const material = new THREE.MeshBasicMaterial({
              color: 0x666666,
              transparent: true,
              opacity: 0.25
          });
          const malla = new THREE.Mesh(geometria, material);

          this.add(malla);
      }

      crearTodosLosGlifos() {
          const anguloOffset = Math.PI / 2;

          for (let i = 0; i < 52; i++) {
              const segmentoGrupo = this.crearGrupoQuincunx();

              const segmentWidthRadians = (Math.PI * 2) / 52;
              const angulo = anguloOffset + (i * segmentWidthRadians) +
  (segmentWidthRadians / 2); // Centrar el quincunx en su segmento
              segmentoGrupo.position.x = Math.cos(angulo) * this.radio;
              segmentoGrupo.position.y = Math.sin(angulo) * this.radio;
              segmentoGrupo.rotation.z = angulo - Math.PI / 2;

              this.add(segmentoGrupo);
              this.segmentos.push(segmentoGrupo);
          }
      }

      crearGrupoQuincunx() {
          const grupo = new THREE.Group();
          const material = new THREE.MeshBasicMaterial({ color:
  0xffffff });

          const offset = this.tubeWidth * 0.25;
          const positions = [\n            new THREE.Vector2(-offset,
  offset),\n            new THREE.Vector2(offset, offset),\n
  new THREE.Vector2(0, 0),\n            new THREE.Vector2(-offset,
  -offset),\n            new THREE.Vector2(offset, -offset),\n
  ];\n\n        positions.forEach(pos => {\n            const geometria
  = new THREE.CircleGeometry(GLIFO_INTERNO_RADIO, 8);\n            const
   glifo = new THREE.Mesh(geometria, material.clone());\n
  glifo.position.set(pos.x, pos.y, 0.1);\n
  grupo.add(glifo);\n        });\n\n        return grupo;\n    }\n\n
  // --- MÉTODOS DE INTERACCIÓN ---\n\n    selectColumn(index) {\n
    // Si hay una columna individual seleccionada, la deseleccionamos
  primero\n        if (this.selectedIndex !== null) {\n
  this.animateToQuincunx(this.selectedIndex);\n        }\n\n        //
  Si se hace clic en el mismo, se deselecciona\n        if (index ===
  this.selectedIndex) {\n            this.selectedIndex = null;\n
       return;\n        }\n\n        this.animateToColumn(index);\n
     this.selectedIndex = index;\n        console.log(Columna 
  seleccionada: ${index});\n    }\n\n    toggleMatrixView() {\n
  this.isMatrixView = !this.isMatrixView;\n        \n        // Si hay
  una columna individual seleccionada, la deseleccionamos primero\n
     if (this.selectedIndex !== null) {\n
  this.animateToQuincunx(this.selectedIndex);\n
  this.selectedIndex = null;\n        }\n\n        for (let i = 0; i <
  52; i++) {\n            if (this.isMatrixView) {\n
  this.animateToColumn(i);\n            } else {\n
  this.animateToQuincunx(i);\n            }\n        }\n    }\n\n    //
  --- ANIMACIONES ---\n\n    animateToColumn(index) {\n        const
  segmento = this.segmentos[index];\n        if (!segmento) return;\n\n
         // Calcular la altura total y el espaciado para los glifos
  escalados\n        const scaledTotalHeight = this.tubeWidth  0.8 
  GLYPH_SCALE_MATRIX;\n        const scaledSpacing = (scaledTotalHeight
  / 4)  COLUMN_GLYPH_SPACING_FACTOR;\n\n        
  segmento.children.forEach((child, i) => {\n            
  gsap.to(child.position, {\n                duration: 0.5,\n           
       ease: \'back.out(1.7)\',\n                x: 0,\n                
  y: (4 - i)  scaledSpacing // La base de la columna en y=0, apilando
  hacia arriba\n            });\n            gsap.to(child.scale, {
  duration: 0.5, x: GLYPH_SCALE_MATRIX, y: GLYPH_SCALE_MATRIX, z:
  GLYPH_SCALE_MATRIX, ease: \'back.out(1.7)\' });\n        });\n
  }\n\n    animateToQuincunx(index) {\n        const segmento =
  this.segmentos[index];\n        if (!segmento) return;\n\n
  const offset = this.tubeWidth  0.25;\n        const quincunxPositions 
  = [\n            new THREE.Vector2(-offset, offset),\n            new 
  THREE.Vector2(offset, offset),\n            new THREE.Vector2(0, 0),\n
              new THREE.Vector2(-offset, -offset),\n            new 
  THREE.Vector2(offset, -offset),\n        ];\n\n        
  segmento.children.forEach((child, i) => {\n            
  gsap.to(child.position, {\n                duration: 0.4,\n           
       ease: \'power2.out\',\n                x: 
  quincunxPositions[i].x,\n                y: quincunxPositions[i].y\n  
            });\n            gsap.to(child.scale, { duration: 0.4, x: 1,
   y: 1, z: 1, ease: \'power2.out\' });\n        });\n    }\n\n    
  actualizar(estado) {\n        const DEGREES_TO_RADIANS = Math.PI / 
  180;\n        const tonalDayIndex = estado.diaDelTonalpohualli - 1; //
   0-259\n\n        const activeCol = tonalDayIndex % 52; // Columna 
  activa (0-51)\n        const activeRow = Math.floor(tonalDayIndex / 
  52); // Fila activa (0-4)\n\n        // 1. Rotar el anillo para 
  alinear la columna activa con el apuntador\n        // Los segmentos 
  están en sentido anti-horario, así que la rotación debe ser negativa\n
          // para llevar el segmento 'activeCol' a la posición 
  superior.\n        // La rotación se calcula para el centro del 
  segmento.\n        const anguloPorSegmento = 360 / 52;\n        
  this.rotation.z = -(activeCol  anguloPorSegmento) *
  DEGREES_TO_RADIANS;\n\n        // 2. Resaltar el círculo activo dentro
   de la columna activa\n        // Primero, deseleccionar el círculo
  previamente activo si lo hay\n        if (this.lastActiveCol !==
  undefined && this.lastActiveRow !== undefined) {\n            const
  prevSegmento = this.segmentos[this.lastActiveCol];\n            if
  (prevSegmento && prevSegmento.children[4 - this.lastActiveRow]) {\n
               prevSegmento.children[4 -
  this.lastActiveRow].material.color.set(0xffffff); // Color blanco\n
           }\n        }\n\n        // Seleccionar el nuevo círculo
  activo\n        const currentSegmento = this.segmentos[activeCol];\n
        if (currentSegmento && currentSegmento.children[4 - activeRow])
  {\n            currentSegmento.children[4 -
  activeRow].material.color.set(0xffff00); // Amarillo\n        }\n\n
       this.lastActiveCol = activeCol;\n        this.lastActiveRow =
  activeRow;\n    }\n}\n