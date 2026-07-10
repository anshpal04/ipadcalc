# this file is going to hash the passwords
from typing_extensions import deprecated

from backend import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemas=["bcrypt"], deprecated="auto")
def hash_password(plain_password: str) ->str:
    return pwd_context.hash(plain_password)

def verify_password(plain_password:str, hashed_password: str) -> str:
    return pwd_context.verify(plain_password, hashed_password)
