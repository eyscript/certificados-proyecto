# Certificados App

Este proyecto es una aplicación full‑stack que permite a usuarios autenticados solicitar certificados y administradores gestionarlos.

## 📦 Estructura

```
├── backend/               # Servidor FastAPI  
│   ├── app/  
│   │   ├── auth/          # Lógica de JWT, dependencias  
│   │   ├── database.py    # Conexión y get_db()  
│   │   ├── models/        # SQLAlchemy ORM  
│   │   ├── routes/        # FastAPI routers  
│   │   ├── schemas/       # Pydantic schemas  
│   │   └── main.py        # Punto de entrada  
│   ├── env/               # Virtualenv (no versionar)  
│   └── .env               # Variables de entorno  
└── frontend/              # Cliente React (Vite)  
    ├── public/  
    ├── src/  
    │   ├── api/           # Llamadas a la API  
    │   ├── auth/          # Contexto de autenticación  
    │   ├── assets/        # Imágenes / SVGs  
    │   ├── pages/         # Vistas (Login, Register, Dashboard…)  
    │   └── App.jsx  
    ├── index.html  
    └── package.json
```


## Características

- **Backend**: FastAPI con SQLAlchemy y Pydantic.
- **Frontend**: React (Vite o Create React App) con React Router.
- **Autenticación**: JWT con rutas protegidas.
- Gestión de estados de solicitud (pendiente, emitido).
- Subida de archivos (PDF/JPG) y descarga de certificados en PDF.

## Requisitos previos

- **Node.js** v14+ y npm o Yarn.
- **Python** 3.9+.
- **Base de datos** PostgreSQL

---

# Instalación

## Clonar el repositorio
```bash
git clone https://github.com/eyscript/certificados-proyecto.git
cd certificados-proyecto
```
### 2. Configurar y ejecutar el backend

```bash
#  Crear y activar entorno virtual
python -m venv venv
# macOS/Linux
t source venv/bin/activate
# Windows
.\env\Scripts\activate

# Instalar dependencias Python
pip install -r requirements.txt

# Variables de entorno
cp .env.example .env
# Editar .env con los valores de conexión:
# DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
SECRET_KEY=certificados-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Si usas Postgres:
DATABASE_URL=postgresql://usuario:pass@localhost:5432/tu_bd

#Crea las tablas y arranca el servidor:

uvicorn app.main:app --reload
#Levantar servidor FastAPI
uvicorn app.main:app --reload
```
El backend correrá en `http://localhost:8000`.

### 3. Configurar y ejecutar el frontend

```bash
cd src
npm install      # o yarn install

# Variables de entorno
cp .env.example .env
# Editar .env con:
# VITE_API_URL=http://localhost:8000/certificates

# Ejecutar servidor de desarrollo
npm run dev      # Vite

```

El frontend correrá en `http://localhost:3000`.

---
## Uso básico

1. Registrar un nuevo usuario o iniciar sesión.
2. En Dashboard, hacer clic en “Solicitar Certificado”.
3. Completar el formulario y subir un PDF/JPG.
4. Ver el estado en “Mis Certificados” y, si está emitido, descargarlo.

---

## Scripts disponibles

### Backend

- `uvicorn app.main:app --reload`: servidor con recarga.

### Frontend

- `npm run dev` o `npm start`: servidor de desarrollo.

---
## 📑 Creación de tablas y datos iniciales

> ⚠️ **Solo necesitas crear las tablas manualmente si decides no usar los modelos SQLAlchemy para generarlas automáticamente.**  
> Las definiciones a continuación reflejan la estructura actual de los modelos en `/app/models`.

```sql
-- 1) Crear tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  hashed_password VARCHAR NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'USER'
);

-- 2) Crear tabla de estados de certificado
CREATE TABLE certificate_statuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- 3) Crear tabla de certificados
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(200),
  user_id INTEGER NOT NULL REFERENCES users(id),
  birth_date VARCHAR NOT NULL,
  id_number VARCHAR(20) NOT NULL,
  address VARCHAR(200) NOT NULL,
  filename VARCHAR(200),
  status_id INTEGER NOT NULL REFERENCES certificate_statuses(id) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

> 🧩 **Obligatorio**  
> Antes de probar el sistema, debes poblar la tabla `certificate_statuses` con los estados iniciales.  
> De lo contrario, se producirán errores al crear certificados.

```sql
-- Insertar estados iniciales
INSERT INTO certificate_statuses (name) VALUES
  ('Recibido'),
  ('En Validacion'),
  ('Emitido'),
  ('Rechazado'),
  ('Pedir Correccion');
