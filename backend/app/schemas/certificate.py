from pydantic import BaseModel, Field
from typing import List, Optional


from app.schemas.user_schema import UserOut

from app.models.certificate_status import CertificateStatus as StatusModel

class CertificateStatusOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class CertificateCreate(BaseModel):
    full_name: str
    document_type: str
    birth_date: str
    id_number: str
    address: str

class CertificateOut(BaseModel):
    id: int
    full_name: str     = Field(..., alias="title")
    document_type: str = Field(..., alias="description")
    filename: str
    birth_date: str
    id_number: str
    address: str

    status_id: int
    status: CertificateStatusOut

    user: UserOut   # usuario anidado

    class Config:
        orm_mode = True
        allow_population_by_field_name = True

class CertificateUpdate(BaseModel):
    status_id: Optional[int]  
