📊 Dinerio - Gestión Inteligente de Suscripciones

Dinerio es una aplicación web moderna y completa para la gestión de suscripciones recurrentes. Diseñada para ayudar a usuarios a controlar sus gastos mensuales, visualizar estadísticas financieras detalladas con gráficos interactivos, establecer presupuestos personalizados y recibir alertas inteligentes de próximos pagos.
🚀 Características Principales
📈 Dashboard Inteligente

Resumen Financiero: Visualización clara de gastos mensuales y anuales
Gráficos Interactivos:

Gráfico de barras para gastos por categoría
Gráfico circular para distribución porcentual
Gráfico de líneas para proyección de gastos


Métricas Clave: Suscripciones activas, próximos pagos, presupuesto restante
Alertas Visuales: Notificaciones de presupuesto excedido

💰 Gestión Completa de Suscripciones

Agregar Suscripciones: Formulario intuitivo con todos los campos necesarios
Categorización: Organización por categorías (Streaming, Software, Fitness, etc.)
Ciclos de Facturación: Soporte para mensual, trimestral, anual y semanal
Estados: Activo, cancelado, pausado
Edición en Tiempo Real: Modificar suscripciones sin recargar la página

🎯 Sistema de Presupuestos

Presupuesto Mensual: Establecer límites de gasto personalizados
Umbrales de Alerta: Configurar notificaciones al alcanzar porcentajes específicos
Seguimiento en Tiempo Real: Monitoreo continuo del gasto vs presupuesto
Alertas Proactivas: Notificaciones antes de exceder el presupuesto

🔔 Notificaciones Inteligentes

Recordatorios de Pago: Alertas antes del vencimiento
Alertas de Presupuesto: Notificaciones cuando se acerca al límite
Centro de Notificaciones: Historial completo de todas las alertas
Marcado como Leído: Gestión fácil de notificaciones

📱 Experiencia de Usuario

Diseño Responsive: Funciona perfecto en desktop, tablet y móvil
Interfaz Moderna: Tema oscuro profesional con gradientes elegantes
Navegación Intuitiva: Sidebar con acceso rápido a todas las secciones
Carga Rápida: Optimizado para máximo rendimiento

🛠️ Tecnologías Utilizadas
Frontend

React 18 - Biblioteca de interfaz de usuario
TypeScript - Tipado estático para mayor confiabilidad
Vite - Build tool y dev server ultrarrápido
Tailwind CSS - Framework de estilos utility-first
Recharts - Biblioteca de gráficos interactivos
React Router - Enrutamiento para SPA
Axios - Cliente HTTP para APIs

Backend

Node.js - Entorno de ejecución JavaScript
Express.js - Framework web para APIs
TypeScript - Desarrollo backend tipado
PostgreSQL - Base de datos relacional
JWT - Autenticación con tokens
bcrypt - Encriptación de contraseñas
CORS - Configuración de políticas de origen cruzado

Base de Datos

PostgreSQL 14+ - Sistema de base de datos relacional
Estructura Normalizada: Diseño optimizado para consultas eficientes
Índices Estratégicos: Optimización de rendimiento
Relaciones Foreign Key: Integridad referencial garantizada

📦 Instalación y Configuración
Prerrequisitos

Node.js 18 o superior
PostgreSQL 14 o superior
npm o yarn

Pasos de Instalación

Clonar el Repositorio

Descargar el proyecto desde GitHub


Configurar Base de Datos

Crear base de datos con nombre subtrack_db
Ejecutar el archivo backend/db/schema.sql en PostgreSQL


Configurar Backend

Navegar a la carpeta backend
Instalar dependencias con npm
Crear archivo .env con la siguiente configuración:



envDB_HOST=localhost
DB_PORT=5432
DB_NAME=subtrack_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_jwt_secreto_muy_seguro
PORT=3000
(fijatse en .env)

Configurar Frontend

Navegar a la carpeta frontend
Instalar dependencias con npm


Ejecutar la Aplicación

Iniciar el backend: navegar a backend y ejecutar npm run dev
Iniciar el frontend: navegar a frontend y ejecutar npm run dev


Acceder a la Aplicación

Frontend: http://localhost:5173
Backend API: http://localhost:3000



🗃️ Estructura del Proyecto
Dinerio/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de DB y JWT
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Auth, CORS, error handling
│   │   ├── routes/          # Definición de endpoints API
│   │   ├── services/        # Servicios de negocio
│   │   └── types/           # Tipos TypeScript
│   ├── db/
│   │   ├── schema.sql       # Estructura de base de datos
│   │   └── seedData.sql     # Datos de prueba
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React reutilizables
│   │   │   ├── auth/        # Formularios de login/registro
│   │   │   ├── dashboard/   # Componentes del dashboard
│   │   │   ├── subscriptions/ # Gestión de suscripciones
│   │   │   └── ui/          # Componentes base (Button, Input, etc.)
│   │   ├── contexts/        # React Context (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Clientes API
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilidades y formateadores
│   └── package.json
└── README.md
🎯 Uso de la Aplicación
Primeros Pasos

Registro de Usuario

Acceder a http://localhost:5173/register
Completar formulario con nombre, apellido, email y contraseña
El sistema redirige automáticamente al login


Inicio de Sesión

Usar las credenciales creadas
Acceso al dashboard principal


Configurar Presupuesto

Hacer clic en "Establecer Presupuesto" en el dashboard
Definir monto mensual y umbral de alerta (recomendado 80%)
Guardar configuración


Agregar Primera Suscripción

Clic en "+ Nueva Suscripción"
Completar: nombre, monto, ciclo de facturación, categoría, próxima fecha de pago
La suscripción aparece inmediatamente en el dashboard



Dashboard Principal
El dashboard muestra:
Tarjetas de Resumen:

Suscripciones Activas
Gasto Mensual Total
Gasto Anual Proyectado
Próximos Pagos (7 días)

Gráficos Interactivos:

Barras: Gastos mensuales por categoría
Circular: Distribución porcentual de gastos
Líneas: Proyección de gastos futuros

Lista de Suscripciones Recientes: Últimas suscripciones agregadas
Gestión de Suscripciones

Ver Todas: Lista completa con opciones de filtrado
Agregar Nueva: Modal con formulario completo
Editar: Clic en suscripción para modificar
Cancelar: Cambiar estado a "cancelado"
Filtrar: Por categoría, estado o ciclo de facturación

Sistema de Notificaciones

Acceso: Icono de campana en el header
Tipos:

Recordatorios de pago (3 días antes)
Alertas de presupuesto (al alcanzar 80% y 100%)
Confirmaciones de acciones


Gestión: Marcar como leídas individualmente o todas juntas

🔌 API Endpoints
Autenticación

POST /api/auth/register - Registrar nuevo usuario
POST /api/auth/login - Iniciar sesión
GET /api/users/profile - Obtener perfil de usuario

Suscripciones

GET /api/subscriptions - Listar suscripciones del usuario
POST /api/subscriptions - Crear nueva suscripción
PUT /api/subscriptions/:id - Actualizar suscripción
DELETE /api/subscriptions/:id - Eliminar suscripción

Presupuesto

POST /api/users/budget - Establecer/actualizar presupuesto
GET /api/users/dashboard - Obtener datos del dashboard

Notificaciones

GET /api/notifications - Obtener notificaciones del usuario
PUT /api/notifications/:id/read - Marcar como leída
PUT /api/notifications/read-all - Marcar todas como leídas

Categorías

GET /api/categories - Obtener categorías disponibles

🗄️ Modelo de Base de Datos
Tablas Principales
users
sqlid UUID PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
first_name VARCHAR(100) NOT NULL
last_name VARCHAR(100) NOT NULL
monthly_budget DECIMAL(10,2) DEFAULT 0
currency VARCHAR(3) DEFAULT 'USD'
notifications_enabled BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
subscriptions
sqlid UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
name VARCHAR(200) NOT NULL
amount DECIMAL(10,2) NOT NULL
currency VARCHAR(3) DEFAULT 'USD'
billing_cycle VARCHAR(20) NOT NULL
next_billing_date DATE NOT NULL
category_id UUID REFERENCES categories(id)
status VARCHAR(20) DEFAULT 'active'
description TEXT
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
categories
sqlid UUID PRIMARY KEY
name VARCHAR(100) NOT NULL
color VARCHAR(7) NOT NULL
icon VARCHAR(50)
user_id UUID REFERENCES users(id)
created_at TIMESTAMP DEFAULT NOW()
notifications
sqlid UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
subscription_id UUID REFERENCES subscriptions(id)
type VARCHAR(50) NOT NULL
title VARCHAR(200) NOT NULL
message TEXT NOT NULL
is_read BOOLEAN DEFAULT false
created_at TIMESTAMP DEFAULT NOW()
🚀 Despliegue en Producción
Backend (Render/Railway)

Conectar repositorio GitHub
Configurar variables de entorno
Especificar comando de build: npm run build
Comando de inicio: npm start

Frontend

Conectar repositorio GitHub
Configurar build command: npm run build
Output directory: dist
Variables de entorno: VITE_API_URL=https://tu-backend.render.com

Base de Datos (PostgreSQL)

Crear proyecto
Ejecutar schema.sql
Obtener connection string
Configurar en variables de entorno del backend

🔧 Troubleshooting
Problemas Comunes
Error de Conexión a Base de Datos

Verificar que PostgreSQL esté corriendo
Verificar credenciales en archivo .env
Confirmar que la base de datos subtrack_db exista

Error CORS

Verificar que las URLs estén en la configuración CORS del backend
Asegurar que frontend y backend usen los puertos correctos

Token JWT Inválido

Cerrar sesión y volver a iniciar
Verificar que JWT_SECRET esté configurado en .env

Gráficos no se Renderizan

Verificar que haya datos de suscripciones
Revisar consola del navegador para errores

🤝 Contribución
Las contribuciones son bienvenidas. Por favor:

Fork el proyecto
Crear una rama para tu feature
Commit tus cambios
Push a la rama
Abrir un Pull Request

Guías de Estilo

Usar TypeScript estricto
Seguir convenciones de commits convencionales
Mantener cobertura de tests
Documentar nuevas funcionalidades

📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.
🆘 Soporte
Si encuentras algún problema:

Revisar la sección de Troubleshooting
Buscar en issues existentes en GitHub
Crear un nuevo issue con:

Descripción detallada del problema
Pasos para reproducir
Logs de error relevantes
Entorno (SO, navegador, versión)



🎯 Roadmap Futuro
v1.1 (Inmediato)

Exportación de reportes en PDF/CSV
Recordatorios por email
Modo claro/oscuro

v1.2 (Corto Plazo)

Soporte para múltiples monedas
Conversión automática de divisas
Categorías personalizadas por usuario

v2.0 (Mediano Plazo)

Aplicación móvil (React Native)
Integración con APIs bancarias
Análisis predictivo de gastos
Planificación financiera avanzada

Características en Consideración

Compartir suscripciones entre usuarios familiares
Plantillas de suscripciones comunes
Integración con calendarios (Google Calendar, Outlook)
Alertas por SMS
Análisis de tendencias de gastos

👥 Créditos
Desarrollado con ❤️ usando:

React
TypeScript
Node.js
PostgreSQL
Tailwind CSS


⭐ Si te gusta este proyecto, no olvides darle una estrella en GitHub
