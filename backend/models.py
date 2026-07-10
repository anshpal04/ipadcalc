# what is the model of the data that to be stored

from tkinter.constants import TRUE

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id=Column(Integer,primary_key=True, index=True)
    email= Column(String, unique=True, index=TRUE, nullable=False)
    hashed_password = Column(String, nullable=False)
    create_at = Column(DateTime(timezone=True),server_default=func.now())
