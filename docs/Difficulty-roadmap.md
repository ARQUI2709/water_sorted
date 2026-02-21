# Water Sort Puzzle — Roadmap de Dificultad Progresiva

## El Problema

A partir de ~12 colores, agregar más botellas  **no incrementa la dificultad real** . Más botellas = más espacio vacío para maniobrar. El jugador experimentado resuelve un nivel de 15 colores con la misma facilidad que uno de 10.

La dificultad real viene de la  **restricción** , no de la escala.

---

## Sistema de Épocas

La propuesta es dividir la progresión en  **6 épocas** , cada una introduciendo una mecánica nueva mientras mantiene las anteriores.

```
Época 1  │ Lv  1-15  │ Aprender          │ 3→10 colores, 2 vacías
Época 2  │ Lv 16-25  │ Presión            │ Vacías se reducen a 1
Época 3  │ Lv 26-40  │ Incertidumbre      │ Segmentos ocultos
Época 4  │ Lv 41-55  │ Profundidad        │ 5 segmentos por botella
Época 5  │ Lv 56-70  │ Eficiencia         │ Límite de movimientos
Época 6  │ Lv 71+    │ Maestría           │ Todo combinado + bloqueos
```

---

## Época 1 — Aprender (Niveles 1-15)

**Mecánica:** Solo incrementar colores progresivamente. El jugador aprende la lógica básica.

**Ejemplo visual:**

```
Nivel 1 (3 colores, 2 vacías):

 [R]  [B]  [G]  [ ]  [ ]
 [G]  [R]  [B]
 [B]  [G]  [R]
 [R]  [B]  [G]

→ Fácil. Muchas botellas vacías para maniobrar.
```

**Configuración actual (funciona bien, no cambiar):**

```js
// Colores: empieza en 3, sube 1 cada 2 niveles, tope 10
const numColorsFor = l => Math.min(3 + Math.floor((l - 1) / 2), 10);

// Vacías: siempre 2 en esta época
const numEmptyFor = (nc, level) => 2;
```

---

## Época 2 — Presión (Niveles 16-25)

**Mecánica:** Se fijan 10-12 colores pero las botellas vacías bajan de 2 a 1. Cada movimiento importa más. No hay margen para errores tontos.

**Ejemplo visual:**

```
Nivel 16 (10 colores, 2 vacías):     Nivel 22 (10 colores, 1 vacía):

 [R][B][G][O][P][ ][ ]               [R][B][G][O][P][ ]
 [C][M][L][T][K]                      [C][M][L][T][K]

→ Mismo puzzle, la mitad del espacio.
  Un movimiento en falso = deadlock.
```

**Configuración propuesta:**

```js
const numEmptyFor = (nc, level) => {
  if (level <= 15) return 2;
  if (level <= 20) return 2;  // transición suave
  if (level <= 25) return 1;  // presión máxima con 4 segmentos
  return 1;  // se mantiene en 1 de aquí en adelante
};
```

**Impacto:** El árbol de decisiones se reduce drásticamente. Con 1 vacía, mover un color al espacio libre bloquea esa "vía de escape" hasta que la vacíes de nuevo. Obliga a pensar 3-4 movimientos adelante.

---

## Época 3 — Incertidumbre (Niveles 26-40)

**Mecánica:** Los segmentos inferiores de cada botella están ocultos (marcados con `?`). Se revelan al quedar expuestos por un pour, o al ser vertidos ellos mismos.

**Ejemplo visual:**

```
Nivel 26 (hide 1):              Nivel 35 (hide 2):

 [R]  [B]  [G]  [ ]             [R]  [B]  [G]  [ ]
 [G]  [R]  [B]                  [?]  [?]  [?]
 [B]  [G]  [R]                  [?]  [?]  [?]
 [?]  [?]  [?]                  [?]  [?]  [?]

→ Solo ves la parte superior.
  Debes deducir o arriesgarte.
  ¡Memoria + estrategia!
```

**Configuración propuesta (ya existe parcialmente):**

```js
const hiddenFor = level => {
  if (level < 26) return 0;
  if (level <= 30) return 1;  // ocultar 1 segmento del fondo
  if (level <= 35) return 2;  // ocultar 2
  return 3;                   // solo visible el top (modo extremo)
};
```

**Lógica de revelación:**

```js
// Un segmento se revela cuando:
// 1. Queda como el tope de la botella (se removió lo de arriba)
// 2. Se vierte a otra botella

// Al hacer pour de botella[from]:
if (nb[from].length > 0) {
  revealed[from][nb[from].length - 1] = true;  // nuevo tope se revela
}
// Los segmentos que llegan a destino siempre son revealed:
revealed[to].push(true);
```

**Impacto:** Transforma el puzzle de lógica pura a lógica + memoria + gestión de riesgo. El jugador debe recordar qué reveló y planificar con información incompleta.

---

## Época 4 — Profundidad (Niveles 41-55)

**Mecánica:** Las botellas pasan de 4 a 5 segmentos (y eventualmente 6). Esto es un **multiplicador exponencial** de complejidad — más capas para desenterrar, más decisiones por botella.

**Ejemplo visual:**

```
4 segmentos (actual):     5 segmentos:           6 segmentos:

 [R]                       [R]                    [R]
 [B]                       [B]                    [B]
 [G]                       [G]                    [G]
 [R]                       [R]                    [R]
                           [B]                    [B]
                                                  [G]

→ Con 5 segmentos, el color del fondo está
  enterrado bajo 4 capas en vez de 3.
  Cada "excavación" requiere más espacio temporal.
```

**Configuración propuesta:**

```js
const CAP = 4;  // actual: constante global

// Nuevo: variable por época
const capFor = level => {
  if (level <= 40) return 4;
  if (level <= 55) return 5;
  return 6;
};

// La generación cambia mínimamente:
function genLevel(l) {
  const cap = capFor(l);
  const nc = numColorsFor(l);
  // Cada color genera `cap` segmentos en vez de 4
  for (let c = 0; c < nc; c++)
    for (let i = 0; i < cap; i++) segments.push(c);
  // Botellas de tamaño `cap`
  // ...
}
```

**Impacto:** Con 5 segmentos y 10 colores, hay 50 segmentos en juego vs 40. Pero el impacto real es que desenterrar un color del fondo requiere mover 4 piezas en vez de 3 — y con solo 1 vacía, cada maniobra es un acto de equilibrismo.

---

## Época 5 — Eficiencia (Niveles 56-70)

**Mecánica:** Límite de movimientos. El jugador no solo debe resolver el puzzle, sino hacerlo en un número acotado de pasos. Cambia el juego de "¿puedo?" a "¿puedo en menos de N?".

**Ejemplo visual:**

```
┌─────────────────────────────┐
│  LV 58    12 mv    MAX: 25  │
│           ████████░░░░░░░░  │  ← barra de movimientos
│                             │
│   Se acabaron → GAME OVER   │
└─────────────────────────────┘
```

**Fórmula propuesta para el límite:**

```js
// Estimación: solución óptima ≈ numColors × cap × 0.8
// Damos margen del 50% sobre el óptimo estimado

const moveLimitFor = (level, numColors, cap) => {
  if (level < 56) return Infinity;  // sin límite antes

  const optimalEstimate = numColors * cap * 0.8;
  const margin = level < 65 ? 2.0 : 1.5;  // más generoso al inicio

  return Math.ceil(optimalEstimate * margin);
};

// Ejemplo: 10 colores × 5 segmentos × 0.8 = 40 óptimo
// Con margen ×2.0 = 80 movimientos máximo
// Con margen ×1.5 = 60 movimientos máximo (nivel alto)
```

**UI sugerida:**

```
Barra de progreso bajo el header:
- Verde (0-60% del límite)
- Amarillo (60-85%)
- Rojo pulsante (85-100%)
- Al llegar al 100%: modal "Out of moves" con opción de Retry
```

**Impacto:** Elimina la estrategia de "mover sin pensar hasta que funcione". Obliga a encontrar rutas eficientes. Combina perfectamente con el sistema de best score existente.

---

## Época 6 — Maestría (Niveles 71+)

**Mecánica:** Todas las anteriores combinadas + botellas bloqueadas temporalmente.

**Botellas congeladas:**

```
Nivel 75:

 [R]  [B]  🔒  [G]  [ ]  🔒
 [G]  [R]  [?]  [B]       [?]
 [?]  [?]  [?]  [?]       [?]
 [?]  [?]  [?]  [?]       [?]
 [?]  [?]  [?]  [?]       [?]

→ Las botellas 🔒 se desbloquean después de 5 movimientos.
  Debes planificar sin acceso completo al tablero.
```

**Configuración propuesta:**

```js
const frozenCountFor = level => {
  if (level < 71) return 0;
  if (level <= 80) return 1;
  if (level <= 90) return 2;
  return Math.min(3, Math.floor((level - 70) / 10));
};

const frozenDurationFor = level => {
  // Movimientos hasta que se desbloquean
  if (level <= 80) return 5;
  if (level <= 90) return 8;
  return 10;
};
```

**Tabla resumen de la época 6:**

```
Nivel │ Colores │ Cap │ Vacías │ Hidden │ Moves │ Frozen
──────┼─────────┼─────┼────────┼────────┼───────┼───────
  71  │   10    │  5  │   1    │   2    │  70   │  1×5
  75  │   10    │  5  │   1    │   3    │  65   │  1×5
  80  │   11    │  5  │   1    │   3    │  60   │  1×8
  85  │   11    │  6  │   1    │   3    │  70   │  2×8
  90  │   12    │  6  │   1    │   3    │  65   │  2×10
 100  │   12    │  6  │   1    │   3    │  60   │  3×10
```

---

## Idea Bonus: Colores Dobles

Un color que necesita **2 botellas completas** en vez de 1. Genera 8 (o 10, 12) segmentos del mismo color.

```
Color rojo normal:  4 segmentos → llena 1 botella
Color rojo doble:   8 segmentos → necesita 2 botellas completas

→ El jugador ve "mucho rojo" y debe coordinar
  llenar 2 botellas simultáneamente sin bloquear
  el espacio que necesita para los demás colores.
```

```js
// En generación: algunos colores son dobles
function genLevel(l) {
  const cap = capFor(l);
  const nc = numColorsFor(l);
  const doubleCount = level >= 80 ? Math.min(2, Math.floor((level - 75) / 10)) : 0;

  const segments = [];
  for (let c = 0; c < nc; c++) {
    const isDouble = c < doubleCount;
    const count = isDouble ? cap * 2 : cap;
    for (let i = 0; i < count; i++) segments.push(c);
  }
  // Se necesitan botellas extra para los dobles
  const totalBottles = nc + doubleCount + numEmptyFor(nc, l);
  // ...
}
```

---

## Resumen Visual de la Progresión

```
Dificultad
    ▲
    │                                          ╱ Época 6
    │                                    ╱────╱  Maestría
    │                              ╱────╱
    │                        ╱────╱  Época 5
    │                  ╱────╱     Eficiencia
    │            ╱────╱  Época 4
    │      ╱────╱     Profundidad
    │ ╱───╱  Época 3
    │╱     Incertidumbre
    │  Época 2
    │  Presión
    │Época 1
    │Aprender
    └──────────────────────────────────────────────► Nivel
    1    15   25     40      55      70       100
```

Cada época introduce  **una sola mecánica nueva** , dando al jugador tiempo para adaptarse antes de agregar la siguiente capa. Las mecánicas anteriores se mantienen activas, creando complejidad combinatoria sin necesidad de más botellas.
