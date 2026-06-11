# Análisis de migración a Godot

Evaluación de la complejidad de migrar **Water Sort Puzzle** (PWA en React) a **Godot 4.x**: qué se conserva, qué se reescribe, compatibilidad del desarrollo actual y qué ganaría el proyecto.

---

## 1. Radiografía del proyecto actual

| Aspecto | Estado actual |
|---|---|
| Stack | React 18 (UMD por CDN) + Babel standalone (JSX compilado en el navegador) + Tailwind CDN |
| Distribución | PWA estática (GitHub Pages), `manifest.json`, sin build step, sin npm, sin tests |
| Tamaño | ~2.100 líneas de JS en 16 archivos + 14 assets PNG |
| Lógica de juego | `game.js` (256 líneas), `solver.js` (125), `constants.js` (63) — **funciones puras, sin dependencia de React ni del DOM** |
| Estado/UI | `app.js` + 8 vistas React (hooks `useState`/`useEffect`), animaciones por CSS keyframes |
| Persistencia | `localStorage` con claves planas (`wb{n}`, `wstar{n}`, `wstreak`, `wdiff`, `wbg`…) |
| Audio | Web Audio API — tonos generados proceduralmente (osciladores), sin archivos de sonido |
| Háptica | `navigator.vibrate` |
| Tipografías | Orbitron y Rajdhani desde Google Fonts (CDN) |

La separación lógica/UI ya existente es el factor que más abarata la migración: el "motor" del juego no sabe nada de React.

---

## 2. Qué se puede mantener (porta casi 1:1)

### 2.1 Lógica de juego — `game.js` → GDScript
Todo el módulo son funciones puras sobre arrays de enteros. La traducción a GDScript es mecánica:

| Función JS | Equivalente Godot | Esfuerzo |
|---|---|---|
| `generateLevel`, `numColorsForLevel`, `chooseE`, `hiddenSegmentsForLevel` | GDScript directo (`Array[int]`) | Trivial |
| `canPour`, `pour`, `pourCount`, `topColor`, `topColorCount` | GDScript directo | Trivial |
| `isWinCondition`, `isDeadlocked`, `findHint` | GDScript directo | Trivial |
| `shuffleArray` | `Array.shuffle()` nativo (+ `seed()` si se quiere puzzle diario determinístico) | Trivial |
| `calculateLayout` | Se puede mantener la fórmula o delegar en `GridContainer` + anclas | Bajo |

### 2.2 Solver BFS — `solver.js`
El algoritmo (BFS con claves canónicas y presupuesto adaptativo de nodos) se porta tal cual. **Advertencia de rendimiento**: GDScript interpretado es notablemente más lento que JS con JIT; un presupuesto de 80.000 nodos que hoy tarda ~50 ms puede tardar varios cientos de ms en GDScript. Mitigaciones, en orden de preferencia:

1. Ejecutarlo en `WorkerThreadPool`/`Thread` (hoy ya es asíncrono vía `setTimeout`, así que el patrón se conserva).
2. Reducir presupuestos de nodos.
3. Portarlo a C# o GDExtension si se quiere subir el presupuesto (más estrellas calculables en niveles grandes — sería incluso una mejora).

### 2.3 Datos y reglas
`constants.js` (paleta de 24 colores, nombres, patrones A11Y, límites por dificultad, rangos de botellas vacías) se convierte en un autoload `Constants.gd` o en `Resource`s. Los `PATTERNS` de accesibilidad (texto sobre el líquido) funcionan igual con `Label`.

### 2.4 Assets
Los 14 PNG (botella, fondos temáticos, iconos) se reutilizan sin cambios. Las tipografías deben empaquetarse como TTF locales (Godot no usa Google Fonts CDN) — descarga única, sin costo real. Los emojis de logros (🏆🔥⭐…) requieren empaquetar una fuente emoji (p. ej. Noto Color Emoji) o sustituirlos por iconos PNG.

### 2.5 Diseño y documentación
Todo `docs/` (mecánicas, roadmap de dificultad, movimiento óptimo) es agnóstico de la tecnología y sigue siendo válido. El diseño de pantallas (mockups en `assets/*-layout.png`) también.

**Total reutilizable: ~40-45 % del código (todo el "motor") + 100 % de assets y diseño.**

---

## 3. Qué se requiere cambiar (reescritura)

### 3.1 Toda la capa de UI (la parte grande)
React/JSX/Tailwind/CSS no existen en Godot. Cada vista se reconstruye como escena de nodos `Control`:

| Vista actual | Escena Godot propuesta | Complejidad |
|---|---|---|
| `app.js` (orquestador + estado global) | Autoload `GameState.gd` con señales + escena `Main.tscn` | **Media-alta** — es el cambio de paradigma: de hooks/estado inmutable a señales/estado mutable |
| `components.js → Bottle` | Escena `Bottle.tscn` (TextureRect + ColorRects/Polygon2D para líquido) | Media |
| `game-board.js` | `GridContainer` o posicionamiento manual reutilizando `calculateLayout` | Media |
| `header.js`, `controls.js` | `HBoxContainer` + botones | Baja |
| `home.js`, `settings.js`, `win-screen.js`, `achievements.js` | Escenas modales (`CanvasLayer`) | Baja-media |
| `map.js` (camino SVG con curvas Bézier) | `Line2D`/`Path2D` + `Curve2D` dentro de un `ScrollContainer` — traducción directa de la misma matemática | Media |
| `Stars`/`Confetti` (divs animados por CSS) | `GPUParticles2D` — menos código y mejor resultado | Baja (mejora) |
| Animaciones CSS (`shake`, `hintPulse`, `bounceIn`, `wave`…) | `Tween`/`AnimationPlayer`; la onda del líquido puede ser un shader 2D | Media |

### 3.2 Gestión de estado
Es el cambio conceptual mayor. El patrón React (estado inmutable, re-render derivado, `useEffect` para deadlock/timer) se sustituye por:

- Autoload `GameState` con `signal bottles_changed`, `signal level_won`, `signal deadlock_detected`.
- El historial de undo se conserva idéntico (lista de snapshots de `bottles`/`revealed`).
- `useTimer` → nodo `Timer` (más simple que el hook actual).

### 3.3 Persistencia — `storage.js`
`localStorage` → `ConfigFile` en `user://save.cfg`. Es una mejora (un solo archivo estructurado en vez de N claves planas), pero implica **pérdida del progreso de jugadores existentes**: no hay puente automático entre el localStorage del navegador y la app nativa. Si se publica también el export web de Godot en el mismo dominio, se puede migrar el progreso leyendo localStorage vía `JavaScriptBridge` la primera vez.

### 3.4 Audio y háptica — `audio.js`
- Tonos procedurales → opción A (recomendada): pre-renderizar los 5 sonidos como WAV/OGG y usar `AudioStreamPlayer`. Opción B: `AudioStreamGenerator` para mantenerlos procedurales (más trabajo, mismo resultado).
- `navigator.vibrate` → `Input.vibrate_handheld()` (Android/iOS). En export web la vibración no está expuesta de serie (se puede llamar vía `JavaScriptBridge`).
- Mejora colateral: desaparecen los problemas de desbloqueo de `AudioContext` en iOS Safari.

### 3.5 Distribución PWA
Lo que hoy es "gratis" (página estática de ~50 KB) cambia sustancialmente — ver §4.

---

## 4. Validación de compatibilidad

### Lo que valida bien
- **Cero dependencias acopladas**: no hay npm, ni router, ni librerías de estado, ni APIs de backend. El único "framework" es React y solo toca la capa de vista.
- **Lógica ya modular y testeable**: el orden de carga documentado en `index.html` (core → components → views → app) se mapea limpiamente a autoloads → escenas compartidas → escenas de vista → main.
- **Sin features web insustituibles**: no usa cámara, share API, push, ni service workers complejos.

### Puntos de fricción reales
1. **Export web de Godot vs PWA actual**: el bundle WASM de Godot 4 pesa ~30-40 MB (vs ~50 KB + CDN hoy). La carga inicial en móvil pasa de instantánea a varios segundos. Godot 4.3+ ofrece export web *single-thread* que ya **no requiere cabeceras COOP/COEP**, así que GitHub Pages sigue siendo viable, pero la experiencia web será objetivamente peor que la actual.
2. **Rendimiento del solver en GDScript** (ver §2.2) — resoluble, pero hay que decidirlo en el diseño.
3. **Progreso de jugadores**: se pierde salvo migración explícita vía export web (§3.3).
4. **iOS**: como PWA hoy se instala desde Safari sin pasar por la App Store; con Godot, distribuir en iOS implica cuenta de Apple Developer, firma y revisión de la tienda.
5. **Curva de aprendizaje**: GDScript es sencillo, pero el modelo de escenas/señales/anclas de Control nodes lleva 1-2 semanas de adaptación si no se conoce.

### Estimación de esfuerzo

| Fase | Alcance | Estimación |
|---|---|---|
| 1. Setup + port de lógica | Proyecto Godot, `Constants`, `GameLogic`, `Solver`, `SaveManager` + pruebas | 2-4 días |
| 2. Núcleo jugable | `Bottle.tscn`, tablero, input táctil, undo/hint/retry, audio | 1-1.5 semanas |
| 3. Vistas secundarias | Home, header, settings, win screen, mapa, logros | 1-1.5 semanas |
| 4. Pulido | Animación de vertido, partículas, shaders, exports (Android/web), QA | 1 semana |
| **Total** | | **~4-6 semanas** a tiempo parcial |

---

## 5. Mejoras que ofrece Godot

**Donde Godot gana claramente:**
- **Animación de vertido real**: la botella se levanta, se inclina sobre el destino y el líquido fluye (tween de posición/rotación + shader). En DOM/CSS esto es muy costoso; en Godot es el caso de uso natural. Es la mejora de *game feel* más visible del género.
- **Shaders 2D para el líquido**: ondulación, menisco, burbujas, brillo — imposibles o carísimos en CSS.
- **Partículas nativas**: confetti y estrellas con `GPUParticles2D` (hoy son 90 divs animados).
- **Exports nativos**: Android (APK/AAB para Play Store), iOS, Windows/Linux/macOS desde el mismo proyecto. Offline real, icono nativo, sin depender de Safari/Chrome.
- **Háptica y audio nativos**: sin las restricciones de autoplay/unlock del navegador.
- **Rendimiento**: render GPU constante a 60 fps con decenas de botellas; el solver puede crecer (C#/threads) y calcular óptimos en niveles donde hoy se rinde (`maxNodes = 0` para >12 botellas).
- **Infraestructura de juego**: sistema de localización (`tr()`), `AnimationPlayer`, `InputMap`, perfilador — el roadmap de `docs/Game-mechanics.md` (modo contrarreloj, boosters, puzzle diario, skins de botella) se implementa más naturalmente.
- **Monetización/plataformas**: ads, IAP y achievements de Play Games / Game Center solo son viables como app nativa.

**Donde el stack actual gana:**
- Distribución web instantánea, sin instalación, sin tiendas, peso mínimo.
- Velocidad de iteración en UI (editar JS + recargar; Tailwind para estilos).
- Cero toolchain: hoy se edita con cualquier editor y se sirve estático.

---

## 6. Recomendación

- **Si el objetivo es publicar en tiendas móviles y elevar el *game feel*** (animación de vertido, shaders, partículas): la migración a Godot **vale la pena y es de riesgo bajo**, porque el 40-45 % del código (toda la lógica) se porta mecánicamente y no hay dependencias acopladas. Plan: portar primero lógica + solver con tests en Godot (fase 1) antes de tocar UI — eso valida el 90 % del riesgo en menos de una semana.
- **Si el objetivo principal es seguir siendo una web app ligera**: quedarse en el stack actual (o endurecerlo: build con Vite en lugar de Babel-en-navegador) y, si solo se busca presencia en tiendas, evaluar un wrapper tipo Capacitor/TWA antes que reescribir la UI.
- **Camino híbrido razonable**: mantener la PWA como está y desarrollar la versión Godot apuntando a Android/iOS, compartiendo `docs/` como especificación única. El export web de Godot quedaría como opción secundaria, no como reemplazo de la PWA.
