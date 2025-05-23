"""
Main application for DevAgent
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import iac_routes

app = FastAPI(title="DevAgent API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(iac_routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to DevAgent API"} 