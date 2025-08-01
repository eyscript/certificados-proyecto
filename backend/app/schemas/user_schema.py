from pydantic import BaseModel, EmailStr
from enum import Enum

class RoleEnum(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.USER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: RoleEnum

    class Config:
        orm_mode = True
