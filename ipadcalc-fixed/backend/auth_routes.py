
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserLogin
from security import hash_password, verify_password
from session_store import create_session

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log the new user straight in so the frontend can jump right to the
    # canvas after registering, instead of asking them to sign in again.
    token = create_session(new_user.id)
    return {"message": "Registered successfully", "user_id": new_user.id, "token": token}

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_session(user.id)
    return {"message": "Login successful", "user_id": user.id, "token": token}
