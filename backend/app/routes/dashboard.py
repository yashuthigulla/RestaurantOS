from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Outlet, Expense, Revenue
from app.utils.auth_dependency import require_owner

router = APIRouter()


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_owner)
):
    user_id = current_user["user_id"]

    total_outlets = db.query(Outlet).filter(
        Outlet.owner_id == user_id
    ).count()

    total_expenses = db.query(
        func.sum(Expense.amount)
    ).join(Outlet).filter(
        Outlet.owner_id == user_id
    ).scalar() or 0

    total_revenue = db.query(
        func.sum(Revenue.amount)
    ).join(Outlet).filter(
        Outlet.owner_id == user_id
    ).scalar() or 0

    profit = total_revenue - total_expenses

    return {
        "total_outlets": total_outlets,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "profit": profit
    }
