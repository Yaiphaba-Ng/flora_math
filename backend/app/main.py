from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import create_db_and_tables
from app.api.routes import quiz, admin, config

app = FastAPI(
    title="FloraMath API 🌸",
    description="Backend powering the magical FloraMath quiz app",
    version="1.0.0",
)

# Setup CORS — allow all origins in development for LAN testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "The magical engine is running."}


app.include_router(quiz.router)
app.include_router(admin.router)
app.include_router(config.router)
