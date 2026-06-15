from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Expense, Outlet
from app.schemas import ExpenseCreate
from app.utils.auth_dependency import get_current_user

from app.utils.auth_dependency import require_owner


router = APIRouter()


@router.post("/")
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlet = db.query(Outlet).filter(
        Outlet.id == expense.outlet_id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found or not owned by user"
        )

    new_expense = Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        outlet_id=expense.outlet_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {
        "message": "Expense created successfully",
        "expense_id": new_expense.id,
        "title": new_expense.title,
        "amount": new_expense.amount,
        "category": new_expense.category,
        "outlet_id": new_expense.outlet_id
    }

@router.get("/")
def get_expenses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expenses = db.query(Expense).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).all()

    return expenses

@router.get("/summary")
def get_expense_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total = db.query(
        func.sum(Expense.amount)
    ).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).scalar()

    return {
        "total_expenses": total or 0
    }

@router.get("/category-summary")
def get_category_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    summary = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total_amount")
    ).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).group_by(Expense.category).all()

    return [
        {
            "category": row.category,
            "total_amount": row.total_amount
        }
        for row in summary
    ]    


@router.get("/{id}")
def get_expense_by_id(
    id:int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
   
):
    expense = db.query(Expense).join(Outlet).filter(
    Expense.id == id,
    Expense.outlet_id == Outlet.id,
    Outlet.owner_id == current_user["user_id"]
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense

@router.put("/{id}")
def update_expense_by_id(
    id: int,
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).join(Outlet).filter(
        Expense.id == id,
        Expense.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    expense.title = expense_data.title
    expense.amount = expense_data.amount
    expense.category = expense_data.category

    db.commit()
    db.refresh(expense)

    return expense

@router.delete("/{id}")
def delete_expense_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).join(Outlet).filter(
        Expense.id == id,
        Expense.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted successfully"}

