"""
API Endpoints for User Authentication.
"""

from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from AgentProvision.core.config import get_settings
from AgentProvision.core.database import get_session
from AgentProvision.core.models.user_model import (LoginRequest, Token, TokenData,
                                             User, UserCreate, UserResponse)

router = APIRouter(tags=["authentication"])
settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# --- Custom Response Models ---
class AuthSuccessResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterResponse(BaseModel):
    token: str
    user: UserResponse


# --- Password Utilities ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# --- JWT Token Utilities ---
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


# --- Dependency to get current user ---
async def get_current_user_dependency(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    stmt = select(User).where(User.email == token_data.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_user_dependency),
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


# --- API Endpoints ---
@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
async def register_user(
    user_in: UserCreate, db: AsyncSession = Depends(get_session)
) -> RegisterResponse:
    """
    Create new user. The UI expects a token and user object upon registration (direct login).
    """
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    db_user = result.scalars().first()

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )

    hashed_password = get_password_hash(user_in.password)
    new_user_data = user_in.dict(exclude={"password"})
    new_user = User(**new_user_data, hashed_password=hashed_password, is_active=True)

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return RegisterResponse(token=access_token, user=UserResponse.from_orm(new_user))


@router.post("/login", response_model=AuthSuccessResponse)
async def login_json_for_ui(
    login_request: LoginRequest, db: AsyncSession = Depends(get_session)
) -> AuthSuccessResponse:
    """
    Login with email and password (JSON body). This is for UI compatibility.
    The UI's auth.ts calls POST /auth/login.
    """
    stmt = select(User).where(User.email == login_request.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return AuthSuccessResponse(
        access_token=access_token, user=UserResponse.from_orm(user)
    )


@router.post("/token", response_model=AuthSuccessResponse, name="oauth2_token_endpoint")
async def login_form_for_oauth_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session),
) -> AuthSuccessResponse:
    """
    OAuth2 compatible token login (form data: username=email, password).
    """
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password (form data)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user (form data)"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return AuthSuccessResponse(
        access_token=access_token, user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user_dependency),
) -> UserResponse:
    """
    Get current user.
    """
    return UserResponse.from_orm(current_user)


# Note: The UI's auth.ts uses POST /auth/login with LoginCredentials (email, password).
# The /login endpoint above uses OAuth2PasswordRequestForm (username, password).
# To make it fully compatible with the UI's authService.login without changing UI:
# I will create an additional endpoint POST /auth/login that accepts LoginRequest.
# Alternatively, the UI could be changed to use a form post for OAuth2 flow.
# For now, creating a compatible endpoint is quicker.


@router.post(
    "/login/email", response_model=Token
)  # Keep this for UI compatibility for now
async def login_with_email_password(
    login_request: LoginRequest, db: AsyncSession = Depends(get_session)
) -> Any:
    """
    Login with email and password (compatibility for UI's current authService.login).
    """
    stmt = select(User).where(User.email == login_request.email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# Need to ensure `datetime` is imported for `create_access_token`
# from datetime import datetime # This should be at the top of the file ideally
