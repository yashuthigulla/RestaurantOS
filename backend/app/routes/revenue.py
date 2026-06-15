from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import  Outlet,Revenue
from app.schemas import  RevenueCreate
from app.utils.auth_dependency import get_current_user


router = APIRouter()


@router.post("/")
def create_revenue(
    revenue: RevenueCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    outlet = db.query(Outlet).filter(
        Outlet.id == revenue.outlet_id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not outlet:
        raise HTTPException(
            status_code=404,
            detail="Outlet not found or not owned by user"
        )

    new_revenue = Revenue(
        title=revenue.title,
        amount=revenue.amount,
        source=revenue.source,
        outlet_id=revenue.outlet_id,
        payment_method = revenue.payment_method
    )

    db.add(new_revenue)
    db.commit()
    db.refresh(new_revenue)

    return {
        "message": "Revenue created successfully",
        "revenue_id": new_revenue.id,
        "title": new_revenue.title,
        "payment_method": new_revenue.payment_method,
        "amount": new_revenue.amount,
        "source": new_revenue.source,
        "outlet_id": new_revenue.outlet_id

    }

@router.get("/")
def get_revenues(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    revenues = db.query(Revenue).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).all()

    return revenues

@router.get("/summary")
def get_revenue_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total = db.query(
        func.sum(Revenue.amount)
    ).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).scalar()

    return {
        "total_revenue": total or 0
    }

@router.get("/source-summary")
def get_source_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    summary = db.query(
        Revenue.source,
        func.sum(Revenue.amount).label("total_amount")
    ).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).group_by(Revenue.source).all()

    return [
        {
            "source": row.source,
            "total_amount": row.total_amount
        }
        for row in summary
    ]


@router.get("/monthly-summary")
def get_monthly_revenue_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    summary = db.query(
        func.date_format(Revenue.date, "%b").label("month"),
        func.sum(Revenue.amount).label("total_amount")
    ).join(Outlet).filter(
        Outlet.owner_id == current_user["user_id"]
    ).group_by(
        func.date_format(Revenue.date, "%b")
    ).all()

    return [
        {
            "month": row.month,
            "total_amount": row.total_amount
        }
        for row in summary
    ]


@router.get("/{id}")
def get_revenue_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    revenue = db.query(Revenue).join(Outlet).filter(
        Revenue.id == id,
        Revenue.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    return revenue

@router.put("/{id}")
def update_revenue_by_id(
    id: int,
    revenue_data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    revenue = db.query(Revenue).join(Outlet).filter(
        Revenue.id == id,
        Revenue.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    revenue.title = revenue_data.title
    revenue.amount = revenue_data.amount
    revenue.source = revenue_data.source
    revenue.payment_method = revenue_data.payment_method

    db.commit()
    db.refresh(revenue)

    return revenue

@router.delete("/{id}")
def delete_revenue_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    revenue = db.query(Revenue).join(Outlet).filter(
        Revenue.id == id,
        Revenue.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

    if not revenue:
        raise HTTPException(
            status_code=404,
            detail="Revenue not found"
        )

    db.delete(revenue)
    db.commit()

    return {
        "message": "Revenue deleted successfully"
    }

