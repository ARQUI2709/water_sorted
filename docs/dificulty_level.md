<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium bg-subtler"><div class="-mt-xl"><div><span><code><span><span># Regla general de dificultad (Water Sort) — Implementación práctica
</span></span><span>
</span><span>Este documento define una regla única y aplicable en código para:
</span><span>1) Garantizar resolubilidad teórica (evitar niveles imposibles).
</span><span>2) Asignar niveles **Fácil / Normal / Difícil** de forma consistente usando \(N\), \(E\) y CAP.
</span><span>3) Producir un **score 0–100** para ordenar/progresar niveles dentro de cada categoría.
</span><span>
</span><span>---
</span><span>
</span><span>## 1) Variables y supuestos
</span><span>
</span><span>- **N**: número de colores (equivale a número de botellas inicialmente llenas).
</span><span>- **CAP**: capacidad de cada botella (segmentos por botella), típico 4, 5 o 6.
</span><span>- **E**: número de botellas vacías (buffers).
</span><span>
</span><span>Supuesto de diseño: el “espacio libre” es el principal controlador de dificultad.
</span><span>
</span><span>---
</span><span>
</span><span>## 2) Regla dura de resolubilidad (no negociable)
</span><span>
</span><span>- Para evitar niveles imposibles, usar **E ≥ 2** como mínimo global.
</span><span>- Para CAP altos, se puede subir E mínimo por diseño (no por resolubilidad), para que el juego sea jugable.
</span><span>
</span><span>En esta política, la resolubilidad está garantizada por construcción (E nunca baja de 2).
</span><span>
</span><span>---
</span><span>
</span><span>## 3) Política (Policy Layer): elegir E según (N, CAP, dificultad)
</span><span>
</span><span>Se define un selector discreto de E por tramos de N y por CAP. Esto fija la dificultad “macro” y evita decisiones erráticas.
</span><span>
</span><span>### Tramos de N
</span><span>- **Band 0**: 3–8 colores
</span><span>- **Band 1**: 9–20 colores
</span><span>- **Band 2**: 21–36 colores
</span><span>
</span><span>### Rangos recomendados de E por CAP y tramo
</span><span>| Tramo N | CAP=4 | CAP=5 | CAP=6 |
</span><span>|--------:|:-----:|:-----:|:-----:|
</span><span>| 3–8     | 2–3   | 2–3   | 3–4   |
</span><span>| 9–20    | 2–3   | 3–4   | 4–5   |
</span><span>| 21–36   | 3–4   | 4–5   | 5–6   |
</span><span>
</span><span>### Mapear dificultad a E dentro del rango
</span><span>- **Difícil**: usar el mínimo del rango.
</span><span>- **Fácil**: usar el máximo del rango.
</span><span>- **Normal**: usar el punto medio (entero).
</span><span>
</span><span>#### Código (TypeScript)
</span><span>```ts
</span><span>export type Tier = "easy" | "normal" | "hard";
</span><span>
</span><span>export function chooseE(N: number, CAP: 4|5|6, tier: Tier): number {
</span><span>  const band = N <= 8 ? 0 : N <= 20 ? 1 : 2;
</span><span>
</span><span>  const ranges: Record<4|5|6, Array<[number, number]>> = {
</span><span>    4: [,,],[1][2][3]
</span><span>    5: [,,],[2][3][4][1]
</span><span>    6: [,,],[3][4][5][2]
</span><span>  };
</span><span>
</span><span>  const [minE, maxE] = ranges[CAP][band];
</span><span>
</span><span>  if (tier === "hard") return minE;
</span><span>  if (tier === "easy") return maxE;
</span><span>  return Math.floor((minE + maxE) / 2); // normal
</span><span>}
</span><span></span></code></span></div></div></div></pre>

---

## 4) Métrica (Score Layer): score continuo 0–100 para ordenar niveles

La policy fija E “macro”. Luego se usa un score continuo para:

* Ordenar niveles dentro de un tier.
* Ajustar progresión.
* Comparar dificultad entre combinaciones distintas de (N, E, CAP).

## Features base

* **Slack absoluto** : `slack = E * CAP` (huecos libres totales).
* **Slack relativo** : `ratio = E / N` (huecos libres por color/tubo).

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">ts</div></div><div><span><code><span><span class="token token">export</span><span></span><span class="token token">function</span><span></span><span class="token token">slack</span><span class="token token punctuation">(</span><span class="token token constant">E</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">,</span><span></span><span class="token token constant">CAP</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">)</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token">return</span><span></span><span class="token token constant">E</span><span></span><span class="token token operator">*</span><span></span><span class="token token constant">CAP</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span><span></span><span class="token token">export</span><span></span><span class="token token">function</span><span></span><span class="token token">slackRatio</span><span class="token token punctuation">(</span><span class="token token constant">E</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">,</span><span></span><span class="token token constant">N</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">)</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token">return</span><span></span><span class="token token constant">E</span><span></span><span class="token token operator">/</span><span></span><span class="token token constant">N</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## Score recomendado (no lineal + factor de profundidad)

Este score aumenta cuando:

* baja `ratio` (menos buffer relativo),
* sube CAP (más profundidad).

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">ts</div></div><div><span><code><span><span class="token token">type</span><span></span><span class="token token">Params</span><span></span><span class="token token operator">=</span><span></span><span class="token token punctuation">{</span><span></span><span class="token token constant">N</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">;</span><span></span><span class="token token constant">E</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">;</span><span></span><span class="token token constant">CAP</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span></span><span class="token token punctuation">}</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">export</span><span></span><span class="token token">function</span><span></span><span class="token token">difficultyScore01</span><span class="token token punctuation">(</span><span class="token token punctuation">{</span><span></span><span class="token token constant">N</span><span class="token token punctuation">,</span><span></span><span class="token token constant">E</span><span class="token token punctuation">,</span><span></span><span class="token token constant">CAP</span><span></span><span class="token token punctuation">}</span><span class="token token operator">:</span><span> Params</span><span class="token token punctuation">)</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token">const</span><span> ratio </span><span class="token token operator">=</span><span></span><span class="token token constant">E</span><span></span><span class="token token operator">/</span><span></span><span class="token token constant">N</span><span class="token token punctuation">;</span><span></span><span class="token token">// menor => más difícil</span><span>
</span></span><span><span></span><span class="token token">const</span><span> depthFactor </span><span class="token token operator">=</span><span></span><span class="token token constant">CAP</span><span></span><span class="token token operator">/</span><span></span><span class="token token">4</span><span class="token token punctuation">;</span><span></span><span class="token token">// CAP=4 => 1, CAP=6 => 1.5</span><span>
</span></span><span>
</span><span><span></span><span class="token token">// Curva logística: penaliza fuerte cuando ratio es bajo.</span><span>
</span></span><span><span></span><span class="token token">// Ajusta k (pendiente) y pivot (centro) en playtesting.</span><span>
</span></span><span><span></span><span class="token token">const</span><span> k </span><span class="token token operator">=</span><span></span><span class="token token">2.0</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">const</span><span> pivot </span><span class="token token operator">=</span><span></span><span class="token token">0.25</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">const</span><span> base </span><span class="token token operator">=</span><span></span><span class="token token">1</span><span></span><span class="token token operator">/</span><span></span><span class="token token punctuation">(</span><span class="token token">1</span><span></span><span class="token token operator">+</span><span> Math</span><span class="token token punctuation">.</span><span class="token token">exp</span><span class="token token punctuation">(</span><span>k </span><span class="token token operator">*</span><span></span><span class="token token punctuation">(</span><span>ratio </span><span class="token token operator">-</span><span> pivot</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span></span><span class="token token">// 0..1 aprox</span><span>
</span></span><span>
</span><span><span></span><span class="token token">// Ponderación suave por profundidad.</span><span>
</span></span><span><span></span><span class="token token">const</span><span> score01 </span><span class="token token operator">=</span><span> Math</span><span class="token token punctuation">.</span><span class="token token">min</span><span class="token token punctuation">(</span><span class="token token">1</span><span class="token token punctuation">,</span><span> base </span><span class="token token operator">*</span><span></span><span class="token token punctuation">(</span><span class="token token">0.75</span><span></span><span class="token token operator">+</span><span></span><span class="token token">0.25</span><span></span><span class="token token operator">*</span><span> depthFactor</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">return</span><span> score01</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span>
</span><span><span></span><span class="token token">export</span><span></span><span class="token token">function</span><span></span><span class="token token">difficultyScore100</span><span class="token token punctuation">(</span><span>p</span><span class="token token operator">:</span><span> Params</span><span class="token token punctuation">)</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token">return</span><span> Math</span><span class="token token punctuation">.</span><span class="token token">round</span><span class="token token punctuation">(</span><span class="token token">difficultyScore01</span><span class="token token punctuation">(</span><span>p</span><span class="token token punctuation">)</span><span></span><span class="token token operator">*</span><span></span><span class="token token">100</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## Ajuste de “agresividad” (opcional)

Para que diferencias pequeñas se noten más o menos:

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">ts</div></div><div><span><code><span><span class="token token">export</span><span></span><span class="token token">function</span><span></span><span class="token token">shapeDifficulty</span><span class="token token punctuation">(</span><span>score01</span><span class="token token operator">:</span><span></span><span class="token token">number</span><span class="token token punctuation">,</span><span> alpha </span><span class="token token operator">=</span><span></span><span class="token token">1.3</span><span class="token token punctuation">)</span><span></span><span class="token token punctuation">{</span><span>
</span></span><span><span></span><span class="token token">return</span><span> Math</span><span class="token token punctuation">.</span><span class="token token">pow</span><span class="token token punctuation">(</span><span>Math</span><span class="token token punctuation">.</span><span class="token token">min</span><span class="token token punctuation">(</span><span>Math</span><span class="token token punctuation">.</span><span class="token token">max</span><span class="token token punctuation">(</span><span>score01</span><span class="token token punctuation">,</span><span></span><span class="token token">0</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span></span><span class="token token">1</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span> alpha</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token punctuation">}</span><span>
</span></span><span></span></code></span></div></div></div></pre>

---

## 5) Regla final de generación de niveles (pipeline)

## Entrada

* Target Tier: `"easy" | "normal" | "hard"`
* N (3..36)
* CAP (4|5|6)

## Proceso

1. `E = chooseE(N, CAP, tier)`
2. Generar distribución inicial aleatoria con N colores * CAP segmentos.
3. (Recomendado) Validar resolubilidad con solver; si falla, regenerar (esto protege contra variaciones de reglas o casos borde).
4. Calcular `score100 = difficultyScore100({N, E, CAP})`.
5. Publicar el nivel con:
   * Tier (etiqueta)
   * E, N, CAP (parámetros)
   * score100 (orden interno / progresión)

## Salida

* Un set de niveles ordenable por `score100` dentro de cada tier.

---

## 6) Convención práctica (para diseño de campaña)

* El “botón principal” de dificultad es **E** (policy layer).
* El “fine tuning” es el score (score layer), útil para ordenar y escalonar progresión.
* Si un tier se siente demasiado fácil/difícil:
  * Ajustar rangos de E por band (policy).
  * O ajustar `pivot`, `k` y `alpha` (score) sin cambiar la policy.

---

## 7) Ejemplo mínimo de uso

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-medium bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">ts</div></div><div><span><code><span><span class="token token">const</span><span></span><span class="token token constant">N</span><span></span><span class="token token operator">=</span><span></span><span class="token token">16</span><span></span><span class="token token">as</span><span></span><span class="token token">const</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">const</span><span></span><span class="token token constant">CAP</span><span></span><span class="token token operator">=</span><span></span><span class="token token">5</span><span></span><span class="token token">as</span><span></span><span class="token token">const</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">const</span><span> tier</span><span class="token token operator">:</span><span> Tier </span><span class="token token operator">=</span><span></span><span class="token token">"hard"</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">const</span><span></span><span class="token token constant">E</span><span></span><span class="token token operator">=</span><span></span><span class="token token">chooseE</span><span class="token token punctuation">(</span><span class="token token constant">N</span><span class="token token punctuation">,</span><span></span><span class="token token constant">CAP</span><span class="token token punctuation">,</span><span> tier</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">const</span><span> score </span><span class="token token operator">=</span><span></span><span class="token token">difficultyScore100</span><span class="token token punctuation">(</span><span class="token token punctuation">{</span><span></span><span class="token token constant">N</span><span class="token token punctuation">,</span><span></span><span class="token token constant">E</span><span class="token token punctuation">,</span><span></span><span class="token token constant">CAP</span><span></span><span class="token token punctuation">}</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">console</span><span class="token token punctuation">.</span><span class="token token">log</span><span class="token token punctuation">(</span><span class="token token punctuation">{</span><span></span><span class="token token constant">N</span><span class="token token punctuation">,</span><span></span><span class="token token constant">CAP</span><span class="token token punctuation">,</span><span> tier</span><span class="token token punctuation">,</span><span></span><span class="token token constant">E</span><span class="token token punctuation">,</span><span> score </span><span class="token token punctuation">}</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span></span></code></span></div></div></div></pre>
