from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.stocks import router as stock_router

app = FastAPI(
    title="Stock Prediction API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://stock-prediction-mocha.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock_router)


@app.get("/")
def root():
    return {
        "message":"Hi world!"
    }