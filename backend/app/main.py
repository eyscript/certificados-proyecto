from fastapi import FastAPI
from app.routes import auth
from app.models.user import User
from app.database import Base, engine

app = FastAPI()

# Crear tablas
Base.metadata.create_all(bind=engine)

# Incluir rutas
app.include_router(auth.router)
