from fastapi import FastAPI
from app.database import engine, Base
from app import models
from app.routes.auth import router as auth_router
from app.routes.outlet import router as outlet_router
from app.routes.expense import router as expense_router
from app.routes.dashboard import router as dashboard_router
from app.routes.revenue import router as revenue_router
from app.routes.order import router as order_router
from app.routes.menu import router as menu_router
from app.routes.bill import router as bill_router


from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
    "https://restaurantosfrontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(
    outlet_router,
    prefix="/outlets",
    tags=["Outlets"]
)

app.include_router(
    order_router,
    prefix="/orders",
    tags=["Orders"]
)

app.include_router(
    menu_router,
    prefix="/menu",
    tags=["Menu"]
)

app.include_router(
    expense_router,
    prefix="/expenses",
    tags=["Expenses"]
)
app.include_router(
    revenue_router,
    prefix="/revenue",
    tags=["Revenue"]
)

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

app.include_router(
    bill_router,
    prefix="/bills",
    tags=["Bills"]
)

@app.get("/")
def root():
    return {"message": "RestaurantOS API is running"}