# Orion — Gestor Personal de Dimensiones

## Visión General

**Orion** es una aplicación web personal para gestionar distintos aspectos de la vida cotidiana, organizada en torno al concepto de **Dimensiones**.

Cada dimensión representa un ámbito de gestión independiente (una persona, un negocio, un vehículo...) con sus propias cuentas, tarjetas, trámites, proveedores y gestiones.

---

## El Concepto: Dimensiones

Una **Dimensión** es una unidad de gestión autónoma. Cada dimensión tiene su propio contexto y sus propios datos.

### Dimensiones iniciales previstas

| ID | Nombre | Descripción |
|----|--------|-------------|
| `pedro` | Pedro (personal) | Finanzas y gestiones personales del titular |
| `esposa` | Esposa | Gestiones de la pareja |
| `madre` | Madre | Gestiones de la madre |
| `hijo` | Hijo | Gestiones del hijo |
| `taxi` | Taxi | Gestión del negocio de taxi |
| `empresa` | Empresa | Gestiones de la empresa |

Las dimensiones son dinámicas: se pueden crear, editar y eliminar desde la aplicación.

---

## Secciones por Dimensión

Cada dimensión contiene las siguientes secciones:

### 🏦 Cuentas Bancarias
- Listado de cuentas (banco, IBAN, saldo, titular)
- Movimientos manuales
- Notas y alertas

### 💳 Tarjetas
- Tarjetas de crédito y débito
- Fecha de vencimiento, límite, saldo
- Avisos de renovación

### 📋 Cuestiones Burocráticas
- DNI, pasaportes, permisos
- Fechas de caducidad
- Documentos a renovar

### 🏛️ Cuestiones Administrativas
- Trámites con organismos públicos (Hacienda, Seguridad Social, Ayuntamiento...)
- Estado de cada trámite
- Fechas límite

### 📅 Gestiones Diarias
- Tareas pendientes
- Recordatorios
- Notas rápidas

### 🤝 Proveedores
- Listado de proveedores y contratos
- Servicios contratados (luz, gas, internet, seguros...)
- Datos de contacto, coste mensual, fecha de renovación

---

## Stack Tecnológico

### Frontend
- **Angular 17+** (standalone components)
- **Tailwind CSS** (dark theme por defecto)
- Routing por dimensión y sección

### Backend
- **Node.js + NestJS**
- API REST
- **Almacenamiento en disco (JSON)** — sin base de datos en esta fase
- Estructura de archivos: `data/{dimensionId}/{section}.json`

### Infraestructura
- **Firebase Hosting** — frontend Angular
- **Firebase App Hosting** — backend NestJS (Cloud Run)
- **GitHub** — control de versiones

---

## Estructura del Repositorio

```
orion/
├── frontend/               # Angular + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── dimension/
│   │   │   │   │   ├── bank-accounts/
│   │   │   │   │   ├── cards/
│   │   │   │   │   ├── bureaucracy/
│   │   │   │   │   ├── admin-matters/
│   │   │   │   │   ├── daily/
│   │   │   │   │   └── providers/
│   │   │   │   └── settings/
│   │   │   └── core/
│   ├── firebase.json
│   └── apphosting.yaml
├── backend/                # NestJS
│   ├── src/
│   │   ├── dimensions/
│   │   ├── bank-accounts/
│   │   ├── cards/
│   │   ├── bureaucracy/
│   │   ├── admin-matters/
│   │   ├── daily/
│   │   ├── providers/
│   │   └── storage/        # JSON file storage service
│   ├── data/               # JSON data files (gitignored)
│   └── apphosting.yaml
├── PROJECT.md
└── README.md
```

---

## Modelo de Datos Base

### Dimensión
```json
{
  "id": "pedro",
  "name": "Pedro (personal)",
  "icon": "👤",
  "color": "#6366f1",
  "createdAt": "2026-05-30"
}
```

### Cuenta Bancaria
```json
{
  "id": "uuid",
  "dimensionId": "pedro",
  "bank": "Santander",
  "iban": "ES00 0000 0000 0000 0000 0000",
  "alias": "Cuenta nómina",
  "balance": 2500.00,
  "currency": "EUR",
  "notes": "",
  "updatedAt": "2026-05-30"
}
```

### Tarjeta
```json
{
  "id": "uuid",
  "dimensionId": "pedro",
  "bank": "BBVA",
  "type": "credit",
  "alias": "Visa Oro",
  "last4": "4321",
  "expiryDate": "2027-09",
  "limit": 5000,
  "currentBalance": 350,
  "currency": "EUR"
}
```

### Proveedor
```json
{
  "id": "uuid",
  "dimensionId": "pedro",
  "name": "Iberdrola",
  "category": "electricity",
  "contractNumber": "123456",
  "monthlyCost": 85.50,
  "renewalDate": "2027-01-01",
  "contact": "+34 900 000 000",
  "notes": ""
}
```

---

## Roadmap

## Firebase
- **Project ID:** `orion-pedro`
- **Hosting URL:** https://orion-pedro.web.app
- **SA credentials:** pendientes (necesarias para deploy)

---

### Fase 1 (actual) — Base
- [x] Proyecto Angular + NestJS
- [x] CRUD de dimensiones
- [x] CRUD de secciones (cuentas, tarjetas, proveedores...)
- [x] Almacenamiento en JSON
- [x] Deploy en Firebase

### Fase 2 — Web Scrapers
- [ ] Scraper de saldos bancarios
- [ ] Scraper de facturas de proveedores
- [ ] Alertas automáticas de caducidad

### Fase 3 — Inteligencia
- [ ] Dashboard con resumen financiero global
- [ ] Alertas y recordatorios automáticos
- [ ] Exportación a PDF/Excel

---

## Convenciones de Desarrollo

- Commits: `feat:`, `fix:`, `chore:` + descripción
- Versión: `v0.x.x` (nunca cambiar el primer dígito)
- Deploy obligatorio tras cada feature
