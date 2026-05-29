# GUÍA DE ANÁLISIS MATEMÁTICO - TEORÍA DE CONJUNTOS
**Proyecto: Contaminación Ambiental**

---

## DEFINICIÓN DE CONJUNTOS (EJEMPLOS)

Una vez que tengas tus datos de las 5 encuestas, puedes definir conjuntos así:

**Conjunto Universal (U):**
U = {Persona 1, Persona 2, Persona 3, Persona 4, Persona 5}
|U| = 5

**Conjunto A:** Personas que practican reciclaje
A = {P1, P3, P5}  (ejemplo, reemplaza con tus datos reales)
|A| = 3

**Conjunto B:** Personas que practican reutilización
B = {P2, P4}
|B| = 2

**Conjunto C:** Personas que practican ahorro de agua
C = {P1, P2, P3}
|C| = 3

**Conjunto D:** Personas que usan transporte ecológico
D = {P5}
|D| = 1

**Conjunto E:** Personas que NO practican ninguna acción ecológica
E = { }  (si todos practican algo, este conjunto está vacío)
|E| = 0

---

## OPERACIONES ENTRE CONJUNTOS

### 1. UNIÓN (∪)
**A ∪ B:** Personas que practican reciclaje O reutilización (o ambas)
- Si A = {P1, P3, P5} y B = {P2, P4}
- Entonces A ∪ B = {P1, P2, P3, P4, P5}
- |A ∪ B| = 5
- **Interpretación ambiental:** El 100% de los encuestados practica al menos una de estas dos acciones ecológicas.

### 2. INTERSECCIÓN (∩)
**A ∩ B:** Personas que practican reciclaje Y reutilización simultáneamente
- Si A = {P1, P3, P5} y B = {P2, P4}
- Entonces A ∩ B = { } (conjunto vacío)
- |A ∩ B| = 0
- **Interpretación ambiental:** Ninguna persona practica ambas acciones, lo que indica que se podría fomentar la combinación de prácticas.

### 3. DIFERENCIA (-)
**A - B:** Personas que practican reciclaje pero NO reutilización
- Si A = {P1, P3, P5} y B = {P2, P4}
- Entonces A - B = {P1, P3, P5}
- |A - B| = 3
- **Interpretación ambiental:** 3 personas reciclan pero no reutilizan materiales.

### 4. COMPLEMENTO (')
**A':** Personas que NO practican reciclaje
- Si A = {P1, P3, P5} y U = {P1, P2, P3, P4, P5}
- Entonces A' = {P2, P4}
- |A'| = 2
- **Interpretación ambiental:** 2 personas (40%) no reciclan, lo que representa un área de mejora.

---

## SUBCONJUNTOS

Un conjunto X es subconjunto de Y (X ⊆ Y) si todos los elementos de X están en Y.

**Ejemplo:**
- Si D = {P5} y A = {P1, P3, P5}
- Entonces D ⊆ A (porque P5 está en A)
- **Interpretación ambiental:** La persona que usa transporte ecológico también recicla.

---

## DIAGRAMAS DE VENN

### Diagrama para A ∪ B (Unión)
```
    A          B
  ┌─────┐   ┌─────┐
  │ P1  │   │ P2  │
  │ P3  │   │ P4  │
  │ P5  │   │     │
  └─────┘   └─────┘
```
*Si hay intersección, los círculos se superponen.*

### Diagrama para A ∩ B (Intersección)
```
    A          B
  ┌─────┐   ┌─────┐
  │     │   │     │
  │  ┌──┴───┴──┐  │
  │  │  vacío  │  │
  │  └─────────┘  │
  └───────────────┘
```
*Si A ∩ B = { }, el área central está vacía.*

---

## CÁLCULOS DE PORCENTAJES

- **Porcentaje de personas que reciclan:** (|A| / |U|) × 100
- **Porcentaje de personas que practican al menos una acción:** (|A ∪ B ∪ C ∪ D| / |U|) × 100
- **Porcentaje de personas que no practican ninguna acción:** (|E| / |U|) × 100

---

## EJEMPLO DE ANÁLISIS COMPLETO

**Datos hipotéticos:**
- U = {P1, P2, P3, P4, P5}
- A (reciclan) = {P1, P3, P5}
- B (reutilizan) = {P2, P4}
- C (ahorran agua) = {P1, P2, P3}

**Análisis:**
1. **A ∪ C = {P1, P2, P3, P5}** → 80% practican reciclaje o ahorro de agua
2. **A ∩ C = {P1, P3}** → 40% practican ambas acciones simultáneamente
3. **B' = {P1, P3, P5}** → 60% no reutilizan materiales
4. **C - A = {P2}** → 20% ahorran agua pero no reciclan

**Conclusión ambiental:** Existe buena conciencia sobre ahorro de agua y reciclaje, pero la reutilización es una práctica poco adoptada. Se recomienda campañas educativas sobre reutilización de materiales.
