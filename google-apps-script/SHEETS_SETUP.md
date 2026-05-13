# SimulaENCAPS - Configuración del Google Spreadsheet y Apps Script

Esta guía describe paso a paso cómo preparar el backend del simulador **SimulaENCAPS** (Examen Nacional de Competencias para Atención Primaria de Salud, MINSA).

> Examen ENCAPS: 100 preguntas, 3 horas, escala 0-20, 5 bloques.
> Fórmula del Puntaje Final: `PF = (PPP * 0.3) + (NENC * 0.7)`, donde `NENC = (correctas / 100) * 20`.

---

## 1. Crear el Google Spreadsheet

1. Ve a [https://sheets.google.com](https://sheets.google.com) y crea una nueva hoja de cálculo.
2. Nómbrala, por ejemplo: `SimulaENCAPS - Datos`.
3. Copia el **ID del Spreadsheet** desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
   ```

   **Spreadsheet en uso:** [Hoja SimulaENCAPS](https://docs.google.com/spreadsheets/d/1E-R5LQobXfReXJSWrEpcwH2-givVzyJLLNhuD0ot1_o/edit)

4. Pega ese ID en `api.gs`, en la constante (ya está cargado por defecto):
   ```js
   const SPREADSHEET_ID = '1E-R5LQobXfReXJSWrEpcwH2-givVzyJLLNhuD0ot1_o';
   ```

---

## 2. Crear las hojas con sus columnas

### Opción A — Automática (recomendada) ⚡

Después de pegar `api.gs` en tu proyecto de Apps Script (paso 4 de esta guía):

1. En el editor de Apps Script, en el desplegable de funciones (arriba), selecciona **`setupSheets`**.
2. Haz click en **▶ Ejecutar**. La primera vez te pedirá autorización — concédela.
3. En unos segundos verás en la consola:
   ```
   === SETUP COMPLETADO ===
   ✓ Banco_SaludPublica (creada)
   ✓ Banco_AtencionIntegral (creada)
   ...
   ✓ Estructura_ENCAPS (creada) con 18 filas
   ...
   ```
4. Vuelve a tu spreadsheet — las **12 hojas** estarán creadas con encabezados con formato (fondo navy, texto blanco, bold, primera fila congelada) y `Estructura_ENCAPS` ya viene con las sub-áreas sugeridas que suman 100 preguntas.

Es **idempotente**: si re-ejecutas `setupSheets`, las hojas que ya existan no se modifican. Solo crea las que faltan.

> Si necesitas reiniciar TODO desde cero, dentro de `api.gs` hay una función comentada `resetAndSetup()` que borra y recrea. **Úsala solo si entiendes que perderás todos los datos.**

### Opción B — Manual

Crea **una hoja (pestaña) por cada tabla** listada abajo. Los nombres deben coincidir EXACTAMENTE (con mayúsculas/tildes/guiones bajos). Si no las creas, las que se necesiten se crearán automáticamente la primera vez que el endpoint correspondiente se invoque.

### 2.1 `Banco_SaludPublica` (20 preguntas en el examen)

| Col | Header                  | Descripción |
|-----|-------------------------|-------------|
| A   | Question Text           | Enunciado   |
| B   | Question Type           | Caso Clínico / Pregunta directa |
| C   | Option 1                | Alternativa 1 |
| D   | Option 2                | Alternativa 2 |
| E   | Option 3                | Alternativa 3 |
| F   | Option 4                | Alternativa 4 |
| G   | Option 5                | Alternativa 5 |
| H   | Correct Answer          | Índice 1-5  |
| I   | Time in seconds         | Sugerido 180 |
| J   | Image Link              | URL opcional |
| K   | NUMERO                  | Numero original |
| L   | SUB-AREA                | Sub-área del bloque (NUEVA) |
| M   | TEMA                    | Tema |
| N   | SUBTEMA                 | Subtema |
| O   | NOMBRE DEL ARCHIVO      | Fuente original |
| P   | JUSTIFICACION           | Justificación de la respuesta |
| Q   | NIVEL                   | Recordar / Aplicar / Analizar (NUEVA) |
| R   | REFERENCIA NORMATIVA    | RM/NTS MINSA (NUEVA) |

### 2.2 `Banco_AtencionIntegral` (25 preguntas)

Misma estructura A-R que `Banco_SaludPublica`.

### 2.3 `Banco_Etica` (15 preguntas)

Misma estructura A-R.

### 2.4 `Banco_Investigacion` (15 preguntas)

Misma estructura A-R.

### 2.5 `Banco_Administracion` (25 preguntas)

Misma estructura A-R.

### 2.6 `Estructura_ENCAPS`

Define la matriz oficial de sub-áreas y temas del examen.

| Col | Header        | Descripción |
|-----|---------------|-------------|
| A   | BLOQUE        | Nombre del bloque |
| B   | SUB-AREA      | Sub-área dentro del bloque |
| C   | TEMA          | Tema específico |
| D   | NUM_PREGUNTAS | Cantidad de preguntas oficiales para ese tema |
| E   | PUNTAJE_EST   | Puntaje estimado |

### 2.7 `respuestas_log`

Registro detallado de respuestas (lo llena el endpoint `logAnswers`).

| Col | Header            | Descripción |
|-----|-------------------|-------------|
| A   | DNI               | DNI del usuario |
| B   | Fecha             | Timestamp |
| C   | QuestionID        | id devuelto por el backend (`Bloque-rowIndex`) |
| D   | Bloque            | Nombre del bloque |
| E   | SubArea           | Sub-área |
| F   | Correcta          | TRUE/FALSE |
| G   | RespuestaElegida  | 1-5 |

### 2.8 `flashcards`

| Col | Header     |
|-----|------------|
| A   | ID         |
| B   | Bloque     |
| C   | SubArea    |
| D   | Tema       |
| E   | Frente     |
| F   | Reverso    |
| G   | Referencia |

### 2.9 `testimonios`

| Col | Header           |
|-----|------------------|
| A   | Fecha            |
| B   | Nombre           |
| C   | Establecimiento  |
| D   | Region           |
| E   | Texto            |
| F   | Aprobado (TRUE/FALSE) |

### 2.10 `usuarios`

| Col | Header           |
|-----|------------------|
| A   | Fecha            |
| B   | DNI              |
| C   | Nombre           |
| D   | Email            |
| E   | Celular          |
| F   | Establecimiento  |
| G   | Region           |
| H   | Cargo            |

### 2.11 `historial_puntajes`

| Col | Header     |
|-----|------------|
| A   | DNI        |
| B   | Fecha      |
| C   | Correctas  |
| D   | Total      |
| E   | Puntaje    |
| F   | NENC       |
| G   | PPP        |
| H   | PF         |
| I   | Porcentaje |

### 2.12 `confirmado`

Usuarios autorizados para más de un intento y para Banqueo Histórico.

| Col | Header |
|-----|--------|
| A   | DNI    |
| B   | Nombre |
| C   | Email  |

---

## 3. Poblar `Estructura_ENCAPS` (sub-áreas sugeridas)

Estas son sub-áreas razonables iniciales (ajusta los `NUM_PREGUNTAS` y temas a la realidad oficial del MINSA cuando dispongas de ella). El `NUM_PREGUNTAS` total por bloque debe sumar al `questionCount` del bloque.

### Bloque: Salud Pública (total 20)

| BLOQUE        | SUB-AREA        | TEMA                                  | NUM_PREGUNTAS | PUNTAJE_EST |
|---------------|-----------------|---------------------------------------|---------------|-------------|
| Salud Pública | Epidemiología   | Indicadores epidemiológicos           | 5             | 1.0         |
| Salud Pública | Vigilancia      | Vigilancia de enfermedades transmisibles | 5          | 1.0         |
| Salud Pública | Promoción       | Promoción de la salud y prevención    | 5             | 1.0         |
| Salud Pública | Determinantes   | Determinantes sociales de la salud    | 5             | 1.0         |

### Bloque: Atención Integral (total 25)

| BLOQUE             | SUB-AREA         | TEMA                                 | NUM_PREGUNTAS | PUNTAJE_EST |
|--------------------|------------------|--------------------------------------|---------------|-------------|
| Atención Integral  | AIEPI            | Manejo del niño <5 años              | 6             | 1.0         |
| Atención Integral  | Salud Materna    | Control prenatal, parto, puerperio   | 6             | 1.0         |
| Atención Integral  | Salud Mental     | Tamizaje y manejo APS                | 4             | 1.0         |
| Atención Integral  | Salud del Adulto | Crónicas, HTA, DM2                   | 5             | 1.0         |
| Atención Integral  | Salud Adolescente| Atención diferenciada                | 4             | 1.0         |

### Bloque: Ética (total 15)

| BLOQUE | SUB-AREA               | TEMA                            | NUM_PREGUNTAS | PUNTAJE_EST |
|--------|------------------------|---------------------------------|---------------|-------------|
| Ética  | Bioética principialista| Autonomía, beneficencia, etc.   | 5             | 1.0         |
| Ética  | Consentimiento         | Consentimiento informado        | 5             | 1.0         |
| Ética  | Derechos del paciente  | Marco legal peruano             | 5             | 1.0         |

### Bloque: Investigación (total 15)

| BLOQUE        | SUB-AREA        | TEMA                              | NUM_PREGUNTAS | PUNTAJE_EST |
|---------------|-----------------|-----------------------------------|---------------|-------------|
| Investigación | Diseños         | Tipos de estudio epidemiológico   | 5             | 1.0         |
| Investigación | Estadística     | Estadística descriptiva e inferencial | 5         | 1.0         |
| Investigación | MBE             | Lectura crítica y MBE             | 5             | 1.0         |

### Bloque: Administración (total 25)

| BLOQUE         | SUB-AREA          | TEMA                                   | NUM_PREGUNTAS | PUNTAJE_EST |
|----------------|-------------------|----------------------------------------|---------------|-------------|
| Administración | Gestión APS       | Modelo de Atención Integral en Salud   | 7             | 1.0         |
| Administración | Calidad           | Garantía y mejora de la calidad        | 6             | 1.0         |
| Administración | Recursos Humanos  | Gestión RR.HH. en establecimientos APS | 6             | 1.0         |
| Administración | Sistemas y SIS    | HIS, registros y reportes              | 6             | 1.0         |

> Asegúrate de que las cadenas en la columna `SUB-AREA` de cada `Banco_*` coincidan EXACTAMENTE con las usadas aquí; los filtros del frontend (Banqueo, Flashcards) las usan literales.

---

## 4. Desplegar el Apps Script

1. En el Spreadsheet abre **Extensiones > Apps Script**.
2. Renombra el proyecto a `SimulaENCAPS API`.
3. Borra el contenido del archivo `Code.gs` y pega el contenido completo de `google-apps-script/api.gs`.
4. Actualiza la constante `SPREADSHEET_ID` con el ID copiado en el paso 1.
5. Guarda (Ctrl + S).
6. Click en **Implementar > Nueva implementación**.
7. Engranaje > **Aplicación web**.
8. Configuración:
   - **Descripción:** `SimulaENCAPS API v1`
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier persona
9. Click en **Implementar**.
10. Autoriza los permisos cuando lo solicite (Spreadsheet read/write).
11. Copia la **URL de la aplicación web** generada. Termina en `/exec`.

> Cuando edites `api.gs`, debes **Crear nueva implementación** o usar **Administrar implementaciones > editar > Nueva versión** para que los cambios queden públicos en la URL `/exec`.

---

## 5. Configurar el frontend (`.env`)

En la raíz del proyecto frontend, edita (o crea) el archivo `.env`:

```env
VITE_API_URL=https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```

Reinicia `npm run dev` para que Vite tome la variable.

---

## 6. Endpoints de prueba (curl / navegador)

Reemplaza `<URL>` por la URL `/exec` de tu Apps Script.

| Acción | URL ejemplo |
|--------|-------------|
| Ping | `<URL>?action=test` |
| Configuración | `<URL>?action=config` |
| 100 preguntas (examen completo) | `<URL>?action=questions` |
| Estructura ENCAPS | `<URL>?action=getEstructura` |
| Banqueo (10 preguntas de un bloque) | `<URL>?action=getBanqueoQuestions&block=Salud%20P%C3%BAblica` |
| Banqueo filtrado por sub-área | `<URL>?action=getBanqueoQuestions&block=Salud%20P%C3%BAblica&subArea=Epidemiolog%C3%ADa` |
| Flashcards | `<URL>?action=getFlashcards&block=%C3%89tica` |
| Testimonios aprobados | `<URL>?action=getTestimonios` |
| Historial de un usuario | `<URL>?action=getHistory&dni=12345678` |
| Progreso | `<URL>?action=getProgress&dni=12345678` |
| Preguntas incorrectas | `<URL>?action=getIncorrectQuestions&dni=12345678` |
| Stats de una pregunta | `<URL>?action=getQuestionStats&questionId=Salud%20P%C3%BAblica-12` |
| Verificar acceso | `<URL>?action=checkAccess&dni=12345678&email=test@correo.com` |
| Verificar acceso al Banqueo | `<URL>?action=checkBanqueoAccess&dni=12345678&email=test@correo.com` |

### Registro de usuario (GET)

```
<URL>?action=register
   &dni=12345678
   &fullName=Juan%20Perez
   &email=juan@correo.com
   &phone=987654321
   &establecimiento=C.S.%20San%20Juan
   &region=Lima
   &cargo=Médico%20Serums
```

### Guardar puntaje (GET)

```
<URL>?action=saveScore
   &dni=12345678
   &correctAnswers=78
   &totalQuestions=100
   &rawScore=78
   &nenc=15.6
   &ppp=14.5
```

### Log de respuestas batch (POST con JSON body)

```
POST <URL>
Content-Type: application/json

{
  "action": "logAnswers",
  "dni": "12345678",
  "answers": [
    { "questionId": "Salud Pública-12", "block": "Salud Pública", "subArea": "Epidemiología", "correcta": true,  "respuestaElegida": 3 },
    { "questionId": "Ética-7",         "block": "Ética",         "subArea": "Bioética principialista", "correcta": false, "respuestaElegida": 2 }
  ]
}
```

> Nota CORS: Apps Script `/exec` con `ContentService` no admite preflight CORS personalizado. En el frontend, los `fetch` se hacen como `Content-Type: text/plain` o `application/x-www-form-urlencoded` para evitar preflight, o se usan parámetros GET cuando es posible.

---

## 7. Checklist de verificación

- [ ] `SPREADSHEET_ID` actualizado en `api.gs`.
- [ ] 5 hojas `Banco_*` con encabezados A-R completos.
- [ ] `Estructura_ENCAPS` poblada (suma 100 preguntas).
- [ ] Hojas `usuarios`, `historial_puntajes`, `confirmado`, `respuestas_log`, `flashcards`, `testimonios` creadas (o se autocrearán).
- [ ] Apps Script desplegado como aplicación web pública.
- [ ] `VITE_API_URL` apuntando a la URL `/exec`.
- [ ] `?action=test` responde `{"success":true,"data":{"status":"ok",...}}`.
- [ ] `?action=config` devuelve 5 bloques y `totalQuestions: 100`.
