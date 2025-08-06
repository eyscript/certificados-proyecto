from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routes import auth, certificates
from app.database import Base, engine
from app.models import user, certificate, certificate_status

app = FastAPI()

# 1) CORS middleware al principio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # en dev: *, luego restringe front
    allow_credentials=True,
    allow_methods=["*"],            # incluye OPTIONS, GET, POST, etc.
    allow_headers=["*"],            # incluye Authorization, Content-Type…
)

# 2) Tablas y estáticos
Base.metadata.create_all(bind=engine)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 3) Rutas
app.include_router(auth.router)
app.include_router(certificates.router)
