from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bill, Order, Outlet
from app.schemas import BillCreate
from app.utils.auth_dependency import get_current_user
from app.utils.auth_dependency import require_owner

from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

router = APIRouter()


def apply_owner_scope(query, current_user):
    if current_user["role"] == "owner":
        return query.filter(Outlet.owner_id == current_user["user_id"])

    return query


@router.post("/generate")
def generate_bill(
    bill_data: BillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order).join(Outlet).filter(
        Order.id == bill_data.order_id,
        Order.outlet_id == Outlet.id
    )

    order = apply_owner_scope(query, current_user).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    subtotal = order.total_amount
    discount = bill_data.discount

    taxable_amount = subtotal - discount
    cgst = taxable_amount * 0.025
    sgst = taxable_amount * 0.025
    total_amount = taxable_amount + cgst + sgst

    bill = Bill(
        order_id=order.id,
        subtotal=subtotal,
        discount=discount,
        cgst=cgst,
        sgst=sgst,
        total_amount=total_amount
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    return bill


@router.get("/")
def get_bills(
    db: Session = Depends(get_db),
    current_user=Depends(require_owner)
):
    bills = db.query(
        Bill.id,
        Bill.order_id,
        Bill.subtotal,
        Bill.discount,
        Bill.cgst,
        Bill.sgst,
        Bill.total_amount,
        Bill.created_at,
        Order.payment_method,
        Order.outlet_id
    ).join(
        Order,
        Bill.order_id == Order.id
    ).join(
        Outlet,
        Order.outlet_id == Outlet.id
    ).filter(
        Outlet.owner_id == current_user["user_id"]
    ).order_by(
        Bill.created_at.desc()
    ).all()

    return [
        {
            "id": bill.id,
            "order_id": bill.order_id,
            "subtotal": bill.subtotal,
            "discount": bill.discount,
            "cgst": bill.cgst,
            "sgst": bill.sgst,
            "total_amount": bill.total_amount,
            "created_at": bill.created_at,
            "payment_method": bill.payment_method,
            "outlet_id": bill.outlet_id
        }
        for bill in bills
    ]


@router.get("/{id}/pdf")
def download_bill_pdf(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Bill).join(Order).join(Outlet).filter(
        Bill.id == id,
        Bill.order_id == Order.id,
        Order.outlet_id == Outlet.id
    )

    bill = apply_owner_scope(query, current_user).first()

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    file_path = f"bill_{bill.id}.pdf"

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 50

    c.setFont("Helvetica-Bold", 20)
    c.drawString(220, y, "RestaurantOS")
    y -= 30

    c.setFont("Helvetica", 10)
    c.drawString(210, y, "Restaurant Billing Invoice")
    y -= 40

    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Bill ID: {bill.id}")
    c.drawString(350, y, f"Order ID: {bill.order_id}")
    y -= 25

    c.drawString(50, y, "GSTIN: 29ABCDE1234F1Z5")
    c.drawString(350, y, "Payment: UPI/Cash/Card")
    y -= 40

    c.line(50, y, 550, y)
    y -= 30

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Description")
    c.drawString(350, y, "Amount")
    y -= 20

    c.setFont("Helvetica", 11)
    c.drawString(50, y, "Subtotal")
    c.drawString(350, y, f"Rs. {bill.subtotal}")
    y -= 20

    c.drawString(50, y, "Discount")
    c.drawString(350, y, f"Rs. {bill.discount}")
    y -= 20

    c.drawString(50, y, "CGST 2.5%")
    c.drawString(350, y, f"Rs. {round(bill.cgst, 2)}")
    y -= 20

    c.drawString(50, y, "SGST 2.5%")
    c.drawString(350, y, f"Rs. {round(bill.sgst, 2)}")
    y -= 25

    c.line(50, y, 550, y)
    y -= 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Grand Total")
    c.drawString(350, y, f"Rs. {round(bill.total_amount, 2)}")
    y -= 50

    c.setFont("Helvetica", 10)
    c.drawString(180, y, "Thank you for dining with us!")

    c.save()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"bill_{bill.id}.pdf"
    )
