from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=True)
    birth_date = Column(String, nullable=False)
    id_number = Column(String, nullable=False)
    address = Column(String, nullable=False)

    # Relación con la tabla de estados
    status_id = Column(Integer, ForeignKey("certificate_statuses.id"), nullable=False, default=1)
    status = relationship("CertificateStatus", lazy="joined")

    user = relationship("User", back_populates="certificates")