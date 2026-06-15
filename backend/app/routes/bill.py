from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bill, Order, Outlet
from app.schemas import BillCreate
from app.utils.auth_dependency import get_current_user

from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

router = APIRouter()


@router.post("/generate")
def generate_bill(
    bill_data: BillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).join(Outlet).filter(
        Order.id == bill_data.order_id,
        Order.outlet_id == Outlet.id,
        Outlet.owner_id == current_user["user_id"]
    ).first()

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

@router.get("/{id}/pdf")
def download_bill_pdf(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    bill = db.query(Bill).filter(Bill.id == id).first()

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