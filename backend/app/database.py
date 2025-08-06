import os
from sqlalchemy import create_engine
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import Session
# Carga las variables del archivo .env en las variables de entorno del sistema
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://certificados_user:Password123@localhost:5432/certificados_db")
#DATABASE_URL =  "postgresql://certificados_user:Password123@localhost:5432/certificados_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()



def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
