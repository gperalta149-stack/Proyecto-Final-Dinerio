# GUÍA DE DEFENSA ORAL — DINERIO (v2 extendida)
### Formato: simulación de la presentación con preguntas del tribunal interpuestas + referencias de código

> **Cómo usar este documento.** La defensa se arma como una charla en "actos" (son **8**). Vos hablás (bloques **[VOS]**) y, cuando el tribunal interrumpe, respuestas con **[PROFESOR]** → **[RESPUESTA]** usando ejemplos reales de Dinerio. Cada identificador técnico del código lleva entre paréntesis **dónde vive** en el proyecto (archivo + línea), así podés señalar y abrir el archivo sin dudar. Todo el glosario de referencias está al final. Está pensada para durar **35-40 min** (cada acto tiene su reparto de tiempo).

---

## PARTE 0. DATOS INQUIETANTES (memorizalos, todos verificados)

- Proyecto web de **gestión de suscripciones y gastos recurrentes**.
- **Stack:** React + TypeScript + Vite (frontend) · Node + Express + TypeScript (backend) · PostgreSQL (local `Dinerio_db` y producción en Supabase).
- **48 endpoints** en **11 módulos** · **9 controladores** · **4 servicios** · **8 tablas** · **16 tests** (Vitest) · **ESLint 0** · **JWT + bcrypt** · **node-cron**.
- **Deploy en vivo:** backend/API en **Render**, frontend en **Vercel**, base en **Supabase**. Los datos de la demo salen de la nube, no de localhost.
- Nombres exactos para no dudar: `BillingCycleService`, `exchangeRateService`, `debtGeneratorService`, `notificationService`, job `NotificationJob`.
- Servicios de moneda: **Bluelytics** con respaldo en **DolarAPI**, cache 15 min, factor tarjeta **1.53**.
- **Tus 3 limitaciones honestas** (preparadas, ver Acto 8): estado `cancelled` recargado, ciclo semanal simplificado, sin paginación.

**Plan de tiempo (35 min):** Apertura 3' → Arquitectura 3' → Backend/API 6' (con demo) → BD 5' → Lógica de negocio 7' (el corazón) → Frontend 3' → Calidad/tests 4' → Trampas y cierre 4'. Eso te deja margen de unos minutos para las preguntas. No te adelantes a lo de BD o calidad: seguí los acts en orden.

---

## ACTO 1 — APERTURA Y PROBLEMA (3 min)

**[VOS]**
> "Buenas, voy a presentar **Dinerio**, una aplicación web para gestionar suscripciones y gastos recurrentes. El disparador es un problema conocido: hoy acumulamos muchos servicios de pago mensual — streaming, música, software, almacenamiento — y se nos olvida qué se vence, cuándo, y cuánto estamos gastando de verdad. En Argentina el problema es doble, porque además se paga en dólares con un factor de impuestos demasiado alto (alrededor de 1.53), que hace que el gasto real no sea transparente. Dinerio ataca tres flancos: **qué** se paga, **cuándo** vence y **cuánto** se gasta."

**[PROFESOR]** *¿Qué entregable vas a mostrar y cuál es su alcance?*
**[RESPUESTA]**
> "Es un sistema **web completo, full-stack, multiusuario**: SPA en React que consume una API REST en Node/Express, con base de datos PostgreSQL. Cubre el ciclo de vida de una suscripción: alta → vencimiento → aviso → pago → reporte. Además: presupuesto mensual, calendario de vencimientos, notificaciones y registro de auditoría."

**[PROFESOR]** *¿Por qué web y no una app de celular?*
**[RESPUESTA]**
> "Sin instalación, usable desde cualquier navegador y fácil de publicar: el frontend está en **Vercel**, la API en **Render** y la base en **Supabase**. Al ser multidispositivo con backend en la nube los datos quedan centralizados y sincronizados, cosa que en una app local no sucede. De hecho, la demo que van a ver corre sobre esa nube."

**[PROFESOR]** *¿Cuál es la base de usuarios que pensás? ¿Es pensado de verdad?*
**[RESPUESTA]**
> "Está pensado como multiusuario real: cada cuenta tiene su universo de datos aislado (filtro por `user_id`). No es una demo de un solo usuario; la arquitectura soporta varios desde el día uno, aunque la puesta en producción actual está orientada a una base inicial."

---

## ACTO 2 — ARQUITECTURA Y STACK (3 min)

**[VOS]**
> "La arquitectura es de tres capas. El **frontend es una SPA** en React + TypeScript: el tipado estático protege los datos financieros (montos, monedas, estados). Se comunica con el backend vía **Axios** contra una API REST. El **backend está en capas — rutas, controladores, servicios, consultas SQL —** y se conecta a **PostgreSQL**. La autenticación es con **JWT**."

**[PROFESOR]** *¿Por qué TypeScript?*
**[RESPUESTA]**
> "El dinero mal tipado es un bug crítico: guardá un `string` donde va un monto y rompe silenciosamente. Compile lo detecta, por ejemplo, que una función que devuelve `number` no se use como string, o que una `Subscription` tenga sí o sí su `amount` (`backend/src/types/index.ts`). Eso elimina de antemano una clase de errores que aparecerían recién en producción."

**[PROFESOR]** *¿Por qué Express y no Nest o Fastify?*
**[RESPUESTA]**
> "Express es el estándar, liviano y suficiente para una API REST de este alcance. Nest es muy estructurado y para este tamaño habría sido sobre-ingeniería. Elegí la menor complejidad que cumple el objetivo."

**[PROFESOR]** *¿Cómo está organizado el código del backend?*
**[RESPUESTA]**
> "Por capas: **rutas** definen el contrato HTTP y la autenticación (`backend/src/routes/`), **controladores** orquestan cada caso de uso (`backend/src/controllers/`), **servicios** concentran la lógica de negocio reutilizable (`backend/src/services/`), y las **consultas SQL parametrizadas** tocan PostgreSQL. Así la lógica no depende de la interfaz."

---

## ACTO 3 — BACKEND / API EN PROFUNDIDAD (6')

**[VOS]**
> "La API es REST y tiene **48 endpoints repartidos en 11 módulos**: auth, subscriptions, categories, debts, calendar, budgets, notifications, reports, users, audit y upload. Los sigo mientras vemos la demo."

### 3.1 Flujo de registro y login
**[PROFESOR]** *¿Me describís el registro a nivel de backend?*
**[RESPUESTA]**
> "En el registro (`backend/src/controllers/authController.ts`): valido con `express-validator` (email válido, contraseña mínima), hasheo con `bcrypt` con salt (`authController.ts:37`), inserto el usuario y devuelvo un **JWT firmado** con `jwt.sign` (`.ts:15`). En el login comparo el hash con `bcrypt.compare` (authController.ts:105) y devuelvo otro token. Ese token viaja en `Authorization: Bearer <token>`."

**[PROFESOR]** ¿Por qué no devolvés la contraseña? ¿Y el JWT, qué contenido tiene?
**[RESPUESTA]**
> "Nunca se devuelve ni se almacena el hash como respuesta, solo se compara. El JWT lleva `{ userId, email, name }` (`backend/src/types/index.ts:74`), con el `userId` para aislar los datos. La firma usa un secreto en `.env`, con `JWT_SECRET`."

### 3.2 Autenticación JWT (la parte que pidió el profesor)
**[PROFESOR]** *¿Cómo se verifica un request protegido?*
**[RESPUESTA]**
> "El middleware `authenticate` (`backend/src/middleware/auth.ts:5`) lee el header `Authorization`, extrae el token, lo verifica con `jwt.verify` (auth.ts:19) y, si es válido, adjunta los datos al request: `req.user = { id, ... }` (auth.ts:20). Después, todas las consultas hacen `WHERE user_id = $1`. Es stateless: no hay sesión en el servidor, la sesión vive en el token."

**[PROFESOR]** *(señalando)* *Eso que escribiste, `req.user.userId`, ¿de dónde sale y por qué lo usás así?*
**[RESPUESTA]**
> "`req.user` es el objeto que deja el middleware en el request (`auth.ts:20`), tipado como `JWTPayload` en `backend/src/types/index.ts` (`user?` en el `AuthRequest`, types/index.ts:83). El `userId` viene de la firma del token que yo genero al hacer login. Lo uso como **clave de aislamiento**: en cada query pongo `WHERE user_id = req.user.userId`, así ningún usuario ve datos de otro."

**[PROFESOR]** *¿Qué pasa si el token está vencido o es inválido?*
**[RESPUESTA]**
> "El middleware responde `401 Unauthorized`. El frontend lo detecta y redirige al login. Al no haber sesión en el servidor, no hay nada que limpiar del lado servidor."

### 3.3 Seguridad
**[PROFESOR]** *¿Cómo evitás la inyección SQL?*
**[RESPUESTA]**
> "Nunca concateno valores en la consulta. Uso parámetros posicionales (`$1`, `$2`) y el driver `pg` los enruta de forma segura. Está en todas las queries."

**[PROFESOR]** *¿Y las contraseñas?*
**[RESPUESTA]**
> "`bcrypt` con salt automático: se guarda solo el hash. Aunque capturaran la base no podrían obtener la contraseña original."

**[PROFESOR]** *¿Cómo garantizás que un usuario no vea datos de otro? Dalo en la práctica.*
**[RESPUESTA]**
> "Como dije, cada query filtra por `req.user.userId`. Aunque alguien adivinara el UUID de otro usuario, el `WHERE user_id = $1` devolvería cero filas. Es aislamiento a nivel de consulta, no solo de la UI: un request directo a la API tampoco filtra datos ajenos."

### 3.4 Control de errores
**[PROFESOR]** *¿Cómo manejás los errores y los códigos HTTP?*
**[RESPUESTA]**
> "Tengo un middleware centralizado `errorHandler` (`backend/src/middleware/errorHandler.ts:8`) y `notFoundHandler` (:24). Cada controlador responde códigos semánticos: `400`, `401`, `404`, `201`, `200`. Y un middleware `createAuditLog` (`backend/src/middleware/auditLog.ts:4`) registra las operaciones relevantes en `audit_logs`."

**[PROFESOR]** ¿Cómo sabés si un request es tuyo o de otro? ¿Me citarías un controlador con eso en vivo?
**[RESPUESTA]**
> "Por ejemplo, en `getUpcomingPayments` (`backend/src/controllers/calendarController.ts:107`) uso `const userId = req.user.userId` y solo traigo lo de ese usuario. Puedo abrirlo y mostrarles la línea."

---

## ACTO 4 — BASE DE DATOS (5')

**[VOS]**
> "La base es relacional y tiene **ocho tablas**. El modelo es donde está la integridad de los datos, así que lo justifica detalladamente."

| Tabla | Para qué sirve | Claves más relevantes |
|---|---|---|
| `users` | cuenta | `email` unique, password (hash), monthly_budget |
| `categories` | agrupación | `UNIQUE(user_id, name)` ; color, icon |
| `subscriptions` | servicios y ciclo | billing_cycle, next_billing_date, status |
| `debts` | vencimientos | status pending/paid; `UNIQUE(subscription_id, due_date)` |
| `notifications` | avisos | type, is_read |
| `audit_logs` | trazabilidad | action, entity_type, details (JSONB), ip |
| `monthly_budgets` | presupuesto | `UNIQUE(user_id, year, month)`, alert_threshold |
| `password_reset_tokens` | reset | expires_at |

**[PROFESOR]** *¿Cómo se relacionan? ¿Dibujás el modelado?*
**[RESPUESTA]**
> "Un usuario tiene muchas categorías y suscripciones. Cada suscripción tiene sus deudas (una por ciclo) y genera notificaciones. Una deuda apunta a `subscription_id` (o es manual con NULL). `audit_logs` registra acciones de cualquier entidad. Al eliminar un `user`, `ON DELETE CASCADE` borra lo suyo; al eliminar una suscripción, sus deudas quedan con `ON DELETE SET NULL` (se conservan pero desvinculadas). Todo está en `backend/db/schema.sql`."

**[PROFESOR]** *¿Qué constraint te enorgullece y por qué?*
**[RESPUESTA]**
> "El `UNIQUE(subscription_id, due_date)` en `debts` (`backend/db/schema.sql`). Garantiza a **nivel base** que no se genere dos veces la deuda de un mismo ciclo, aunque el job se ejecute dos veces o haya una carrera (race condition). Es una garantía del motor de datos, no de mi código."

**[PROFESOR]** *¿Qué índices creaste y por qué?*
**[RESPUESTA]**
> "Sobre las claves foráneas (`user_id`) y los campos de filtrado y orden frecuentes: `email`, `next_billing_date`, `status`, `is_read`, y `year/month` en presupuestos. Aceleran las consultas más habituales sin coste notable de escritura."

**[PROFESOR]** *¿Cómo inicializás/sembrás la base?*
**[RESPUESTA]**
> "Con un script de `seed` que inserta datos de prueba, y `schema.sql` con el `CREATE TABLE`. Están en `backend/scripts/seed.ts` y `backend/db/`. En producción uso Supabase (Postgres administrado)."

---

## ACTO 5 — LÓGICA DE NEGOCIO (6' — EL CORAZÓN, tu mejor material)

### 5.1 Generación de deudas
**[VOS]**
> "El corazón de Dinerio: las suscripciones generan deudas. Al crear una suscripción, si la fecha de próximo cobro ya pasó, se genera la deuda pendiente."

**[PROFESOR]** *¿Cómo se crean las deudas automáticamente?*
**[RESPUESTA]**
> "Por dos vías. La primera, en el alta de la suscripción, si `next_billing_date` es pasada, la deuda se crea al instante. La segunda, un **job con node-cron** ejecuta `debtGeneratorService` (`backend/src/services/debtGeneratorService.ts:4`) y genera las deudas de los ciclos que van venciendo. Así el sistema no depende de la acción del usuario."

**[PROFESOR]** ¿Y si el generador corre dos veces? ¿Duplico?
**[RESPUESTA]**
> "No: antes de insertar, el servicio consulta si ya existe la deuda con esa `due_date`; y como red de seguridad la base tiene `UNIQUE(subscription_id, due_date)`. Doble capa de protección."

**[PROFESOR]** *¿Qué diferencia hay entre una deuda de suscripción y una manual?*
**[RESPUESTA]**
> "La manual se crea sin `subscription_id` (`NULL`): sirve para un gasto puntual o una deuda externa. La de suscripción se vincula a la suscripción y se genera según su ciclo, con su `due_date`."

### 5.2 Ciclos de facturación
**[VOS]**
> "`BillingCycleService` concentra la matemática del negocio (mensual, trimestral, anual, semanal) en `backend/src/services/BillingCycleService.ts`."

**[PROFESOR]** ¿Cómo calculás el equivalente mensual?
**[RESPUESTA]**
> "`getMonthlyEquivalent` (BillingCycleService.ts:19): anual divide por 12, trimestral por 3, semanal multiplica por 4, mensual queda igual. Se compara un plan anual con uno mensual en pie de igualdad."

**[PROFESOR]** ¿Y cómo sabés cuántas veces se cobra en un rango de meses?
**[RESPUESTA]**
> "`countBillingCyclesInRange` (BillingCycleService.ts:39): recorre desde la fecha de inicio hasta el final del rango sumando de a 3 meses (trimestral), por ejemplo. Si el rango es anterior al alta, devuelve 0. Alimenta la evolución mensual de los reportes."

**[PROFESOR]** ¿Qué casos borde manejás? Dame uno.
**[RESPUESTA]**
> "Fechas de fin de mes: si la suscripción cobra el 31 y el mes tiene 30, `getOccurrenceDateInMonth` (BillingCycleService.ts:79) ajusta al último día (30 o 28 en febrero). Evita que un cobro se pierda o se duplique en meses cortos."

### 5.3 Moneda y conversión
**[VOS]**
> "`exchangeRateService` consulta el tipo de cambio a **Bluelytics** (con respaldo en **DolarAPI**) y lo cache 15 minutos."

**[PROFESOR]** ¿Cómo calculás el monto en pesos que se paga en la tarjeta?
**[RESPUESTA]**
> "En `getExchangeRate` (backend/src/services/exchangeRateService.ts:5) consulto el dólar de referencia y aplico el factor **1.53** (por IVA 21% + PAIS 30% + IIBB ≈ 53%). Multiplico el monto en USD por ese factor y guardo `amount_ars`."

**[PROFESOR]** ¿Por qué cacheás el tipo de cambio?
**[RESPUESTA]**
> "Para no golpear la API externa en cada pedido (menos latencia y respetar límites). 15' es equilibrado porque el tipo de cambio no varía tan seguido."

**[PROFESOR]** ¿Y si la API externa falla?
**[RESPUESTA]**
> "Cadena de fallback: primero Bluylabs, luego DolarAPI, luego valor por defecto, y cacheo el último valor. La app nunca deja de responder."

### 5.4 Calendario
**[VOS]**
> "La vista le muestra al usuario de un vistazo qué le vence."

**[PROFESOR]** *¿Qué datos trae el calendario?*
**[RESPUESTA]**
> "`getCalendarEvents` (backend/src/controllers/calendarController.ts:31) devuelve las suscripciones con su fecha de próximo cobro mapeadas a eventos; el frontend las distribuye por día en el grid."

**[PROFESOR]** *¿Cómo sacaste los paneles "Vencen hoy / en 3 días / en 7 días"?*
**[RESPUESTA]**
> "El hook `useCalendar` (frontend/src/features/calendar/hooks/useCalendar.ts:20) usa `daysUntil` (frontend/src/features/calendar/utils/date.ts:63) para calcular la diferencia a hoy y agruparlos: día 0 → Hoy, 1–3 → en 3 días, 4–7 → en 7. Es lógica pura, cubierta por tests directos."

### 5.5 Presupuesto
**[PROFESOR]** ¿Cómo funciona el presupuesto mensual?
**[RESPUESTA]**
> "`monthly_budgets` guarda por `(user_id, year, month)` un monto y un `alert_threshold` (80% por defecto); `getBudgetForMonth` (backend/src/controllers/budgetController.ts:9) compara el gasto del mes contra el presupuesto y dispara alerta al superar el umbral. La unicidad evita dos presupuestos para el mismo mes."

### 5.6 Reportes
**[PROFESOR]** ¿Qué reportes da el sistema?
**[RESPUESTA]**
> "Tres: resumen financiero del mes (`getFinancialReport`, backend/src/controllers/reportController.ts:154), la evolución mensual por ciclos (`getMonthlyEvolution`, reportController.ts:391) y la exportación a CSV (`exportSubscriptionsCSV`, reportController.ts:37). Además el desglose por categoría. Podemos abrirlos y mostrar dónde se calcula cada total (la lógica requiere datos con categoría para el total)."

**[PROFESOR]** ¿Por qué exportás CSV y no PDF?
**[RESPUESTA]**
> "CSV es abierto, cualquier planilla lo abre y filtra, sin depender de librerías de PDF. Es la necesidad práctica más directa."

### 5.7 Notificaciones y auditoría
**[PROFESOR]** "¿Cómo se generan las notificaciones?"
**[RESPUESTA]**
> "Automatizadamente por eventos relevantes; por ejemplo al registrar un pago se crea una notificación `payment_paid`. `NotificationGeneratorService` (backend/src/services/notificationService.ts:3) y el job `NotificationJob` (backend/src/jobs/notificationJob.ts:3). El frontend muestra el conteo de no leídas en la campana y se marcan individual o todas."

**[PROFESOR]** "¿Qué es la auditoría y para qué sirve?"
**[RESPUESTA]**
> "El middleware `createAuditLog` (backend/src/middleware/auditLog.ts:4) registra cada acción de alto impacto: quién, qué, tipo de entidad, id, detalle en JSON e IP. Responde el "quién hizo qué y cuándo", útil para el usuario y para la auditoría del sistema."

---

## ACTO 6 — FRONTEND (3')

**[VOS]**
> "El frontend está organizado por features: cada módulo reúne página, componentes y hooks."

**[PROFESOR]** "¿Qué features tiene?"
**[RESPUESTA]**
> "Son 12: auth, dashboard, subscriptions, debts, calendar, budget, reports, notifications, categories, profile, audit y la home pública."

**[PROFESOR]** "¿Enrutado y rutas protegidas?"
**[RESPUESTA]**
> "React Router con dos guardas: `PublicRoute` (`frontend/src/app/protectedRoute.tsx:29`, para home/login) y `PrivateRoute` (`protectedRoute.tsx:19`, para el resto; si no hay sesión, redirige). `AuthProvider` (frontend/src/shared/contexts/AuthContext.tsx:12) guarda el token y el usuario; `useAuth` (AuthContext.tsx:106) lo expone a los componentes."

**[PROFESOR]** *¿Cómo mostrás el costo en USD?*
**[RESPUESTA]**
> "Con `formatCurrency` (frontend/src/shared/utils/formatters.ts:7). Para una suscripción en dólares, la tabla muestra el original y el equivalente en pesos con dólar tarjeta (el débito real). `parseAmount` (formatters.ts:1) normaliza y `getBillingCycleLabel` (formatters.ts:29) las etiquetas."

**[PROFESOR]** "¿Dónde están los estilos?"
**[RESPUESTA]**
> "Entre `/src/styles` CSS Modules por módulo y una capa compartida, para página y consistencia. Sin framework de UI."

---

## ACTO 7 — CALIDAD Y TESTS (4')

**[VOS]**
> "Demuestro la calidad con typecheck, ESLint y pruebas automatizadas."

**[PROFESOR]** ¿Qué usás para testear y por qué?
**[RESPUESTA]**
> "Vitest. Testeo **funciones puras** (la lógica sensible) para no necesitar base ni UI: son **16 tests** que corren en segundos. Con `test:watch` se ejecutan al guardar."

**[PROFESOR]** ¿Qué está testeado?
**[RESPUESTA]**
> "Tres grupos: formatos (formatters.ts) y los cálculos del calendario (date.ts:63 + useCalendar.ts) — montos, etiquetas, y agrupaciones 'Hoy / 3 / 7' con límite de rangos y sin solapamiento."

**[PROFESOR]** ¿Por qué esos y no todo?
**[RESPUESTA]**
> "Porque elijo donde. Un error silencioso pesa: dinero y fechas, de máxima impacto en confianza y fáciles de aislar. El resto (consultas y UI) queda cubierto por el typecheck, el build y la demo."

**[PROFESOR]** ¿Qué más verificás?
**[RESPUESTA]**
> "`tsc --noEmit` sin errores, ESLint con 0 warnings, y `npm run build` que compila TS y arma el bundle. Esos 4 pilares — tests, lint, typecheck, build — son mi certificado de calidad."

---

## ACTO 8 — DECISIONES Y PREGUNTAS TRAMPOSAS (4')

**[PROFESOR]** *"¿Por qué no usaste un framework de UI (Material, Bootstrap)?"*
**[RESPUESTA]**
> "Control total estético y consistencia: uso CSS propio en CSS Modules en `/src/styles`. Tailwind está configurado pero lo dejé sin usar a propósito, para no atarme a clases utilitarias ajenas y mantener identidad visual y un CSS menor."

**[PROFESOR]** *"¿Cuál fue la parte más difícil?"*
**[RESPUESTA]**
> "La matemática de los ciclos de facturación — cuántas veces cobra una suscripción trimestral en un rango, con casos de fechas cortas — y la conversión por impuestos. Por eso la concentré en `BillingCycleService` y la cubrí con tests."

**[PROFESOR]** *"¿Qué harías distinto desde el principio?"*
**[RESPUESTA]**
> "Definir los estados de suscripción separados del estado de pago (hoy conviven en un campo y los fui ordenando) y usar migraciones versionadas desde el inicio en lugar de editar `schema.sql` a mano."

**[PROFESOR]** *"¿Qué limitaciones conocidas tenés?"*
**[RESPUESTA]**
> "Tres, honestas: (1) el estado `cancelled` lo usa la suscripción al pagar, mezclando 'dada de baja' con 'pagada' (lo separaría). (2) el ciclo semanal está simplificado a un evento por mes, no las 4 ocurrencias semanales. (3) no hay paginación en listas grandes."

**[PROFESOR]** *"¿Cómo la escalaría?"*
**[RESPUESTA]**
> "La lógica está aislada en servicios, así que crecer es un tema de infraestructura y optimización (índices, cache del tipo de cambio, un worker aparte para el job), no de rediseñar la lógica."

**[PROFESOR]** *"¿Es tu proyecto y podés defender el 100%?"*
**[RESPUESTA]**
> "Sí: explico cada módulo, servicio y tabla, y lo dejo documentado en la doc técnica, este checklist y un repo con historial limpio. Y la parte que les mostraré en vivo hoy corre en Render + Vercel + Supabase, no en la máquina."

---

## GLOSARIO DE REFERENCIAS DE CÓDIGO (para consultar rápido el día de la defensa)

| Identificador | Dónde está (archivo:línea) |
|---|---|
| `authenticate` (middleware JWT) | `backend/src/middleware/auth.ts:5` |
| `req.user = { ... }` (asignación) | `backend/src/middleware/auth.ts:20` |
| `jwt.verify(token, ...)` | `backend/src/middleware/auth.ts:19` |
| `JWTPayload` / `userId` | `backend/src/types/index.ts:74` y `:75` |
| `AuthRequest.user?` | `backend/src/types/index.ts:83` |
| `jwt.sign({ userId, ... })` | `backend/src/controllers/authController.ts:15` |
| `bcrypt.hash` | `backend/src/controllers/authController.ts:37` |
| `bcrypt.compare` | `backend/src/controllers/authController.ts:105` |
| `errorHandler` | `backend/src/middleware/errorHandler.ts:8` |
| `notFoundHandler` | `backend/src/middleware/errorHandler.ts:24` |
| `createAuditLog` | `backend/src/middleware/auditLog.ts:4` |
| `getWeeklyEquivalent` | `backend/src/services/BillingCycleService.ts:19` |
| `countBillingCyclesInRange` | `backend/src/services/BillingCycleService.ts:39` |
| `getOccurrenceDateInMonth` | `backend/src/services/BillingCycleService.ts:79` |
| `getExchangeRate` | `backend/src/services/exchangeRateService.ts:5` |
| `DebtGeneratorService` | `backend/src/services/debtGeneratorService.ts:4` |
| `NotificationJob` | `backend/src/jobs/notificationJob.ts:3` |
| `NotificationGeneratorService` | `backend/src/services/notificationService.ts:3` |
| `getCalendarEvents` | `backend/src/controllers/calendarController.ts:31` |
| `getUpcomingPayments` | `backend/src/controllers/calendarController.ts:107` |
| `paySubscription` | `backend/src/controllers/subscriptionController.ts:475` |
| `markDebtAsPaid` | `backend/src/controllers/debtController.ts:121` |
| `getFinancialReport` | `backend/src/controllers/reportController.ts:154` |
| `getMonthlyEvolution` | `backend/src/controllers/reportController.ts:391` |
| `exportSubscriptionsCSV` | `backend/src/controllers/reportController.ts:37` |
| `getBudgetForMonth` | `backend/src/controllers/budgetController.ts:9` |
| `useCalendar` (hook) | `frontend/src/features/calendar/hooks/useCalendar.ts:20` |
| `daysUntil` | `frontend/src/features/calendar/utils/date.ts:63` |
| `formatCurrency` | `frontend/src/shared/utils/formatters.ts:7` |
| `parseAmount` | `frontend/src/shared/utils/formatters.ts:1` |
| `getBillingCycleLabel` | `frontend/src/shared/utils/formatters.ts:29` |
| `PrivateRoute` / `PublicRoute` | `frontend/src/app/protectedRoute.tsx:19` y `:29` |
| `AuthProvider` / `useAuth` | `frontend/src/shared/contexts/AuthContext.tsx:12` y `:106` |
| Constraint `UNIQUE(subscription_id, due_date)` | `backend/db/schema.sql` |

---

## DEMO GUION (la mostrás EN VIVO en Render + Vercel; VS Code solo si preguntan por código)

> **Regla:** la demo corre sobre la web publicada — abrí la app de **Vercel** (frontend) que consume la API de **Render** (backend) y la base de **Supabase** (Postgres). No levantes localhost salvo que el deploy esté caído. **VS Code** se abre únicamente cuando el tribunal pregunta por implementación (usá el glosario de código y el salto a `archivo:línea`).

> Mientras hablas, mostrás en orden, sin salirte:

1. **Login** en la URL publicada con un usuario de prueba → queda la sesión en el sidebar.
2. **Dashboard**: KPIs (total mensual, suscripciones, presupuesto).
3. **Suscripciones**: tabla; **crear una en USD** y mostrar el equivalente en ARS (dólar tarjeta).
4. **Calendario**: vencimientos del mes y paneles "Hoy / 3 / 7".
5. **Deudas**: resumen y **pagar** (elegir método) → historial actualizado.
6. **Presupuesto**: uso del mes + alerta al superar umbral.
7. **Reportes**: resumen + por categoría + **exportar CSV**.
8. **Notificaciones**: contador en la campanita, marcar leídas.
9. **Auditoría** (opcional): trazabilidad.
10. **Cierre técnico**: abrir **VS Code** y mostrar `npm test`, o en su defecto un panel del deploy (Render/Vercel) con los logs. Si el profesor pregunta funcionamiento, explicá sobre la web abierta.

> **Si no andan los datos de producción:** tenés Plan B — levantar backend (`npm run dev`) y frontend (`npm run dev`) en local con datos sembrados, sin apartarte del guion.

---

## COMANDOS DE VERIFICACIÓN (día anterior)

```powershell
# Backend
cd "C:\Users\Guille y Vane\Documents\Dinerio\Proyecto-Final-Dinerio\Proyecto-Final-Dinerio\backend"
npm run typecheck
npm run lint

# Frontend
cd "C:\Users\Guille y Vane\Documents\Dinerio\Proyecto-Final-Dinerio\Proyecto-Final-Dinerio\frontend"
npm run build
npm test
npm run lint
```

**Verificar el deploy en vivo (IMPORTANTE, es lo que se muestra):**
- **En Render (backend/API):** que el servicio esté "Live" y contesten los endpoints.
- **En Vercel (frontend):** que el build use `VITE_API_URL` = **URL de Render** (no `localhost`). Si `frontend/.env` apunta a localhost, la web publicada no va a cargar datos. Este valor se configura en el panel de Vercel → Settings → Environment Variables (con un redeploy).
- **En Supabase:** que la tabla `users` tenga el usuario de prueba y los datos sembrados.

```powershell
# Alternativa local para ensayar / Plan B (si las nubes fallan)
cd "C:\...\backend"; npm run dev     # API → http://localhost:3000
cd "C:\...\frontend"; npm run dev    # app → http://localhost:5173
```

---

## ERRORES A NO COMETER

- **No inventes números** ("48 endpoints, 8 tablas, 16 tests" — memorizalos).
- **No afirmes librerías que no tenés**: no hay nodemailer ni recharts ni date-fns; los gráficos son SVG propios.
- **No afirmes fecha rarusa** (no se usa date-fns para fechas: lo calculás vos).
- **No digas "anduvo" si no anduvo**: si la demo falla, "en producción está corriendo, lo verifico con el panel de Render/Vercel".
- **No olvides que la demo es en la nube**: la mostrás en Render + Vercel, y **VS Code solo cuando pregunten código** (usá el glosario). No hostees localhost delante del tribunal.
- **No presentes la web rota por `VITE_API_URL`**: antes del examen verificá que el frontend publicado apunte a la API de Render (ver comandos).
- **No olvides el glosario de código**: si te señalan `req.user`, abrí `auth.ts:20` y mostralo.
- **No digas "testing de todo"**: solo funciones puras de dinero/fechas; el resto lo cubre typecheck/build/demo.
- Plan B: si caen Render/Vercel, levantar en local con datos sembrados y seguir el mismo guion.