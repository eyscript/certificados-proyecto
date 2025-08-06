from fastapi import (
    APIRouter, Depends, HTTPException,
    Path, Body, File, UploadFile, Form
)
from datetime import datetime
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from io import BytesIO
import os
from reportlab.pdfgen import canvas

from app.database import get_db
from app.models.certificate import Certificate
from app.models.certificate_status import CertificateStatus
from app.models.user import RoleEnum
from app.routes.auth import get_current_user
from app.schemas.certificate import (
    CertificateOut, CertificateStatusOut,
    CertificateUpdate
)
from datetime import date
import re

router = APIRouter(prefix="/certificates", tags=["certificates"])
# 1) Nuevo endpoint: devuelve UNA sola solicitud del usuario
@router.get("/mine", response_model=CertificateOut, tags=["certificates"])
def get_my_certificate(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    cert = (
        db.query(Certificate)
          .filter(Certificate.user_id == current_user.id)
          .order_by(Certificate.id.desc())
          .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="No tienes ninguna solicitud.")
    return cert

@router.get("/", response_model=List[CertificateOut])
def list_certificates_for_user(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Trae sólo las solicitudes de este usuario
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    return certs

# —————— Devuelve todos los estados disponibles ——————
@router.get("/statuses", response_model=List[CertificateStatusOut])
def get_all_statuses(
    db: Session = Depends(get_db)
):
    return db.query(CertificateStatus).order_by(CertificateStatus.id).all()

@router.post("/upload", response_model=CertificateOut)
async def create_certificate_with_file(

    full_name: str = Form(...),
    birth_date: date = Form(...),        # ahora FastAPI parsea y valida
    id_number: str = Form(...),
    address: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    import re
    if not re.fullmatch("\\d{6,12}", id_number):
        raise HTTPException(400, "Número de documento inválido (6-12 dígitos)")

    # Nombre completo: longitud razonable
    if len(full_name) < 3 or len(full_name) > 50:
        raise HTTPException(400, "Nombre debe tener entre 3 y 50 caracteres")

    # Dirección: longitud razonable
    if len(address) < 5 or len(address) > 200:
        raise HTTPException(400, "Dirección debe tener entre 5 y 200 caracteres")

    # Archivo: tipo permitido y tamaño máximo 2 MB
    ALLOWED = {"application/pdf", "image/jpeg", "image/png"}
    content = await file.read()
    if file.content_type not in ALLOWED:
        raise HTTPException(400, "Tipo de archivo no soportado")
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(413, "Archivo demasiado grande (límite 2 MB)")
    # ¡Muy importante! Volvemos al inicio del buffer antes de escribirlo en disco
    file.file.seek(0)
    # Crea uploads/ si no existe
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        f.write(file.file.read())

    # Crea el objeto Certificate
    cert = Certificate(
        title=full_name,
        description=document_type,
        user_id=current_user.id,
        filename=file.filename,
        # Guarda los nuevos campos en columnas dedicadas
        birth_date=birth_date,
        id_number=id_number,
        address=address,
        status_id=1
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cert = db.query(Certificate).get(certificate_id)
    if not cert:
        raise HTTPException(404, "Certificado no encontrado")
    if current_user.role != RoleEnum.ADMIN and cert.user_id != current_user.id:
        raise HTTPException(403, "No autorizado")
    if cert.status_id != 3:  # Solo si está 'Emitido'
        raise HTTPException(400, "Certificado no emitido aún")

    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, "Certificado Oficial")
    p.setFont("Helvetica", 12)
    p.drawString(100, 720, f"Nombre: {cert.title}")
    p.drawString(100, 700, f"Documento: {cert.id_number}")
    p.drawString(100, 680, f"Dirección: {cert.address}")
    p.drawString(100, 660, f"Estado: {cert.status.name}")
    fecha_emision = datetime.utcnow().strftime("%Y-%m-%d")
    p.drawString(100, 600, f"Fecha de emisión: {fecha_emision}")
    p.showPage()
    p.save()

    buffer.seek(0)
    filename = f"certificado_{cert.id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# —————— 1) Listar todas las solicitudes (ADMIN) ——————
@router.get("/all", response_model=List[CertificateOut], tags=["certificates"])
def list_all_certificates(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(403, "No autorizado")
    return db.query(Certificate).all()


# —————— 2) Detalles de una solicitud (ADMIN) ——————
@router.get("/{certificate_id}", response_model=CertificateOut, tags=["certificates"])
def get_certificate(
    certificate_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(403, "No autorizado")
    cert = db.query(Certificate).get(certificate_id)
    if not cert:
        raise HTTPException(404, "No existe esa solicitud")
    return cert


# —————— 3) Actualizar estado (ADMIN) ——————
@router.patch("/{certificate_id}", response_model=CertificateOut, tags=["certificates"])
def update_certificate(
    certificate_id: int = Path(..., gt=0),
    data: CertificateUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(403, "No autorizado")
    cert = db.query(Certificate).get(certificate_id)
    if not cert:
        raise HTTPException(404, "No existe esa solicitud")
    # Sólo status_id puede venir en data
    if data.status_id is not None:
        cert.status_id = data.status_id
    db.commit()
    db.refresh(cert)
    return cert