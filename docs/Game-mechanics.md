x


# Mecánicas Implementables — Basado en Juegos Comerciales

Análisis de Water Sort Puzzle (IEC Global), Ball Sort Puzzle (Guru Game), Color Sort (SortJoy), Woody Sort (Athena Studio), Cups (CrazyGames), Color Water Sort (Nintendo Switch), y otros juegos del género sorting puzzle.

---

## 1. Modos de Juego

Los juegos más exitosos no tienen un solo modo infinito. Ofrecen variedad para retener jugadores con diferentes motivaciones.

### Modo Clásico (ya implementado)

Niveles secuenciales con dificultad progresiva. Es la base del juego.

### Modo Contrarreloj

Presente en Color Water Sort (Nintendo Switch) y Cups (CrazyGames). El jugador tiene un tiempo límite para completar el nivel. La barra de tiempo baja constantemente y crea urgencia sin cambiar las reglas del puzzle.

**Cómo se siente:** En vez del timer pasivo que ya tienes (que solo cuenta), el timer se vuelve activo. Empiezas con 60-90 segundos y cada movimiento válido te regala +3 segundos. Si llega a cero, pierdes.

**Implementación:** Reutilizar el timer existente pero en cuenta regresiva. Agregar un selector de modo en una pantalla inicial: Clásico / Timed / Hard.

### Modo Difícil (Movimientos Limitados)

También del Switch. El jugador tiene un presupuesto fijo de movimientos. Cada pour consume uno. Si se acaban, pierde.

**Cómo se siente:** Transforma el juego de "puedo resolverlo" a "puedo resolverlo eficientemente". Es el modo favorito de los speedrunners y completionistas.

### Puzzle Diario

Presente en Magic Sort Puzzle y varios clones. Un puzzle fijo por día (mismo para todos los jugadores). No se puede repetir. Mantiene al jugador regresando cada día.

**Cómo se siente:** "Hoy ya hice mi puzzle diario" — crea hábito. Se puede implementar con una semilla basada en la fecha (`seed = YYYYMMDD`) para que el nivel sea determinístico.

---

## 2. Sistema de Estrellas (Rating por Nivel)

Presente en prácticamente todos los juegos comerciales del género. Cups lo implementa explícitamente con 3 estrellas basadas en movimientos.

**Cómo funciona:**

* ★★★ = resolvido en ≤ movimientos óptimos × 1.2
* ★★☆ = resolvido en ≤ movimientos óptimos × 1.8
* ★☆☆ = resolvido (sin importar cuántos movimientos)

**Cómo se siente:** Da motivación para rejugar niveles ya completados. El jugador ve "Nivel 14: ★★☆" y quiere volver a intentarlo. Agrega profundidad sin cambiar el puzzle.

**Implementación:** Ya tienes best score por nivel. Solo necesitas calcular umbrales y mostrar estrellas en el modal de victoria y en el level jump dialog.

---

## 3. Power-ups / Boosters

La mecánica de monetización #1 del género. En nuestro caso (sin ads ni compras), se pueden ofrecer como recompensas por juego.

### Tubo Extra (+1 vacía)

El booster más universal. Presente en Ball Sort Puzzle, Water Sort Puzzle, Woody Sort, y prácticamente todos los juegos del género. Agrega una botella vacía temporal al nivel actual.

**Cómo se siente:** Es el "salvavidas" cuando estás atascado pero no quieres reiniciar. Mantiene al jugador en el nivel sin frustración.

**Implementación:** Botón en la barra inferior. Ganado al completar N niveles consecutivos (streak reward). Limitado a 1 uso por nivel.

### Inversión de Color

Presente en Color Sort (SortJoy). Cambia todos los segmentos de un color por otro en todo el tablero.

**Cómo se siente:** Sorprendente y poderoso. Si tienes 2 colores difíciles de separar, fusionarlos simplifica drásticamente el puzzle. Pero reduce el número de colores a completar, así que no es trampa total.

**Implementación:** El jugador selecciona 2 colores. Todos los segmentos del color A se convierten en color B. Se reduce `numColors` en 1 y se necesita una botella menos.

### Auto-completar Último Color

Presente en Ball Sort Puzzle (varias versiones). Cuando solo queda 1 color sin ordenar, el juego lo resuelve automáticamente con animación.

**Cómo se siente:** Satisfactorio. Evita los últimos 2-3 movimientos triviales. Es un reward visual, no un power-up propiamente.

**Implementación:** Detectar cuando `coloresRestantes === 1` y ejecutar los pours automáticamente con delay entre cada uno para la animación.

---

## 4. Sistema de Monedas / Economía

Presente en casi todos los juegos del género (Water Sort Puzzle, Woody Sort, Cups, Color Sort).

### Ganar Monedas

* Completar nivel: +10 monedas
* 3 estrellas: +5 bonus
* Streak de 5+ niveles: +20 bonus
* Puzzle diario: +50 monedas

### Gastar Monedas

* Tubo extra: 30 monedas
* Inversión de color: 50 monedas
* Hint extra (más allá de los 3 gratis): 20 monedas
* Desbloquear temas visuales: 100-500 monedas

**Cómo se siente:** Da propósito al juego más allá de "pasar niveles". El jugador administra un recurso y decide cuándo gastar. Sin dinero real involucrado.

---

## 5. Obstáculos Especiales

Mecánicas que rompen la rutina introduciendo reglas nuevas en niveles específicos.

### Botellas Bloqueadas con Candado

Inspirado en puzzle games tipo Candy Crush y adaptaciones del género sorting. Una o dos botellas tienen un candado. No se pueden tocar hasta cumplir una condición: completar N botellas, o hacer N movimientos.

**Cómo se siente:** Limita el espacio disponible al inicio. Fuerza a planificar con recursos reducidos y luego adaptarte cuando se desbloquean.

### Segmento "Basura" / Color Especial

Un segmento gris o negro que no pertenece a ningún color. No se puede completar una botella con basura. Debe ser movido a una botella dedicada o desaparece al ser vertido N veces.

**Cómo se siente:** Un estorbo que ocupa espacio valioso. Obliga a planificar alrededor de él.

### Segmento Arcoíris (Comodín)

Un segmento especial que cuenta como "cualquier color". Puede completar cualquier botella pero también puede engañar si lo pones en el lugar equivocado.

**Cómo se siente:** Parece un regalo pero requiere estrategia para usarlo óptimamente.

### Botella de Tamaño Diferente

Algunas botellas con capacidad 2 o 3 en vez de 4. Limita cuánto puedes almacenar ahí temporalmente.

**Cómo se siente:** Rompe la simetría. No todas las botellas son iguales, hay que priorizar cuáles usar como buffer.

---

## 6. Rejugabilidad y Progresión

### Mapa de Niveles con Caminos

Presente en Woody Sort, Goods Sort, y muchos juegos casuales. En vez de un número de nivel plano, el jugador avanza por un mapa visual con nodos, bifurcaciones y zonas temáticas.

**Cómo se siente:** Progresión visible. "Estoy en el bosque, me falta llegar al volcán." Da sentido de aventura al puzzle.

**Implementación simplificada:** No necesita ser un mapa gráfico completo. Puede ser un nombre de zona que cambia cada 15-20 niveles con un color de fondo temático: "Costa" (azul), "Jungla" (verde), "Volcán" (rojo), "Nieve" (blanco), etc. Cambia el gradiente de fondo y el nombre en el header.

### Nivel Bonus Cada N Niveles

Cada 10 niveles, un puzzle especial con reglas diferentes: solo 30 segundos, o sin undo, o con botellas invertidas (el pour va de abajo hacia arriba).

**Cómo se siente:** Rompe la monotonía. Es un evento que el jugador anticipa.

### Logros / Achievements

* "Primer paso" — Completa tu primer nivel
* "Sin ayuda" — Completa un nivel sin usar undo
* "Speedster" — Completa un nivel en menos de 15 segundos
* "Cerebro" — Completa un nivel en el mínimo de movimientos posible
* "Racha de fuego" — 10 niveles seguidos sin reiniciar
* "Centenario" — Alcanza el nivel 100
* "Daltónico" — Completa 10 niveles en modo accesibilidad
* "Silencio" — Completa 20 niveles con sonido desactivado

**Implementación:** Lista de condiciones verificadas al final de cada nivel. Se muestran como badges en una pantalla de perfil.

---

## 7. Personalización Visual

Presente en todos los juegos exitosos del género (Cups, Woody Sort, Color Sort, Water Sort Puzzle).

### Temas de Botella

Diferentes estilos visuales: vidrio clásico, madera, neón, pixel art, acuarela. Se desbloquean con monedas o por progresión.

### Fondos

El gradiente cósmico actual es genial, pero ofrecer alternativas mantiene la frescura: atardecer, océano, bosque, minimalista blanco, dark mode puro.

### Efectos de Completar

Diferentes animaciones al completar una botella: confetti (actual), estrellas, burbujas, fuegos artificiales, arcoíris.

---

## 8. Social / Competitivo

### Leaderboard Semanal

Presente en Woody Sort. Los puntos acumulados en la semana se comparan con otros jugadores. En nuestro caso (sin backend), se puede hacer un leaderboard local que muestre el historial del propio jugador.

### Compartir Resultado

Al completar un nivel difícil, botón para copiar un resultado tipo Wordle:

```
🧪 Water Sort Lv.47
⭐⭐⭐ 12 moves · 0:34
🔥 Streak: 8
```

Fácil de implementar: genera texto y usa `navigator.share()` o `navigator.clipboard`.

---

## 9. Calidad de Vida (QoL)

Mecánicas que no cambian el juego pero mejoran la experiencia, tomadas de los juegos mejor reseñados.

### Multi-undo (no solo último movimiento)

Ya tienes historial completo. Permitir undo ilimitado pero con costo: cada undo reduce la calificación de estrellas. El primero es gratis, los siguientes cuestan.

### Preview de Pour Completo

Ya tienes ghost preview. Mejora: al mantener presionado (long press) una botella, mostrar el estado completo del tablero después del pour, como un "what if" temporal.

### Auto-save Mid-level

Si el jugador cierra la app a mitad de un nivel, restaurar el estado exacto al volver. Guardar `bottles`, `revealed`, `moves` e `history` en localStorage asociados al nivel actual.

### Velocidad de Animación Ajustable

Reseñas de Water Sort Puzzle en App Store mencionan repetidamente que la velocidad de pour es muy lenta. Ofrecer un toggle: Normal / Rápido / Instantáneo.

---

## Resumen: Prioridad de Implementación

Ordenado por impacto vs esfuerzo:

| Prioridad | Mecánica                             | Impacto | Esfuerzo |
| --------- | ------------------------------------- | ------- | -------- |
| 1         | Sistema de estrellas (★★★)         | Alto    | Bajo     |
| 2         | Compartir resultado (estilo Wordle)   | Alto    | Bajo     |
| 3         | Auto-completar último color          | Medio   | Bajo     |
| 4         | Tubo extra (power-up)                 | Alto    | Medio    |
| 5         | Modo contrarreloj                     | Alto    | Medio    |
| 6         | Puzzle diario (seed por fecha)        | Alto    | Medio    |
| 7         | Temas visuales (fondos)               | Medio   | Medio    |
| 8         | Sistema de monedas                    | Medio   | Medio    |
| 9         | Logros/Achievements                   | Medio   | Medio    |
| 10        | Obstáculos especiales                | Alto    | Alto     |
| 11        | Mapa de niveles                       | Medio   | Alto     |
| 12        | Modo difícil (movimientos limitados) | Alto    | Bajo     |
